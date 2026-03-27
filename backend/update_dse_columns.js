const db = require('./src/config/database');
(async () => {
    try {
        const columns = [
            'ALTER TABLE leads ADD COLUMN visit_status ENUM("Not Visited", "Visited", "Test Drive Done") DEFAULT "Not Visited"',
            'ALTER TABLE leads ADD COLUMN interest_level ENUM("High", "Medium", "Low") NULL',
            'ALTER TABLE leads ADD COLUMN deal_stage ENUM("New", "Visited", "Negotiation", "Quotation Given", "Booking Done", "Lost") DEFAULT "New"',
            'ALTER TABLE leads ADD COLUMN expected_purchase_timeline ENUM("0–30 days", "30–60 days", "60–90 days") NULL',
            'ALTER TABLE leads ADD COLUMN budget DECIMAL(15,2) NULL',
            'ALTER TABLE leads ADD COLUMN dse_notes TEXT NULL',
            'ALTER TABLE leads ADD COLUMN last_updated_by ENUM("Telecaller", "DSE") NULL',
            'ALTER TABLE leads ADD COLUMN lost_reason TEXT NULL'
        ];
        
        for (const sql of columns) {
            try {
                await db.query(sql);
                console.log(`Executed: ${sql.substring(0, 50)}...`);
            } catch (e) {
                console.warn(`Skipped: ${sql.substring(0, 50)}... (likely already exists)`);
            }
        }
        
        console.log('Database columns updated successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error updating database:', err);
        process.exit(1);
    }
})();
