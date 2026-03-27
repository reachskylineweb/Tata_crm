require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM leads');
  console.log(`\n📊 Current leads in database: ${total}`);

  if (total === 0) {
    console.log('✅ No leads to delete. Table is already empty.\n');
    await db.end();
    return;
  }

  await db.query('DELETE FROM leads');
  await db.query('ALTER TABLE leads AUTO_INCREMENT = 1');

  // Also clear upload_batches so history is clean
  await db.query('DELETE FROM upload_batches');
  await db.query('ALTER TABLE upload_batches AUTO_INCREMENT = 1');

  const [[{ remaining }]] = await db.query('SELECT COUNT(*) as remaining FROM leads');
  console.log(`✅ Deleted ${total} leads successfully.`);
  console.log(`📊 Remaining leads: ${remaining}`);
  console.log('🗑️  Upload batch history also cleared.\n');

  await db.end();
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
