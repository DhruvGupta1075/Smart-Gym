const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  checkWhitelistStatus,
  getWhitelist,
  addToWhitelist,
  removeFromWhitelist,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { checkWhitelist } = require('../middleware/whitelist');

router.post('/register', checkWhitelist, register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/check-whitelist', checkWhitelistStatus);

// Whitelist management
router.get('/whitelist', protect, authorize('admin'), getWhitelist);
router.post('/whitelist', protect, authorize('admin'), addToWhitelist);
router.delete('/whitelist/:id', protect, authorize('admin'), removeFromWhitelist);

module.exports = router;
