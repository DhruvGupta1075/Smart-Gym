const Attendance = require('../models/Attendance');
const QRCodeSession = require('../models/QRCodeSession');
const User = require('../models/User');

// Helper to format date
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

// @desc    Self Check-in using Scanned QR Code token or manual code string
// @route   POST /api/attendance/check-in
// @access  Private (Member, Trainer)
exports.checkIn = async (req, res) => {
  try {
    const { qrToken, method = 'QR_SCAN' } = req.body;
    const memberId = req.user._id;
    const today = getTodayDateString();

    if (!qrToken) {
      return res.status(400).json({ success: false, message: 'Check-in token or scanned QR payload is required' });
    }

    // Check if member already checked in today
    const existingCheckIn = await Attendance.findOne({ member: memberId, date: today });
    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: `Already checked in today at ${new Date(existingCheckIn.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Keep up the great work!`,
        attendance: existingCheckIn,
      });
    }

    // Parse payload if it's full JSON string or pure token
    let tokenStr = qrToken.trim();
    try {
      if (tokenStr.startsWith('{') && tokenStr.endsWith('}')) {
        const parsed = JSON.parse(tokenStr);
        tokenStr = parsed.token || tokenStr;
      }
    } catch (e) {
      // Keep as string
    }

    // Find active QR session matching the token or matching today's active session
    let validSession = await QRCodeSession.findOne({
      token: tokenStr,
      active: true,
    });

    // Also accept matching codeString or active today token
    if (!validSession) {
      validSession = await QRCodeSession.findOne({
        date: today,
        active: true,
      });
      // Verify token match
      if (!validSession || (!tokenStr.includes(validSession.token) && tokenStr !== validSession.token)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired QR code. Please scan the current gym kiosk code.',
        });
      }
    }

    // Check if membership is expired or frozen for members
    const user = await User.findById(memberId);
    if (user.role === 'member' && user.membership?.status === 'Expired') {
      return res.status(403).json({
        success: false,
        message: 'Membership has expired! Please renew with front desk or online before checking in.',
      });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      member: memberId,
      date: today,
      checkInTime: new Date(),
      method: method,
      status: 'Present',
      qrSessionId: validSession.token,
      notes: `Checked in at ${validSession.location}`,
    });

    // Update streak on user
    user.streakDays = (user.streakDays || 0) + 1;
    user.lastCheckIn = new Date();
    await user.save();

    const populated = await Attendance.findById(attendance._id).populate('member', 'name email avatar membership');

    res.status(201).json({
      success: true,
      message: `Check-in Successful! Welcome to the gym, ${user.name}! 🔥`,
      attendance: populated,
      streakDays: user.streakDays,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all attendance logs with filters
// @route   GET /api/attendance/logs
// @access  Private (Admin, Trainer)
exports.getAllAttendanceLogs = async (req, res) => {
  try {
    const { date, memberId, startDate, endDate, limit = 100 } = req.query;
    let query = {};

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (memberId) {
      query.member = memberId;
    }

    const logs = await Attendance.find(query)
      .populate('member', 'name email phone membership avatar assignedTrainer')
      .sort({ checkInTime: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get personal attendance history
// @route   GET /api/attendance/my-logs
// @access  Private (Member, Trainer)
exports.getMyAttendanceLogs = async (req, res) => {
  try {
    const logs = await Attendance.find({ member: req.user._id })
      .sort({ checkInTime: -1 })
      .limit(60);

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export attendance to CSV dataset
// @route   GET /api/attendance/export-csv
// @access  Private (Admin)
exports.exportAttendanceCSV = async (req, res) => {
  try {
    const logs = await Attendance.find()
      .populate('member', 'name email phone membership')
      .sort({ checkInTime: -1 });

    const headers = ['Log ID', 'Member Name', 'Member Email', 'Phone', 'Membership Plan', 'Date', 'Check-In Time', 'Method', 'Status'];
    const rows = logs.map((log) => [
      log._id,
      log.member?.name || 'Unknown',
      log.member?.email || 'N/A',
      log.member?.phone || 'N/A',
      log.member?.membership?.planName || 'N/A',
      log.date,
      new Date(log.checkInTime).toLocaleString(),
      log.method,
      log.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=gym_attendance_${getTodayDateString()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
