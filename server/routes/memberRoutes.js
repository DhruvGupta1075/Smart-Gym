const express = require('express');
const router = express.Router();
const {
  getMemberDashboard,
  getMyWorkoutPlan,
  getMyNutritionPlan,
  getMyProgress,
  addProgressLog,
  deleteProgressLog,
} = require('../controllers/memberController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getMemberDashboard);
router.get('/workout-plan', getMyWorkoutPlan);
router.get('/nutrition-plan', getMyNutritionPlan);
router.route('/progress')
  .get(getMyProgress)
  .post(addProgressLog);

router.delete('/progress/:id', deleteProgressLog);

module.exports = router;
