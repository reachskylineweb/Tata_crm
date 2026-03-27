const db = require('./src/config/database');
(async () => {
    try {
        const [rows] = await db.query('DESCRIBE leads');
        console.log('Columns in leads table:');
        rows.forEach(r => console.log(`- ${r.Field}: ${r.Type}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
