#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.DATABASE_PASSWORD;

if (!supabaseUrl || !dbPassword) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or DATABASE_PASSWORD');
  process.exit(1);
}

const ref = new URL(supabaseUrl).hostname.split('.')[0];

const sql = (await import('postgres')).default({
  host: `db.${ref}.supabase.co`,
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: dbPassword,
  ssl: 'require',
  connect_timeout: 30,
  max: 1,
});

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '063_calendar_categories.sql');
const migration = fs.readFileSync(migrationPath, 'utf8');

try {
  await sql.unsafe(migration);
  console.log('Migration 063 calendar_categories — OK');
} catch (e) {
  console.error('Migration 063 failed:', e.message);
  process.exit(1);
} finally {
  await sql.end();
}
