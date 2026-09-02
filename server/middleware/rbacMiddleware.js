// Role-Based Access Control (RBAC) Middleware Foundation
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. User role information missing.',
      });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};
