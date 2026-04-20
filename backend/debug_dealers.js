const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    // Show ALL users with their roles
    const [users] = await db.query("SELECT id, username, full_name, role, dealer_id, is_active FROM users ORDER BY id");
    console.log('\n===== ALL USERS =====');
    console.log(JSON.stringify(users, null, 2));

    // Try to verify password for all dealer accounts
    const [dealers] = await db.query("SELECT u.username, u.password_hash FROM users u WHERE u.role = 'dealer'");
    console.log('\n===== DEALER PASSWORD TESTS =====');
    const testPasswords = ['Dealer@123', 'dealer123', 'Admin@123', 'admin123', '123456'];
    for (const u of dealers) {
      console.log(`\nDealer: ${u.username}`);
      for (const p of testPasswords) {
        const match = await bcrypt.compare(p, u.password_hash);
        if (match) console.log(`  MATCH: "${p}" ✅`);
      }
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit();
})();
