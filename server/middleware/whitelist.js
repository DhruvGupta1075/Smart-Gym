const Whitelist = require('../models/Whitelist');

// Middleware to verify if admin or trainer email is in the pre-approved whitelist
const checkWhitelist = async (req, res, next) => {
  const { email, role } = req.body;

  // Members do not require pre-whitelisting
  if (!role || role === 'member') {
    return next();
  }

  // Admins and Trainers must have their email pre-approved
  if (role === 'admin' || role === 'trainer') {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for role verification',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isApproved = await Whitelist.findOne({
      email: normalizedEmail,
      role: role,
    });

    if (!isApproved) {
      return res.status(403).json({
        success: false,
        message: `Restricted Access: The email address (${normalizedEmail}) is not authorized for '${role}' privileges. Contact gym administration for whitelisting.`,
      });
    }
  }

  next();
};

module.exports = { checkWhitelist };
