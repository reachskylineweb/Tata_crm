const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const [rows] = await db.query('SELECT username, password_hash, role, is_active FROM users ORDER BY id');
    
    console.log('\n===== ALL USERS =====');
    for (const u of rows) {
      const validHash = u.password_hash && (u.password_hash.startsWith('$2b') || u.password_hash.startsWith('$2a'));
      console.log(`Username: ${u.username} | Role: ${u.role} | Active: ${u.is_active} | Valid Hash: ${validHash}`);
    }

    // Test known passwords
    const testCases = [
      { username: 'admin', password: 'admin123' },
      { username: 'others_dealer', password: 'dealer123' },
    ];

    console.log('\n===== PASSWORD TESTS =====');
    for (const tc of testCases) {
      const [r] = await db.query('SELECT password_hash FROM users WHERE username = ?', [tc.username]);
      if (r.length === 0) {
        console.log(`${tc.username}: USER NOT FOUND`);
      } else {
        const match = await bcrypt.compare(tc.password, r[0].password_hash);
        console.log(`${tc.username} / "${tc.password}" => ${match ? 'MATCH ✅' : 'NO MATCH ❌'}`);
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit();
})();
