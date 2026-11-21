# Quy ước làm việc của nhóm Bá Khí

Đề tài 25 là quản lý việc làm sinh viên. TV001 trong yêu cầu được đối chiếu với TV01 trên dashboard, phụ trách backend và Cloud. Tài liệu này chuẩn bị phần quy ước của T001; không thay biên bản họp hay bằng chứng đăng ký LMS.

## Phân công

| Mã | Thành viên | MSSV | Phần việc |
| --- | --- | --- | --- |
| TV01 | Nguyễn Đức Đạt | 231A290126 | Backend và Cloud |
| TV02 | Nguyễn Đỗ Hoàng Anh | 231A0290111 | Android quản trị và nhà tuyển dụng |
| TV03 | Hà Gia Bảo | 231A010014 | Flutter sinh viên |
| TV04 | Võ Trần Kim Tuyến | 241A310165 | CSDL và QA |

Danh sách đối chiếu từ `web-dashboard/tasks-data.js`. Chưa có đủ bằng chứng tài khoản GitHub riêng của cả bốn người. Không lấy tác giả các commit hiện tại để tự gán tài khoản cho thành viên.

## Git và bàn giao

Repo: https://github.com/doubleD1302/nhomBaKhi. Làm trên nhánh `tv01/Txxx-mo-ta-ngan`, commit dạng `[T002] Hoàn thiện đăng ký và đăng nhập`; mỗi commit mô tả thay đổi có ý nghĩa. Không sửa tác giả hoặc chia nhỏ commit để tạo số lượng minh chứng.

TV01 nhờ TV04 review backend và CSDL; TV02 và TV03 đối chiếu hợp đồng API khi tích hợp app. PR ghi vấn đề, thay đổi, lệnh kiểm tra và hạn chế; người viết không tự coi thay đổi đã được nhóm duyệt. Mỗi người dùng tài khoản GitHub riêng theo yêu cầu môn học.

Mỗi lần đổi endpoint, trường JSON, trạng thái hoặc bảng phải cập nhật `backend/api.md`, test liên quan và mô tả ảnh hưởng tới hai app. `/api` hiện dùng camelCase trong JSON; hợp đồng `/api/v1` snake_case ở bộ thiết kế là đề xuất khác, cần migration riêng khi nhóm chốt.

Không commit `.env`, mật khẩu DB, JWT secret hay service key. Cấu hình thật được nhập trên máy cá nhân hoặc Render Environment. Không chạy reset/seed vào DB dùng chung. Người thay đổi CSDL lập migration, backup và nhờ TV04 đối chiếu trước khi áp dụng vào môi trường chung.

## Những mục còn cần bằng chứng thật cho T001

- Xác nhận đã đăng ký đề 25 và repo trên LMS, kèm thời điểm và ảnh/biên nhận nộp.
- Liên kết bốn tài khoản GitHub và quyền truy cập repo của giảng viên.
- Ngày bắt đầu tuần 8 và hạn LMS thực tế. Dashboard hiện mặc định tuần 9, không tự suy tuần học từ ngày máy tính.
- Ngày họp khởi động, người tham dự, quyết định và xác nhận của nhóm.

Chỉ ghi giờ thực tế sau khi thành viên xác nhận. Giá trị `actual_hours` được AutoSeed điền bằng giờ kế hoạch trên cloud không chứng minh thời gian đã làm.
