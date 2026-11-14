# Use case — nền tảng kết nối việc làm

| Sơ đồ | Ai sử dụng? |
| --- | --- |
| [Tổng quan](00_Tong_quan.svg) | Các nhóm chức năng của toàn hệ thống |
| [Sinh viên](01_SV.svg) | Hồ sơ, tìm việc, ứng tuyển và báo cáo tin |
| [Nhà tuyển dụng](01_NTD.svg) | Hồ sơ doanh nghiệp, tin tuyển dụng, địa điểm và ứng viên |
| [Quản trị](01_QT.svg) | Duyệt hồ sơ/tin, xử lý vi phạm và thống kê |
| [Tìm việc và ứng tuyển](02_Chi_tiet_tim_viec_ung_tuyen.svg) | Luồng kết nối sinh viên với tin tuyển dụng |
| [Đăng và quản lý tin](03_Chi_tiet_quan_ly_tin.svg) | Luồng tạo, cập nhật và duyệt tin |
| [Kiểm duyệt](04_Chi_tiet_kiem_duyet.svg) | Gắn cờ, gỡ tin, khóa tài khoản và thống kê |
| [Báo cáo tin vi phạm](05_Chi_tiet_bao_cao_lua_dao.svg) | Gửi bằng chứng và kết luận báo cáo |

Thiết kế gồm 21 use case, 3 tác nhân: Sinh viên, Nhà tuyển dụng và Quản trị viên. Đăng nhập là tiền điều kiện của chức năng được bảo vệ; các xử lý bắt buộc dùng `include`, nhánh tùy chọn dùng `extend`.

Phạm vi dừng ở việc kết nối ứng viên với nhà tuyển dụng. Không có use case nhận ca, check-in/check-out, duyệt công, tính lương hoặc chi trả.
