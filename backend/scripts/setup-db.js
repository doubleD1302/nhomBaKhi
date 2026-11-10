require('dotenv').config();
const fs = require('node:fs/promises');
const path = require('node:path');
const { pool } = require('../src/db');

async function setup() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  const reset = process.argv.includes('--reset');
  if (reset && !process.argv.includes('--confirm-reset')) {
    throw new Error('Reset refused. Add --confirm-reset to confirm dropping application tables.');
  }
  if (reset) {
    await pool.query(await fs.readFile(path.join(__dirname, '..', 'reset-schema.sql'), 'utf8'));
  } else {
    const existing = await pool.query(
      "SELECT to_regclass('public.nguoi_dung') AS users_table",
    );
    if (existing.rows[0].users_table) {
      throw new Error('Application tables already exist. Use npm run db:reset only on a database you intend to clear.');
    }
  }
  const schema = await fs.readFile(path.join(__dirname, '..', 'schema.sql'), 'utf8');
  await pool.query(schema);
  const seed = await fs.readFile(path.join(__dirname, '..', 'seed.sql'), 'utf8');
  if (seed.trim()) await pool.query(seed);
  console.log('Database schema created. No sample records were inserted.');
}

setup()
  .catch((error) => {
    console.error('Database setup failed.', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());