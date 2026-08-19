const User = require('../models/User');
const WorkoutPlan = require('../models/WorkoutPlan');
const NutritionPlan = require('../models/NutritionPlan');
const ProgressLog = require('../models/ProgressLog');
const Attendance = require('../models/Attendance');

// @desc    Get Trainer Dashboard Overview
// @route   GET /api/trainer/dashboard
// @access  Private (Trainer, Admin)
exports.getTrainerDashboard = async (req, res) => {
  try {
    const trainerId = req.user._id;

    const [clients, workoutPlans, nutritionPlans] = await Promise.all([
      User.find({ assignedTrainer: trainerId, role: 'member' }),
      WorkoutPlan.find({ trainer: trainerId }).populate('member', 'name email avatar'),
      NutritionPlan.find({ trainer: trainerId }).populate('member', 'name email avatar'),
    ]);

    const clientIds = clients.map((c) => c._id);
    const today = new Date().toISOString().split('T')[0];

    const todayCheckIns = await Attendance.find({
      member: { $in: clientIds },
      date: today,
    }).populate('member', 'name email avatar');

    // Recent progress updates from clients
    const recentProgress = await ProgressLog.find({
      member: { $in: clientIds },
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('member', 'name email avatar');

    res.status(200).json({
      success: true,
      stats: {
        totalClients: clients.length,
        activeWorkoutPlans: workoutPlans.length,
        activeNutritionPlans: nutritionPlans.length,
        todayClientAttendanceCount: todayCheckIns.length,
      },
      clients,
      workoutPlans,
      nutritionPlans,
      todayCheckIns,
      recentProgress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all assigned clients with full progress summaries
// @route   GET /api/trainer/clients
// @access  Private (Trainer, Admin)
exports.getMyClients = async (req, res) => {
  try {
    const trainerId = req.user._id;
    const clients = await User.find({ assignedTrainer: trainerId, role: 'member' });

    const clientsWithProgress = await Promise.all(
      clients.map(async (client) => {
        const [latestProgress, activeWorkout, activeNutrition, attendanceCount] = await Promise.all([
          ProgressLog.findOne({ member: client._id }).sort({ date: -1 }),
          WorkoutPlan.findOne({ member: client._id }),
          NutritionPlan.findOne({ member: client._id }),
          Attendance.countDocuments({ member: client._id }),
        ]);

        return {
          ...client.toObject(),
          latestProgress,
          activeWorkout,
          activeNutrition,
          attendanceCount,
        };
      })
    );

    res.status(200).json({ success: true, count: clientsWithProgress.length, clients: clientsWithProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a Workout Plan
// @route   POST /api/trainer/workout-plans
// @access  Private (Trainer, Admin)
exports.createWorkoutPlan = async (req, res) => {
  try {
    const { title, description, goal, difficulty, member, isTemplate, schedule } = req.body;

    if (!title || !schedule || schedule.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide title and at least one day schedule' });
    }

    const plan = await WorkoutPlan.create({
      title,
      description,
      goal,
      difficulty,
      trainer: req.user._id,
      member: member || null,
      isTemplate: !!isTemplate,
      schedule,
    });

    const populated = await WorkoutPlan.findById(plan._id).populate('member', 'name email');
    res.status(201).json({ success: true, message: 'Workout plan created successfully', plan: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Workout Plans created by Trainer or Templates
// @route   GET /api/trainer/workout-plans
// @access  Private (Trainer, Admin)
exports.getWorkoutPlans = async (req, res) => {
  try {
    const { memberId } = req.query;
    let query = { trainer: req.user._id };

    if (memberId) {
      query.member = memberId;
    }

    const plans = await WorkoutPlan.find(query).populate('member', 'name email avatar').sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: plans.length, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a Workout Plan
// @route   PUT /api/trainer/workout-plans/:id
// @access  Private (Trainer, Admin)
exports.updateWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }

    // Allow author trainer or admin
    if (plan.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this plan' });
    }

    const updated = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('member', 'name email');
    res.status(200).json({ success: true, message: 'Workout plan updated', plan: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a Workout Plan
// @route   DELETE /api/trainer/workout-plans/:id
// @access  Private (Trainer, Admin)
exports.deleteWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }

    if (plan.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this plan' });
    }

    await WorkoutPlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Workout plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a Nutrition Plan
// @route   POST /api/trainer/nutrition-plans
// @access  Private (Trainer, Admin)
exports.createNutritionPlan = async (req, res) => {
  try {
    const { title, goal, targetCalories, targetMacros, waterLitersPerDay, member, isTemplate, meals, guidelines } = req.body;

    if (!title || !meals || meals.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide a title and at least one meal' });
    }

    const plan = await NutritionPlan.create({
      title,
      goal,
      targetCalories: targetCalories || 2400,
      targetMacros: targetMacros || { proteinGrams: 160, carbsGrams: 250, fatsGrams: 65 },
      waterLitersPerDay: waterLitersPerDay || 3.5,
      trainer: req.user._id,
      member: member || null,
      isTemplate: !!isTemplate,
      meals,
      guidelines: guidelines || [],
    });

    const populated = await NutritionPlan.findById(plan._id).populate('member', 'name email');
    res.status(201).json({ success: true, message: 'Nutrition plan created successfully', plan: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Nutrition Plans
// @route   GET /api/trainer/nutrition-plans
// @access  Private (Trainer, Admin)
exports.getNutritionPlans = async (req, res) => {
  try {
    const { memberId } = req.query;
    let query = { trainer: req.user._id };

    if (memberId) {
      query.member = memberId;
    }

    const plans = await NutritionPlan.find(query).populate('member', 'name email avatar').sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: plans.length, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a Nutrition Plan
// @route   PUT /api/trainer/nutrition-plans/:id
// @access  Private (Trainer, Admin)
exports.updateNutritionPlan = async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Nutrition plan not found' });
    }

    if (plan.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this plan' });
    }

    const updated = await NutritionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('member', 'name email');
    res.status(200).json({ success: true, message: 'Nutrition plan updated', plan: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a Nutrition Plan
// @route   DELETE /api/trainer/nutrition-plans/:id
// @access  Private (Trainer, Admin)
exports.deleteNutritionPlan = async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Nutrition plan not found' });
    }

    if (plan.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this plan' });
    }

    await NutritionPlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Nutrition plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
