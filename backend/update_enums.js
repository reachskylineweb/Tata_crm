const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function migrate() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'tatamotors_crm',
        port: process.env.DB_PORT || 3306
    });

    console.log('Connected to database');

    try {
        console.log('Converting ENUM columns to permanent VARCHAR(100) to prevent truncation errors...');
        
        await db.query(`ALTER TABLE leads MODIFY COLUMN visit_status VARCHAR(100)`);
        await db.query(`ALTER TABLE leads MODIFY COLUMN deal_stage VARCHAR(100)`);
        await db.query(`ALTER TABLE leads MODIFY COLUMN expected_purchase_timeline VARCHAR(100)`);
        await db.query(`ALTER TABLE leads MODIFY COLUMN customer_response VARCHAR(100)`);
        await db.query(`ALTER TABLE leads MODIFY COLUMN interest_level VARCHAR(100)`);
        await db.query(`ALTER TABLE leads MODIFY COLUMN dse_status VARCHAR(100) DEFAULT 'In Progress'`);

        console.log('Mapping old data to new taxonomy...');
        // Map visit_status
        await db.query(`UPDATE leads SET visit_status = 'Physical Visit' WHERE visit_status = 'Visited'`);
        await db.query(`UPDATE leads SET visit_status = 'Test Drive' WHERE visit_status IN ('Test Drive Done', 'Test Drive')`);
        
        // Map deal_stage
        await db.query(`UPDATE leads SET deal_stage = 'C1 (Showroom Visitor)' WHERE deal_stage = 'Visited'`);
        await db.query(`UPDATE leads SET deal_stage = 'C3 (Vehicle Purchase)' WHERE deal_stage = 'Booking Done'`);
        await db.query(`UPDATE leads SET deal_stage = 'C0 (Customer Inquiry)' WHERE deal_stage IN ('Negotiation', 'Quotation Given')`);
        
        // Ensure defaults where necessary
        await db.query(`UPDATE leads SET visit_status = 'Not Visited' WHERE visit_status IS NULL OR visit_status = ''`);

        console.log('Migration completed successfully — Columns are now completely flexible VARCHARs!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await db.end();
    }
}

migrate();
