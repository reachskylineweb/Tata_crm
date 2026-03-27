const db = require('./src/config/database');
require('dotenv').config();

async function checkDseLeads() {
  try {
    const [leads] = await db.query(`
      SELECT dealer_id, dealer_name, assigned_to_dse, count(*) as count 
      FROM leads 
      WHERE assigned_to_dse IS NOT NULL AND assigned_to_dse != ''
      GROUP BY dealer_id, dealer_name, assigned_to_dse
    `);
    console.log('DSE assigned leads:', leads);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkDseLeads();
