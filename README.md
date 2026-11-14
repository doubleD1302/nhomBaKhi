# Dashboard tiến độ · Nhóm Bá Khí

**Đề tài 25: Nền tảng tìm kiếm việc làm cho sinh viên · INT4211 · HK261**

## Truy cập

- [Trang chính và đăng nhập thành viên](https://doubled1302.github.io/nhomBaKhi/).
- **[Chế độ Giảng viên — xem ngay, không cần đăng nhập](https://doubled1302.github.io/nhomBaKhi/lecturer.html).**

## Chế độ Giảng viên

Trang `lecturer.html` cung cấp:

- Tổng quan toàn dự án: tỷ lệ nhiệm vụ hoàn thành, số nhiệm vụ từng trạng thái và giờ thực tế so với kế hoạch.
- Tiến độ của cả bốn thành viên; chọn một người để xem toàn bộ nhiệm vụ được giao.
- Bộ lọc theo thành viên, tuần, trạng thái và từ khóa; xem tiêu chí hoàn thành, ghi chú và liên kết minh chứng.
- Liên kết trực tiếp đến ERD, Use Case và lịch sử GitHub.
- Tự tải dữ liệu Cloud mỗi 15 giây khi trang đang hiển thị; có nút cập nhật thủ công và thời điểm đồng bộ gần nhất.

Đây là giao diện chỉ xem: không nhận vai trò, không ghi dữ liệu Cloud và không thay đổi phiên đăng nhập thành viên trên cùng trình duyệt. Trang không dùng tiến độ chỉ lưu cục bộ trên máy thành viên; cần đồng bộ lên Cloud để giảng viên thấy cập nhật.

Tỷ lệ hoàn thành tính bằng số nhiệm vụ có trạng thái `done` chia cho tổng số nhiệm vụ. Khi mất kết nối hoặc chưa có bản ghi Cloud, trang ghi rõ nguồn dữ liệu đang hiển thị. Số liệu phản ánh cập nhật của nhóm, cần đối chiếu minh chứng khi nghiệm thu.

## Chế độ thành viên

Đăng nhập bằng mã được cấp để làm việc với dashboard cá nhân, Kanban, WBS, mốc tiến độ, checklist và báo cáo tuần. Mã mới có tiền tố `JOB-`; các mã `TRO-` đã cấp trước đây vẫn dùng được.

Kế hoạch trong `tasks-data.js` mô tả hồ sơ sinh viên, lịch rảnh, tìm việc, ứng tuyển, nhà tuyển dụng, tin tuyển dụng và kiểm duyệt vi phạm. Khi tải dữ liệu đã lưu hoặc nhập JSON, dashboard giữ tiến độ theo mã nhiệm vụ và lấy tên, phân công, tiêu chí từ kế hoạch hiện tại.

## Chạy tại máy

Từ thư mục `web-dashboard`, chạy:

```powershell
python -m http.server 8766 --bind 127.0.0.1
```

Mở [dashboard thành viên](http://127.0.0.1:8766/) hoặc [trang Giảng viên](http://127.0.0.1:8766/lecturer.html).

## Kiểm tra

Từ thư mục gốc repository:

```powershell
node --test web-dashboard/test/lecturer.test.cjs
```

Website công khai hiện xuất bản từ thư mục gốc của nhánh `gh-pages`. Mã nguồn phát triển nằm ở `main/web-dashboard/`; khi phát hành, đồng bộ nội dung thư mục này sang gốc `gh-pages` rồi push để chạy Pages build and deployment. Môi trường `github-pages` chỉ cho phép nhánh `gh-pages`; workflow cũ chạy trực tiếp từ `main` chưa phù hợp cấu hình này.
