require('dotenv').config();
const fs = require('node:fs/promises');
const path = require('node:path');
const { pool } = require('../src/db');

async function setup() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  if (process.argv.includes('--reset')) {
    throw new Error('Automatic reset is disabled. Use a separate empty database for API v1.');
  }
  const existing = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname IN ('public', 'viec_lam') AND tablename = ANY($1::text[])",
    [['nguoi_dung','ho_so_sinh_vien','nha_tuyen_dung','nhom_viec','khung_gio_ranh','tin_tuyen_dung',
      'ung_tuyen','ca_lam_viec','nhan_ca','cham_cong','bang_luong','bao_cao_lua_dao']],
  );
  if (existing.rowCount) {
    throw new Error('Application tables already exist. Review the schema with TV04; setup does not overwrite existing data.');
  }
  const schema = await fs.readFile(path.join(__dirname, '..', 'database', 'api-v1', 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('API v1 schema created. No sample records were inserted; legacy seed.sql was not executed.');
}

setup()
  .catch((error) => {
    console.error('Database setup failed.', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
