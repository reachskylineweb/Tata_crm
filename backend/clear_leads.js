const db = require('./src/config/database');

async function clearLeads() {
  try {
    console.log("Starting to clear leads data...");
    
    await db.query('DELETE FROM leads');
    await db.query('ALTER TABLE leads AUTO_INCREMENT = 1');
    console.log("✅ Cleared leads table");
    
    await db.query('DELETE FROM duplicate_leads');
    await db.query('ALTER TABLE duplicate_leads AUTO_INCREMENT = 1');
    console.log("✅ Cleared duplicate_leads table");
    
    await db.query('DELETE FROM upload_batches');
    await db.query('ALTER TABLE upload_batches AUTO_INCREMENT = 1');
    console.log("✅ Cleared upload_batches table");
    
    console.log("Successfully cleared all uploaded leads in the database.");
  } catch (error) {
    console.error("❌ Error clearing leads:", error.message);
  } finally {
    process.exit(0);
  }
}

clearLeads();
