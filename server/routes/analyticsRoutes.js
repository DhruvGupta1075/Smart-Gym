const express = require('express');
const router = express.Router();
const { getDetailedAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('admin', 'trainer'));

router.get('/detailed', getDetailedAnalytics);

module.exports = router;
