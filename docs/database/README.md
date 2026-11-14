# Database — trạng thái hiện tại

## Nguồn sự thật

PostgreSQL 16 là nơi lưu tài khoản, danh mục, câu hỏi, kỳ thi, attempts, answers, kết quả, PIN failures, AI jobs và recovery tokens. **Flyway migrations** trong `backend/src/main/resources/db/migration` là lịch sử schema đang chạy; backend đặt `spring.flyway.enabled=true` và Hibernate `ddl-auto=validate`.

| Migration | Thay đổi |
|---|---|
| V1 | users, subjects, teacher_groups, teacher_group_members. |
| V2 | questions, options, subject timestamp. |
| V3 | classes/student_classes, exams/exam_questions, exam_attempts/answers, AI jobs. |
| V4 | Seed dữ liệu demo. |
| V5 | Điều chỉnh BCrypt demo hash, unique partial index giới hạn một admin. |
| V6 | Bảng đếm PIN sai và tạm khóa. |
| V7 | Group/file metadata của AI job. |
| V8 | Password reset token digest/expiry/used. |

ERD và quan hệ xem [system-design.md](../architecture/system-design.md#5-erd-đang-triển-khai).

## Khởi tạo và cập nhật

1. Khởi động PostgreSQL bằng Docker Compose ở thư mục root.
2. Đảm bảo `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` backend trỏ đến đúng instance/database.
3. Start backend. Flyway validate rồi áp dụng migration chưa chạy; Hibernate validate entity mapping.
4. Theo dõi log Flyway và kiểm tra `flyway_schema_history`/`information_schema` trong DBeaver.

Đừng chạy cả `full-schema.sql` và Flyway để tạo cùng schema. `full-schema.sql` là script cũ, có lệnh `DROP TABLE` ở đầu và thiếu migration V5–V8; chỉ chạy trên database disposable khi chủ động muốn xóa/tạo lại từ đầu. `question-bank-schema.sql` là bản vá thủ công từ giai đoạn Flyway tắt, không dùng cho hiện tại. `seed-data.sql` cũng là legacy seed độc lập; seed được áp dụng tự động nằm ở V4/V5.

## Nguyên tắc dữ liệu

- PK/FK/unique/check constraints là lớp bảo vệ cuối; validation ở service không thay constraint.
- Một attempt/student/exam và một answer/attempt/question nhờ unique constraints.
- `password_hash` lưu password BCrypt, không lưu password rõ; reset token chỉ lưu SHA-256 digest.
- `exam_questions` nối đề với câu dùng lại, giữ thứ tự/điểm; câu đã dùng trong đề công bố không bị xóa.
- `exam_answers` lưu text và `exam_answer_options` lưu lựa chọn; kết quả chính thức tính/lưu ở `exam_attempts`.
- Timestamp lịch thi/deadline dùng `TIMESTAMPTZ`; frontend phải gửi/nhận ISO-8601.
- Sinh viên và lớp là quan hệ nhiều-nhiều qua `student_classes`; nhóm teacher nhiều-nhiều qua `teacher_group_members`.

## Database local

Compose publish cổng host `5433` → container `5432`; DB mặc định trong `.env.example` là `online_exam`. DBeaver kết nối host `localhost`, port `5433`, đúng database/user/password của volume hiện tại. Sửa `.env` không đổi password đã khởi tạo trong volume. Không xóa volume để xử lý xác thực vì volume chứa dữ liệu.
