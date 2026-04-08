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
        // 1. Convert to VARCHAR first to allow data modification
        console.log('Converting columns to VARCHAR...');
        await db.query(`ALTER TABLE leads MODIFY COLUMN visit_status VARCHAR(255)`);
        await db.query(`ALTER TABLE leads MODIFY COLUMN deal_stage VARCHAR(255)`);

        // 2. Map existing visit_status data
        console.log('Mapping visit_status data...');
        await db.query(`UPDATE leads SET visit_status = 'Physical Visit' WHERE visit_status = 'Visited'`);
        await db.query(`UPDATE leads SET visit_status = 'Test Drive' WHERE visit_status = 'Test Drive Done'`);

        // 3. Map existing deal_stage data
        console.log('Mapping deal_stage data...');
        // mapping 'Visited' -> 'C1 (Showroom Visitor)'
        // mapping 'Booking Done' -> 'C3 (Vehicle Purchase)'
        await db.query(`UPDATE leads SET deal_stage = 'C1 (Showroom Visitor)' WHERE deal_stage = 'Visited'`);
        await db.query(`UPDATE leads SET deal_stage = 'C3 (Vehicle Purchase)' WHERE deal_stage = 'Booking Done'`);
        // For 'Negotiation' and 'Quotation Given', let's map them to C1 or C2? 
        // Let's just leave them as they are for now, but ensure they are part of the new enum or map them to 'New' if we really want to "remove" them.
        // Better map them to 'C0 (Customer Inquiry)' if they are orphaned.
        await db.query(`UPDATE leads SET deal_stage = 'C0 (Customer Inquiry)' WHERE deal_stage IN ('Negotiation', 'Quotation Given')`);

        // 4. Update columns back to ENUM with new values
        console.log('Updating visit_status enum...');
        // Allowing 'Not Visited', 'Physical Visit', 'Telecalling', 'Test Drive'
        await db.query(`ALTER TABLE leads MODIFY COLUMN visit_status ENUM('Not Visited', 'Physical Visit', 'Telecalling', 'Test Drive') DEFAULT 'Not Visited'`);
        
        console.log('Updating deal_stage enum...');
        // Allowing 'New', 'C0 (Customer Inquiry)', 'C1 (Showroom Visitor)', 'C2 (KYC / Documentation)', 'C3 (Vehicle Purchase)', 'Lost'
        await db.query(`ALTER TABLE leads MODIFY COLUMN deal_stage ENUM('New', 'C0 (Customer Inquiry)', 'C1 (Showroom Visitor)', 'C2 (KYC / Documentation)', 'C3 (Vehicle Purchase)', 'Lost') DEFAULT 'New'`);

        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await db.end();
    }
}

migrate();
