const XLSX = require('xlsx');

// Mock objects for the helpers in upload.js
const COLUMN_MAP = {
  'உங்கள்_மாவட்டம்': 'location',
  'உங்களுக்கு_விருப்பப்பட்ட_வாகனம்': 'model',
  'full name': 'full_name',
  'full_name': 'full_name',
  'phone_number': 'phone_number',
  'phone number': 'phone_number',
  'name': 'full_name',
  'location': 'location',
  'model': 'model',
};

function parseToYMD(val) {
  if (!val) return null;
  const s = String(val).trim();
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function addDays(ymd, n) {
  const d = new Date(ymd + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split('T')[0];
}

function dowOf(ymd) {
  return new Date(ymd + 'T00:00:00Z').getUTCDay();
}

function adjustLeadDate(leadDate, uploadDateStr) {
  const today = uploadDateStr;
  const dow   = dowOf(today);
  const yesterday = addDays(today, -1);
  if (dow === 1) { // Monday
    const sunday   = yesterday;
    const saturday = addDays(today, -2);
    const leadYMD = parseToYMD(leadDate);
    if (leadYMD === sunday)   return sunday;
    if (leadYMD === saturday) return saturday;
    return saturday;
  }
  return yesterday; // Normal days (including Friday)
}

// ─────────────────────────────────────────────────────────────────
// ACTUAL TEST DATA FROM THE UPLOADED FILE
// Today = Mar 20, 2026 (Friday)
const today = '2026-03-20';

// Test case 1: Input lead dated 18 Mar
console.log('Today:', today, '(Day', dowOf(today) + ')');
console.log('Input Lead Date: 2026-03-18  → Adjusted:', adjustLeadDate('2026-03-18', today));
console.log('Input Lead Date: 2026-03-19  → Adjusted:', adjustLeadDate('2026-03-19', today));
console.log('Input Lead Date: today (20)  → Adjusted:', adjustLeadDate(today, today));
console.log('Input Lead Date: null        → Adjusted:', adjustLeadDate(null, today));
