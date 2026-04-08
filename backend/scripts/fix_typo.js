const db = require('../src/config/database');

async function fixTypo() {
  try {
    console.log('Starting typo correction in database...');

    // 1. Update telecaller_remark
    const [result1] = await db.query(`
      UPDATE leads 
      SET telecaller_remark = REPLACE(telecaller_remark, 'Intrested', 'Interested')
      WHERE telecaller_remark LIKE '%Intrested%'
    `);
    console.log(`Updated telecaller_remark (Intrested): ${result1.affectedRows} rows`);

    const [result2] = await db.query(`
      UPDATE leads 
      SET telecaller_remark = REPLACE(telecaller_remark, 'intrested', 'interested')
      WHERE telecaller_remark LIKE '%intrested%'
    `);
    console.log(`Updated telecaller_remark (intrested): ${result2.affectedRows} rows`);

    // 2. Update customer_response
    const [result3] = await db.query(`
      UPDATE leads 
      SET customer_response = REPLACE(customer_response, 'Intrested', 'Interested')
      WHERE customer_response LIKE '%Intrested%'
    `);
    console.log(`Updated customer_response (Intrested): ${result3.affectedRows} rows`);

    const [result4] = await db.query(`
      UPDATE leads 
      SET customer_response = REPLACE(customer_response, 'intrested', 'interested')
      WHERE customer_response LIKE '%intrested%'
    `);
    console.log(`Updated customer_response (intrested): ${result4.affectedRows} rows`);

    console.log('Typo correction completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error during typo correction:', err);
    process.exit(1);
  }
}

fixTypo();
