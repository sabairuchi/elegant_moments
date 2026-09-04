import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { auditService } from './auditService.js';

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

// Ensure data files exist (graceful in read-only environments)
const ensureFilesExist = () => {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2), 'utf-8');
    if (!fs.existsSync(TOKENS_FILE)) fs.writeFileSync(TOKENS_FILE, JSON.stringify(seedTokens, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem (e.g. Vercel serverless lambda)
  }
};

const readUsers = () => {
  if (memoryUsers) return memoryUsers;
  ensureFilesExist();
  try {
    if (fs.existsSync(USERS_FILE)) {
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
  ensureFilesExist();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    // In serverless / read-only filesystem environments, memory cache preserves changes during lambda lifecycle
    return true;
  }
};

const readTokens = () => {
  if (memoryTokens) return memoryTokens;
  ensureFilesExist();
  try {
    if (fs.existsSync(TOKENS_FILE)) {
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
  ensureFilesExist();
  try {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true;
  }
};

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
    const users = readUsers();
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  },

  async findById(id) {
    if (!id) return null;
    const users = readUsers();
    return users.find((u) => u.id === id) || null;
  },

  async createUser({ firstName, lastName, email, phone, password }) {
    const users = readUsers();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
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
      isVerified: false,
      accountStatus: 'PENDING_VERIFICATION',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

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
    const tokens = readTokens();
    // Invalidate existing unexpired tokens of same type for user
    const filtered = tokens.filter((t) => !(t.userId === userId && t.type === type && !t.used));

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

    filtered.push(newToken);
    writeTokens(filtered);
    return token;
  },

  async verifyEmailToken(tokenStr) {
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

    // Update token as used
    tokenObj.used = true;
    writeTokens(tokens);

    // Update user
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
  },

  async resendVerification(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      // Generic response to avoid enumeration
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

    // Anti-account enumeration: Always return success message
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

    // Generate single-use reset token valid for 1 hour
    const token = await this.createToken(user.id, 'PASSWORD_RESET', 60 * 60 * 1000);

    return {
      success: true,
      message: 'If an account exists with that email address, password reset instructions have been sent.',
      resetTokenDevOnly: token, // Included for local dev demo/testing ease
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

    // Mark token as used
    tokenObj.used = true;
    writeTokens(tokens);

    // Hash new password & update user
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
  },

  async getAllTokens() {
    return readTokens();
  },

  // ---------------------------------------------------------------------------
  // Admin User Management
  // ---------------------------------------------------------------------------

  async listUsers({ page = 1, limit = 20, search = '', role = '', status = '' }) {
    let users = readUsers();

    // Filters
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

    // Pagination
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
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
  },

  countSuperAdmins() {
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

    const users = readUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const targetUser = users[userIndex];

    // Prevent suspending the last super_admin
    if (targetUser.role === 'super_admin' && newStatus !== 'ACTIVE') {
      if (this.countSuperAdmins() <= 1) {
        const err = new Error('Cannot suspend or deactivate the last remaining Super Admin.');
        err.statusCode = 403;
        throw err;
      }
    }

    const oldStatus = targetUser.accountStatus;
    targetUser.accountStatus = newStatus;
    if (newStatus === 'INACTIVE' || newStatus === 'SUSPENDED') {
      targetUser.isActive = false;
    } else if (newStatus === 'ACTIVE') {
      targetUser.isActive = true;
    }

    targetUser.updatedAt = new Date().toISOString();
    writeUsers(users);

    auditService.logAction({
      userId: currentAdminUser.id,
      userEmail: currentAdminUser.email,
      action: 'USER_STATUS_CHANGED',
      entityType: 'USER',
      entityId: userId,
      details: { oldStatus, newStatus },
      ipAddress,
    });

    return this.getSafeUser(targetUser);
  },

  async updateUserRole(userId, newRole, currentAdminUser, ipAddress) {
    const validRoles = ['super_admin', 'admin', 'planner', 'vendor', 'client'];
    if (!validRoles.includes(newRole)) {
      const err = new Error('Invalid role specified.');
      err.statusCode = 400;
      throw err;
    }

    const users = readUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const targetUser = users[userIndex];
    const oldRole = targetUser.role;

    // Prevent demoting the last super_admin
    if (oldRole === 'super_admin' && newRole !== 'super_admin') {
      if (this.countSuperAdmins() <= 1) {
        const err = new Error('Cannot demote the last remaining Super Admin.');
        err.statusCode = 403;
        throw err;
      }
    }

    targetUser.role = newRole;
    targetUser.roles = [newRole];
    targetUser.updatedAt = new Date().toISOString();
    writeUsers(users);

    auditService.logAction({
      userId: currentAdminUser.id,
      userEmail: currentAdminUser.email,
      action: 'USER_ROLE_CHANGED',
      entityType: 'USER',
      entityId: userId,
      details: { oldRole, newRole },
      ipAddress,
    });

    return this.getSafeUser(targetUser);
  }
};
