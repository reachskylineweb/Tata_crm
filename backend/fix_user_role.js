const db = require('./src/config/database');
require('dotenv').config();

async function fixUserRole() {
  try {
    console.log('--- UPDATING USER ROLE ENUM ---');
    await db.query(`ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'campaign_team', 'dealer', 'dse') NOT NULL DEFAULT 'dealer'`);
    console.log('✅ Updated role enum to include "dse"');
  } catch (err) {
    console.error('❌ Error updating role enum:', err.message);
  } finally {
    process.exit();
  }
}

fixUserRole();
