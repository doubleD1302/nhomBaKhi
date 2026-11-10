const express = require('express');
const { truyVan } = require('../db');
const { asyncHandler } = require('../utils');
const { xacThuc, choPhep } = require('../middleware/auth');

const router = express.Router();

router.get('/categories', asyncHandler(async (req, res) => {
  const result = await truyVan('SELECT id, ten AS name FROM nhom_viec ORDER BY ten');
  res.json(result.rows);
}));

router.get('/', (req, res, next) => {
  if (req.query.schedule === 'true') return xacThuc(req, res, next);
  return next();
}, asyncHandler(async (req, res) => {
  const { area = '', category, minWage, schedule } = req.query;
  const params = [];
  let where = `j.trang_thai_duyet = 'DA_DUYET' AND e.trang_thai_duyet = 'DA_DUYET'
    AND e.da_xac_minh = TRUE AND u.trang_thai = 'HOAT_DONG'`;
  if (area) {
    params.push(`%${String(area).slice(0, 100)}%`);
    where += ` AND j.dia_diem ILIKE $${params.length}`;
  }
  if (category !== undefined) {
    const categoryId = Number(category);
    if (!Number.isInteger(categoryId) || categoryId < 1) return res.status(400).json({ loi: 'Nhóm việc không hợp lệ' });
    params.push(categoryId);
    where += ` AND j.nhom_id = $${params.length}`;
  }
  if (minWage !== undefined) {
    const wage = Number(minWage);
    if (!Number.isFinite(wage) || wage < 0) return res.status(400).json({ loi: 'Mức lương không hợp lệ' });
    params.push(wage);
    where += ` AND j.luong_theo_gio >= $${params.length}`;
  }
  if (schedule === 'true') {
    const student = await truyVan(
      'SELECT id FROM ho_so_sinh_vien WHERE nguoi_dung_id = $1',
      [req.nguoiDung.id],
    );
    if (!student.rows[0]) return res.status(403).json({ loi: 'Chỉ sinh viên mới dùng được bộ lọc lịch rảnh' });
    params.push(student.rows[0].id);
    where += ` AND EXISTS (
      SELECT 1 FROM ca_lam_viec s
      JOIN khung_gio_ranh a ON a.sinh_vien_id = $${params.length}
        AND a.thu_trong_tuan = EXTRACT(ISODOW FROM s.ngay)
        AND a.gio_bat_dau < s.gio_ket_thuc AND a.gio_ket_thuc > s.gio_bat_dau
      WHERE s.tin_id = j.id AND s.ngay >= CURRENT_DATE
        AND s.so_nguoi_da_nhan < s.so_nguoi_can
    )`;
  }
  const result = await truyVan(
    `SELECT j.id, j.tieu_de AS title, j.mo_ta AS description, j.dia_diem AS location,
       j.vi_do AS latitude, j.kinh_do AS longitude,
       j.luong_theo_gio AS "hourlyWage", j.so_luong AS headcount,
       c.ten AS category, e.ten_cong_ty AS company, e.da_xac_minh AS verified
     FROM tin_tuyen_dung j
     JOIN nha_tuyen_dung e ON e.id = j.ntd_id
     JOIN nguoi_dung u ON u.id = e.nguoi_dung_id
     JOIN nhom_viec c ON c.id = j.nhom_id
     WHERE ${where} ORDER BY j.tao_luc DESC LIMIT 100`,
    params,
  );
  res.json(result.rows);
}));

router.get('/employer/mine', xacThuc, choPhep('NHA_TUYEN_DUNG'), asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT j.id, j.tieu_de AS title, j.trang_thai_duyet AS status,
       j.ly_do_tu_choi AS "rejectionReason", j.tao_luc AS "createdAt"
     FROM tin_tuyen_dung j JOIN nha_tuyen_dung e ON e.id = j.ntd_id
     WHERE e.nguoi_dung_id = $1 ORDER BY j.tao_luc DESC`,
    [req.nguoiDung.id],
  );
  res.json(result.rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT j.id, j.tieu_de AS title, j.mo_ta AS description, j.dia_diem AS location,
       j.vi_do AS latitude, j.kinh_do AS longitude,
       j.luong_theo_gio AS "hourlyWage", j.so_luong AS headcount,
       c.ten AS category, e.ten_cong_ty AS company, e.da_xac_minh AS verified
     FROM tin_tuyen_dung j
     JOIN nha_tuyen_dung e ON e.id = j.ntd_id
     JOIN nhom_viec c ON c.id = j.nhom_id
     WHERE j.id = $1 AND j.trang_thai_duyet = 'DA_DUYET'
       AND e.trang_thai_duyet = 'DA_DUYET' AND e.da_xac_minh = TRUE`,
    [req.params.id],
  );
  if (!result.rows[0]) return res.status(404).json({ loi: 'Không tìm thấy tin tuyển dụng' });
  res.json(result.rows[0]);
}));

router.post('/', xacThuc, choPhep('NHA_TUYEN_DUNG'), asyncHandler(async (req, res) => {
  const { categoryId, title, description, location, latitude, longitude, hourlyWage, headcount } = req.body;
  const category = Number(categoryId);
  const lat = Number(latitude);
  const lon = Number(longitude);
  const wage = Number(hourlyWage);
  const count = Number(headcount);
  if (typeof title !== 'string' || !title.trim() || typeof description !== 'string'
      || !description.trim() || typeof location !== 'string' || !location.trim()
      || !Number.isInteger(category) || category < 1
      || !Number.isFinite(lat) || lat < -90 || lat > 90
      || !Number.isFinite(lon) || lon < -180 || lon > 180
      || !Number.isInteger(wage) || wage < 1 || !Number.isInteger(count) || count < 1) {
    return res.status(400).json({ loi: 'Thông tin tin tuyển dụng không hợp lệ' });
  }
  const result = await truyVan(
    `INSERT INTO tin_tuyen_dung
       (ntd_id, nhom_id, tieu_de, mo_ta, dia_diem, vi_do, kinh_do, luong_theo_gio, so_luong)
     SELECT e.id, $2, $3, $4, $5, $6, $7, $8, $9
     FROM nha_tuyen_dung e
     WHERE e.nguoi_dung_id = $1 AND e.trang_thai_duyet = 'DA_DUYET'
       AND e.da_xac_minh = TRUE
     RETURNING id, trang_thai_duyet AS status`,
    [req.nguoiDung.id, category, title.trim(), description.trim(), location.trim(), lat, lon, wage, count],
  );
  if (!result.rows[0]) return res.status(403).json({ loi: 'Nhà tuyển dụng cần được xác minh trước khi đăng tin' });
  res.status(201).json(result.rows[0]);
}));

router.post('/:jobId/shifts', xacThuc, choPhep('NHA_TUYEN_DUNG'), asyncHandler(async (req, res) => {
  const { workDate, startTime, endTime, neededWorkers } = req.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate || '')
      || !/^\d{2}:\d{2}$/.test(startTime || '')
      || !/^\d{2}:\d{2}$/.test(endTime || '')
      || startTime >= endTime || !Number.isInteger(neededWorkers) || neededWorkers < 1) {
    return res.status(400).json({ loi: 'Thông tin ca làm không hợp lệ' });
  }
  const result = await truyVan(
    `INSERT INTO ca_lam_viec (tin_id, ngay, gio_bat_dau, gio_ket_thuc, so_nguoi_can)
     SELECT j.id, $3, $4, $5, $6 FROM tin_tuyen_dung j
     JOIN nha_tuyen_dung e ON e.id = j.ntd_id
     WHERE j.id = $1 AND e.nguoi_dung_id = $2
       AND j.trang_thai_duyet = 'DA_DUYET'
       AND e.trang_thai_duyet = 'DA_DUYET' AND e.da_xac_minh = TRUE
     RETURNING id, tin_id AS "jobId", ngay AS "workDate"`,
    [req.params.jobId, req.nguoiDung.id, workDate, startTime, endTime, neededWorkers],
  );
  if (!result.rows[0]) return res.status(404).json({ loi: 'Không tìm thấy tin của nhà tuyển dụng' });
  res.status(201).json(result.rows[0]);
}));

module.exports = router;