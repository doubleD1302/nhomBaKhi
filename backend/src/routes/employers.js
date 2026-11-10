const express = require('express');
const { truyVan, trongGiaoDich } = require('../db');
const { asyncHandler } = require('../utils');
const { xacThuc, choPhep } = require('../middleware/auth');

const router = express.Router();
router.use(xacThuc, choPhep('NHA_TUYEN_DUNG'));

router.get('/profile', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT e.ten_cong_ty AS "companyName", e.ma_so_thue AS "taxCode",
       e.dia_chi AS address, e.giay_phep_url AS "licenseUrl",
       e.trang_thai_duyet AS status, e.da_xac_minh AS verified,
       u.ho_ten AS "contactName", u.sdt AS phone
     FROM nha_tuyen_dung e JOIN nguoi_dung u ON u.id = e.nguoi_dung_id
     WHERE u.id = $1`,
    [req.nguoiDung.id],
  );
  if (!result.rows[0]) return res.status(404).json({ loi: 'Không tìm thấy hồ sơ nhà tuyển dụng' });
  res.json(result.rows[0]);
}));

router.patch('/profile', asyncHandler(async (req, res) => {
  const { companyName, taxCode, address, licenseUrl, contactName, phone } = req.body;
  if (typeof companyName !== 'string' || !companyName.trim()
      || typeof taxCode !== 'string' || !taxCode.trim()
      || typeof address !== 'string' || !address.trim()
      || typeof licenseUrl !== 'string' || !/^https:\/\//i.test(licenseUrl.trim())
      || typeof contactName !== 'string' || !contactName.trim()) {
    return res.status(400).json({ loi: 'Thông tin công ty hoặc URL giấy phép không hợp lệ' });
  }
  await trongGiaoDich(async (client) => {
    await client.query(
      `UPDATE nha_tuyen_dung SET ten_cong_ty = $2, ma_so_thue = $3,
       dia_chi = $4, giay_phep_url = $5, trang_thai_duyet = 'CHO_DUYET',
       da_xac_minh = FALSE WHERE nguoi_dung_id = $1`,
      [req.nguoiDung.id, companyName.trim(), taxCode.trim(), address.trim(), licenseUrl.trim()],
    );
    await client.query(
      'UPDATE nguoi_dung SET ho_ten = $2, sdt = $3 WHERE id = $1',
      [req.nguoiDung.id, contactName.trim(), String(phone || '').trim()],
    );
  });
  res.json({ message: 'Đã lưu hồ sơ và gửi yêu cầu xác minh' });
}));

router.get('/applications', asyncHandler(async (req, res) => {
  const result = await truyVan(
    `SELECT a.id, a.trang_thai AS status, a.ung_tuyen_luc AS "appliedAt",
       u.id AS "studentId", u.ho_ten AS "studentName", u.email,
       p.truong AS school, p.nganh AS major, p.ky_nang AS skills, j.tieu_de AS title
     FROM ung_tuyen a JOIN tin_tuyen_dung j ON j.id = a.tin_id
     JOIN nha_tuyen_dung e ON e.id = j.ntd_id
     JOIN ho_so_sinh_vien p ON p.id = a.sinh_vien_id
     JOIN nguoi_dung u ON u.id = p.nguoi_dung_id
     WHERE e.nguoi_dung_id = $1 ORDER BY a.ung_tuyen_luc DESC`,
    [req.nguoiDung.id],
  );
  res.json(result.rows);
}));

router.patch('/applications/:id', asyncHandler(async (req, res) => {
  const decision = req.body.decision;
  if (!['DA_DUYET', 'TU_CHOI'].includes(decision)) {
    return res.status(400).json({ loi: 'Quyết định phải là DA_DUYET hoặc TU_CHOI' });
  }
  const result = await truyVan(
    `UPDATE ung_tuyen a SET trang_thai = $3
     FROM tin_tuyen_dung j JOIN nha_tuyen_dung e ON e.id = j.ntd_id
     WHERE a.tin_id = j.id AND a.id = $1 AND e.nguoi_dung_id = $2
     RETURNING a.id, a.trang_thai AS status`,
    [req.params.id, req.nguoiDung.id, decision],
  );
  if (!result.rows[0]) return res.status(404).json({ loi: 'Không tìm thấy hồ sơ ứng tuyển' });
  res.json(result.rows[0]);
}));

module.exports = router;