const bcrypt = require('bcryptjs');
const db = require('./src/config/database');
require('dotenv').config();

async function createDSEs() {
  const dses = [
    { username: 'ramesh', full_name: 'Ramesh', password: 'ramesh@123', email: 'ramesh@tata.com', dealer_id: 1 },
    { username: 'sam', full_name: 'Sam', password: 'sam@123', email: 'sam@tata.com', dealer_id: 1 },
    { username: 'srinivasan', full_name: 'Srinivasan', password: 'srinivasan@123', email: 'srini@tata.com', dealer_id: 1 }
  ];

  console.log('--- CREATING DSE USERS ---');

  for (const dse of dses) {
    try {
      const hash = await bcrypt.hash(dse.password, 10);
      
      // Check if user already exists
      const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [dse.username]);
      if (existing.length > 0) {
        console.log(`User ${dse.username} already exists, skipping...`);
        continue;
      }

      await db.query(
        'INSERT INTO users (username, full_name, role, password_hash, email, dealer_id, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [dse.username, dse.full_name, 'dse', hash, dse.email, dse.dealer_id]
      );
      console.log(`✅ Created ${dse.username} (Password: ${dse.password})`);
    } catch (err) {
      console.error(`❌ Error creating ${dse.username}:`, err.message);
    }
  }

  process.exit();
}

createDSEs();
