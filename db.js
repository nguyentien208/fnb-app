import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fnb_saas',
  multipleStatements: true,
};

let pool = null;

export async function getDbPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function initMySqlDatabase() {
  try {
    const tempPool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempPool.end();

    const p = await getDbPool();
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await p.query(schemaSql);
    console.log('✅ MySQL Database Schema Verified (fnb_saas)');
    return true;
  } catch (err) {
    console.error('❌ MySQL Initialization Error:', err.message);
    return false;
  }
}

// MySQL State Persistence Helper
export async function saveStateToMySql(stateData) {
  if (!stateData) return;
  try {
    const p = await getDbPool();
    // Save snapshot json for high-performance instant reload resilience
    const jsonStr = JSON.stringify(stateData);
    await p.query(`
      CREATE TABLE IF NOT EXISTS system_state_snapshots (
        id INT PRIMARY KEY AUTO_INCREMENT,
        state_json LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await p.query(`
      INSERT INTO system_state_snapshots (id, state_json) 
      VALUES (1, ?) 
      ON DUPLICATE KEY UPDATE state_json = VALUES(state_json), updated_at = CURRENT_TIMESTAMP;
    `, [jsonStr]);
  } catch (err) {
    console.error('Error saving state to MySQL:', err.message);
  }
}

export async function loadStateFromMySql() {
  try {
    const p = await getDbPool();
    const [rows] = await p.query(`
      SELECT state_json FROM system_state_snapshots WHERE id = 1 LIMIT 1;
    `);
    if (rows && rows.length > 0) {
      return JSON.parse(rows[0].state_json);
    }
  } catch (err) {
    console.warn('MySQL state snapshot fetch error:', err.message);
  }
  return null;
}
