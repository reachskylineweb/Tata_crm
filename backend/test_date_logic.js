// ─────────────────────────────────────────────────────────────────
// TEST: Tata Motors Lead Assignment Date Logic (UTC-safe)
// ─────────────────────────────────────────────────────────────────

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

  if (dow === 1) {                                        // Monday
    const sunday   = yesterday;                           // Mon-1 = Sun
    const saturday = addDays(today, -2);                  // Mon-2 = Sat
    const leadYMD = parseToYMD(leadDate);

    if (leadYMD === sunday)   return sunday;              // Sunday lead   → Sunday
    if (leadYMD === saturday) return saturday;            // Saturday lead → Saturday
    return saturday;                                      // Others / null → Saturday
  }

  return yesterday;                                       // Normal days   → yesterday
}

// ─────────────────────────────────────────────────────────────────
let passed = 0, failed = 0;

function test(label, todayYMD, leadYMD, expected) {
  const result = adjustLeadDate(leadYMD, todayYMD);
  const ok = result === expected;
  const icon = ok ? '✅' : '❌';
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const day = dayNames[dowOf(todayYMD)];
  console.log(`${icon} [${day}] ${label}`);
  if (!ok) console.log(`      Got: ${result}  Expected: ${expected}  (Upload=${todayYMD}, Lead=${leadYMD})`);
  ok ? passed++ : failed++;
}

console.log('\n══════ CASE 1: Normal Thursday (20 Mar 2026) ══════');
const THU = '2026-03-20';
test('Lead dated 19 Mar → 19 Mar',    THU, '2026-03-19', '2026-03-19');
test('Lead dated 18 Mar → 19 Mar',    THU, '2026-03-18', '2026-03-19');
test('Lead dated 15 Mar → 19 Mar',    THU, '2026-03-15', '2026-03-19');
test('Lead dated TODAY  → 19 Mar',    THU, '2026-03-20', '2026-03-19');
test('No date in lead   → 19 Mar',    THU,  null,         '2026-03-19');

console.log('\n══════ CASE 2: Monday (23 Mar 2026) [Sat=21, Sun=22] ══════');
const MON = '2026-03-23';
const SAT = '2026-03-21';
const SUN = '2026-03-22';
test('Saturday lead → Saturday (21st)',  MON, SAT, '2026-03-21');
test('Sunday lead   → Sunday   (22nd)',  MON, SUN, '2026-03-22');
test('Old lead (18) → Saturday (21st)',  MON, '2026-03-18', '2026-03-21');
test('No date       → Saturday (21st)',  MON,  null,         '2026-03-21');
test('Today (Mon)   → Saturday (21st)',  MON,  MON,          '2026-03-21');

console.log('\n══════ CASE 3: Tuesday (24 Mar) → Monday (23rd) ══════');
const TUE = '2026-03-24';
test('Any lead → 23 Mar (Monday)',    TUE, '2026-03-20', '2026-03-23');
test('Yesterday → 23 Mar',           TUE, '2026-03-23', '2026-03-23');

console.log('\n══════ CASE 4: Wednesday (25 Mar) → Tuesday (24th) ══════');
const WED = '2026-03-25';
test('Old lead → 24 Mar',            WED, '2026-03-10', '2026-03-24');

console.log('\n══════ CASE 5: Friday (27 Mar) → Thursday (26th) ══════');
const FRI = '2026-03-27';
test('Any lead → 26 Mar',            FRI, '2026-03-25', '2026-03-26');

console.log('\n══════ CASE 6: Saturday (28 Mar) → Friday (27th) ══════');
const SAT2 = '2026-03-28';
test('Any lead → 27 Mar',            SAT2, '2026-03-26', '2026-03-27');

console.log('\n══════════════════════════════════════════');
console.log(`  TOTAL: ${passed + failed}  ✅ PASSED: ${passed}  ❌ FAILED: ${failed}`);
console.log('══════════════════════════════════════════\n');
process.exit(failed > 0 ? 1 : 0);
