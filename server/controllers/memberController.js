const User = require('../models/User');
const WorkoutPlan = require('../models/WorkoutPlan');
const NutritionPlan = require('../models/NutritionPlan');
const ProgressLog = require('../models/ProgressLog');
const Attendance = require('../models/Attendance');

// @desc    Get member personal dashboard data
// @route   GET /api/member/dashboard
// @access  Private (Member, Admin, Trainer)
exports.getMemberDashboard = async (req, res) => {
  try {
    const memberId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    const [
      user,
      assignedWorkout,
      assignedNutrition,
      progressHistory,
      attendanceHistory,
      todayAttendance,
    ] = await Promise.all([
      User.findById(memberId).populate('assignedTrainer', 'name email phone specialization trainerDetails avatar'),
      WorkoutPlan.findOne({ member: memberId }).populate('trainer', 'name specialization avatar'),
      NutritionPlan.findOne({ member: memberId }).populate('trainer', 'name specialization avatar'),
      ProgressLog.find({ member: memberId }).sort({ date: 1 }),
      Attendance.find({ member: memberId }).sort({ checkInTime: -1 }).limit(30),
      Attendance.findOne({ member: memberId, date: today }),
    ]);

    // Calculate check-in streak
    const totalCheckIns = attendanceHistory.length;
    const isCheckedInToday = !!todayAttendance;

    res.status(200).json({
      success: true,
      user,
      assignedWorkout,
      assignedNutrition,
      progressHistory,
      attendanceHistory,
      isCheckedInToday,
      totalCheckIns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get assigned Workout Plan
// @route   GET /api/member/workout-plan
// @access  Private (Member)
exports.getMyWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({ member: req.user._id }).populate('trainer', 'name email phone avatar');
    res.status(200).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get assigned Nutrition Plan
// @route   GET /api/member/nutrition-plan
// @access  Private (Member)
exports.getMyNutritionPlan = async (req, res) => {
  try {
    const plan = await NutritionPlan.findOne({ member: req.user._id }).populate('trainer', 'name email phone avatar');
    res.status(200).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get member progress logs
// @route   GET /api/member/progress
// @access  Private (Member, Trainer, Admin)
exports.getMyProgress = async (req, res) => {
  try {
    const memberId = req.query.memberId || req.user._id;
    const logs = await ProgressLog.find({ member: memberId }).sort({ date: 1 });
    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a body progress measurement log
// @route   POST /api/member/progress
// @access  Private (Member, Trainer)
exports.addProgressLog = async (req, res) => {
  try {
    const {
      date = new Date().toISOString().split('T')[0],
      weightKg,
      bodyFatPercentage,
      measurements,
      benchPressMaxKg,
      squatMaxKg,
      deadliftMaxKg,
      notes,
      energyLevel,
      targetMemberId,
    } = req.body;

    const memberId = (req.user.role === 'trainer' || req.user.role === 'admin') && targetMemberId
      ? targetMemberId
      : req.user._id;

    if (!weightKg) {
      return res.status(400).json({ success: false, message: 'Weight (kg) is required' });
    }

    // Upsert for the same day or create new
    let log = await ProgressLog.findOne({ member: memberId, date });

    if (log) {
      log.weightKg = weightKg;
      if (bodyFatPercentage !== undefined) log.bodyFatPercentage = bodyFatPercentage;
      if (measurements) log.measurements = { ...log.measurements, ...measurements };
      if (benchPressMaxKg !== undefined) log.benchPressMaxKg = benchPressMaxKg;
      if (squatMaxKg !== undefined) log.squatMaxKg = squatMaxKg;
      if (deadliftMaxKg !== undefined) log.deadliftMaxKg = deadliftMaxKg;
      if (notes !== undefined) log.notes = notes;
      if (energyLevel !== undefined) log.energyLevel = energyLevel;
      await log.save();
    } else {
      log = await ProgressLog.create({
        member: memberId,
        date,
        weightKg,
        bodyFatPercentage: bodyFatPercentage || 0,
        measurements: measurements || {},
        benchPressMaxKg: benchPressMaxKg || 0,
        squatMaxKg: squatMaxKg || 0,
        deadliftMaxKg: deadliftMaxKg || 0,
        notes: notes || '',
        energyLevel: energyLevel || 8,
      });
    }

    res.status(201).json({ success: true, message: 'Progress recorded successfully', log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a progress log
// @route   DELETE /api/member/progress/:id
// @access  Private (Member, Trainer, Admin)
exports.deleteProgressLog = async (req, res) => {
  try {
    const log = await ProgressLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Progress log not found' });
    }

    if (log.member.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'trainer') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await ProgressLog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Progress log deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
