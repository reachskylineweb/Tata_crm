const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    // Get all users
    const [users] = await db.query('SELECT id, username, full_name, role, dealer_id, is_active FROM users ORDER BY role, username');
    
    console.log('\n=== ALL USERS ===');
    for (const u of users) {
      console.log(`[${u.id}] ${u.username} | ${u.role} | dealer_id:${u.dealer_id} | active:${u.is_active}`);
    }

    // Reset ALL dealer passwords to Dealer@123
    const [dealers] = await db.query("SELECT id, username FROM users WHERE role = 'dealer'");
    console.log(`\n=== RESETTING ${dealers.length} DEALER(S) ===`);
    const dealerHash = await bcrypt.hash('Dealer@123', 10);
    for (const d of dealers) {
      await db.query('UPDATE users SET password_hash = ?, is_active = 1 WHERE id = ?', [dealerHash, d.id]);
      console.log(`  ✅ ${d.username} => Dealer@123`);
    }

    // Verify it works
    console.log('\n=== VERIFY ===');
    const [first] = await db.query("SELECT password_hash FROM users WHERE role = 'dealer' LIMIT 1");
    if (first.length > 0) {
      const ok = await bcrypt.compare('Dealer@123', first[0].password_hash);
      console.log('Password verify test:', ok ? 'PASS ✅' : 'FAIL ❌');
    }

    console.log('\nAll dealers can now login with password: Dealer@123');
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit();
})();
