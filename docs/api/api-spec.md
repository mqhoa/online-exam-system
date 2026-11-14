# API reference — trạng thái implementation

Tài liệu này ghi các route trong controllers hiện tại. Base `/api` được dùng cho nghiệp vụ; xác thực ở `/api/v1/auth`. JSON dùng camelCase DTO. Endpoint ghi dữ liệu yêu cầu CSRF cookie/token trừ khi ghi khác. Kiểm tra lại controller/DTO khi sửa API.

## 1. Phiên, xác thực và CSRF

| Method | Path | Auth | Chức năng |
|---|---|---|---|
| GET | `/api/v1/auth/csrf` | Public | Khởi tạo/đọc CSRF token; client gửi cookie session và `X-XSRF-TOKEN` khi POST/PUT/PATCH/DELETE. |
| POST | `/api/v1/auth/login` | Public | `{ "username": "...", "password": "..." }`; thành công trả `{ "user": {id, username, fullName, role} }`, session cookie. Session ID được đổi sau login. |
| GET | `/api/v1/auth/me` | Session | Hồ sơ user của session. |
| POST | `/api/v1/auth/logout` | Session | Hủy session. |
| POST | `/api/v1/auth/password/change` | Session | `{ "currentPassword": "...", "newPassword": "..." }`. |
| POST | `/api/v1/auth/password/forgot` | Public + CSRF | `{ "email": "..." }`; trả thông điệp chung. Cần cấu hình SMTP để gửi mail. |
| POST | `/api/v1/auth/password/reset` | Public + CSRF | `{ "token": "...", "password": "..." }`; token một lần, 30 phút. |

Security config cho phép public: login, csrf, forgot/reset, `/error`; mọi route khác cần authenticated session. CSRF không tắt cho endpoint public thay đổi dữ liệu.

## 2. Tài khoản và danh sách sinh viên

Tất cả các route dưới đây yêu cầu ADMIN trừ khi controller/service mở rộng quyền về sau.

| Method | Path | Body / response |
|---|---|---|
| GET | `/api/users` | Danh sách tài khoản (không trả `password_hash`). |
| POST | `/api/users` | Tạo teacher/student: username, password, fullName, email, role. Admin không được tạo thêm admin. Trả 201. |
| PATCH | `/api/users/{id}/status` | `{ "enabled": true/false }`; khóa/mở tài khoản. |
| PATCH | `/api/users/{id}/password` | `{ "password": "..." }`; admin đặt mật khẩu cho teacher/student, tối thiểu 8 ký tự. Trả 204. |
| GET | `/api/users/students` | Danh sách sinh viên, lớp và trạng thái. |
| POST | `/api/users/students` | Tạo profile student; backend tạo password ngẫu nhiên, trả `initialPassword` một lần. |
| PUT | `/api/users/students/{id}` | Sửa profile/class assignment; 204. |
| GET | `/api/users/import/students/template` | Tải `.xlsx` template. |
| POST | `/api/users/import/students/preview` | Multipart `file`; preview validation, chưa ghi. |
| POST | `/api/users/import/students` | Multipart `file`; `.xlsx/.xls/.csv`; import và trả thông tin mật khẩu ban đầu một lần. |

Workbook yêu cầu mã sinh viên, họ tên, ngày sinh `yyyy-MM-dd`, email; lớp tùy chọn. Mật khẩu ban đầu không thể khôi phục từ hash; admin phải chuyển credential an toàn cho sinh viên.

## 3. Môn và nhóm giảng viên

| Method | Path | Quyền | Body / response |
|---|---|---|---|
| GET | `/api/subjects` | Authenticated | Danh sách môn. |
| POST | `/api/subjects` | ADMIN | `{code,name,description}`; 201. |
| PUT | `/api/subjects/{id}` | ADMIN | Cập nhật `{code,name,description}`. |
| GET | `/api/teacher-groups` | ADMIN/TEACHER | Nhóm enabled mà teacher được phân công; admin xem nhóm enabled. |
| GET | `/api/teacher-groups?all=true` | ADMIN | Bao gồm cả nhóm disabled để quản lý. |
| POST | `/api/teacher-groups` | ADMIN | `{subjectId,name,description}`; 201. |
| PUT | `/api/teacher-groups/{id}` | ADMIN | Sửa nhóm. |
| PATCH | `/api/teacher-groups/{id}/status` | ADMIN | `{ "enabled": true/false }`. |
| GET | `/api/teacher-groups/{id}/teachers` | ADMIN | Danh sách ID giảng viên đã gán. |
| PUT | `/api/teacher-groups/{id}/teachers` | ADMIN | `{ "teacherIds": [2,3] }`. |

## 4. Question bank và Excel

Teacher phải thuộc group; admin được phép quản lý theo policy service.

| Method | Path | Body / response |
|---|---|---|
| GET | `/api/questions?teacherGroupId={id}` | Câu hỏi trong group và options. |
| GET | `/api/questions/{questionId}` | Chi tiết câu. |
| POST | `/api/questions` | `{teacherGroupId,createdBy,content,questionType,options:[{content,correct}]}`; 201. `createdBy` hiện vẫn bắt buộc theo DTO legacy nhưng service lấy actor thực từ session; không dùng giá trị client để cấp quyền. |
| PUT | `/api/questions/{questionId}` | Sửa câu; từ chối nếu câu thuộc đề PUBLISHED/CLOSED. |
| DELETE | `/api/questions/{questionId}` | Xóa câu nếu không bị đề đã công bố khóa; 204. |
| GET | `/api/questions/template` | Tải Excel mẫu `.xlsx`. |
| POST | `/api/questions/import?teacherGroupId={id}` | Multipart `file`, `.xlsx/.xls`; lỗi một dòng làm rollback cả import. |
| GET | `/api/questions/export?teacherGroupId={id}` | Xuất `.xlsx`; tối đa 10 cặp option theo template. |

Question types: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `SHORT_ANSWER`. Cấu trúc Excel đầy đủ được mô tả ở [import-and-ai.md](import-and-ai.md).

## 5. Kỳ thi, attempt, đáp án và kết quả

| Method | Path | Quyền | Body / kết quả |
|---|---|---|---|
| GET | `/api/exams` | Auth | Student nhận kỳ đã publish còn hạn; teacher/admin nhận đề trong group phù hợp. Query tùy chọn `teacherGroupId`. |
| POST | `/api/exams` | TEACHER/ADMIN | Tạo đề DRAFT, danh sách questionId/score, group, thời gian, duration, PIN; 201. |
| GET | `/api/exams/{id}` | Auth | Teacher/admin xem đề quản lý; student DTO không có PIN/đáp án đúng. |
| PUT | `/api/exams/{id}` | TEACHER/ADMIN | Chỉ cập nhật DRAFT. |
| POST | `/api/exams/{id}/publish` | TEACHER/ADMIN | DRAFT → PUBLISHED. |
| POST | `/api/exams/{id}/close` | TEACHER/ADMIN | PUBLISHED → CLOSED. |
| POST | `/api/exams/{id}/attempts` | STUDENT | `{ "pin": "..." }`; tạo hoặc resume attempt; một attempt/user/exam. |
| GET | `/api/attempts/{id}` | Auth + ownership/group policy | Trạng thái, deadline, đề không lộ answer key và đáp án đã lưu. |
| PUT | `/api/attempts/{id}/answers/{questionId}` | Owner STUDENT | `{ "optionIds": [1], "answerText": null }`; upsert; trả 204. |
| POST | `/api/attempts/{id}/submit` | Owner STUDENT | Chốt attempt và trả result; gọi lại không tạo kết quả mới. |
| GET | `/api/attempts/{id}/result` | Owner / teacher group / admin | Kết quả attempt đã chốt. |
| GET | `/api/attempts/mine` | STUDENT | Kết quả các bài đã submit của mình. |
| GET | `/api/exams/{id}/results` | Teacher group / admin | Danh sách kết quả theo kỳ thi. |

Mọi thời gian dạng ISO-8601 instant. Deadline server `min(started_at + duration, exam.end_time)`. Multiple choice chấm all-or-nothing; short answer so theo đáp án mẫu được normalize. Điểm tổng do backend tính.

## 6. AI PDF

| Method | Path | Auth | Body / response |
|---|---|---|---|
| POST | `/api/ai/generations` | TEACHER thuộc group | Multipart `file`, `teacherGroupId`, `focusTopic`, `questionCount` (1–20), `difficulty` (`EASY/MEDIUM/HARD`); 202 job. |
| GET | `/api/ai/generations/{id}` | Chủ job / admin | Job `PENDING/PROCESSING/COMPLETED/FAILED`, kết quả gợi ý/error. |
| POST | `/api/ai/generations/{id}/approve` | TEACHER chủ job | `{ "questionIndexes": [0,1] }`; câu đã chọn mới được tạo. |

PDF giới hạn 10 MB, cần lớp text, chưa hỗ trợ OCR. Gemini key chỉ ở backend environment.

## 7. Lỗi và convention

| Status thường gặp | Nghĩa |
|---|---|
| 200 | Đọc/cập nhật hoặc trả kết quả. |
| 201 | Tạo tài nguyên. |
| 202 | Job AI nhận xử lý nền. |
| 204 | Thành công không có response body. |
| 400 | Validation/transition/PIN/deadline không hợp lệ. |
| 401 | Chưa đăng nhập/session hết hạn hoặc credential sai. |
| 403 | Đã login nhưng role/ownership/group không cho phép. |
| 404 | Tài nguyên không tồn tại. |
| 409 | Xung đột unique/foreign key hoặc dữ liệu đã tồn tại. |

Lỗi `ApiExceptionHandler` hiện trả JSON `{ "error": "..." }`; chưa dùng RFC 9457 Problem Details. Client phải xử lý 204 không có body. Mutating request cần CSRF header; frontend `authApi`/`apiClient` tự đọc XSRF cookie.

## 8. Trạng thái chuẩn hóa API

Route session auth có prefix `/api/v1/auth`, phần nghiệp vụ hiện tại dùng `/api`. Đây là trạng thái code, không nên gọi là API đã version đồng nhất. Trước khi mở rộng client bên ngoài, cần chốt versioning, OpenAPI contract, pagination, validation error schema chung và CORS/origin theo deployment.
