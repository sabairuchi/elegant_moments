import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { auditService } from './auditService.js';
import { query, hasDbConnection } from '../db/index.js';

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let seedUsers = [];
let seedTokens = [];
try {
  seedUsers = require('../data/users.json');
} catch {
  seedUsers = [];
}
try {
  seedTokens = require('../data/tokens.json');
} catch {
  seedTokens = [];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const TOKENS_FILE = path.join(__dirname, '..', 'data', 'tokens.json');

let memoryUsers = null;
let memoryTokens = null;

const ensureFilesExist = () => {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2), 'utf-8');
    if (!fs.existsSync(TOKENS_FILE)) fs.writeFileSync(TOKENS_FILE, JSON.stringify(seedTokens, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem
  }
};

const readUsers = () => {
  if (memoryUsers) return memoryUsers;
  ensureFilesExist();
  try {
    if (process.env.NODE_ENV !== 'production' && fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      memoryUsers = JSON.parse(raw);
    } else {
      memoryUsers = [...seedUsers];
    }
  } catch (err) {
    memoryUsers = [...seedUsers];
  }
  return memoryUsers;
};

const writeUsers = (users) => {
  memoryUsers = users;
  if (process.env.NODE_ENV === 'production') return true;
  ensureFilesExist();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true;
  }
};

const readTokens = () => {
  if (memoryTokens) return memoryTokens;
  ensureFilesExist();
  try {
    if (process.env.NODE_ENV !== 'production' && fs.existsSync(TOKENS_FILE)) {
      const raw = fs.readFileSync(TOKENS_FILE, 'utf-8');
      memoryTokens = JSON.parse(raw);
    } else {
      memoryTokens = [...seedTokens];
    }
  } catch (err) {
    memoryTokens = [...seedTokens];
  }
  return memoryTokens;
};

const writeTokens = (tokens) => {
  memoryTokens = tokens;
  if (process.env.NODE_ENV === 'production') return true;
  ensureFilesExist();
  try {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true;
  }
};

const mapRowToUser = (row) => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  firstName: row.first_name,
  lastName: row.last_name,
  phone: row.phone || '',
  role: row.role || 'client',
  roles: Array.isArray(row.roles)
    ? row.roles
    : row.roles
    ? typeof row.roles === 'string'
      ? JSON.parse(row.roles)
      : [row.role || 'client']
    : [row.role || 'client'],
  isActive: row.is_active ?? true,
  isVerified: row.is_verified ?? true,
  accountStatus: row.account_status || (row.is_active ? 'ACTIVE' : 'SUSPENDED'),
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
});

export const userService = {
  // Password Security Policy
  validatePasswordPolicy(password) {
    if (!password || typeof password !== 'string') {
      return 'Password is required.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number.';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Password must contain at least one special character.';
    }
    return null;
  },

  // Safe user representation (never exposes passwordHash or tokens)
  getSafeUser(user) {
    if (!user) return null;
    const { passwordHash, plainPasswordTemp, ...safeUser } = user;
    return safeUser;
  },

  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    if (hasDbConnection()) {
      const res = await query('SELECT * FROM users WHERE LOWER(email) = $1 AND deleted_at IS NULL', [cleanEmail]);
      if (res.rows.length > 0) {
        return mapRowToUser(res.rows[0]);
      }
      return null;
    }

    const users = readUsers();
    return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findById(id) {
    if (!id) return null;

    if (hasDbConnection()) {
      const res = await query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
      if (res.rows.length > 0) {
        return mapRowToUser(res.rows[0]);
      }
      return null;
    }

    const users = readUsers();
    return users.find((u) => u.id === id) || null;
  },

  async createUser({ firstName, lastName, email, phone, password }) {
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existing = await this.findByEmail(cleanEmail);
    if (existing) {
      const err = new Error('An account with this email already exists.');
      err.statusCode = 409;
      throw err;
    }

    // Password Policy Validation
    const policyError = this.validatePasswordPolicy(password);
    if (policyError) {
      const err = new Error(policyError);
      err.statusCode = 400;
      throw err;
    }

    // Securely hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newId = `usr-client-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const newUser = {
      id: newId,
      email: cleanEmail,
      passwordHash,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone ? phone.trim() : '',
      role: 'client', // STRICT REQUIREMENT: Public registration MUST default to 'client'
      roles: ['client'],
      isActive: true,
      isVerified: true,
      accountStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (hasDbConnection()) {
      await query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, roles, is_active, is_verified, account_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newId,
          cleanEmail,
          passwordHash,
          firstName.trim(),
          lastName.trim(),
          phone ? phone.trim() : '',
          'client',
          JSON.stringify(['client']),
          true,
          true,
          'ACTIVE',
        ]
      );
    } else {
      const users = readUsers();
      users.push(newUser);
      writeUsers(users);
    }

    // Create verification token
    const verificationToken = await this.createToken(newUser.id, 'EMAIL_VERIFICATION', 24 * 60 * 60 * 1000); // 24h

    return {
      user: this.getSafeUser(newUser),
      verificationToken,
    };
  },

  async verifyPassword(inputPassword, passwordHash) {
    return await bcrypt.compare(inputPassword, passwordHash);
  },

  // Token Management (Verification & Password Reset)
  async createToken(userId, type, ttlMs) {
    const token = crypto.randomBytes(32).toString('hex');
    const newToken = {
      id: `tok-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      userId,
      token,
      type, // 'EMAIL_VERIFICATION' | 'PASSWORD_RESET'
      used: false,
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (hasDbConnection()) {
      await query(
        `UPDATE tokens SET used = true WHERE user_id = $1 AND type = $2 AND used = false`,
        [userId, type]
      );
      await query(
        `INSERT INTO tokens (id, user_id, token, type, used, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [newToken.id, newToken.userId, newToken.token, newToken.type, false, newToken.expiresAt, newToken.createdAt]
      );
    } else {
      const tokens = readTokens();
      const filtered = tokens.filter((t) => !(t.userId === userId && t.type === type && !t.used));
      filtered.push(newToken);
      writeTokens(filtered);
    }

    return token;
  },

  async verifyEmailToken(tokenStr) {
    if (hasDbConnection()) {
      const res = await query(`SELECT * FROM tokens WHERE token = $1 AND type = 'EMAIL_VERIFICATION'`, [tokenStr]);
      if (res.rows.length === 0) {
        const err = new Error('Invalid email verification token.');
        err.statusCode = 400;
        throw err;
      }
      const tokenObj = res.rows[0];

      if (tokenObj.used) {
        const err = new Error('This verification token has already been used.');
        err.statusCode = 400;
        throw err;
      }

      if (new Date(tokenObj.expires_at) < new Date()) {
        const err = new Error('Verification token has expired. Please request a new verification email.');
        err.statusCode = 400;
        throw err;
      }

      await query(`UPDATE tokens SET used = true WHERE id = $1`, [tokenObj.id]);
      await query(`UPDATE users SET is_verified = true, account_status = 'ACTIVE', updated_at = NOW() WHERE id = $1`, [tokenObj.user_id]);

      const user = await this.findById(tokenObj.user_id);
      return this.getSafeUser(user);
    } else {
      const tokens = readTokens();
      const tokenObj = tokens.find((t) => t.token === tokenStr && t.type === 'EMAIL_VERIFICATION');

      if (!tokenObj) {
        const err = new Error('Invalid email verification token.');
        err.statusCode = 400;
        throw err;
      }

      if (tokenObj.used) {
        const err = new Error('This verification token has already been used.');
        err.statusCode = 400;
        throw err;
      }

      if (new Date(tokenObj.expiresAt) < new Date()) {
        const err = new Error('Verification token has expired. Please request a new verification email.');
        err.statusCode = 400;
        throw err;
      }

      tokenObj.used = true;
      writeTokens(tokens);

      const users = readUsers();
      const user = users.find((u) => u.id === tokenObj.userId);
      if (!user) {
        const err = new Error('Associated user not found.');
        err.statusCode = 404;
        throw err;
      }

      user.isVerified = true;
      if (user.accountStatus === 'PENDING_VERIFICATION') {
        user.accountStatus = 'ACTIVE';
      }
      user.updatedAt = new Date().toISOString();
      writeUsers(users);

      return this.getSafeUser(user);
    }
  },

  async resendVerification(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      return { message: 'If an account exists with this email, a verification link has been generated.' };
    }

    if (user.isVerified) {
      return { message: 'This account email is already verified.' };
    }

    const token = await this.createToken(user.id, 'EMAIL_VERIFICATION', 24 * 60 * 60 * 1000);
    return {
      message: 'Verification link generated successfully.',
      token,
      email: user.email,
    };
  },

  async forgotPassword(email) {
    const user = await this.findByEmail(email);

    if (!user) {
      return {
        success: true,
        message: 'If an account exists with that email address, password reset instructions have been sent.',
      };
    }

    if (user.accountStatus === 'SUSPENDED') {
      return {
        success: true,
        message: 'If an account exists with that email address, password reset instructions have been sent.',
      };
    }

    const token = await this.createToken(user.id, 'PASSWORD_RESET', 60 * 60 * 1000);

    return {
      success: true,
      message: 'If an account exists with that email address, password reset instructions have been sent.',
      resetTokenDevOnly: token,
      email: user.email,
    };
  },

  async resetPassword(tokenStr, newPassword) {
    const policyError = this.validatePasswordPolicy(newPassword);
    if (policyError) {
      const err = new Error(policyError);
      err.statusCode = 400;
      throw err;
    }

    if (hasDbConnection()) {
      const res = await query(`SELECT * FROM tokens WHERE token = $1 AND type = 'PASSWORD_RESET'`, [tokenStr]);
      if (res.rows.length === 0) {
        const err = new Error('Invalid password reset token.');
        err.statusCode = 400;
        throw err;
      }
      const tokenObj = res.rows[0];

      if (tokenObj.used) {
        const err = new Error('This password reset token has already been used.');
        err.statusCode = 400;
        throw err;
      }

      if (new Date(tokenObj.expires_at) < new Date()) {
        const err = new Error('Password reset token has expired. Please request a new reset link.');
        err.statusCode = 400;
        throw err;
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      await query(`UPDATE tokens SET used = true WHERE id = $1`, [tokenObj.id]);
      await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [newPasswordHash, tokenObj.user_id]);

      const user = await this.findById(tokenObj.user_id);
      return this.getSafeUser(user);
    } else {
      const tokens = readTokens();
      const tokenObj = tokens.find((t) => t.token === tokenStr && t.type === 'PASSWORD_RESET');

      if (!tokenObj) {
        const err = new Error('Invalid password reset token.');
        err.statusCode = 400;
        throw err;
      }

      if (tokenObj.used) {
        const err = new Error('This password reset token has already been used.');
        err.statusCode = 400;
        throw err;
      }

      if (new Date(tokenObj.expiresAt) < new Date()) {
        const err = new Error('Password reset token has expired. Please request a new reset link.');
        err.statusCode = 400;
        throw err;
      }

      tokenObj.used = true;
      writeTokens(tokens);

      const users = readUsers();
      const user = users.find((u) => u.id === tokenObj.userId);
      if (!user) {
        const err = new Error('Associated user not found.');
        err.statusCode = 404;
        throw err;
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
      user.updatedAt = new Date().toISOString();
      writeUsers(users);

      return this.getSafeUser(user);
    }
  },

  async getAllTokens() {
    if (hasDbConnection()) {
      const res = await query(`SELECT * FROM tokens ORDER BY created_at DESC`);
      return res.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        token: r.token,
        type: r.type,
        used: r.used,
        expiresAt: r.expires_at,
        createdAt: r.created_at,
      }));
    }
    return readTokens();
  },

  // ---------------------------------------------------------------------------
  // Admin User Management
  // ---------------------------------------------------------------------------

  async listUsers({ page = 1, limit = 20, search = '', role = '', status = '' }) {
    if (hasDbConnection()) {
      let whereClauses = ['deleted_at IS NULL'];
      let params = [];
      let pIdx = 1;

      if (search) {
        const s = `%${search.toLowerCase()}%`;
        whereClauses.push(`(LOWER(email) LIKE $${pIdx} OR LOWER(first_name) LIKE $${pIdx} OR LOWER(last_name) LIKE $${pIdx})`);
        params.push(s);
        pIdx++;
      }
      if (role && role !== 'All') {
        whereClauses.push(`role = $${pIdx}`);
        params.push(role);
        pIdx++;
      }
      if (status && status !== 'All') {
        whereClauses.push(`account_status = $${pIdx}`);
        params.push(status);
        pIdx++;
      }

      const whereSql = whereClauses.join(' AND ');
      const countRes = await query(`SELECT COUNT(*) FROM users WHERE ${whereSql}`, params);
      const total = parseInt(countRes.rows[0].count, 10);
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;

      const dataRes = await query(
        `SELECT * FROM users WHERE ${whereSql} ORDER BY created_at DESC LIMIT $${pIdx} OFFSET $${pIdx + 1}`,
        [...params, limit, start]
      );
      const paginated = dataRes.rows.map((row) => this.getSafeUser(mapRowToUser(row)));

      return {
        data: paginated,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
        },
      };
    } else {
      let users = readUsers();

      if (search) {
        const s = search.toLowerCase();
        users = users.filter(
          (u) =>
            u.email.toLowerCase().includes(s) ||
            u.firstName.toLowerCase().includes(s) ||
            u.lastName.toLowerCase().includes(s)
        );
      }
      if (role && role !== 'All') {
        users = users.filter((u) => u.role === role);
      }
      if (status && status !== 'All') {
        users = users.filter((u) => u.accountStatus === status);
      }

      const total = users.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const paginated = users.slice(start, start + limit).map((u) => this.getSafeUser(u));

      return {
        data: paginated,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
        },
      };
    }
  },

  async countSuperAdmins() {
    if (hasDbConnection()) {
      const res = await query(`SELECT COUNT(*) FROM users WHERE role = 'super_admin' AND account_status = 'ACTIVE' AND deleted_at IS NULL`);
      return parseInt(res.rows[0].count, 10);
    }
    const users = readUsers();
    return users.filter((u) => u.role === 'super_admin' && u.accountStatus === 'ACTIVE').length;
  },

  async updateUserStatus(userId, newStatus, currentAdminUser, ipAddress) {
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'INACTIVE', 'PENDING_VERIFICATION'];
    if (!validStatuses.includes(newStatus)) {
      const err = new Error('Invalid account status.');
      err.statusCode = 400;
      throw err;
    }

    if (userId === currentAdminUser.id) {
      const err = new Error('You cannot change your own account status.');
      err.statusCode = 403;
      throw err;
    }

    const targetUser = await this.findById(userId);
    if (!targetUser) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    if (targetUser.role === 'super_admin' && newStatus !== 'ACTIVE') {
      const count = await this.countSuperAdmins();
      if (count <= 1) {
        const err = new Error('Cannot suspend or deactivate the last remaining Super Admin.');
        err.statusCode = 403;
        throw err;
      }
    }

    const oldStatus = targetUser.accountStatus;
    const isActive = newStatus === 'ACTIVE';

    if (hasDbConnection()) {
      await query(
        `UPDATE users SET account_status = $1, is_active = $2, updated_at = NOW() WHERE id = $3`,
        [newStatus, isActive, userId]
      );
    } else {
      const users = readUsers();
      const u = users.find((x) => x.id === userId);
      if (u) {
        u.accountStatus = newStatus;
        u.isActive = isActive;
        u.updatedAt = new Date().toISOString();
        writeUsers(users);
      }
    }

    auditService.logAction({
      userId: currentAdminUser.id,
      userEmail: currentAdminUser.email,
      action: 'USER_STATUS_CHANGED',
      entityType: 'USER',
      entityId: userId,
      details: { oldStatus, newStatus },
      ipAddress,
    });

    const updatedUser = await this.findById(userId);
    return this.getSafeUser(updatedUser);
  },

  async updateUserRole(userId, newRole, currentAdminUser, ipAddress) {
    const validRoles = ['super_admin', 'admin', 'planner', 'vendor', 'client'];
    if (!validRoles.includes(newRole)) {
      const err = new Error('Invalid role specified.');
      err.statusCode = 400;
      throw err;
    }

    const targetUser = await this.findById(userId);
    if (!targetUser) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const oldRole = targetUser.role;

    if (oldRole === 'super_admin' && newRole !== 'super_admin') {
      const count = await this.countSuperAdmins();
      if (count <= 1) {
        const err = new Error('Cannot demote the last remaining Super Admin.');
        err.statusCode = 403;
        throw err;
      }
    }

    if (hasDbConnection()) {
      await query(
        `UPDATE users SET role = $1, roles = $2, updated_at = NOW() WHERE id = $3`,
        [newRole, JSON.stringify([newRole]), userId]
      );
    } else {
      const users = readUsers();
      const u = users.find((x) => x.id === userId);
      if (u) {
        u.role = newRole;
        u.roles = [newRole];
        u.updatedAt = new Date().toISOString();
        writeUsers(users);
      }
    }

    auditService.logAction({
      userId: currentAdminUser.id,
      userEmail: currentAdminUser.email,
      action: 'USER_ROLE_CHANGED',
      entityType: 'USER',
      entityId: userId,
      details: { oldRole, newRole },
      ipAddress,
    });

    const updatedUser = await this.findById(userId);
    return this.getSafeUser(updatedUser);
  },
};
