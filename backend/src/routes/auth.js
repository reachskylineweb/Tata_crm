const express = require('express');
const router = express.Router();
const { login, register, logout } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   POST /api/auth/logout
router.post('/logout', authenticate, logout);

/**
 * @route   POST /api/auth/change-password
 * @desc    Allows an authenticated admin to reset any user's password
 * @access  Admin only (requires valid JWT)
 *
 * Body: { user_id: number, new_password: string }
 */
router.post('/change-password', authenticate, authorize('admin'), async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const db = require('../config/database');
    const { user_id, new_password } = req.body;

    if (!user_id || !new_password || new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'user_id and new_password (min 8 chars) are required.' });
    }

    const hash = await bcrypt.hash(new_password, 10);
    const [result] = await db.query(
      'UPDATE users SET password_hash = ?, is_active = 1 WHERE id = ?',
      [hash, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: `Password updated for user ID ${user_id}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Password reset failed: ' + err.message });
  }
});

module.exports = router;