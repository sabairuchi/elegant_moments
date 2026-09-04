import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { userService } from '../services/userService.js';
import { getPermissionsForRoles } from '../config/permissions.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No Bearer token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.',
      });
    }

    const user = await userService.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account associated with this token no longer exists.',
      });
    }

    // Check account status
    if (user.accountStatus === 'SUSPENDED' || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended or deactivated. Contact support for assistance.',
      });
    }

    req.user = userService.getSafeUser(user);
    req.user.permissions = getPermissionsForRoles(req.user.roles || [req.user.role]);
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};
