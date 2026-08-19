const express = require('express');
const router = express.Router();
const {
  getTrainerDashboard,
  getMyClients,
  createWorkoutPlan,
  getWorkoutPlans,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  createNutritionPlan,
  getNutritionPlans,
  updateNutritionPlan,
  deleteNutritionPlan,
} = require('../controllers/trainerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('trainer', 'admin'));

router.get('/dashboard', getTrainerDashboard);
router.get('/clients', getMyClients);

// Workout Plans
router.route('/workout-plans')
  .post(createWorkoutPlan)
  .get(getWorkoutPlans);

router.route('/workout-plans/:id')
  .put(updateWorkoutPlan)
  .delete(deleteWorkoutPlan);

// Nutrition Plans
router.route('/nutrition-plans')
  .post(createNutritionPlan)
  .get(getNutritionPlans);

router.route('/nutrition-plans/:id')
  .put(updateNutritionPlan)
  .delete(deleteNutritionPlan);

module.exports = router;
