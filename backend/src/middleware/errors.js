function notFound(req, res) {
  res.status(404).json({ loi: `Không tìm thấy đường dẫn ${req.path}` });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && Object.hasOwn(error, 'body')) {
    return res.status(400).json({ loi: 'JSON gửi lên không hợp lệ' });
  }
  if (error.code === '23505') return res.status(409).json({ loi: 'Dữ liệu đã tồn tại' });
  if (error.code === '23503' || error.code === '23514' || error.code === '22P02') {
    return res.status(400).json({ loi: 'Dữ liệu không hợp lệ' });
  }
  console.error(error);
  return res.status(500).json({ loi: 'Lỗi máy chủ' });
}

module.exports = { notFound, errorHandler };