import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const isProduction = !!process.env.TURSO_DATABASE_URL;

if (!isProduction) {
  const dataDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

export const db = createClient(
  isProduction
    ? { url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN }
    : { url: `file:${path.join(__dirname, '../../data/hr.db')}` }
);

export async function initDb(): Promise<void> {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT NOT NULL,
      salary_min INTEGER,
      salary_max INTEGER,
      currency TEXT DEFAULT 'USD',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      applicant_name TEXT NOT NULL,
      applicant_email TEXT,
      applicant_phone TEXT,
      cv_filename TEXT NOT NULL,
      cv_path TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      ai_score INTEGER,
      ai_strengths TEXT,
      ai_weaknesses TEXT,
      ai_recommendation TEXT,
      ai_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      evaluated_at DATETIME,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );
  `);

  const adminRes = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: ['admin'] });
  if (adminRes.rows.length === 0) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    await db.execute({
      sql: 'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      args: ['admin', passwordHash, 'admin'],
    });
    console.log('✅ Default admin created — username: admin | password: admin123');
  }

  console.log('✅ Database initialized');
}
