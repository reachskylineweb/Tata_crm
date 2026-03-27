const db = require('./src/config/database');
(async () => {
    try {
        const [rows] = await db.query('SELECT id, full_name, jio_tag_photo FROM leads WHERE jio_tag_photo IS NOT NULL');
        console.log('Leads with photos:', rows);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
})();
