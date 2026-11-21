const fs = require('node:fs/promises');
const path = require('node:path');
const express = require('express');
const { PGlite } = require('@electric-sql/pglite');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'local-dev-pglite-secret-over-32-characters-nhomBaKhi';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const port = Number(process.env.PORT || 3000);

const { pool } = require('../src/db');
const app = require('../src/app');
const { seedDatabase, seedLightDemo } = require('./seed-api-v1');

const ALL_TABLES = [
  'bao_cao_lua_dao',
  'bang_luong',
  'cham_cong',
  'nhan_ca',
  'ca_lam_viec',
  'ung_tuyen',
  'tin_tuyen_dung',
  'khung_gio_ranh',
  'nhom_viec',
  'nha_tuyen_dung',
  'ho_so_sinh_vien',
  'nguoi_dung',
];

async function start() {
  const dataDir = path.join(__dirname, '..', '.pglite-data');
  const db = new PGlite(dataDir);

  const query = async (sql, params = []) => {
    const result = await db.query(sql, params);
    return {
      ...result,
      rowCount: /^\s*(SELECT|WITH)\b/i.test(sql)
        ? result.rows.length
        : (result.affectedRows ?? result.rows.length),
    };
  };
  pool.query = query;
  pool.connect = async () => ({ query, release() {} });

  const tableCheck = await query(
    "SELECT to_regclass('public.nguoi_dung') AS table_name",
  );
  if (!tableCheck.rows[0].table_name) {
    const schemaSql = await fs.readFile(
      path.join(__dirname, '..', 'database', 'api-v1', 'schema.sql'),
      'utf8',
    );
    await db.exec(schemaSql);
    console.log('Created API v1 schema in local PGlite.');
  }

  const useFullSeed = process.env.SEED_MODE === 'full';
  const seedResult = useFullSeed
    ? await seedDatabase(query)
    : await seedLightDemo(query);
  if (!seedResult.alreadySeeded) {
    console.log(useFullSeed
      ? 'Seeded full R18 volume data into local PGlite.'
      : 'Seeded light demo data into local PGlite.');
  }

  const devApp = express();
  devApp.use(express.json({ limit: '1mb' }));
  devApp.post('/dev/reset', async (req, res, next) => {
    try {
      const mode = req.body && req.body.mode === 'full' ? 'full' : 'light';
      await query(`TRUNCATE TABLE ${ALL_TABLES.join(', ')} RESTART IDENTITY CASCADE`);
      if (mode === 'full') await seedDatabase(query);
      else await seedLightDemo(query);
      res.json({ ok: true, mode });
    } catch (error) {
      next(error);
    }
  });
  devApp.use('/review', express.static(path.join(__dirname, '..', 'review-web')));
  devApp.get('/', (req, res) => res.redirect('/review/'));
  devApp.use(app);

  const server = devApp.listen(port, '0.0.0.0', () => {
    console.log(`Local dev server running at http://localhost:${port}`);
    console.log(`Local Web Review: http://localhost:${port}/review/`);
    console.log(`Android Emulator base URL: http://10.0.2.2:${port}/api`);
    console.log('Demo accounts:');
    console.log('  QUAN_TRI       : admin@nhombakhi.edu.vn / Admin@123456');
    console.log('  NHA_TUYEN_DUNG : ntd@nhombakhi.edu.vn / Employer@123');
    console.log('  SINH_VIEN      : sinhvien@nhombakhi.edu.vn / Student@123');
  });

  const shutdown = async () => {
    server.close(async () => {
      await db.close();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Failed to start local PGlite dev server:', error);
  process.exit(1);
});
