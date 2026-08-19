const User = require('../models/User');
const Attendance = require('../models/Attendance');

// @desc    Get detailed deep-dive analytics for Chart.js dashboards
// @route   GET /api/analytics/detailed
// @access  Private (Admin, Trainer)
exports.getDetailedAnalytics = async (req, res) => {
  try {
    const [allMembers, allAttendance, trainers] = await Promise.all([
      User.find({ role: 'member' }).populate('assignedTrainer', 'name'),
      Attendance.find().sort({ checkInTime: -1 }).limit(1000),
      User.find({ role: 'trainer' }),
    ]);

    // 1. Membership Plan Distribution
    const planCounts = {
      'Basic Monthly': 0,
      'Silver Quarterly': 0,
      'Gold Half-Yearly': 0,
      'Platinum Annual': 0,
      'VIP Elite': 0,
    };
    const planRevenue = {
      'Basic Monthly': 0,
      'Silver Quarterly': 0,
      'Gold Half-Yearly': 0,
      'Platinum Annual': 0,
      'VIP Elite': 0,
    };

    allMembers.forEach((m) => {
      const plan = m.membership?.planName || 'Basic Monthly';
      const price = m.membership?.price || 49;
      if (planCounts[plan] !== undefined) {
        planCounts[plan]++;
        planRevenue[plan] += price;
      }
    });

    // 2. Peak Hours Distribution (6:00 to 22:00)
    const hourlyDistribution = Array.from({ length: 17 }, (_, i) => ({
      hour: `${(i + 6).toString().padStart(2, '0')}:00`,
      checkIns: 0,
    }));

    allAttendance.forEach((att) => {
      const hour = new Date(att.checkInTime).getHours();
      if (hour >= 6 && hour <= 22) {
        const index = hour - 6;
        if (hourlyDistribution[index]) {
          hourlyDistribution[index].checkIns++;
        }
      }
    });

    // 3. Day of Week Attendance
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayDistribution = daysMap.map((day) => ({ day, count: 0 }));

    allAttendance.forEach((att) => {
      const dayIndex = new Date(att.checkInTime).getDay();
      weekdayDistribution[dayIndex].count++;
    });

    // 4. Trainer Workload
    const trainerWorkload = trainers.map((t) => {
      const count = allMembers.filter((m) => m.assignedTrainer && m.assignedTrainer._id.toString() === t._id.toString()).length;
      return {
        trainerName: t.name,
        clientCount: count,
      };
    });

    // 5. Monthly Revenue Simulation (Past 6 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const monthlyRevenue = [];

    for (let i = 5; i >= 0; i--) {
      const mIndex = (currentMonth - i + 12) % 12;
      const baseRev = Object.values(planRevenue).reduce((a, b) => a + b, 0);
      const simulatedFactor = 0.85 + ((5 - i) * 0.05) + (Math.random() * 0.1 - 0.05);
      monthlyRevenue.push({
        month: monthNames[mIndex],
        revenue: Math.round(baseRev * simulatedFactor),
        newMembers: Math.round(allMembers.length * 0.2 * (0.8 + (5 - i) * 0.1)),
      });
    }

    res.status(200).json({
      success: true,
      analytics: {
        totalMembersCount: allMembers.length,
        planCounts,
        planRevenue,
        hourlyDistribution,
        weekdayDistribution,
        trainerWorkload,
        monthlyRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
