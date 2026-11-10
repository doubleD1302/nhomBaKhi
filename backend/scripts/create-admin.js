require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/db');

async function main() {
  const [email, password, fullName] = process.argv.slice(2);
  if (!email || !password || !fullName || password.length < 12) {
    throw new Error('Usage: npm run create-admin -- <email> <password-at-least-12-characters> <full-name>');
  }
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO nguoi_dung (email, mat_khau_hash, ho_ten, vai_tro)
     VALUES ($1, $2, $3, 'QUAN_TRI')`,
    [email.trim().toLowerCase(), hash, fullName.trim()],
  );
  console.log('Administrator account created.');
}

main()
  .catch((error) => {
    console.error('Could not create administrator account.', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());