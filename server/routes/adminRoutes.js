const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getAllTrainers,
  generateDailyQRCode,
  getActiveQRCode,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Admin protected routes
router.use(protect);

// QR Code endpoints accessible to trainers and members for fetching active code
router.get('/active-qr', getActiveQRCode);

// Admin-only routes
router.get('/dashboard-stats', authorize('admin'), getDashboardStats);
router.get('/members', authorize('admin', 'trainer'), getAllMembers);
router.get('/members/:id', authorize('admin', 'trainer'), getMemberById);
router.post('/members', authorize('admin'), createMember);
router.put('/members/:id', authorize('admin'), updateMember);
router.delete('/members/:id', authorize('admin'), deleteMember);
router.get('/trainers', authorize('admin', 'trainer', 'member'), getAllTrainers);
router.post('/generate-qr', authorize('admin'), generateDailyQRCode);

module.exports = router;
