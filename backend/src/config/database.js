const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * DATABASE CONFIGURATION
 * -----------------------------------------------------------------------
 * Priority order (most-specific first, so any platform works out of the box):
 *   1. DB_HOST / DB_USER / DB_PASSWORD / DB_NAME / DB_PORT  ← VPS / OVHcloud / DigitalOcean / .env
 *   2. MYSQL_HOST / MYSQL_USER / MYSQL_PASSWORD / MYSQL_DATABASE / MYSQL_PORT  ← Generic MySQL
 *   3. MYSQLHOST / MYSQLUSER / MYSQLPASSWORD / MYSQLDATABASE / MYSQLPORT  ← Railway bare vars
 *   4. Hardcoded localhost defaults  ← local development
 * -----------------------------------------------------------------------
 */
const dbConfig = {
  host:     process.env.DB_HOST     || process.env.MYSQL_HOST     || process.env.MYSQLHOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || process.env.MYSQLPORT || '3306', 10),
  user:     process.env.DB_USER     || process.env.MYSQL_USER     || process.env.MYSQLUSER     || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: process.env.DB_NAME     || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'tatamotors_crm',
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 60000
};

const pool = mysql.createPool(dbConfig);

// Helper: verify connection on startup
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Connected → host: ${dbConfig.host}:${dbConfig.port}, db: ${dbConfig.database}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
    console.error('   Ensure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are set in your .env file.');
    return false;
  }
};

if (process.env.NODE_ENV !== 'test') {
  checkConnection();
}

module.exports = pool;