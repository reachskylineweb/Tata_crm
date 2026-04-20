const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    // Show all users first
    const [users] = await db.query('SELECT id, username, role FROM users ORDER BY id');
    console.log('All users:');
    users.forEach(u => console.log(` - [${u.id}] ${u.username} (${u.role})`));

    // Reset passwords to known values
    const resets = [
      { username: 'admin', newPassword: 'Admin@123' },
      { username: 'others_dealer', newPassword: 'Dealer@123' },
      { username: 'ramesh', newPassword: 'Dse@123' },
      { username: 'sam', newPassword: 'Dse@123' },
      { username: 'srinivasan', newPassword: 'Dse@123' },
    ];

    console.log('\nResetting passwords...');
    for (const r of resets) {
      const hash = await bcrypt.hash(r.newPassword, 10);
      const [result] = await db.query(
        'UPDATE users SET password_hash = ?, is_active = 1 WHERE username = ?',
        [hash, r.username]
      );
      if (result.affectedRows > 0) {
        console.log(` ✅ ${r.username} => "${r.newPassword}"`);
      } else {
        console.log(` ⚠️  ${r.username} not found`);
      }
    }

    // Also reset ANY other dealer accounts (id > 5)
    const [others] = await db.query("SELECT id, username FROM users WHERE role = 'dealer' AND username != 'others_dealer'");
    for (const u of others) {
      const hash = await bcrypt.hash('Dealer@123', 10);
      await db.query('UPDATE users SET password_hash = ?, is_active = 1 WHERE id = ?', [hash, u.id]);
      console.log(` ✅ ${u.username} (dealer) => "Dealer@123"`);
    }

    console.log('\nDone! Use these to login:');
    console.log('  Admin       : admin / Admin@123');
    console.log('  Others Dealer: others_dealer / Dealer@123');
    console.log('  New Dealers : <username> / Dealer@123');
    console.log('  DSEs        : ramesh, sam, srinivasan / Dse@123');

  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit();
})();
