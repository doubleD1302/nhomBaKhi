const jwt = require('jsonwebtoken');
const { truyVan } = require('../db');

async function xacThuc(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return res.status(401).json({ loi: 'Thiếu token đăng nhập' });
  try {
    req.nguoiDung = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!Number.isSafeInteger(Number(req.nguoiDung.id)) || Number(req.nguoiDung.id) < 1) {
      return res.status(401).json({ loi: 'Token không hợp lệ' });
    }
  } catch {
    return res.status(401).json({ loi: 'Token không hợp lệ hoặc đã hết hạn' });
  }
  try {
    const result = await truyVan('SELECT vai_tro, trang_thai FROM nguoi_dung WHERE id = $1', [req.nguoiDung.id]);
    const user = result.rows[0];
    if (!user || user.trang_thai !== 'HOAT_DONG' || user.vai_tro !== req.nguoiDung.vaiTro) {
      return res.status(401).json({ loi: 'Tài khoản không còn hoạt động hoặc quyền đã thay đổi' });
    }
    return next();
  } catch (error) { return next(error); }
}

function choPhep(...vaiTroChoPhep) {
  return (req, res, next) => {
    if (!req.nguoiDung || !vaiTroChoPhep.includes(req.nguoiDung.vaiTro)) {
      return res.status(403).json({ loi: 'Không có quyền thực hiện' });
    }
    return next();
  };
}

module.exports = { xacThuc, choPhep };
