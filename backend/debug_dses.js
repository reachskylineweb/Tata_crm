const db = require('./src/config/database');
(async () => {
    try {
        const [rows] = await db.query('SELECT username, full_name, dealer_id, role FROM users WHERE role = "dse"');
        console.log('DSE_USERS_START');
        console.log(JSON.stringify(rows));
        console.log('DSE_USERS_END');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
