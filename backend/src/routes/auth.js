const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { truyVan, trongGiaoDich } = require('../db');
const { asyncHandler } = require('../utils');
const { xacThuc } = require('../middleware/auth');

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, fullName, phone = '', role } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      || typeof password !== 'string' || password.length < 8
      || typeof fullName !== 'string' || !fullName.trim()
      || !['SINH_VIEN', 'NHA_TUYEN_DUNG'].includes(role)) {
    return res.status(400).json({ loi: 'Thông tin đăng ký không hợp lệ' });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await trongGiaoDich(async (client) => {
    const inserted = await client.query(
      `INSERT INTO nguoi_dung (email, mat_khau_hash, ho_ten, sdt, vai_tro)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, ho_ten, vai_tro`,
      [normalizedEmail, passwordHash, fullName.trim(), String(phone).trim(), role],
    );
    const row = inserted.rows[0];
    if (role === 'SINH_VIEN') {
      await client.query('INSERT INTO ho_so_sinh_vien (nguoi_dung_id) VALUES ($1)', [row.id]);
    } else {
      await client.query('INSERT INTO nha_tuyen_dung (nguoi_dung_id) VALUES ($1)', [row.id]);
    }
    return row;
  });
  res.status(201).json({ user: publicUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  const result = await truyVan(
    `SELECT id, email, mat_khau_hash, ho_ten, vai_tro, trang_thai
     FROM nguoi_dung WHERE email = $1`,
    [email],
  );
  const user = result.rows[0];
  if (!user || user.trang_thai !== 'HOAT_DONG'
      || typeof password !== 'string'
      || !(await bcrypt.compare(password, user.mat_khau_hash))) {
    return res.status(401).json({ loi: 'Email hoặc mật khẩu không đúng' });
  }
  const token = jwt.sign(
    { id: user.id, vaiTro: user.vai_tro },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' },
  );
  res.json({ token, user: publicUser(user) });
}));

router.get('/me', xacThuc, asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT id, email, ho_ten, vai_tro, trang_thai
     FROM nguoi_dung WHERE id = $1`,
    [req.nguoiDung.id],
  );
  if (!result.rows[0]) return res.status(401).json({ loi: 'Tài khoản không còn tồn tại' });
  res.json({ user: publicUser(result.rows[0]) });
}));

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.ho_ten,
    role: user.vai_tro,
  };
}

module.exports = router;