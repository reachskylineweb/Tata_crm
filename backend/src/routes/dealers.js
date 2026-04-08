const express = require('express');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const router = express.Router();

// GET /api/dealers - List all dealers
router.get('/', authenticate, async (req, res) => {
  try {
    const [dealers] = await db.query(`
      SELECT d.*, 
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT l.id) as total_leads,
        COUNT(DISTINCT CASE WHEN l.status='Completed' THEN l.id END) as completed_leads,
        COUNT(DISTINCT CASE WHEN l.status!='Completed' THEN l.id END) as pending_leads,
        COUNT(DISTINCT CASE WHEN l.follow_up_date = CURDATE() AND l.status!='Completed' THEN l.id END) as today_followups,
        COUNT(DISTINCT CASE WHEN l.follow_up_date > CURDATE() AND l.status!='Completed' THEN l.id END) as upcoming_followups,
        COUNT(DISTINCT CASE WHEN l.follow_up_date < CURDATE() AND l.status!='Completed' THEN l.id END) as overdue_followups,
        MAX(l.follow_up_date) as last_followup
      FROM dealers d
      LEFT JOIN users u ON d.id = u.dealer_id
      LEFT JOIN leads l ON d.id = l.dealer_id
      GROUP BY d.id
      ORDER BY (d.dealer_name = 'Others') ASC, d.dealer_name ASC
    `);

    // Fetch remarks distribution for each dealer for the pie charts
    const [remarksData] = await db.query(`
      SELECT dealer_id, telecaller_remark, COUNT(*) as count 
      FROM leads 
      WHERE telecaller_remark IS NOT NULL AND telecaller_remark != ''
      GROUP BY dealer_id, telecaller_remark
    `);

    const result = dealers.map(d => {
      const dealerRemarks = remarksData
        .filter(r => r.dealer_id === d.id)
        .map(r => ({ label: r.telecaller_remark, value: r.count }));
      return { ...d, remarks_distribution: dealerRemarks };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Dealers API error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dealers/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM dealers WHERE id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Dealer not found' });

    // Get districts
    const [districts] = await db.query(
      `SELECT dealer_district as district FROM district_dealer_mapping WHERE dealer_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...rows[0], districts } });
  } catch (err) {
    console.error('Fetch dealer details error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dealers/:id/leads - Get leads for a specific dealer
router.get('/:id/leads', authenticate, async (req, res) => {
  try {
    const dealerId = req.params.id;

    // Dealers can only see their own
    if (req.user.role === 'dealer' && req.user.dealer_id != dealerId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [leads] = await db.query(
      `SELECT * FROM leads WHERE dealer_id = ? ORDER BY lead_date DESC, id DESC LIMIT ? OFFSET ?`,
      [dealerId, parseInt(limit), offset]
    );
    const [count] = await db.query(`SELECT COUNT(*) as total FROM leads WHERE dealer_id = ?`, [dealerId]);

    res.json({
      success: true,
      data: leads,
      pagination: { total: count[0].total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/dealers - Create a new dealer + login account (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { dealer_name, contact_person, phone, email, username, password, sheet_name } = req.body;

    if (!dealer_name || !username || !password || !email) {
      return res.status(400).json({ success: false, message: 'Dealer name, username, email and password are required' });
    }

    // 1. Create dealer record
    const [dealerResult] = await db.query(
      `INSERT INTO dealers (dealer_name, sheet_name, contact_person, phone, email) VALUES (?, ?, ?, ?, ?)`,
      [dealer_name, sheet_name || dealer_name, contact_person || '', phone || '', email]
    );
    const newDealerId = dealerResult.insertId;

    // 2. Create linked user account
    const password_hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (username, full_name, email, password_hash, role, dealer_id) VALUES (?, ?, ?, ?, 'dealer', ?)`,
      [username, contact_person || dealer_name, email, password_hash, newDealerId]
    );

    res.status(201).json({ success: true, message: 'Dealer created successfully', dealer_id: newDealerId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }
    console.error('Create dealer error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/dealers/:id - Update dealer info (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { dealer_name, contact_person, phone, email } = req.body;
    await db.query(
      `UPDATE dealers SET dealer_name=?, contact_person=?, phone=?, email=? WHERE id=?`,
      [dealer_name, contact_person, phone, email, req.params.id]
    );
    res.json({ success: true, message: 'Dealer updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dealers/:id/users - Get users for a dealer
router.get('/:id/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, username, email, full_name, is_active, created_at FROM users WHERE dealer_id = ?`,
      [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dealers/my/dses-stats - Get DSE list with their stats for the current dealer
router.get('/my/dses-stats', authenticate, async (req, res) => {
  try {
    const dealerId = req.user.dealer_id;
    if (!dealerId) return res.status(403).json({ success: false, message: 'Only dealers can access this' });

    const [dses] = await db.query(`
      SELECT 
        u.id, u.full_name, u.username, u.email,
        COUNT(l.id) as total_assigned,
        COUNT(CASE WHEN l.status != 'Completed' THEN 1 END) as total_pending,
        COUNT(CASE WHEN l.status = 'Completed' THEN 1 END) as total_completed,
        COUNT(CASE WHEN l.follow_up_date IS NOT NULL AND l.status != 'Completed' THEN 1 END) as total_follow_up
      FROM users u
      LEFT JOIN leads l ON u.full_name = l.assigned_to_dse AND l.dealer_id = u.dealer_id
      WHERE u.dealer_id = ? AND u.role = 'dse'
      GROUP BY u.id
    `, [dealerId]);

    res.json({ success: true, data: dses });
  } catch (err) {
    console.error('DSE stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/dealers/my/dses - Add a new DSE
router.post('/my/dses', authenticate, async (req, res) => {
  try {
    const dealerId = req.user.dealer_id;
    if (!dealerId) return res.status(403).json({ success: false, message: 'Only dealers can add DSEs' });

    const { username, full_name, email, password } = req.body;
    if (!username || !full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    
    await db.query(
      'INSERT INTO users (username, full_name, email, password_hash, role, dealer_id) VALUES (?, ?, ?, ?, "dse", ?)',
      [username, full_name, email, password_hash, dealerId]
    );

    res.json({ success: true, message: 'DSE created successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }
    console.error('Create DSE error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
