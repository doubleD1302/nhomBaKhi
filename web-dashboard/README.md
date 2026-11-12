# Web Dashboard Quản Lý Dự Án — Đề Tài 25

**INT4211 – Lập trình trên các thiết bị di động (HK261)**  
*Đề tài: Nền tảng việc làm bán thời gian cho sinh viên (Nhóm 4 thành viên)*

---

## 🚀 Cách mở và sử dụng

### Cách 1: Mở trực tiếp (Không cần cài đặt bất cứ thứ gì)
- Nhấp đúp chuột vào file `Mo_Web_Theo_Doi.bat` ở thư mục gốc đồ án.
- Hoặc mở trực tiếp file `web_dashboard/index.html` bằng bất kỳ trình duyệt nào (Google Chrome, Microsoft Edge, Firefox, Brave,...).
- Ứng dụng hoạt động 100% offline và tự động lưu tiến độ vào `localStorage` của trình duyệt.

### Cách 2: Chạy qua Local Server (Nếu muốn chia sẻ qua mạng nội bộ LAN / Wi-Fi)
Mở terminal tại thư mục này và gõ:
```bash
# Bằng Node.js:
npx serve .

# Hoặc bằng Python:
python -m http.server 3000
```
Sau đó truy cập: `http://localhost:3000`.

### Cách 3: Đưa lên GitHub Pages (Để cả 4 thành viên cùng xem online)
1. Trong repository GitHub của nhóm, tạo thư mục hoặc đưa nội dung thư mục `web_dashboard` vào nhánh `gh-pages` hoặc thư mục `docs/`.
2. Vào **Settings** của Repo -> **Pages** -> Chọn nhánh xuất bản.
3. Cả nhóm có thể truy cập qua link: `https://[username].github.io/[repo-name]/`.

---

## 🌟 Các tính năng chính trên Web Dashboard

1. **📊 Dashboard (Tổng quan tiến độ)**:
   - Theo dõi % hoàn thành toàn dự án, số task đã xong, số giờ đã làm so với kế hoạch (340h) và tổng năng lực (384h).
   - Tiến độ riêng của 4 thành viên (TV01, TV02, TV03, TV04). Nhấp vào thẻ thành viên để lọc nhanh việc của người đó.
   - Cảnh báo mốc kiểm tra giữa kỳ Tuần 11 (1.0 điểm, không nộp bù).
   - Tóm tắt 4 điểm nhấn kỹ thuật quan trọng của Đề tài 25 (GPS Haversine, Lọc lịch rảnh, Transaction nhận ca, Tính lương).

2. **📋 Bảng Kanban tương tác**:
   - 4 cột: *Chưa bắt đầu*, *Đang thực hiện*, *Chờ review / test*, *Hoàn thành*.
   - Hỗ trợ **kéo thả thẻ (Drag & Drop)** hoặc bấm vào thẻ để cập nhật chi tiết.
   - Bộ lọc theo thành viên và theo tuần (Tuần 8 đến 15).

3. **📑 Danh sách WBS 64 Task**:
   - Bảng tra cứu toàn diện 64 đầu việc từ kế hoạch gốc.
   - Tìm kiếm nhanh bằng từ khóa, lọc theo trạng thái, tuần học, thành viên.
   - Tick chọn hoàn thành nhanh hoặc chỉnh sửa % tiến độ, link PR, giờ thực tế.

4. **👤 Trang cá nhân 4 thành viên**:
   - Xem chi tiết 16 đầu việc được giao cho từng thành viên.
   - Thanh đếm số commit (Mục tiêu: ≥15 commit có ý nghĩa rải đều 8 tuần trên GitHub).

5. **🎯 Mốc tiến độ & Bộ tiêu chí tự kiểm (Checklists)**:
   - 5 mốc tiến độ chính thức từ tuần 8 đến tuần 15.
   - Bảng kiểm 10 tiêu chí App Admin Android (Mục C.1).
   - Bảng kiểm 10 tiêu chí App Client Flutter (Mục C.2).
   - Định mức dữ liệu mẫu (Seed Data): 25 NTD, 80 tin, 200 SV có lịch rảnh, 300 ca, 500 chấm công.

6. **📖 Căn cứ kỹ thuật & Hợp đồng API**:
   - Tra cứu nhanh các endpoint API (`/api/v1/...`) và 12 bảng CSDL Supabase.

7. **📝 Trình tạo báo cáo tuần tự động (Markdown)**:
   - Chọn tuần và thành viên -> Tự động trích xuất các task hoàn thành, đang làm, tồn đọng và link PR thành văn bản báo cáo tuần chuẩn mẫu.
   - Bấm 1 nút để sao chép Markdown nộp cho Giảng viên.

8. **💾 Đồng bộ & Sao lưu dữ liệu**:
   - **Xuất JSON (Export)**: Tải file tiến độ về máy.
   - **Nhập JSON (Import)**: Nạp file tiến độ từ đồng đội để cập nhật trạng thái chung.
   - **Đặt lại (Reset)**: Khôi phục kế hoạch ban đầu nếu cần.
