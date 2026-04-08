const mysql = require('mysql2/promise');

async function updateTelecallerRemarks() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'root123',
    database: 'tatamotors_crm'
  });

  console.log('Connected to database');

  try {
    const changes = [
      { old: 'Interested / purchased within 30 days', new: 'purchase plan within 30 days' },
      { old: 'Interested / purchased within 60 days', new: 'purchase plan within 60 days' },
      { old: 'Interested / purchased within 90 days', new: 'purchase plan within 90 days' }
    ];

    for (const change of changes) {
      console.log(`Updating "${change.old}" to "${change.new}"...`);
      const [result] = await connection.execute(
        'UPDATE leads SET telecaller_remark = ? WHERE telecaller_remark = ?',
        [change.new, change.old]
      );
      console.log(`Rows affected: ${result.affectedRows}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

updateTelecallerRemarks();
