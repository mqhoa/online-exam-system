# Import/Export Excel và sinh câu hỏi bằng AI

Các API dưới đây dùng cookie session hiện tại và yêu cầu gửi CSRF token cho request thay đổi dữ liệu. Frontend gọi các endpoint qua Vite proxy `/api`.

## Excel ngân hàng câu hỏi

- `GET /api/questions/template`: tải tệp mẫu `.xlsx`.
- `POST /api/questions/import?teacherGroupId={id}`: multipart field `file`, hỗ trợ `.xlsx` và `.xls`.
- `GET /api/questions/export?teacherGroupId={id}`: xuất câu hỏi và đáp án đúng trong nhóm ra `.xlsx`.

Workbook dùng sheet đầu tiên. Dòng 1 là tiêu đề: `Nội dung câu hỏi`, `Loại câu hỏi`, rồi tối đa 10 cặp `Đáp án N`, `Đúng N`. Giá trị loại là `SINGLE_CHOICE`, `MULTIPLE_CHOICE` hoặc `SHORT_ANSWER`; cột đúng chấp nhận `TRUE/FALSE`, `1/0`, `Đúng/Sai`. Với short answer, mọi ô đáp án có nội dung đều được chấp nhận làm đáp án mẫu. Toàn bộ workbook được ghi trong một transaction; dòng sai làm hủy import.

## Import tài khoản sinh viên

- `GET /api/users/import/students/template`: tải workbook mẫu `.xlsx`.
- `POST /api/users/import/students/preview`: multipart field `file`, đọc trước và trả lỗi theo dòng, chưa ghi dữ liệu.
- `POST /api/users/import/students`: multipart field `file`, hỗ trợ `.xlsx`, `.xls`, `.csv`.
- `GET /api/users/students`: xem danh sách sinh viên đã lưu.

Cột cần có: `Mã sinh viên`, `Họ và tên`, `Ngày sinh` theo `yyyy-MM-dd`, `Email`; cột `Lớp` có thể bỏ trống. Mã sinh viên là username đăng nhập. Backend tạo mật khẩu tạm ngẫu nhiên và trả đúng một lần trong kết quả import; admin cần tải và bàn giao an toàn.

## AI từ PDF

- `POST /api/ai/generations`: multipart gồm `file`, `teacherGroupId`, `focusTopic`, `questionCount` (1–20), `difficulty` (`EASY`, `MEDIUM`, `HARD`); trả job `202 Accepted`.
- `GET /api/ai/generations/{id}`: xem `PENDING`, `PROCESSING`, `COMPLETED` hoặc `FAILED` và câu hỏi đề xuất.
- `POST /api/ai/generations/{id}/approve`: JSON `{ "questionIndexes": [0, 1] }`, lưu các câu đã duyệt vào ngân hàng câu hỏi.

PDF tối đa 10 MB có lớp văn bản; PDF scan chưa hỗ trợ OCR. Cấu hình `GEMINI_API_KEY` cho tiến trình backend (không đưa key vào frontend hoặc Git). `GEMINI_MODEL` và `AI_UPLOAD_DIR` có thể ghi đè qua biến môi trường. Nếu chưa có key, job sẽ báo `FAILED` với hướng dẫn cấu hình.

## Đổi và quên mật khẩu

- `POST /api/v1/auth/password/change` (đang đăng nhập): `{ "currentPassword": "...", "newPassword": "..." }`.
- `POST /api/v1/auth/password/forgot` (công khai): `{ "email": "..." }`; phản hồi chung để không tiết lộ email/tài khoản có tồn tại hay không.
- `POST /api/v1/auth/password/reset` (công khai): `{ "token": "...", "password": "..." }`; token ngẫu nhiên chỉ dùng một lần, hết hạn sau 30 phút và chỉ bản băm SHA-256 được lưu trong DB.

Khôi phục qua email cần bật `MAIL_ENABLED=true` và cấu hình `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAIL_FROM`, `FRONTEND_BASE_URL`. Nếu chưa cấu hình SMTP, người dùng cần liên hệ admin để được đặt lại mật khẩu. Admin cũng có thể đặt mật khẩu mới trong màn quản lý tài khoản. Mật khẩu người dùng được băm bằng BCrypt; hệ thống không thể đọc lại mật khẩu gốc.
