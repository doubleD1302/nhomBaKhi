const express = require('express');
const { truyVan, trongGiaoDich } = require('../db');
const { asyncHandler } = require('../utils');
const { xacThuc, choPhep } = require('../middleware/auth');

const router = express.Router();
router.use(xacThuc, choPhep('QUAN_TRI'));

router.get('/dashboard', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT
       (SELECT COUNT(*) FROM nha_tuyen_dung WHERE trang_thai_duyet = 'CHO_DUYET') AS "pendingEmployers",
       (SELECT COUNT(*) FROM tin_tuyen_dung WHERE trang_thai_duyet = 'CHO_DUYET') AS "pendingJobs",
       (SELECT COUNT(*) FROM bao_cao_lua_dao WHERE trang_thai = 'CHO_XU_LY') AS "openReports",
       (SELECT COUNT(*) FROM tin_tuyen_dung WHERE trang_thai_duyet = 'DA_DUYET') AS "activeJobs"`,
  );
  res.json(result.rows[0]);
}));

router.post('/categories', asyncHandler(async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!name || name.length > 100) return res.status(400).json({ loi: 'Tên nhóm việc không hợp lệ' });
  const result = await truyVan(
    'INSERT INTO nhom_viec (ten) VALUES ($1) RETURNING id, ten AS name',
    [name],
  );
  res.status(201).json(result.rows[0]);
}));

router.get('/employers', asyncHandler(async (req, res) => {
  const status = req.query.status || 'CHO_DUYET';
  const result = await truyVan(
    `SELECT e.id, e.ten_cong_ty AS "companyName", e.ma_so_thue AS "taxCode",
       e.dia_chi AS address, e.giay_phep_url AS "licenseUrl",
       e.trang_thai_duyet AS status, u.ho_ten AS "contactName", u.email, u.sdt AS phone
     FROM nha_tuyen_dung e JOIN nguoi_dung u ON u.id = e.nguoi_dung_id
     WHERE e.trang_thai_duyet = $1 ORDER BY e.id DESC`,
    [status],
  );
  res.json({ employers: result.rows });
}));

router.patch('/employers/:id/review', asyncHandler(async (req, res) => {
  const { decision, reason = '' } = req.body;
  if (!['APPROVE', 'REJECT', 'BLOCK'].includes(decision)
      || (decision !== 'APPROVE' && !String(reason).trim())) {
    return res.status(400).json({ loi: 'Quyết định hoặc lý do xử lý không hợp lệ' });
  }
  const result = await trongGiaoDich(async (client) => {
    const updated = await client.query(
      `UPDATE nha_tuyen_dung SET trang_thai_duyet = $2,
       da_xac_minh = ($2 = 'DA_DUYET')
       WHERE id = $1 RETURNING nguoi_dung_id`,
      [req.params.id, decision === 'APPROVE' ? 'DA_DUYET' : decision === 'BLOCK' ? 'BI_KHOA' : 'TU_CHOI'],
    );
    if (!updated.rows[0]) return false;
    if (decision === 'BLOCK') {
      await client.query(
        "UPDATE nguoi_dung SET trang_thai = 'BI_KHOA' WHERE id = $1",
        [updated.rows[0].nguoi_dung_id],
      );
    }
    return true;
  });
  if (!result) return res.status(404).json({ loi: 'Không tìm thấy nhà tuyển dụng' });
  res.json({ message: 'Đã xử lý hồ sơ nhà tuyển dụng' });
}));

router.get('/jobs', asyncHandler(async (req, res) => {
  const status = req.query.status || 'CHO_DUYET';
  const result = await truyVan(
    `SELECT j.id, j.tieu_de AS title, j.mo_ta AS description, j.dia_diem AS location,
       j.luong_theo_gio AS "hourlyWage", j.trang_thai_duyet AS status,
       j.ly_do_tu_choi AS "rejectionReason", e.ten_cong_ty AS company
     FROM tin_tuyen_dung j JOIN nha_tuyen_dung e ON e.id = j.ntd_id
     WHERE j.trang_thai_duyet = $1 ORDER BY j.tao_luc DESC`,
    [status],
  );
  res.json({ jobs: result.rows });
}));

router.patch('/jobs/:id/review', asyncHandler(async (req, res) => {
  const { decision, reason = '' } = req.body;
  if (!['APPROVE', 'REJECT', 'REMOVE'].includes(decision)
      || (decision !== 'APPROVE' && !String(reason).trim())) {
    return res.status(400).json({ loi: 'Quyết định hoặc lý do xử lý không hợp lệ' });
  }
  const status = decision === 'APPROVE' ? 'DA_DUYET'
    : decision === 'REJECT' ? 'TU_CHOI' : 'DA_GO';
  const result = await truyVan(
    `UPDATE tin_tuyen_dung SET trang_thai_duyet = $2, ly_do_tu_choi = $3
     WHERE id = $1 RETURNING id, trang_thai_duyet AS status`,
    [req.params.id, status, decision === 'APPROVE' ? null : String(reason).trim()],
  );
  if (!result.rows[0]) return res.status(404).json({ loi: 'Không tìm thấy tin tuyển dụng' });
  res.json(result.rows[0]);
}));

router.get('/reports', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT r.id, r.tin_id AS "jobId", j.tieu_de AS title,
       r.noi_dung AS description, r.bang_chung_url AS "evidenceUrl",
       r.trang_thai AS status, r.tao_luc AS "createdAt", u.email AS reporter
     FROM bao_cao_lua_dao r JOIN tin_tuyen_dung j ON j.id = r.tin_id
     JOIN nguoi_dung u ON u.id = r.nguoi_bao_id
     WHERE r.trang_thai = $1 ORDER BY r.tao_luc DESC`,
    [req.query.status || 'CHO_XU_LY'],
  );
  res.json({ reports: result.rows });
}));

router.patch('/reports/:id/review', asyncHandler(async (req, res) => {
  const { decision, conclusion } = req.body;
  if (!['CONFIRMED', 'DISMISSED'].includes(decision)
      || typeof conclusion !== 'string' || !conclusion.trim()) {
    return res.status(400).json({ loi: 'Kết luận xử lý không hợp lệ' });
  }
  const result = await truyVan(
    `UPDATE bao_cao_lua_dao SET trang_thai = $2, ket_luan = $3
     WHERE id = $1 RETURNING id, trang_thai AS status`,
    [req.params.id, decision, conclusion.trim()],
  );
  if (!result.rows[0]) return res.status(404).json({ loi: 'Không tìm thấy báo cáo' });
  res.json(result.rows[0]);
}));

router.get('/time-records', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT c.id, c.nhan_ca_id AS "shiftClaimId", u.ho_ten AS "studentName",
       j.tieu_de AS title, c.check_in_luc AS "checkInAt",
       c.check_out_luc AS "checkOutAt", c.so_gio AS hours,
       c.trang_thai_duyet AS status
     FROM cham_cong c JOIN nhan_ca n ON n.id = c.nhan_ca_id
     JOIN ho_so_sinh_vien p ON p.id = n.sinh_vien_id
     JOIN nguoi_dung u ON u.id = p.nguoi_dung_id
     JOIN ca_lam_viec s ON s.id = n.ca_id JOIN tin_tuyen_dung j ON j.id = s.tin_id
     WHERE c.trang_thai_duyet IN ('CHO_DUYET', 'CAN_DUYET_THU_CONG')
     ORDER BY c.check_in_luc`,
  );
  res.json({ timeRecords: result.rows });
}));

router.patch('/time-records/:id/review', asyncHandler(async (req, res) => {
  const { decision } = req.body;
  if (!['APPROVE', 'REJECT'].includes(decision)) return res.status(400).json({ loi: 'Quyết định không hợp lệ' });
  const result = await truyVan(
    `UPDATE cham_cong SET trang_thai_duyet = $2
     WHERE id = $1 RETURNING id, trang_thai_duyet AS status`,
    [req.params.id, decision === 'APPROVE' ? 'DA_DUYET' : 'TU_CHOI'],
  );
  if (!result.rows[0]) return res.status(404).json({ loi: 'Không tìm thấy bản ghi chấm công' });
  res.json(result.rows[0]);
}));

router.get('/analytics', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT c.id, c.ten AS category,
       COUNT(j.id)::int AS "jobCount",
       COALESCE(ROUND(AVG(j.luong_theo_gio)), 0)::int AS "averageWage",
       COUNT(j.id) FILTER (WHERE j.trang_thai_duyet IN ('DA_GO', 'TU_CHOI'))::int AS "removedOrRejected"
     FROM nhom_viec c LEFT JOIN tin_tuyen_dung j ON j.nhom_id = c.id
     GROUP BY c.id, c.ten ORDER BY "jobCount" DESC, c.ten`,
  );
  res.json({ categories: result.rows });
}));

router.get('/payroll', asyncHandler(async (req, res) => {
  const period = req.query.period;
  if (period !== undefined && !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    return res.status(400).json({ loi: 'Kỳ lương phải theo định dạng YYYY-MM' });
  }
  const result = await truyVan(
    `SELECT b.id, b.ky AS period, b.tong_gio AS "totalHours",
       b.tong_tien AS "totalAmount", b.trang_thai AS status,
       u.ho_ten AS "studentName", e.ten_cong_ty AS company
     FROM bang_luong b JOIN ho_so_sinh_vien p ON p.id = b.sinh_vien_id
     JOIN nguoi_dung u ON u.id = p.nguoi_dung_id
     JOIN nha_tuyen_dung e ON e.id = b.ntd_id
     WHERE ($1::text IS NULL OR b.ky = $1) ORDER BY b.ky DESC, u.ho_ten`,
    [period || null],
  );
  res.json({ payroll: result.rows });
}));

router.post('/payroll/calculate', asyncHandler(async (req, res) => {
  const period = req.body.period;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period || '')) {
    return res.status(400).json({ loi: 'Kỳ lương phải theo định dạng YYYY-MM' });
  }
  const rows = await trongGiaoDich(async (client) => {
    const result = await client.query(
      `INSERT INTO bang_luong (sinh_vien_id, ntd_id, ky, tong_gio, tong_tien)
       SELECT p.id, j.ntd_id, $1,
         ROUND(SUM(c.so_gio), 2),
         ROUND(SUM(c.so_gio * j.luong_theo_gio))::bigint
       FROM cham_cong c JOIN nhan_ca n ON n.id = c.nhan_ca_id
       JOIN ho_so_sinh_vien p ON p.id = n.sinh_vien_id
       JOIN ca_lam_viec s ON s.id = n.ca_id
       JOIN tin_tuyen_dung j ON j.id = s.tin_id
       WHERE c.trang_thai_duyet = 'DA_DUYET' AND c.check_out_luc IS NOT NULL
         AND TO_CHAR(c.check_out_luc, 'YYYY-MM') = $1
       GROUP BY p.id, j.ntd_id
       ON CONFLICT (sinh_vien_id, ntd_id, ky) DO UPDATE
       SET tong_gio = EXCLUDED.tong_gio, tong_tien = EXCLUDED.tong_tien
       WHERE bang_luong.trang_thai = 'CHO_DUYET'
       RETURNING id, sinh_vien_id AS "studentId", ntd_id AS "employerId",
         ky AS period, tong_gio AS "totalHours", tong_tien AS "totalAmount"`,
      [period],
    );
    return result.rows;
  });
  res.status(201).json({ payroll: rows });
}));

router.patch('/payroll/:id/approve', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `UPDATE bang_luong SET trang_thai = 'DA_DUYET'
     WHERE id = $1 AND trang_thai = 'CHO_DUYET'
     RETURNING id, trang_thai AS status`,
    [req.params.id],
  );
  if (!result.rows[0]) return res.status(404).json({ loi: 'Không tìm thấy bảng lương đang chờ duyệt' });
  res.json(result.rows[0]);
}));

module.exports = router;