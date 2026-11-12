# Nhóm Ba Khỉ — Đề tài 25: Nền Tảng Việc Làm Bán Thời Gian Cho Sinh Viên

**Môn học:** INT4211 – Lập trình trên các thiết bị di động (HK261)  
**Thành viên:** 231A010014 - Hà Gia Bảo & các thành viên Nhóm Ba Khỉ

---

## 🏗️ Cấu Trúc Dự Án (4 Thành Phần)

Hệ thống được thiết kế theo đúng quy chuẩn đồ án INT4211 với 4 thư mục chuyên biệt:

- `backend/`: REST API Node.js 20 / Express 4, xác thực JWT, bcrypt, CSDL PostgreSQL trên Supabase (Pooler IPv4 cổng 5432), triển khai Cloud Render 24/7.
- `client-flutter/`: Ứng dụng di động cho Sinh viên viết bằng Flutter 3.35+ (Dart), hỗ trợ tạo hồ sơ, thiết lập lịch rảnh có nút Undo SnackBar, tìm việc giao thời gian, ứng tuyển, nhận ca làm và chấm công định vị GPS.
- `admin-android/`: Ứng dụng di động cho Người quản lý & Doanh nghiệp viết bằng Android Studio (Java + XML Layout, minSdk 24, Retrofit 2), hỗ trợ duyệt NTD, duyệt tin chống lừa đảo, quản lý ca làm, xem bảng chấm công/lương và dashboard biểu đồ báo cáo.
- `web-dashboard/`: **Ứng dụng Web theo dõi tiến độ & phân chia công việc cho 4 thành viên**, được xây dựng chuẩn theo **mô hình kiến trúc MVC (Model - View - Controller)**:
  - Cho phép thành viên tự do chọn 1 trong 4 nhiệm vụ chính.
  - Cấp thẻ thành viên kỹ thuật số & mã code truy cập cá nhân (`BK-TV01`, `BK-TV02`, `BK-TV03`, `BK-TV04`).
  - Hiển thị Dashboard riêng biệt, cá nhân hóa cho từng thành viên: 16 tasks riêng, tiến độ commit GitHub (mục tiêu ≥15 commit), studio chuyên môn cho từng vai trò.
  - Tích hợp bảng Kanban kéo thả, tra cứu WBS 64 task, bộ kiểm nghiệm thu (C.1 & C.2) và công cụ tự động sinh báo cáo tuần (Markdown).

---

## 📋 Hồ Sơ Kế Hoạch & Phân Công Chi Tiết

- File Word kế hoạch và bảng phân chia công việc chính thức cho 4 người: [`docs/Phan_Cong_Cong_Viec_Nhom_De25.docx`](./docs/Phan_Cong_Cong_Viec_Nhom_De25.docx).
- Mở nhanh Web Dashboard theo dõi: Chạy file `Mo_Web_Theo_Doi.bat` hoặc mở trực tiếp `web-dashboard/index.html` trong trình duyệt.

---

## 🗄️ Database

- `backend/schema.sql`: Script khởi tạo 12 bảng chính có quan hệ khóa ngoại (FK) chặt chẽ.
- `backend/seed.sql`: Dữ liệu mẫu ban đầu đạt định mức tối thiểu (25 NTD, 80 tin, 200 SV có lịch rảnh, 300 ca, 500 chấm công).

Xem [HUONG_DAN_CHAY_PROJECT.txt](./HUONG_DAN_CHAY_PROJECT.txt) để cài đặt, cấu hình và chạy từng ứng dụng. API được mô tả trong [backend/api.md](./backend/api.md). Trước khi nộp, dùng [PHU_LUC_4_CHECKLIST.txt](./PHU_LUC_4_CHECKLIST.txt).
