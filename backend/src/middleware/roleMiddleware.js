/**
 * Role-based access control middleware.
 * Usage: authorize('admin', 'officer')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — role '${req.user.role}' is not permitted for this resource`,
      });
    }

    next();
  };
};

module.exports = { authorize };
