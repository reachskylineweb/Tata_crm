const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Upload directory — consistent with server.js static serving
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `leads_${Date.now()}_${file.originalname}`);
  }
});

const MAX_MB = parseInt(process.env.UPLOAD_MAX_SIZE_MB || '50', 10);

const upload = multer({
  storage,
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls', '.csv'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'));
    }
  }
});

// Column Variants for Intelligent Auto-Mapping
const COLUMN_MAP = {
  // Full Name
  'full name': 'full_name',
  'full_name': 'full_name',
  'name': 'full_name',
  'customer name': 'full_name',
  'cust_name': 'full_name',
  'customer_name': 'full_name',

  // Phone
  'phone_number': 'phone_number',
  'phone number': 'phone_number',
  'phone': 'phone_number',
  'mobile': 'phone_number',
  'mobile number': 'phone_number',
  'contact': 'phone_number',
  'contact_number': 'phone_number',

  // Location/District
  'location': 'location',
  'district': 'location',
  'city': 'location',
  'மாவட்டம்': 'location',
  'உங்கள்_மாவட்டம்': 'location',

  // Model/Vehicle
  'model': 'model',
  'vehicle': 'model',
  'product': 'model',
  'உங்களுக்கு_விருப்பப்பட்ட_வாகனம்': 'model',
  'vehicle_type': 'model',
};

// Normalize Indian numbers: remove prefix +91, 91, 0, find last 10 digits
function normalizePhone(phone) {
  if (!phone) return '';
  // Force to string and remove all non-digits
  let cleaned = phone.toString().replace(/\D/g, '');
  
  // Rule: If the length is at least 10, keep ONLY the last 10 digits
  // This handles +919876543210, 919876543210, 09876543210, 9876543210 as the SAME.
  if (cleaned.length >= 10) {
    return cleaned.slice(-10);
  }
  return cleaned;
}

// Normalize strings for uniform matching
function normalizeDistrict(district) {
  if (!district) return 'others';
  return district.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

// ─────────────────────────────────────────────────────────────────
// TATA MOTORS: Task Assigning Rule (Refined 2026-03-24)
//
// Rules:
//  1. For Tue, Wed, Thu, Fri (and Sat/Sun):
//       - Find the latest date (max) among all leads in the uploaded sheet.
//       - Assign ALL leads in that batch to that latest date.
//  2. For Monday:
//       - Keep the original date from the lead sheet for each lead (Saturday/Sunday leads).
//       - Do not change or consolidate the dates.
// ─────────────────────────────────────────────────────────────────

/** Parse any date-like value into a YYYY-MM-DD string (UTC-safe), or null */
function parseToYMD(val) {
  if (!val) return null;

  let ymd = null;

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    // Extract local parts directly to avoid UTC shift
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    ymd = `${y}-${m}-${d}`;
  } else if (typeof val === 'number') {
    // Excel serial date (days since 1900-01-01)
    try {
      const parsed = XLSX.SSF.parse_date_code(val);      // { y, m, d, ... }
      const m = String(parsed.m).padStart(2, '0');
      const d = String(parsed.d).padStart(2, '0');
      ymd = `${parsed.y}-${m}-${d}`;
    } catch { return null; }
  } else {
    // String – grab the date portion only, ignore time
    const s = String(val).trim();
    const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) { ymd = `${m[1]}-${m[2]}-${m[3]}`; }
    else {
      const d = new Date(s);
      if (isNaN(d.getTime())) return null;
      // Extract local parts directly to avoid UTC shift
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      ymd = `${year}-${month}-${day}`;
    }
  }

  return ymd;                                             // YYYY-MM-DD
}

/** Add `n` days to a YYYY-MM-DD string, return YYYY-MM-DD (UTC) */
function addDays(ymd, n) {
  const d = new Date(ymd + 'T00:00:00Z');               // UTC midnight
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split('T')[0];
}

/** Day-of-week for a YYYY-MM-DD string (0=Sun … 6=Sat, UTC) */
function dowOf(ymd) {
  return new Date(ymd + 'T00:00:00Z').getUTCDay();
}

function adjustLeadDate(rawLeadDate, uploadDateStr, maxLeadDateInBatch) {
  // uploadDateStr = today's date as YYYY-MM-DD
  const today = uploadDateStr;
  const dow = dowOf(today);

  // ── MONDAY RULE ─────────────────────────────────────────────
  // Keep original date from sheet (no changes)
  if (dow === 1) {
    const parsed = parseToYMD(rawLeadDate);
    if (parsed) return parsed;
    
    // Fallback if no date in row: use Saturday (2 days before Monday)
    return addDays(today, -2);
  }

  // ── TUE, WED, THU, FRI (Latest Date Rule) ───────────────────
  // Use the maximum date found in the entire sheet
  if (maxLeadDateInBatch) {
    return maxLeadDateInBatch;
  }

  // Final fallback: Yesterday
  return addDays(today, -1);
}

// Find dealer by district
async function findDealerByDistrict(district) {
  const normalized = normalizeDistrict(district);
  const [rows] = await db.query(
    `SELECT d.id, d.dealer_name FROM district_dealer_mapping ddm 
     JOIN dealers d ON ddm.dealer_id = d.id 
     WHERE ddm.district_normalized = ?`,
    [normalized]
  );
  if (rows.length > 0) return rows[0];

  // Fallback: try partial match
  const [rows2] = await db.query(
    `SELECT d.id, d.dealer_name FROM district_dealer_mapping ddm 
     JOIN dealers d ON ddm.dealer_id = d.id 
     WHERE ? LIKE CONCAT('%', ddm.district_normalized, '%') OR ddm.district_normalized LIKE CONCAT('%', ?, '%')
     LIMIT 1`,
    [normalized, normalized]
  );
  if (rows2.length > 0) return rows2[0];

  // Default to "Others"
  const [others] = await db.query(`SELECT id, dealer_name FROM dealers WHERE dealer_name = 'Others' LIMIT 1`);
  return others[0] || { id: 13, dealer_name: 'Others' };
}

// POST /api/upload/leads
router.post('/leads', authenticate, authorize('admin', 'campaign_team'), upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  console.log(`[UPLOAD] Starting batch: ${req.file.originalname}`);

  const now = new Date();
  const uploadDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  let batchId;

  try {
    // 1. Initialize Batch
    const [batchResult] = await db.query(
      `INSERT INTO upload_batches (upload_date, file_name, total_records, uploaded_by, status) VALUES (?, ?, 0, ?, 'processing')`,
      [uploadDate, req.file.originalname, req.user.id]
    );
    batchId = batchResult.insertId;

    // 2. Parse File
    const workbook = XLSX.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (rawData.length < 2) {
      await db.query(`UPDATE upload_batches SET status='failed', error_log='Empty file or no data' WHERE id=?`, [batchId]);
      return res.status(400).json({ success: false, message: 'File is empty or invalid' });
    }

    // 3. Intelligent Header Mapping
    const rawHeaders = rawData[0].map(h => (h || '').toString().trim());
    const headers = rawHeaders.map(h => h.toLowerCase());
    const colIndex = {};

    headers.forEach((h, i) => {
      // Direct Map Match
      if (COLUMN_MAP[h]) {
        colIndex[COLUMN_MAP[h]] = i;
      } else {
        // Fuzzy/Substring Match
        for (const [key, field] of Object.entries(COLUMN_MAP)) {
          if (h.includes(key) || key.includes(h)) {
            if (colIndex[field] === undefined) colIndex[field] = i; 
          }
        }
      }
    });

    console.log(`[UPLOAD] Header mapping indices:`, colIndex);

    // 4. Pre-scan for Max Date
    let createdTimeIdx = headers.findIndex(h => h.includes('created_time') || h.includes('date'));
    const dataRows = rawData.slice(1);
    let maxLeadDateInBatch = null;

    if (createdTimeIdx >= 0) {
      dataRows.forEach(row => {
        const parsedYMD = parseToYMD(row[createdTimeIdx]);
        if (parsedYMD && (!maxLeadDateInBatch || parsedYMD > maxLeadDateInBatch)) {
          maxLeadDateInBatch = parsedYMD;
        }
      });
    }

    // 5. Counters
    let stats = { processed: 0, duplicate: 0, invalid: 0, missing: 0 };
    const insertedLeads = [];
    const duplicatesToStore = [];
    const errors = [];

    // Pre-fetch existing normalized phones to check duplicates across entire DB
    // Optimization: Only fetch phones for leads added in the last 180 days to keep query fast
    const [existingRows] = await db.query(`SELECT phone_number FROM leads WHERE created_at > DATE_SUB(NOW(), INTERVAL 6 MONTH)`);
    const globalPhoneSet = new Set(existingRows.map(r => normalizePhone(r.phone_number)));
    const batchSeenPhones = new Set();

    // 6. Main Processing Loop
    for (let rowIdx = 0; rowIdx < dataRows.length; rowIdx++) {
      const row = dataRows[rowIdx];
      if (!row || row.every(cell => cell === '' || cell === null)) continue;

      const getVal = (field) => colIndex[field] !== undefined ? (row[colIndex[field]] || '').toString().trim() : '';

      const rawFullName = getVal('full_name');
      const rawPhone = getVal('phone_number');
      const location = getVal('location') || 'others';
      const model = getVal('model');
      const rawLeadDate = createdTimeIdx >= 0 ? row[createdTimeIdx] : null;

      // VALIDATION 1: Missing Identity
      if (!rawFullName && !rawPhone) {
        stats.missing++;
        continue;
      }

      const phone = normalizePhone(rawPhone);
      const fullName = rawFullName || 'Customer';
      const adjustedDate = adjustLeadDate(rawLeadDate, uploadDate, maxLeadDateInBatch);

      // VALIDATION 2: Phone Format
      if (!phone || phone.length < 10) {
        duplicatesToStore.push([adjustedDate, fullName, location, model, rawPhone, batchId, 'Invalid phone number']);
        stats.invalid++;
        continue;
      }

      // VALIDATION 3: Duplicates
      if (globalPhoneSet.has(phone) || batchSeenPhones.has(phone)) {
        duplicatesToStore.push([adjustedDate, fullName, location, model, rawPhone, batchId, 'Duplicate phone']);
        stats.duplicate++;
        continue;
      }

      // Valid Row -> Prepare for Insert
      try {
        const dealer = await findDealerByDistrict(location);
        insertedLeads.push([
          adjustedDate, fullName, location, model, phone, 
          dealer.id, dealer.dealer_name, batchId, 'In Progress', 'In Progress'
        ]);
        batchSeenPhones.add(phone);
        stats.processed++;
      } catch (err) {
        errors.push(`Row ${rowIdx + 2}: ${err.message}`);
        stats.invalid++;
      }
    }

    // 7. Bulk Operations
    if (insertedLeads.length > 0) {
      await db.query(
        `INSERT INTO leads (lead_date, full_name, location, model, phone_number, dealer_id, dealer_name, upload_batch_id, status, dse_status) VALUES ?`,
        [insertedLeads]
      );
    }

    if (duplicatesToStore.length > 0) {
      // Check if 'reason' column exists in duplicate_leads by catching error safely
      try {
        await db.query(
          `INSERT INTO duplicate_leads (lead_date, full_name, location, model, phone_number, upload_batch_id, reason) VALUES ?`,
          [duplicatesToStore]
        );
      } catch (e) {
        // Fallback if 'reason' column was not added
        const legacyDups = duplicatesToStore.map(d => d.slice(0, 6));
        await db.query(
          `INSERT INTO duplicate_leads (lead_date, full_name, location, model, phone_number, upload_batch_id) VALUES ?`,
          [legacyDups]
        );
      }
    }

    // 8. Update Batch Record
    await db.query(
      `UPDATE upload_batches SET 
        status='completed', 
        total_records=?, 
        processed_records=?, 
        duplicate_records=?, 
        invalid_records=?, 
        error_log=? 
       WHERE id=?`,
      [dataRows.length, stats.processed, stats.duplicate, stats.invalid, errors.length > 0 ? errors.slice(0, 10).join('; ') : null, batchId]
    );

    console.log(`[UPLOAD] Batch ${batchId} done. Added: ${stats.processed}, Dups: ${stats.duplicate}, Invalid: ${stats.invalid}`);

    res.json({
      success: true,
      message: `${stats.processed} leads added successfully!`,
      data: {
        batch_id: batchId,
        total_rows: dataRows.length,
        processed: stats.processed,
        duplicates: stats.duplicate,
        invalid: stats.invalid,
        missing: stats.missing,
        errors: errors.slice(0, 5)
      }
    });

  } catch (err) {
    console.error('[UPLOAD] Fatal Error:', err);
    if (batchId) {
      await db.query(`UPDATE upload_batches SET status='failed', error_log=? WHERE id=?`, [err.message.substring(0, 500), batchId]);
    }
    res.status(500).json({ success: false, message: 'Processing failed: ' + err.message });
  }
});



// GET /api/upload/batches - Get upload history
router.get('/batches', authenticate, authorize('admin', 'campaign_team'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ub.*, u.full_name as uploaded_by_name 
       FROM upload_batches ub 
       LEFT JOIN users u ON ub.uploaded_by = u.id 
       ORDER BY ub.created_at DESC 
       LIMIT 50`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
