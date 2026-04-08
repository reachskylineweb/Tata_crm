const db = require('./src/config/database');
(async () => {
    try {
        const [rows] = await db.query('SELECT assigned_to_dse, dealer_id FROM leads WHERE assigned_to_dse IS NOT NULL LIMIT 10');
        console.log('LEADS_START');
        console.log(JSON.stringify(rows));
        console.log('LEADS_END');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
