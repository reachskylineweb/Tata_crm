const db = require('./src/config/database');
async function checkColumns() {
  try {
    const [rows] = await db.query('SHOW COLUMNS FROM leads');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkColumns();
