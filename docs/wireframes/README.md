# Wireframe đăng nhập hệ thống thi trực tuyến

Mockup desktop: [online-exam-mockup.html](./online-exam-mockup.html). Mở file HTML trực tiếp để xem bố cục; không cần backend. Giao diện đăng nhập React đang được triển khai tại `frontend/src/features/auth`.

## Mục tiêu

Đây là cổng đăng nhập chung cho Admin, Teacher và Student. Người dùng không chọn vai trò: backend xác thực tài khoản, trả về hồ sơ và quyền đã gán, rồi frontend điều hướng theo vai trò đó.

Frontend đang dùng `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`, cùng endpoint đổi/quên mật khẩu. Hợp đồng và trạng thái triển khai ở [API reference](../api/api-spec.md). Login dùng backend session, không giả lập vai trò.

## Nguyên tắc thiết kế

- Desktop-first, bố cục hai cột: giới thiệu nền tảng bên trái, form xác thực bên phải.
- Hỗ trợ co giãn trên màn hình nhỏ nhưng không mô phỏng giao diện quản trị bằng khung điện thoại.
- Form gồm tên đăng nhập, mật khẩu, hiện/ẩn mật khẩu, trạng thái đang xác thực và lỗi rõ ràng.
- Ngôn ngữ có thể đổi Việt/Anh; vai trò luôn lấy từ kết quả xác thực phía server.
- Phiên đăng nhập dùng cookie session do Spring Security quản lý, kèm CSRF token; frontend không lưu access token trong `localStorage` hoặc `sessionStorage`.

## Cấu trúc frontend

- `src/app`: khởi tạo ứng dụng, xử lý phiên và trang sau đăng nhập.
- `src/app/callbacks`: điều hướng sau khi server xác thực, dựa trên role trong hồ sơ tài khoản.
- `src/components`: thành phần giao diện dùng chung.
- `src/features/auth`: form đăng nhập, API và kiểu dữ liệu xác thực.
- `src/i18n`: provider và nội dung dịch.
- `src/index.css`: design tokens và style nền tảng toàn cục.

Không tạo callback OAuth riêng vì hiện tại nghiệp vụ dùng tài khoản/mật khẩu; callback ở đây chỉ là điểm tiếp nhận thành công và điều hướng theo quyền đã được backend xác thực.

## Tham chiếu

- [Đặc tả API](../api/api-spec.md)
- [README dự án](../../README.md)
