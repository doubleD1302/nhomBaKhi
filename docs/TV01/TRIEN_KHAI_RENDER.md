# Triển khai backend việc làm trên Render

T009 chỉ được nghiệm thu sau khi API HTTPS và đăng nhập với CSDL thật hoạt động. Ngày 15/11/2026, URL cấu hình trên dashboard `https://nhombakhi-backend.onrender.com/health` trả 404. `.env` hiện tại còn mật khẩu kết nối mẫu, chưa đủ điều kiện triển khai.

## Căn cứ chọn Render

Tài liệu `DoAn_CuoiKy_25DeTai_INT4211.docx.pdf`, trang 2 phần B, quy định nơi chạy backend là Render Web Service trong stack bắt buộc. Muốn dùng công nghệ khác phải xin phép giảng viên trước tuần 9 kèm lý do. Trang 5 mục D.1 yêu cầu link API đang chạy là đường dẫn Render. Slide 3 của `DoAn_CuoiKy_GioiThieu_INT4211.pptx.pdf` nhắc lại yêu cầu này.

Cloudflare Workers có thể chạy Express qua Node compatibility và HTTP adapter theo [tài liệu Cloudflare](https://developers.cloudflare.com/workers/tutorials/deploy-an-express-app/); PostgreSQL có thể kết nối qua [Hyperdrive](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/). Đó là khả năng kỹ thuật, không phải bằng chứng giảng viên chấp nhận thay nền tảng. Chưa có xác nhận đổi công nghệ nên giữ phương án Render, chưa chuyển backend sang Workers/D1.

## Chuẩn bị CSDL

TV01 và TV04 đối chiếu [schema ứng viên](../../backend/database/api-v1/README.md) với ERD mới trước khi áp dụng lên môi trường chung. Để thử riêng, tạo database trống; lấy đúng connection string Session Pooler IPv4 port 5432 từ Supabase Connect. Host và region phải lấy từ chính dự án, không suy ra từ hostname ghi trong tài liệu.

Trong `backend`, chạy `npm ci`, tạo `.env` riêng từ `.env.example`, nhập `DATABASE_URL` thật, tạo JWT secret ngẫu nhiên bằng:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Chạy `npm run db:setup` chỉ trên CSDL thử riêng còn trống. Lệnh không chèn seed. Tạo tài khoản quản trị với `npm run create-admin -- <email> <mat-khau-rieng-toi-thieu-12-ky-tu> <ho-ten>`; không ghi mật khẩu thật vào tài liệu hay commit. Tránh dùng tài khoản/mật khẩu demo cho môi trường công khai.

## Tạo dịch vụ

Blueprint `render.yaml` dùng Node 20, root `backend`, build `npm ci --omit=dev`, start `npm start`, health check `/health`. Render tự cấp JWT secret; nhập `DATABASE_URL` tại Environment. Có thể thay `CORS_ORIGIN=*` bằng danh sách origin cần cho web. Chưa có bằng chứng tài khoản Render đã được kết nối trong phiên làm việc này.

Không đặt `db:setup`, reset hay seed vào lệnh build/start. Sau deploy, kiểm tra `/health` là HTTP server và `/ready` là truy vấn được bảng ứng dụng; hai endpoint có mục đích khác nhau.

```powershell
cd backend
npm run check:deploy -- https://TEN-DICH-VU.onrender.com
```

Kiểm tra trả 200 đúng JSON cho `/health`, `/ready`, `/api/jobs/categories`, `/api/jobs`. Sau đó dùng collection Postman của TV01 để đăng nhập thật, đăng ký NTD thử, duyệt hồ sơ và tin. Lưu log không chứa token/mật khẩu. Hai app cần đổi URL placeholder sang API đã kiểm tra rồi build và thử trên thiết bị.

Các kiểm tra local không chứng minh Render hoặc Supabase đang chạy. Không đánh dấu T009 hoàn thành trước khi có bằng chứng HTTPS và đăng nhập thật.
