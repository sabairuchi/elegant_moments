// Role-Based Access Control (RBAC) & Authorization Foundation

// 1. Role Guard Middleware
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please authenticate first.',
      });
    }

    const userRoles = req.user.roles || [req.user.role];
    const hasRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}. Current role: ${req.user.role}.`,
      });
    }

    next();
  };
};

// 2. Data Ownership Foundation Middleware
// Checks whether the authenticated user owns the target resource or holds administrative override privileges.
export const checkResourceOwnership = (getOwnerUserId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    // Administrative roles (super_admin, admin) bypass individual ownership checks
    if (['super_admin', 'admin'].includes(req.user.role)) {
      return next();
    }

    const ownerUserId = typeof getOwnerUserId === 'function' ? await getOwnerUserId(req) : req.params[getOwnerUserId];

    if (req.user.id !== ownerUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. You do not have ownership permission for this resource.',
      });
    }

    next();
  };
};
