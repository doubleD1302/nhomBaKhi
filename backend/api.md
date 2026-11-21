# Tài liệu API

Đường dẫn gốc của API là `/api`. Các yêu cầu JSON cần có header
`Content-Type: application/json`. Những API yêu cầu đăng nhập cần header:
`Authorization: Bearer <token>`. Các vai trò gồm `SINH_VIEN`
(sinh viên), `NHA_TUYEN_DUNG` (nhà tuyển dụng) và `QUAN_TRI` (quản trị).

Lỗi được trả về theo dạng `{ "loi": "..." }`. Các mã trạng thái phổ biến:
400 (dữ liệu đầu vào không hợp lệ), 401 (thiếu token hoặc token hết hạn),
403 (không đủ quyền), 404 (không tìm thấy dữ liệu), 409 (trùng lặp hoặc
xung đột thao tác) và 500 (lỗi máy chủ/cơ sở dữ liệu).

## API công khai và xác thực

Hợp đồng này mô tả code `/api` hiện tại. Hợp đồng đề xuất `/api/v1` dùng snake_case trong bộ thiết kế là phương án khác, chưa được triển khai/migration. Schema ứng viên tương thích code: `database/api-v1/schema.sql`; xem README cùng thư mục trước khi khởi tạo CSDL.

| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| GET | `/health` | Kiểm tra trạng thái hoạt động công khai của máy chủ |
| GET | `/ready` | 200 khi truy vấn được bảng `nguoi_dung`; 503 khi CSDL/schema chưa sẵn sàng |
| POST | `/api/auth/register` | Đăng ký sinh viên hoặc nhà tuyển dụng với các trường `email,password,fullName,phone,role` |
| POST | `/api/auth/login` | Đăng nhập bằng `email,password`; trả về JWT và thông tin người dùng |
| GET | `/api/auth/me` | Lấy thông tin tài khoản hiện đang đăng nhập |
| GET | `/api/jobs/categories` | Lấy danh sách nhóm việc |
| GET | `/api/jobs?area=&category=&minWage=&schedule=true` | Lấy danh sách việc đã được duyệt và xác minh; `schedule=true` yêu cầu sinh viên đăng nhập |
| GET | `/api/jobs/:id` | Xem chi tiết tin tuyển dụng đã được duyệt |

`category` là ID nhóm việc; `minWage` là mức lương tối thiểu theo giờ.
Bộ lọc lịch rảnh so khớp ca làm sắp tới còn chỗ với khung giờ rảnh hằng tuần
của sinh viên.

## API dành cho sinh viên

Tất cả đường dẫn dành cho sinh viên yêu cầu token có vai trò `SINH_VIEN`.

| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| GET / PATCH | `/api/students/profile` | Xem/cập nhật họ tên, số điện thoại, trường, ngành, năm học, kỹ năng và giới thiệu |
| GET / PUT | `/api/students/availability` | Xem/thay thế khung giờ rảnh hằng tuần (`dayOfWeek`: Thứ Hai=1 đến Chủ nhật=7) |
| POST / GET | `/api/students/applications` | Ứng tuyển với `{ "jobId": 1 }` / xem trạng thái các hồ sơ ứng tuyển |
| GET | `/api/students/my-shifts` | Xem các ca đã nhận và thông tin chấm công của tài khoản hiện tại |
| POST | `/api/students/reports` | Báo cáo tin tuyển dụng với `{ "jobId": 1, "description": "..." }` |
| GET | `/api/students/payroll` | Xem bảng lương theo kỳ |

## API dành cho nhà tuyển dụng

Tất cả đường dẫn nhà tuyển dụng yêu cầu token có vai trò `NHA_TUYEN_DUNG`.

| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| GET / PATCH | `/api/employer/profile` | Xem/cập nhật thông tin công ty, địa chỉ, URL giấy phép và người liên hệ |
| GET | `/api/employer/applications` | Xem hồ sơ ứng tuyển vào các tin của nhà tuyển dụng hiện tại |
| PATCH | `/api/employer/applications/:id` | Chấp nhận/từ chối hồ sơ với `decision: DA_DUYET` hoặc `TU_CHOI` |
| POST | `/api/jobs` | Tạo tin tuyển dụng ở trạng thái chờ duyệt |
| GET | `/api/jobs/employer/mine` | Xem các tin của nhà tuyển dụng hiện tại và trạng thái duyệt |
| POST | `/api/jobs/:jobId/shifts` | Tạo ca làm với `workDate,startTime,endTime,neededWorkers` |
| GET | `/api/shifts` | Xem ca làm của nhà tuyển dụng hiện tại |

Nhà tuyển dụng phải được quản trị viên duyệt và xác minh trước khi đăng tin
hoặc tạo ca làm.

## Ca làm và chấm công của sinh viên

| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| GET | `/api/shifts` | Sinh viên đã đăng nhập xem các ca sắp tới còn chỗ |
| POST | `/api/shifts/:id/claim` | Nhận ca sau khi hồ sơ ứng tuyển tương ứng được duyệt |
| POST | `/api/shifts/:id/check-in` | Check-in với `{ "latitude": 10, "longitude": 106 }` |
| POST | `/api/shifts/:id/check-out` | Check-out với `{ "latitude": 10, "longitude": 106 }` |

Máy chủ tự tính khoảng cách check-in. Vị trí nằm ngoài
`CHECK_IN_RADIUS_METERS` (mặc định 200 m) sẽ được ghi nhận để quản trị viên
duyệt thủ công. Việc nhận ca được thực hiện trong transaction và sẽ từ chối
nếu ca đã đủ người hoặc trùng lịch.

## API dành cho quản trị viên

Tất cả đường dẫn quản trị yêu cầu token có vai trò `QUAN_TRI`.

| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| GET | `/api/admin/dashboard` | Xem số nhà tuyển dụng/tin đang chờ duyệt, báo cáo cần xử lý và tin đã duyệt |
| POST | `/api/admin/categories` | Thêm nhóm việc vào cơ sở dữ liệu ban đầu đang trống |
| GET / PATCH | `/api/admin/employers`, `/api/admin/employers/:id/review` | Xử lý nhà tuyển dụng: `APPROVE`, `REJECT` hoặc `BLOCK` |
| GET / PATCH | `/api/admin/jobs`, `/api/admin/jobs/:id/review` | Xử lý tin: `APPROVE`, `REJECT` hoặc `REMOVE` |
| GET / PATCH | `/api/admin/reports`, `/api/admin/reports/:id/review` | Xem/xử lý báo cáo lừa đảo và ghi kết luận |
| GET / PATCH | `/api/admin/time-records`, `/api/admin/time-records/:id/review` | Xem và duyệt chấm công |
| GET | `/api/admin/analytics` | Thống kê số tin và lương trung bình theo nhóm việc |
| GET | `/api/admin/payroll?period=YYYY-MM` | Xem bảng lương |
| POST | `/api/admin/payroll/calculate` | Tính lương từ chấm công đã duyệt với `{ "period": "YYYY-MM" }` |
| PATCH | `/api/admin/payroll/:id/approve` | Duyệt bảng lương đang chờ xử lý |

## Trạng thái cơ sở dữ liệu

`npm run db:setup` tạo schema ứng viên trong `public` cho CSDL mới còn trống và không tự seed. Lệnh từ chối khi đã có bảng ứng dụng trong `public` hoặc `viec_lam`. Schema/seed gốc dưới `backend/` thuộc mô hình khác và không được chạy tự động. Reset bị vô hiệu; đối chiếu với TV04 trước migration CSDL dùng chung.

## Luồng nghiệm thu T002 và T010

1. `POST /api/auth/register` với `email`, `password`, `fullName`, `role`; chỉ nhận SINH_VIEN hoặc NHA_TUYEN_DUNG. Mật khẩu từ 8 ký tự, tối đa 72 byte UTF-8; email được trim/lowercase, không trùng. Trả 201 `{ "user": { "id": 1, "email": "...", "fullName": "...", "role": "..." } }`.
2. `POST /api/auth/login` với email/password trả 200 `{ "token": "...", "user": {...} }`. Không trả hash. Token hết hạn/sai chữ ký hoặc tài khoản bị khóa trả 401 khi gọi route bảo vệ; mỗi request kiểm tra lại trạng thái và vai trò trong DB.
3. NTD `PATCH /api/employer/profile` với `companyName,taxCode,address,licenseUrl,contactName,phone`; URL giấy phép bắt đầu HTTPS. Hồ sơ trở về CHO_DUYET.
4. Quản trị `GET /api/admin/employers`, lấy id hồ sơ; `PATCH /api/admin/employers/:id/review` với `decision: APPROVE|REJECT|BLOCK`. REJECT/BLOCK cần `reason`; lý do lưu ở `nha_tuyen_dung.ly_do_tu_choi`. BLOCK đồng thời khóa tài khoản; JWT cũ bị từ chối.
5. Quản trị `POST /api/admin/categories` với `{ "name": "Phục vụ" }`; nhận id nhóm việc.
6. NTD đã được duyệt `POST /api/jobs` với `{ "categoryId": 1, "title": "Phục vụ", "description": "Mô tả công việc", "location": "TP HCM", "latitude": 10.77, "longitude": 106.69, "hourlyWage": 30000, "headcount": 2 }`. Trả 201 `{ "id": 1, "status": "CHO_DUYET" }`.
7. Quản trị `PATCH /api/admin/jobs/:id/review` với `decision: APPROVE|REJECT|REMOVE`; REJECT/REMOVE cần `reason`. `GET /api/jobs/employer/mine` trả tin của đúng chủ và `rejectionReason`. Tin chưa duyệt/bị từ chối/NTD bị khóa không công khai.

Collection chạy thủ công: `docs/TV01/TV01.postman_collection.json`. Test tích hợp thực thi HTTP + SQL trên PGlite tách biệt; không xác nhận CSDL Supabase hoặc Render đã hoạt động.
