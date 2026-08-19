const User = require('../models/User');
const Whitelist = require('../models/Whitelist');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'smart_gym_jwt_secret_key_2026_super_secure', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };

  // Remove password from user output
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    message,
    token,
    user: userObj,
  });
};

// @desc    Register new user (Member, Trainer, Admin)
// @route   POST /api/auth/register
// @access  Public (Whitelist verified for Admin/Trainer)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'member', phone, membershipPlan, fitnessGoals, trainerSpecialization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    let isWhitelisted = false;

    // Check whitelist for Admin & Trainer
    if (role === 'admin' || role === 'trainer') {
      const whitelisted = await Whitelist.findOne({ email: normalizedEmail, role });
      if (!whitelisted) {
        return res.status(403).json({
          success: false,
          message: `Access Denied: Email '${normalizedEmail}' is not on the approved whitelist for role '${role}'. Contact Gym Superadmin.`,
        });
      }
      isWhitelisted = true;
    }

    // Determine membership defaults if member
    let membership = undefined;
    if (role === 'member') {
      const plan = membershipPlan || 'Basic Monthly';
      const prices = {
        'Basic Monthly': 49,
        'Silver Quarterly': 129,
        'Gold Half-Yearly': 229,
        'Platinum Annual': 399,
        'VIP Elite': 599,
      };
      const days = {
        'Basic Monthly': 30,
        'Silver Quarterly': 90,
        'Gold Half-Yearly': 180,
        'Platinum Annual': 365,
        'VIP Elite': 365,
      };

      membership = {
        planName: plan,
        status: 'Active',
        startDate: new Date(),
        expiryDate: new Date(Date.now() + (days[plan] || 30) * 24 * 60 * 60 * 1000),
        price: prices[plan] || 49,
      };
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      phone: phone || '',
      isWhitelisted,
      membership,
      fitnessGoals: fitnessGoals || 'General fitness, muscle tone, and cardiovascular health',
      trainerDetails: role === 'trainer' ? {
        specialization: trainerSpecialization || 'Strength & Conditioning, Functional Movement',
        experienceYears: 4,
        bio: 'Dedicated fitness professional helping athletes and members achieve transformative results.',
      } : undefined,
    });

    sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for user (include password for validation)
    const user = await User.findOne({ email: normalizedEmail }).select('+password').populate('assignedTrainer', 'name email phone avatar');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    // For Admin / Trainer, ensure email is on whitelist
    if (user.role === 'admin' || user.role === 'trainer') {
      const whitelisted = await Whitelist.findOne({ email: normalizedEmail, role: user.role });
      if (!whitelisted && !user.isWhitelisted) {
        return res.status(403).json({
          success: false,
          message: `Access Denied: Email '${normalizedEmail}' has had its whitelist authorization revoked.`,
        });
      }
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('assignedTrainer', 'name email phone trainerDetails avatar');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Check whitelist status for an email & role
// @route   POST /api/auth/check-whitelist
// @access  Public
exports.checkWhitelistStatus = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ success: false, message: 'Email and role required' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (role === 'member') {
      return res.status(200).json({ success: true, isWhitelisted: true, message: 'Members do not require whitelisting.' });
    }
    const whitelisted = await Whitelist.findOne({ email: normalizedEmail, role });
    res.status(200).json({
      success: true,
      isWhitelisted: !!whitelisted,
      message: whitelisted ? 'Email is authorized!' : 'Email is not authorized for this role.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Whitelist items (Admin only)
// @route   GET /api/auth/whitelist
// @access  Private (Admin)
exports.getWhitelist = async (req, res) => {
  try {
    const whitelist = await Whitelist.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: whitelist.length, data: whitelist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add email to whitelist (Admin only)
// @route   POST /api/auth/whitelist
// @access  Private (Admin)
exports.addToWhitelist = async (req, res) => {
  try {
    const { email, role, notes } = req.body;
    if (!email || !role) {
      return res.status(400).json({ success: false, message: 'Email and role are required' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Whitelist.findOne({ email: normalizedEmail, role });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This email is already whitelisted for this role.' });
    }
    const item = await Whitelist.create({
      email: normalizedEmail,
      role,
      notes: notes || 'Whitelisted by Admin',
      addedBy: req.user.name || 'Admin',
    });
    res.status(201).json({ success: true, message: 'Email added to whitelist', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove email from whitelist (Admin only)
// @route   DELETE /api/auth/whitelist/:id
// @access  Private (Admin)
exports.removeFromWhitelist = async (req, res) => {
  try {
    const item = await Whitelist.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Whitelist entry not found' });
    }
    res.status(200).json({ success: true, message: 'Email removed from whitelist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
