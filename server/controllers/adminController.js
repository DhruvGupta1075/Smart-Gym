const User = require('../models/User');
const Attendance = require('../models/Attendance');
const QRCodeSession = require('../models/QRCodeSession');
const WorkoutPlan = require('../models/WorkoutPlan');
const NutritionPlan = require('../models/NutritionPlan');
const ProgressLog = require('../models/ProgressLog');
const QRCode = require('qrcode');

// Helper to get formatted YYYY-MM-DD
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

// @desc    Get high-level gym analytics and KPIs
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const today = getTodayDateString();

    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      totalTrainers,
      todayAttendanceCount,
      allMembersList,
    ] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      User.countDocuments({ role: 'member', 'membership.status': 'Active' }),
      User.countDocuments({ role: 'member', 'membership.status': 'Expired' }),
      User.countDocuments({ role: 'trainer' }),
      Attendance.countDocuments({ date: today }),
      User.find({ role: 'member' }).select('membership createdAt name email phone assignedTrainer').populate('assignedTrainer', 'name'),
    ]);

    // Calculate revenue
    let totalRevenue = 0;
    const planDistribution = {
      'Basic Monthly': 0,
      'Silver Quarterly': 0,
      'Gold Half-Yearly': 0,
      'Platinum Annual': 0,
      'VIP Elite': 0,
    };

    allMembersList.forEach((m) => {
      const plan = m.membership?.planName || 'Basic Monthly';
      const price = m.membership?.price || 49;
      totalRevenue += price;
      if (planDistribution[plan] !== undefined) {
        planDistribution[plan]++;
      } else {
        planDistribution[plan] = 1;
      }
    });

    // Upcoming membership expirations (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const now = new Date();

    const upcomingExpirations = await User.find({
      role: 'member',
      'membership.status': 'Active',
      'membership.expiryDate': { $gte: now, $lte: sevenDaysFromNow },
    }).select('name email phone membership');

    // Last 7 days attendance trend
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past7Days.push(d.toISOString().split('T')[0]);
    }

    const attendanceTrend = await Promise.all(
      past7Days.map(async (dayStr) => {
        const count = await Attendance.countDocuments({ date: dayStr });
        const dateObj = new Date(dayStr);
        const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        return { date: dayStr, label, count };
      })
    );

    // Recent check-ins
    const recentCheckIns = await Attendance.find({ date: today })
      .sort({ checkInTime: -1 })
      .limit(10)
      .populate('member', 'name email avatar membership');

    res.status(200).json({
      success: true,
      stats: {
        totalMembers,
        activeMembers,
        expiredMembers,
        totalTrainers,
        todayAttendanceCount,
        totalRevenue,
        planDistribution,
        upcomingExpirations,
        attendanceTrend,
        recentCheckIns,
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all members with filters and search
// @route   GET /api/admin/members
// @access  Private (Admin)
exports.getAllMembers = async (req, res) => {
  try {
    const { search, status, plan, trainer } = req.query;
    let query = { role: 'member' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query['membership.status'] = status;
    }

    if (plan && plan !== 'All') {
      query['membership.planName'] = plan;
    }

    if (trainer && trainer !== 'All') {
      query.assignedTrainer = trainer;
    }

    const members = await User.find(query)
      .populate('assignedTrainer', 'name email phone specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: members.length, members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single member full profile
// @route   GET /api/admin/members/:id
// @access  Private (Admin, Trainer)
exports.getMemberById = async (req, res) => {
  try {
    const member = await User.findById(req.params.id)
      .populate('assignedTrainer', 'name email phone trainerDetails avatar');

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const [attendanceHistory, workoutPlans, nutritionPlans, progressLogs] = await Promise.all([
      Attendance.find({ member: member._id }).sort({ checkInTime: -1 }).limit(30),
      WorkoutPlan.find({ member: member._id }).populate('trainer', 'name'),
      NutritionPlan.find({ member: member._id }).populate('trainer', 'name'),
      ProgressLog.find({ member: member._id }).sort({ date: 1 }),
    ]);

    res.status(200).json({
      success: true,
      member,
      attendanceHistory,
      workoutPlans,
      nutritionPlans,
      progressLogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new member manually (Admin)
// @route   POST /api/admin/members
// @access  Private (Admin)
exports.createMember = async (req, res) => {
  try {
    const { name, email, password, phone, membershipPlan, assignedTrainer, fitnessGoals } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

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

    const newMember = await User.create({
      name,
      email: normalizedEmail,
      password: password || 'Member@12345',
      role: 'member',
      phone: phone || '',
      assignedTrainer: assignedTrainer || null,
      fitnessGoals: fitnessGoals || 'Fitness & Muscle Building',
      membership: {
        planName: plan,
        status: 'Active',
        startDate: new Date(),
        expiryDate: new Date(Date.now() + (days[plan] || 30) * 24 * 60 * 60 * 1000),
        price: prices[plan] || 49,
      },
    });

    const populated = await User.findById(newMember._id).populate('assignedTrainer', 'name email');
    res.status(201).json({ success: true, message: 'Member created successfully', member: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update member details, status, renewal
// @route   PUT /api/admin/members/:id
// @access  Private (Admin)
exports.updateMember = async (req, res) => {
  try {
    const { name, phone, assignedTrainer, membershipPlan, membershipStatus, expiryDate, fitnessGoals } = req.body;

    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (name) member.name = name;
    if (phone !== undefined) member.phone = phone;
    if (fitnessGoals !== undefined) member.fitnessGoals = fitnessGoals;
    if (assignedTrainer !== undefined) member.assignedTrainer = assignedTrainer || null;

    if (membershipPlan) member.membership.planName = membershipPlan;
    if (membershipStatus) member.membership.status = membershipStatus;
    if (expiryDate) member.membership.expiryDate = new Date(expiryDate);

    await member.save();

    const updated = await User.findById(member._id).populate('assignedTrainer', 'name email phone');
    res.status(200).json({ success: true, message: 'Member updated successfully', member: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a member
// @route   DELETE /api/admin/members/:id
// @access  Private (Admin)
exports.deleteMember = async (req, res) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    await Promise.all([
      User.findByIdAndDelete(req.params.id),
      Attendance.deleteMany({ member: req.params.id }),
      WorkoutPlan.deleteMany({ member: req.params.id }),
      NutritionPlan.deleteMany({ member: req.params.id }),
      ProgressLog.deleteMany({ member: req.params.id }),
    ]);

    res.status(200).json({ success: true, message: 'Member and associated records deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all trainers with client counts
// @route   GET /api/admin/trainers
// @access  Private (Admin, Trainer, Member)
exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer' }).select('-password');

    const trainersWithCounts = await Promise.all(
      trainers.map(async (t) => {
        const clientCount = await User.countDocuments({ assignedTrainer: t._id, role: 'member' });
        const workoutPlansCount = await WorkoutPlan.countDocuments({ trainer: t._id });
        return {
          ...t.toObject(),
          clientCount,
          workoutPlansCount,
        };
      })
    );

    res.status(200).json({ success: true, count: trainersWithCounts.length, trainers: trainersWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate daily QR code for Gym Self Check-In
// @route   POST /api/admin/generate-qr
// @access  Private (Admin)
exports.generateDailyQRCode = async (req, res) => {
  try {
    const today = getTodayDateString();
    const { location = 'Main Entrance Kiosk', validHours = 24 } = req.body;

    // Inactivate any previous QR codes for today
    await QRCodeSession.updateMany({ date: today }, { active: false });

    // Generate a unique signed check-in payload
    const token = `SMARTGYM-${today}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + validHours * 60 * 60 * 1000);

    const payload = JSON.stringify({
      gym: 'Smart Gym Analytics Platform',
      token,
      date: today,
      location,
      expiresAt: expiresAt.toISOString(),
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#06B6D4',
        light: '#0B0F19',
      },
    });

    const qrSession = await QRCodeSession.create({
      token,
      date: today,
      codeString: payload,
      qrDataUrl,
      active: true,
      generatedBy: req.user._id,
      location,
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: 'Daily QR Code generated successfully',
      qrSession: {
        token,
        date: today,
        qrDataUrl,
        location,
        expiresAt,
        codeString: payload,
      },
    });
  } catch (error) {
    console.error('generateDailyQRCode error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active QR Code session
// @route   GET /api/admin/active-qr
// @access  Private (Admin, Trainer, Member)
exports.getActiveQRCode = async (req, res) => {
  try {
    const today = getTodayDateString();
    let qrSession = await QRCodeSession.findOne({ date: today, active: true }).sort({ createdAt: -1 });

    // If none exists for today, automatically generate one on demand
    if (!qrSession) {
      const token = `SMARTGYM-${today}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const payload = JSON.stringify({
        gym: 'Smart Gym Analytics Platform',
        token,
        date: today,
        location: 'Main Gym Floor Kiosk',
        expiresAt: expiresAt.toISOString(),
      });

      const qrDataUrl = await QRCode.toDataURL(payload, {
        width: 400,
        margin: 2,
        color: {
          dark: '#06B6D4',
          light: '#0B0F19',
        },
      });

      qrSession = await QRCodeSession.create({
        token,
        date: today,
        codeString: payload,
        qrDataUrl,
        active: true,
        location: 'Main Gym Floor Kiosk',
        expiresAt,
      });
    }

    res.status(200).json({ success: true, qrSession });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
