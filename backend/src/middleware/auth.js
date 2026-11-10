const jwt = require('jsonwebtoken');

function xacThuc(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return res.status(401).json({ loi: 'Thiếu token đăng nhập' });
  try {
    req.nguoiDung = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ loi: 'Token không hợp lệ hoặc đã hết hạn' });
  }
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