const express = require('express');
const { truyVan, trongGiaoDich } = require('../db');
const { asyncHandler, haversineMeters, isValidCoordinate } = require('../utils');
const { xacThuc, choPhep } = require('../middleware/auth');

const router = express.Router();
router.use(xacThuc);

router.get('/', asyncHandler(async (req, res) => {
  if (req.nguoiDung.vaiTro === 'NHA_TUYEN_DUNG') {
    const result = await truyVan(
      `SELECT s.id, j.tieu_de AS title, s.ngay AS "workDate",
         s.gio_bat_dau AS "startTime", s.gio_ket_thuc AS "endTime",
         s.so_nguoi_can AS "neededWorkers", s.so_nguoi_da_nhan AS "claimedWorkers"
       FROM ca_lam_viec s JOIN tin_tuyen_dung j ON j.id = s.tin_id
       JOIN nha_tuyen_dung e ON e.id = j.ntd_id
       WHERE e.nguoi_dung_id = $1 ORDER BY s.ngay, s.gio_bat_dau`,
      [req.nguoiDung.id],
    );
    return res.json(result.rows);
  }
  if (req.nguoiDung.vaiTro !== 'SINH_VIEN') return res.status(403).json({ loi: 'Không có quyền xem ca làm' });
  const result = await truyVan(
    `SELECT s.id, j.id AS "jobId", j.tieu_de AS title, j.dia_diem AS location,
       s.ngay AS "workDate", s.gio_bat_dau AS "startTime",
       s.gio_ket_thuc AS "endTime", s.so_nguoi_can AS "neededWorkers",
       s.so_nguoi_da_nhan AS "claimedWorkers"
     FROM ca_lam_viec s JOIN tin_tuyen_dung j ON j.id = s.tin_id
     JOIN nha_tuyen_dung e ON e.id = j.ntd_id
     WHERE j.trang_thai_duyet = 'DA_DUYET' AND e.trang_thai_duyet = 'DA_DUYET'
       AND e.da_xac_minh = TRUE AND s.ngay >= CURRENT_DATE
       AND s.so_nguoi_da_nhan < s.so_nguoi_can
     ORDER BY s.ngay, s.gio_bat_dau`,
    [],
  );
  res.json(result.rows);
}));

router.post('/:id/claim', choPhep('SINH_VIEN'), asyncHandler(async (req, res) => {
  const shift = await trongGiaoDich(async (client) => {
    const selected = await client.query(
      `SELECT s.id, s.tin_id, s.ngay, s.gio_bat_dau, s.gio_ket_thuc,
         s.so_nguoi_can, s.so_nguoi_da_nhan, p.id AS sinh_vien_id
       FROM ca_lam_viec s JOIN tin_tuyen_dung j ON j.id = s.tin_id
       JOIN nha_tuyen_dung e ON e.id = j.ntd_id
       JOIN ho_so_sinh_vien p ON p.nguoi_dung_id = $2
       WHERE s.id = $1 AND s.ngay >= CURRENT_DATE
         AND j.trang_thai_duyet = 'DA_DUYET'
         AND e.trang_thai_duyet = 'DA_DUYET' AND e.da_xac_minh = TRUE
       FOR UPDATE OF s`,
      [req.params.id, req.nguoiDung.id],
    );
    const row = selected.rows[0];
    if (!row) return { error: 'NOT_FOUND' };
    if (row.so_nguoi_da_nhan >= row.so_nguoi_can) return { error: 'FULL' };
    const accepted = await client.query(
      `SELECT 1 FROM ung_tuyen WHERE tin_id = $1 AND sinh_vien_id = $2
       AND trang_thai = 'DA_DUYET'`,
      [row.tin_id, row.sinh_vien_id],
    );
    if (!accepted.rowCount) return { error: 'APPLICATION_REQUIRED' };
    const conflict = await client.query(
      `SELECT 1 FROM nhan_ca n JOIN ca_lam_viec other ON other.id = n.ca_id
       WHERE n.sinh_vien_id = $1 AND n.trang_thai = 'DA_NHAN'
         AND other.ngay = $2 AND other.gio_bat_dau < $4 AND other.gio_ket_thuc > $3`,
      [row.sinh_vien_id, row.ngay, row.gio_bat_dau, row.gio_ket_thuc],
    );
    if (conflict.rowCount) return { error: 'SCHEDULE_CONFLICT' };
    const claimed = await client.query(
      `INSERT INTO nhan_ca (ca_id, sinh_vien_id)
       VALUES ($1, $2) RETURNING id`,
      [row.id, row.sinh_vien_id],
    );
    await client.query(
      'UPDATE ca_lam_viec SET so_nguoi_da_nhan = so_nguoi_da_nhan + 1 WHERE id = $1',
      [row.id],
    );
    return { id: claimed.rows[0].id };
  });
  if (shift.error === 'NOT_FOUND') return res.status(404).json({ loi: 'Không tìm thấy ca đang mở' });
  if (shift.error === 'FULL') return res.status(409).json({ loi: 'Ca làm đã đủ người' });
  if (shift.error === 'APPLICATION_REQUIRED') return res.status(403).json({ loi: 'Ứng tuyển cần được duyệt trước khi nhận ca' });
  if (shift.error === 'SCHEDULE_CONFLICT') return res.status(409).json({ loi: 'Ca làm trùng với lịch đã nhận' });
  res.status(201).json({ id: shift.id, message: 'Đã nhận ca' });
}));

router.post('/:id/check-in', choPhep('SINH_VIEN'), asyncHandler(async (req, res) => {
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);
  if (!isValidCoordinate(latitude, longitude)) return res.status(400).json({ loi: 'Tọa độ không hợp lệ' });
  const outcome = await trongGiaoDich(async (client) => {
    const result = await client.query(
      `SELECT n.id, j.vi_do, j.kinh_do
       FROM nhan_ca n JOIN ho_so_sinh_vien p ON p.id = n.sinh_vien_id
       JOIN ca_lam_viec s ON s.id = n.ca_id JOIN tin_tuyen_dung j ON j.id = s.tin_id
       WHERE n.id = $1 AND p.nguoi_dung_id = $2 AND n.trang_thai = 'DA_NHAN'
       FOR UPDATE OF n`,
      [req.params.id, req.nguoiDung.id],
    );
    const shift = result.rows[0];
    if (!shift) return { error: 'NOT_FOUND' };
    const distance = haversineMeters(latitude, longitude, shift.vi_do, shift.kinh_do);
    const status = distance > Number(process.env.CHECK_IN_RADIUS_METERS || 200)
      ? 'CAN_DUYET_THU_CONG'
      : 'CHO_DUYET';
    const inserted = await client.query(
      `INSERT INTO cham_cong (nhan_ca_id, check_in_luc, vi_do_in, kinh_do_in, trang_thai_duyet)
       VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4) RETURNING id`,
      [shift.id, latitude, longitude, status],
    );
    return { id: inserted.rows[0].id, distanceMeters: Math.round(distance), status };
  });
  if (outcome.error) return res.status(404).json({ loi: 'Không tìm thấy ca hoặc ca đã chấm công' });
  res.status(201).json(outcome);
}));

router.post('/:id/check-out', choPhep('SINH_VIEN'), asyncHandler(async (req, res) => {
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);
  if (!isValidCoordinate(latitude, longitude)) return res.status(400).json({ loi: 'Tọa độ không hợp lệ' });
  const result = await truyVan(
    `UPDATE cham_cong c SET check_out_luc = CURRENT_TIMESTAMP,
       vi_do_out = $3, kinh_do_out = $4,
       so_gio = ROUND((EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - c.check_in_luc)) / 3600)::numeric, 2)
     FROM nhan_ca n JOIN ho_so_sinh_vien p ON p.id = n.sinh_vien_id
     WHERE c.nhan_ca_id = n.id AND n.id = $1 AND p.nguoi_dung_id = $2
       AND c.check_in_luc IS NOT NULL AND c.check_out_luc IS NULL
     RETURNING c.id, c.so_gio AS "totalHours", c.trang_thai_duyet AS status`,
    [req.params.id, req.nguoiDung.id, latitude, longitude],
  );
  if (!result.rows[0]) return res.status(409).json({ loi: 'Chưa check-in hoặc ca đã check-out' });
  res.json(result.rows[0]);
}));

module.exports = router;