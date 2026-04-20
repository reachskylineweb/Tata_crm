const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
  try {
    const hash = await bcrypt.hash('Admin@123', 10);
    console.log('🔄 Resetting admin account...');
    
    // Check if user exists
    const [users] = await db.query("SELECT id FROM users WHERE username = 'admin' OR email = 'admin@tatamotors.com'");
    
    if (users.length > 0) {
      await db.query(
        "UPDATE users SET password_hash = ?, is_active = TRUE, role = 'admin' WHERE id = ?",
        [hash, users[0].id]
      );
      console.log('✅ Admin password updated successfully');
    } else {
      await db.query(
        "INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        ['admin', 'admin@tatamotors.com', hash, 'System Administrator', 'admin', true]
      );
      console.log('✅ Admin user created successfully');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err);
    process.exit(1);
  }
}

resetAdmin();
