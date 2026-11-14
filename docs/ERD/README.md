# ERD — nền tảng kết nối việc làm

Thiết kế mới tập trung vào việc tạo hồ sơ, đăng tin, tìm việc, ứng tuyển và kiểm duyệt nội dung. Mô hình không có bảng ca nhận, chấm công, bảng lương hay chi trả.

| Hình | Nội dung |
| --- | --- |
| [Tổng quan 14 bảng](00_ERD_tong_quan.svg) | Toàn bộ quan hệ khóa chính/khóa ngoại |
| [Tài khoản, hồ sơ và địa điểm](01_ERD_tai_khoan.svg) | Người dùng, sinh viên, nhà tuyển dụng, khu vực và địa điểm |
| [Tin tuyển dụng và ứng tuyển](02_ERD_tuyen_dung.svg) | Tin việc, nhóm việc, hồ sơ ứng tuyển |
| [Kiểm duyệt](03_ERD_kiem_duyet.svg) | Trạng thái duyệt và nhật ký thao tác quản trị |
| [Báo cáo tin vi phạm](04_ERD_bao_cao_lua_dao.svg) | Báo cáo, bằng chứng và diễn biến xử lý |

Mỗi hình có SVG, PNG và `.puml`; SVG dùng để phóng to, PNG dùng chèn báo cáo, `.puml` là mã nguồn chỉnh sửa. `*` là bắt buộc, PK là khóa chính, FK là khóa ngoại. Quan hệ 1–N thể hiện bằng `||--o{`, quan hệ 1–0..1 bằng `||--o|`.

Các trường lương trong tin chỉ là thông tin hiển thị giúp ứng viên ra quyết định; hệ thống không tính công, lập bảng lương hoặc ghi nhận thanh toán.
