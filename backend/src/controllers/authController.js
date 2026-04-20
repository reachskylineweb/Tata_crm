const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').trim();
    const cleanPassword = password || '';

    // 1. Validation
    if (!identifier || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: "Email/Username and password required"
      });
    }

    // 2. Database Fetch
    const [users] = await db.query(
      "SELECT id, username, email, password_hash, full_name, role, dealer_id FROM users WHERE (email = ? OR username = ?) AND (is_active = TRUE OR is_active IS NULL)",
      [identifier, identifier]
    );

    if (users.length === 0) {
      console.log(`[AUTH] User not found: ${identifier}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const user = users[0];

    // 3. Bcrypt Comparison
    const isMatch = await bcrypt.compare(cleanPassword, user.password_hash);

    if (!isMatch) {
      console.log(`[AUTH] Password mismatch for: ${identifier}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // 4. JWT Generation
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        full_name: user.full_name,
        dealer_id: user.dealer_id
      },
      process.env.JWT_SECRET || 'Tata_CRM_2026_Prod_Secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 5. Response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        dealer_id: user.dealer_id
      }
    });

  } catch (error) {
    console.error("[LOGIN API ERROR]:", error.message);
    res.status(500).json({ success: false, message: "Internal server error during login" });
  }
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        status: "error",
        message: "Email, password and full name are required"
      });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "User with this email already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      "INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)",
      [username || email.split('@')[0], email, hashedPassword, full_name, role || 'dealer']
    );

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: {
        id: result.insertId,
        email,
        role: role || 'dealer'
      }
    });

  } catch (error) {
    console.error("[REGISTER API ERROR]:", error);
    next(error);
  }
};

/**
 * @desc    Logout user
 */
exports.logout = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Logged out successfully"
  });
};
