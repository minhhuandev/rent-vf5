# Hướng dẫn triển khai (Deploy) lên cPanel

Dự án này **đã được viết bằng Node.js (Express) và React.js (Vite)**, hoàn toàn tương thích để chạy trên cPanel thông qua tính năng **Setup Node.js App** (Phusion Passenger).

## Các bước chuẩn bị và Build source code

1. Trên máy tính của bạn (hoặc terminal), chạy lệnh sau để cài đặt các thư viện:
   ```bash
   npm install
   ```

2. Chạy lệnh build để đóng gói cả Frontend (React) và Backend (Node.js):
   ```bash
   npm run build
   ```
   *Lệnh này sẽ tạo ra thư mục `dist` (chứa giao diện React đã tối ưu) và file `server.cjs` (chứa code Backend đã được biên dịch).*

3. Nén (Zip) các file và thư mục sau để upload lên cPanel:
   - Thư mục `dist/`
   - File `server.cjs`
   - File `package.json`
   - File `package-lock.json`
   - Thư mục `uploads/` (nếu có ảnh đã tải lên)
   - File `database.sqlite` (nếu bạn muốn giữ lại dữ liệu hiện tại)

## Các bước cấu hình trên cPanel

1. Đăng nhập vào cPanel, mở **File Manager**.
2. Tạo một thư mục mới cho ứng dụng (ví dụ: `myapp`) bên ngoài thư mục `public_html` để bảo mật.
3. Upload file Zip vừa tạo vào thư mục `myapp` và giải nén (Extract).
4. Quay lại trang chủ cPanel, tìm và chọn **Setup Node.js App**.
5. Nhấn **Create Application** và điền các thông tin sau:
   - **Node.js version**: Chọn phiên bản 18.x hoặc mới hơn.
   - **Application mode**: `Production`
   - **Application root**: Nhập tên thư mục bạn vừa tạo (ví dụ: `myapp`).
   - **Application URL**: Chọn tên miền bạn muốn chạy web.
   - **Application startup file**: Nhập `server.cjs`
6. Nhấn **Create** để tạo ứng dụng.
7. Sau khi tạo xong, cuộn xuống phần **Detected configuration files** và nhấn **Run NPM Install** để cPanel cài đặt các thư viện cần thiết (Express, SQLite, v.v.).
8. Nhấn **Restart** để khởi động lại ứng dụng.

## Lưu ý về Port
Ứng dụng đã được cấu hình tự động nhận Port từ cPanel thông qua biến môi trường `process.env.PORT`. Bạn không cần phải cấu hình thủ công Port trong code.

## Quản lý Database
Dự án sử dụng SQLite (`better-sqlite3`), dữ liệu được lưu trực tiếp trong file `database.sqlite` cùng cấp với file `server.cjs`. Bạn có thể dễ dàng backup hoặc di chuyển file này.
