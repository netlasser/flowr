import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Direct connection (port 5432) for DDL — not the pooler (port 6543)
const dbUrl = process.env.DATABASE_URL?.replace(':6543/', ':5432/');

if (!dbUrl) {
  console.error('DATABASE_URL not set in .env');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl, max: 1 });

async function run() {
  const migrationFile = process.argv[2];
  if (!migrationFile) {
    console.error('Usage: node server/migrate.js <migration-file>');
    console.error('       node server/migrate.js server/migrations/002_add_completed_to_focus_sessions.sql');
    process.exit(1);
  }

  const sql = readFileSync(resolve(__dirname, '..', migrationFile), 'utf8');
  console.log(`Running migration: ${migrationFile}`);
  console.log(`SQL: ${sql}`);

  try {
    const result = await pool.query(sql);
    console.log(`Done. ${result.command} — ${result.rowCount ?? 0} rows affected.`);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
