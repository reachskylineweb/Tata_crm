const db = require('./src/config/database');
(async () => {
    try {
        const [rows] = await db.query('DESCRIBE leads');
        const cols = rows.filter(r => ['last_contacted_date', 'follow_up_count', 'priority'].includes(r.Field));
        console.log(JSON.stringify(cols, null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
})();
