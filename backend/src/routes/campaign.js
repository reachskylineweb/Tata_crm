const express = require('express');
const router = express.Router();
const { getCampaigns, getMetrics } = require('../controllers/campaignController');
const { authenticate, authorize } = require('../middleware/auth');
const db = require('../config/database');

// GET /api/campaigns - List all campaigns
router.get('/', authenticate, getCampaigns);

// GET /api/campaigns/metrics - List campaign metrics
router.get('/metrics', authenticate, authorize('admin', 'campaign_team', 'campaign_manager'), getMetrics);

// POST /api/campaigns/metrics - Add or update a campaign metric
router.post('/metrics', authenticate, authorize('admin', 'campaign_team', 'campaign_manager'), async (req, res) => {
  try {
    const { metric_date, total_leads, ad_spend } = req.body;
    
    if (!metric_date || total_leads === undefined || ad_spend === undefined) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Try an insert, fallback safely to update if database doesn't have metric_date as unique key
    const [existing] = await db.query('SELECT id FROM campaign_metrics WHERE metric_date = DATE(?)', [metric_date]);
    
    if (existing.length > 0) {
      await db.query(
        'UPDATE campaign_metrics SET total_leads = ?, ad_spend = ?, entered_by = ? WHERE id = ?',
        [total_leads, ad_spend, req.user.id, existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO campaign_metrics (metric_date, total_leads, ad_spend, entered_by) VALUES (?, ?, ?, ?)',
        [metric_date, total_leads, ad_spend, req.user.id]
      );
    }
    
    res.json({ success: true, message: 'Metrics saved successfully' });
  } catch (err) {
    console.error('Save metrics error:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

module.exports = router;
