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
      price INTEGER,
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

  console.log('Database tables verified.');

  // --- Migrations: safely add new columns if they don't exist ---
  // SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we swallow errors.
  const runMigration = async (sql: string) => {
    try { await run(sql); } catch (e: any) { /* Column already exists — ignore */ }
  };

  await runMigration(`ALTER TABLE \`Order\` ADD COLUMN customerName TEXT DEFAULT ''`);
  await runMigration(`ALTER TABLE \`Order\` ADD COLUMN customerPhone TEXT DEFAULT ''`);
  await runMigration(`ALTER TABLE \`Order\` ADD COLUMN customerEmail TEXT`);
  await runMigration(`ALTER TABLE Project ADD COLUMN previewUrl TEXT`);
  await runMigration(`ALTER TABLE User ADD COLUMN email TEXT`);
  await runMigration(`ALTER TABLE User ADD COLUMN passwordHash TEXT`);

  console.log('Migrations applied.');
};

export default db;
