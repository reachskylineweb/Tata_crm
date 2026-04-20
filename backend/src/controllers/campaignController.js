const db = require('../config/database');

/**
 * @desc    Get all campaigns
 * @route   GET /api/campaigns
 * @access  Private
 */
exports.getCampaigns = async (req, res, next) => {
  try {
    const [campaigns] = await db.query("SELECT * FROM campaigns ORDER BY created_at DESC");
    
    res.status(200).json({
      success: true,
      campaigns: campaigns
    });
  } catch (error) {
    console.error("[CAMPAIGN ERROR]:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get campaign metrics
 * @route   GET /api/campaigns/metrics
 * @access  Private (Admin/Campaign Team)
 */
exports.getMetrics = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT cm.*, u.full_name as entered_by_name,
             CASE WHEN cm.total_leads > 0 THEN ROUND(cm.ad_spend / cm.total_leads, 2) ELSE 0 END as cost_per_lead
      FROM campaign_metrics cm
      LEFT JOIN users u ON cm.entered_by = u.id
      ORDER BY cm.metric_date DESC
      LIMIT 60
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};
