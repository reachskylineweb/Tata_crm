const db = require('./src/config/database');
async function checkPhotos() {
  try {
    const [rows] = await db.query('SELECT id, full_name, jio_tag_photo FROM leads WHERE jio_tag_photo IS NOT NULL LIMIT 5');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkPhotos();
