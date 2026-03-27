const db = require('./src/config/database');
require('dotenv').config();

async function fixLeads() {
  try {
    console.log('--- RESYNCING LEADS DEALER_ID BY DISTRICT ---');
    
    // Get all district mappings
    const [mappings] = await db.query(`
      SELECT m.district, m.dealer_id, d.dealer_name 
      FROM district_dealer_mapping m
      JOIN dealers d ON m.dealer_id = d.id
    `);
    
    let updatedCount = 0;

    for (const m of mappings) {
      const [result] = await db.query(`
        UPDATE leads 
        SET dealer_id = ?, dealer_name = ?
        WHERE (dealer_id != ? OR dealer_name != ? OR dealer_id IS NULL)
        AND LOWER(location) = LOWER(?)
      `, [m.dealer_id, m.dealer_name, m.dealer_id, m.dealer_name, m.district]);
      
      if (result.affectedRows > 0) {
        console.log(`✅ Updated ${result.affectedRows} leads for district: ${m.district} (Dealer: ${m.dealer_name})`);
        updatedCount += result.affectedRows;
      }
    }

    // Special Case: Others
    const [[othersDealer]] = await db.query("SELECT id, dealer_name FROM dealers WHERE dealer_name LIKE '%Others%'");
    if (othersDealer) {
      const [result] = await db.query(`
        UPDATE leads 
        SET dealer_id = ?, dealer_name = ?
        WHERE (dealer_id IS NULL OR dealer_id NOT IN (SELECT id FROM dealers))
        OR (dealer_id = ? AND dealer_name != ?)
      `, [othersDealer.id, othersDealer.dealer_name, othersDealer.id, othersDealer.dealer_name]);
      if (result.affectedRows > 0) {
        console.log(`✅ Updated ${result.affectedRows} leads to Others`);
        updatedCount += result.affectedRows;
      }
    }

    console.log(`--- DONE. Total Updated: ${updatedCount} ---`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

fixLeads();
