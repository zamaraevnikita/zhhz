import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

// Connect to SQLite DB
const dbPath = path.resolve(process.cwd(), 'dev.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Promisify database functions for async/await usage
export const run = promisify(db.run.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
export const get = promisify(db.get.bind(db)) as <T>(sql: string, params?: any[]) => Promise<T | undefined>;
export const all = promisify(db.all.bind(db)) as <T>(sql: string, params?: any[]) => Promise<T[]>;

// Helper to wrap multiple queries in an SQLite transaction
export const runTransaction = async (queries: Array<{ sql: string; params?: any[] }>) => {
  await run('BEGIN TRANSACTION');
  try {
    for (const q of queries) {
      await run(q.sql, q.params);
    }
    await run('COMMIT');
  } catch (err) {
    await run('ROLLBACK');
    throw err;
  }
};

// Initialize schema
export const initDb = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'USER',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Project (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT NOT NULL,
      themeId TEXT NOT NULL,
      isCustom BOOLEAN DEFAULT 0,
      spreads TEXT NOT NULL,
      price TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS \`Order\` (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      totalAmount INTEGER NOT NULL,
      items TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS LayoutTemplate (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slots TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS DesignTemplate (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      themeId TEXT NOT NULL,
      previewUrl TEXT,
      pagePresets TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS OtpRequest (
      phone TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expiresAt INTEGER NOT NULL,
      attempts INTEGER DEFAULT 0,
      pendingName TEXT,
      pendingEmail TEXT,
      pendingPasswordHash TEXT
    )
  `);

  console.log('Database tables verified.');

  // --- Migrations: safely add new columns if they don't exist ---
  const ensureColumnExists = async (table: string, column: string, typeDef: string) => {
    try {
        const columns = await all<any>(`PRAGMA table_info(\`${table}\`)`);
        const exists = columns.some(c => c.name === column);
        if (!exists) {
            await run(`ALTER TABLE \`${table}\` ADD COLUMN ${column} ${typeDef}`);
            console.log(`Migration: Added ${column} to ${table}`);
        }
    } catch (e) {
        console.error(`Migration Failed for ${table}.${column}:`, e);
        throw e;
    }
  };

  await ensureColumnExists('Order', 'customerName', "TEXT DEFAULT ''");
  await ensureColumnExists('Order', 'customerPhone', "TEXT DEFAULT ''");
  await ensureColumnExists('Order', 'customerEmail', "TEXT");
  await ensureColumnExists('Project', 'previewUrl', "TEXT");
  await ensureColumnExists('Project', 'guestSecret', "TEXT");
  await ensureColumnExists('User', 'email', "TEXT");
  await ensureColumnExists('User', 'passwordHash', "TEXT");

  // --- Optimization: Indexes ---
  await run(`CREATE INDEX IF NOT EXISTS idx_project_userid ON Project(userId)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_order_userid ON \`Order\`(userId)`);

  console.log('Migrations applied.');
};

export default db;
