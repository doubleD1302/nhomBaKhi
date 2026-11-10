const express = require('express');
const { truyVan, trongGiaoDich } = require('../db');
const { asyncHandler } = require('../utils');
const { xacThuc, choPhep } = require('../middleware/auth');

const router = express.Router();
router.use(xacThuc, choPhep('SINH_VIEN'));

router.get('/profile', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT u.ho_ten AS "fullName", u.sdt AS phone, p.truong AS school,
       p.nganh AS major, p.nam_hoc AS "studyYear", p.ky_nang AS skills, p.gioi_thieu AS bio
     FROM nguoi_dung u JOIN ho_so_sinh_vien p ON p.nguoi_dung_id = u.id
     WHERE u.id = $1`,
    [req.nguoiDung.id],
  );
  if (!result.rows[0]) return res.status(404).json({ loi: 'Không tìm thấy hồ sơ' });
  res.json(result.rows[0]);
}));

router.patch('/profile', asyncHandler(async (req, res) => {
  const { fullName, phone, school, major, studyYear, skills, bio } = req.body;
  if (typeof fullName !== 'string' || !fullName.trim()
      || !Number.isInteger(studyYear) || studyYear < 1 || studyYear > 10) {
    return res.status(400).json({ loi: 'Họ tên hoặc năm học không hợp lệ' });
  }
  const result = await trongGiaoDich(async (client) => {
    const user = await client.query(
      'UPDATE nguoi_dung SET ho_ten = $2, sdt = $3 WHERE id = $1 AND vai_tro = $4 RETURNING id',
      [req.nguoiDung.id, fullName.trim(), String(phone || '').trim(), 'SINH_VIEN'],
    );
    if (!user.rows[0]) return false;
    await client.query(
      `UPDATE ho_so_sinh_vien SET truong = $2, nganh = $3, nam_hoc = $4,
       ky_nang = $5, gioi_thieu = $6 WHERE nguoi_dung_id = $1`,
      [req.nguoiDung.id, String(school || ''), String(major || ''), studyYear,
        String(skills || ''), String(bio || '')],
    );
    return true;
  });
  if (!result) return res.status(404).json({ loi: 'Không tìm thấy hồ sơ' });
  res.json({ message: 'Đã cập nhật hồ sơ' });
}));

router.get('/availability', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT a.thu_trong_tuan AS "dayOfWeek", a.gio_bat_dau AS "startTime",
       a.gio_ket_thuc AS "endTime"
     FROM khung_gio_ranh a JOIN ho_so_sinh_vien p ON p.id = a.sinh_vien_id
     WHERE p.nguoi_dung_id = $1 ORDER BY a.thu_trong_tuan, a.gio_bat_dau`,
    [req.nguoiDung.id],
  );
  res.json({ availability: result.rows });
}));

router.put('/availability', asyncHandler(async (req, res) => {
  const availability = req.body.availability;
  if (!Array.isArray(availability) || availability.length > 70
      || availability.some((item) => !Number.isInteger(item.dayOfWeek)
        || item.dayOfWeek < 1 || item.dayOfWeek > 7
        || !/^\d{2}:\d{2}$/.test(item.startTime || '')
        || !/^\d{2}:\d{2}$/.test(item.endTime || '')
        || item.startTime >= item.endTime)) {
    return res.status(400).json({ loi: 'Danh sách khung giờ không hợp lệ' });
  }
  await trongGiaoDich(async (client) => {
    await client.query(
      `DELETE FROM khung_gio_ranh a USING ho_so_sinh_vien p
       WHERE a.sinh_vien_id = p.id AND p.nguoi_dung_id = $1`,
      [req.nguoiDung.id],
    );
    for (const item of availability) {
      await client.query(
        `INSERT INTO khung_gio_ranh (sinh_vien_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc)
         SELECT id, $2, $3, $4 FROM ho_so_sinh_vien WHERE nguoi_dung_id = $1
         ON CONFLICT DO NOTHING`,
        [req.nguoiDung.id, item.dayOfWeek, item.startTime, item.endTime],
      );
    }
  });
  res.json({ message: 'Đã cập nhật khung giờ rảnh' });
}));

router.post('/applications', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `INSERT INTO ung_tuyen (tin_id, sinh_vien_id)
     SELECT j.id, p.id FROM tin_tuyen_dung j
     JOIN nha_tuyen_dung e ON e.id = j.ntd_id
     JOIN ho_so_sinh_vien p ON p.nguoi_dung_id = $2
     WHERE j.id = $1 AND j.trang_thai_duyet = 'DA_DUYET'
       AND e.trang_thai_duyet = 'DA_DUYET' AND e.da_xac_minh = TRUE
     RETURNING id, tin_id AS "jobId", trang_thai AS status, ung_tuyen_luc AS "appliedAt"`,
    [req.body.jobId, req.nguoiDung.id],
  );
  if (!result.rows[0]) return res.status(404).json({ loi: 'Không tìm thấy tin đã được duyệt' });
  res.status(201).json(result.rows[0]);
}));

router.get('/applications', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT a.id, a.tin_id AS "jobId", j.tieu_de AS title,
       a.trang_thai AS status, a.ung_tuyen_luc AS "appliedAt"
     FROM ung_tuyen a JOIN ho_so_sinh_vien p ON p.id = a.sinh_vien_id
     JOIN tin_tuyen_dung j ON j.id = a.tin_id
     WHERE p.nguoi_dung_id = $1 ORDER BY a.ung_tuyen_luc DESC`,
    [req.nguoiDung.id],
  );
  res.json(result.rows);
}));

router.post('/reports', asyncHandler(async (req, res) => {
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
  if (!Number.isInteger(Number(req.body.jobId)) || description.length < 10) {
    return res.status(400).json({ loi: 'Tin tuyển dụng hoặc nội dung báo cáo không hợp lệ' });
  }
  const result = await truyVan(
    `INSERT INTO bao_cao_lua_dao (tin_id, nguoi_bao_id, noi_dung, bang_chung_url)
     SELECT id, $2, $3, $4 FROM tin_tuyen_dung WHERE id = $1
     RETURNING id, trang_thai AS status`,
    [req.body.jobId, req.nguoiDung.id, description, req.body.evidenceUrl || null],
  );
  if (!result.rows[0]) return res.status(404).json({ loi: 'Không tìm thấy tin tuyển dụng' });
  res.status(201).json(result.rows[0]);
}));

router.get('/my-shifts', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT n.id, j.tieu_de AS title, s.ngay AS "workDate",
       s.gio_bat_dau AS "startTime", s.gio_ket_thuc AS "endTime",
       j.dia_diem AS location, c.trang_thai_duyet AS "timeRecordStatus",
       c.check_in_luc AS "checkInAt", c.check_out_luc AS "checkOutAt"
     FROM nhan_ca n JOIN ho_so_sinh_vien p ON p.id = n.sinh_vien_id
     JOIN ca_lam_viec s ON s.id = n.ca_id JOIN tin_tuyen_dung j ON j.id = s.tin_id
     LEFT JOIN cham_cong c ON c.nhan_ca_id = n.id
     WHERE p.nguoi_dung_id = $1 ORDER BY s.ngay, s.gio_bat_dau`,
    [req.nguoiDung.id],
  );
  res.json(result.rows);
}));

router.get('/payroll', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT b.id, b.ky AS period, b.tong_gio AS "totalHours",
       b.tong_tien AS "totalAmount", b.trang_thai AS status, e.ten_cong_ty AS company
     FROM bang_luong b JOIN ho_so_sinh_vien p ON p.id = b.sinh_vien_id
     JOIN nha_tuyen_dung e ON e.id = b.ntd_id
     WHERE p.nguoi_dung_id = $1 ORDER BY b.ky DESC`,
    [req.nguoiDung.id],
  );
  res.json(result.rows);
}));

module.exports = router;