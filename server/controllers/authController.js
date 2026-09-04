import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { userService } from '../services/userService.js';

const generateJwtToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      roles: user.roles,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

export const authController = {
  // 1. POST /api/auth/register
  async register(req, res, next) {
    try {
      const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, email, and password are required.',
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password and password confirmation do not match.',
        });
      }

      const { user, verificationToken } = await userService.createUser({
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      const token = generateJwtToken(user);

      res.status(201).json({
        success: true,
        message: 'Registration successful. A verification email has been dispatched.',
        token,
        user,
        verificationUrlDevOnly: `http://localhost:5173/verify-email?token=${verificationToken}`,
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // 2. POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.',
        });
      }

      const user = await userService.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
      }

      const isMatch = await userService.verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
      }

      if (user.accountStatus === 'SUSPENDED' || !user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact Elegant Moments support.',
        });
      }

      const token = generateJwtToken(user);
      const safeUser = userService.getSafeUser(user);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: safeUser,
      });
    } catch (error) {
      next(error);
    }
  },

  // 3. POST /api/auth/logout
  async logout(req, res, next) {
    try {
      // In JWT stateless auth, client invalidates token. We acknowledge logout.
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  // 4. GET /api/auth/me
  async getCurrentUser(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  },

  // 5. POST /api/auth/verify-email
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Verification token is required.',
        });
      }

      const user = await userService.verifyEmailToken(token);
      res.status(200).json({
        success: true,
        message: 'Email address verified successfully!',
        user,
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // 6. POST /api/auth/resend-verification
  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
      }

      const result = await userService.resendVerification(email);
      res.status(200).json({
        success: true,
        message: result.message,
        verificationUrlDevOnly: result.token ? `http://localhost:5173/verify-email?token=${result.token}` : undefined,
      });
    } catch (error) {
      next(error);
    }
  },

  // 7. POST /api/auth/forgot-password
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
      }

      const result = await userService.forgotPassword(email);
      res.status(200).json({
        success: true,
        message: result.message,
        resetUrlDevOnly: result.resetTokenDevOnly
          ? `http://localhost:5173/reset-password?token=${result.resetTokenDevOnly}`
          : undefined,
      });
    } catch (error) {
      next(error);
    }
  },

  // 8. POST /api/auth/reset-password
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password are required.',
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password and password confirmation do not match.',
        });
      }

      const user = await userService.resetPassword(token, newPassword);
      res.status(200).json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
        user,
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // 9. GET /api/auth/debug-tokens (Dev helper for reviewing links)
  async getDebugTokens(req, res, next) {
    try {
      const tokens = await userService.getAllTokens();
      res.status(200).json({
        success: true,
        tokens,
      });
    } catch (error) {
      next(error);
    }
  },
};
