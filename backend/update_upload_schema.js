const db = require('./src/config/database');

async function updateSchema() {
  try {
    console.log('Updating schema for lead uploads...');
    
    // 1. Add reason column to duplicate_leads
    try {
      await db.query(`ALTER TABLE duplicate_leads ADD COLUMN IF NOT EXISTS reason VARCHAR(255) AFTER upload_batch_id`);
      console.log('✅ Added reason to duplicate_leads');
    } catch (e) {
      console.log('⚠️ Could not add reason to duplicate_leads (may already exist)');
    }

    // 2. Add detailed counts to upload_batches
    try {
      await db.query(`ALTER TABLE upload_batches ADD COLUMN IF NOT EXISTS duplicate_records INT DEFAULT 0 AFTER processed_records`);
      await db.query(`ALTER TABLE upload_batches ADD COLUMN IF NOT EXISTS invalid_records INT DEFAULT 0 AFTER duplicate_records`);
      console.log('✅ Added detailed count columns to upload_batches');
    } catch (e) {
      console.log('⚠️ Could not add count columns to upload_batches (may already exist)');
    }

    console.log('🎉 Schema update completed!');
  } catch (err) {
    console.error('❌ Schema update failed:', err);
  } finally {
    process.exit();
  }
}

updateSchema();
