const express = require('express');
const router = express.Router();
const {
  checkIn,
  getAllAttendanceLogs,
  getMyAttendanceLogs,
  exportAttendanceCSV,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.post('/check-in', checkIn);
router.get('/my-logs', getMyAttendanceLogs);
router.get('/logs', authorize('admin', 'trainer'), getAllAttendanceLogs);
router.get('/export-csv', authorize('admin'), exportAttendanceCSV);

module.exports = router;
