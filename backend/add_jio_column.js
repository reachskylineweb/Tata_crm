const db = require('./src/config/database');
(async () => {
    try {
        const sql = 'ALTER TABLE leads ADD COLUMN jio_tag_photo VARCHAR(500) NULL AFTER dse_notes';
        await db.query(sql);
        console.log('Column jio_tag_photo added successfully');
        process.exit(0);
    } catch (e) {
        console.warn('Column likely already exists or table issue:', e.message);
        process.exit(0);
    }
})();
