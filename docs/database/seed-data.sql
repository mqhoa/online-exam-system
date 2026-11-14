-- =============================================================================
-- SAMPLE SEED DATA SCRIPT: HỆ THỐNG THI TRỰC TUYẾN
-- Cơ sở dữ liệu: PostgreSQL 16
-- Khởi tạo dữ liệu chuẩn cho Admin, Giảng viên, Sinh viên, Môn học, Kỳ thi
-- LEGACY standalone seed. Current seed data is versioned in Flyway V4/V5.
-- =============================================================================

-- 1. BẢNG NGƯỜI DÙNG (USERS)
-- Mật khẩu chuẩn:
-- admin   / Admin@123
-- teacher / Teacher@123
-- student / Student@123
INSERT INTO users (id, username, password_hash, full_name, email, role, enabled, date_of_birth)
VALUES
    (1, 'admin', '$2a$10$7hsqTf6D7m60kzfDKK/ZoubziUI0FXa0N6PggCuZQovGQiqnRgK26', 'Quản trị viên Hệ thống', 'admin@onlineexam.edu.vn', 'ADMIN', TRUE, '1990-01-01'),
    (2, 'teacher', '$2a$10$1coufYrRFUbLIPTk0/HqCOjNLj6raj92D5oVpy3skSxMZ3S50N5aW', 'ThS. Nguyễn Văn Thầy', 'teacher@onlineexam.edu.vn', 'TEACHER', TRUE, '1985-05-15'),
    (3, 'teacher01', '$2a$10$1coufYrRFUbLIPTk0/HqCOjNLj6raj92D5oVpy3skSxMZ3S50N5aW', 'TS. Trần Thị Cô', 'teacher01@onlineexam.edu.vn', 'TEACHER', TRUE, '1988-11-20'),
    (4, 'student', '$2a$10$WaaxKHmuafPUuSiF.qrxvuJE6YCL4U1CWo3xet0EnRmgajBndQAhG', 'Nguyễn Anh Long', 'student@onlineexam.edu.vn', 'STUDENT', TRUE, '1998-06-12'),
    (5, '1651227671', '$2a$10$WaaxKHmuafPUuSiF.qrxvuJE6YCL4U1CWo3xet0EnRmgajBndQAhG', 'Nguyễn Anh Long', 'nguyenanhlong1651227671@example.com', 'STUDENT', TRUE, '1998-06-12'),
    (6, '1651221159', '$2a$10$WaaxKHmuafPUuSiF.qrxvuJE6YCL4U1CWo3xet0EnRmgajBndQAhG', 'Đặng Đức Long', 'dangduclong1651221159@example.com', 'STUDENT', TRUE, '1995-11-02'),
    (7, '1651220980', '$2a$10$WaaxKHmuafPUuSiF.qrxvuJE6YCL4U1CWo3xet0EnRmgajBndQAhG', 'Dương Hữu An', 'duonghuuan1651220980@example.com', 'STUDENT', TRUE, '2001-03-14'),
    (8, '1651224900', '$2a$10$WaaxKHmuafPUuSiF.qrxvuJE6YCL4U1CWo3xet0EnRmgajBndQAhG', 'Lê Hồng Lan', 'lehonglan1651224900@example.com', 'STUDENT', TRUE, '2004-05-12'),
    (9, '1651228115', '$2a$10$WaaxKHmuafPUuSiF.qrxvuJE6YCL4U1CWo3xet0EnRmgajBndQAhG', 'Hồ Anh Lan', 'hoanhlan1651228115@example.com', 'STUDENT', TRUE, '2004-12-08'),
    (10, '1651220103', '$2a$10$WaaxKHmuafPUuSiF.qrxvuJE6YCL4U1CWo3xet0EnRmgajBndQAhG', 'Le Van C', 'levanc@example.com', 'STUDENT', TRUE, '1999-12-10'),
    (11, '1651220102', '$2a$10$WaaxKHmuafPUuSiF.qrxvuJE6YCL4U1CWo3xet0EnRmgajBndQAhG', 'Tran Thi B', 'tranthib@example.com', 'STUDENT', TRUE, '2000-05-20'),
    (12, '1651220101', '$2a$10$WaaxKHmuafPUuSiF.qrxvuJE6YCL4U1CWo3xet0EnRmgajBndQAhG', 'Nguyen Van A', 'nguyenvana@example.com', 'STUDENT', TRUE, '1999-01-15')
ON CONFLICT (username) DO NOTHING;

-- 2. BẢNG LỚP HỌC (CLASSES)
INSERT INTO classes (id, code, name, description, enabled)
VALUES
    (1, 'THH1525', 'Lớp Tin học ứng dụng K15', 'Khoa Công nghệ thông tin', TRUE),
    (2, 'KTTC125', 'Lớp Kế toán tài chính K12', 'Khoa Kinh tế và Kế toán', TRUE),
    (3, 'CNTT01', 'Lớp Kỹ thuật phần mềm 01', 'Khoa Công nghệ thông tin', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 3. PHÂN LỚP SINH VIÊN (STUDENT_CLASSES)
INSERT INTO student_classes (student_id, class_id)
VALUES
    (4, 1), (4, 2), -- student: THH1525, KTTC125
    (5, 1), (5, 2), -- Nguyễn Anh Long: THH1525, KTTC125
    (6, 2),         -- Đặng Đức Long: KTTC125
    (7, 1),         -- Dương Hữu An: THH1525
    (8, 1), (8, 2), -- Lê Hồng Lan: THH1525, KTTC125
    (9, 2),         -- Hồ Anh Lan: KTTC125
    (10, 2),        -- Le Van C: KTTC125
    (11, 1), (11, 2), -- Tran Thi B: THH1525, KTTC125
    (12, 1)         -- Nguyen Van A: THH1525
ON CONFLICT DO NOTHING;

-- 4. BẢNG MÔN HỌC (SUBJECTS)
INSERT INTO subjects (id, code, name, description, enabled)
VALUES
    (1, 'INT1001', 'Lập trình Web nâng cao', 'Kiến trúc Spring Boot, RESTful API, React và Bảo mật JWT', TRUE),
    (2, 'INT1002', 'Cơ sở dữ liệu phân tán', 'Phân mảnh, phân tán dữ liệu, tối ưu hóa truy vấn và giao dịch ACID', TRUE),
    (3, 'FIN2001', 'Kế toán tài chính doanh nghiệp', 'Hệ thống chuẩn mực kế toán tài chính và báo cáo thuế', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 5. BẢNG NHÓM GIẢNG VIÊN (TEACHER_GROUPS & MEMBERS)
INSERT INTO teacher_groups (id, subject_id, name, description, enabled)
VALUES
    (1, 1, 'Nhóm Lập trình Web - K15', 'Phụ trách môn INT1001 học kỳ 1 2026-2027', TRUE),
    (2, 2, 'Nhóm Cơ sở dữ liệu - K12', 'Phụ trách môn INT1002 học kỳ 1 2026-2027', TRUE),
    (3, 3, 'Nhóm Kế toán doanh nghiệp', 'Phụ trách môn FIN2001 học kỳ 1 2026-2027', TRUE)
ON CONFLICT (subject_id, name) DO NOTHING;

INSERT INTO teacher_group_members (group_id, teacher_id)
VALUES
    (1, 2),
    (2, 2),
    (3, 3)
ON CONFLICT DO NOTHING;

-- 6. BẢNG CÂU HỎI (QUESTIONS)
INSERT INTO questions (id, teacher_group_id, created_by, content, question_type, difficulty, explanation)
VALUES
    (1, 1, 2, 'Giao thức nào cung cấp kết nối mạng an toàn và được mã hóa giữa trình duyệt và máy chủ web?', 'SINGLE_CHOICE', 'EASY', 'HTTPS mã hóa đường truyền bằng giao thức TLS/SSL.'),
    (2, 1, 2, 'Những phương thức HTTP nào dưới đây được coi là Idempotent theo chuẩn RFC 7231?', 'MULTIPLE_CHOICE', 'MEDIUM', 'Theo chuẩn HTTP, các phương thức GET, HEAD, PUT, DELETE được định nghĩa là Idempotent.'),
    (3, 1, 2, 'Từ khóa nào trong Java dùng để định nghĩa một hằng số hoặc ngăn chặn một lớp bị kế thừa?', 'SHORT_ANSWER', 'EASY', 'Từ khóa final ngăn chặn gán lại giá trị hoặc kế thừa lớp trong Java.'),
    (4, 1, 2, 'Cơ chế nào trong Spring Boot được dùng để tự động cấu hình các bean dựa trên thư viện trong classpath?', 'SINGLE_CHOICE', 'MEDIUM', '@EnableAutoConfiguration kích hoạt Spring Boot Autoconfigure.'),
    (5, 2, 2, 'Trong hệ quản trị CSDL quan hệ, 4 đặc tính cơ bản của một Transaction (ACID) viết tắt của những từ nào?', 'MULTIPLE_CHOICE', 'MEDIUM', 'ACID đại diện cho: Atomicity, Consistency, Isolation, Durability.')
ON CONFLICT DO NOTHING;

-- 7. BẢNG PHƯƠNG ÁN LỰA CHỌN (OPTIONS)
INSERT INTO options (id, question_id, content, is_correct, option_order)
VALUES
    (1, 1, 'HTTPS (Hypertext Transfer Protocol Secure)', TRUE, 1),
    (2, 1, 'HTTP (Hypertext Transfer Protocol)', FALSE, 2),
    (3, 1, 'FTP (File Transfer Protocol)', FALSE, 3),
    (4, 1, 'SNMP (Simple Network Management Protocol)', FALSE, 4),

    (5, 2, 'GET', TRUE, 1),
    (6, 2, 'PUT', TRUE, 2),
    (7, 2, 'DELETE', TRUE, 3),
    (8, 2, 'POST', FALSE, 4),

    (9, 3, 'final', TRUE, 1),
    (10, 3, 'FINAL', TRUE, 2),

    (11, 4, '@EnableAutoConfiguration / Spring Boot Autoconfigure', TRUE, 1),
    (12, 4, '@ManualConfiguration', FALSE, 2),
    (13, 4, '@StaticInjection', FALSE, 3),
    (14, 4, '@AutoAutowired', FALSE, 4),

    (15, 5, 'Atomicity (Tính nguyên tử)', TRUE, 1),
    (16, 5, 'Consistency (Tính nhất quán)', TRUE, 2),
    (17, 5, 'Isolation (Tính độc lập)', TRUE, 3),
    (18, 5, 'Durability (Tính bền vững)', TRUE, 4)
ON CONFLICT (question_id, option_order) DO NOTHING;

-- 8. BẢNG KỲ THI (EXAMS)
INSERT INTO exams (id, group_id, title, description, created_by, start_time, end_time, duration_minutes, pin, status)
VALUES
    (1, 1, 'Kiểm tra giữa kỳ - Lập trình Web và Spring Boot', 'Bao gồm kiến thức chương 1 đến chương 4', 2, '2026-11-09 08:00:00+07', '2026-11-09 18:00:00+07', 45, '123456', 'PUBLISHED'),
    (2, 1, 'Thi cuối kỳ - Lập trình ứng dụng phân tán', 'Bài thi kết thúc học phần', 2, '2026-11-25 09:00:00+07', '2026-11-25 10:30:00+07', 60, '987654', 'DRAFT'),
    (3, 2, 'Khảo sát định kỳ - Kiến trúc CSDL phân tán', 'Kiểm tra kiến thức phân mảnh và phân tán', 2, '2026-11-01 14:00:00+07', '2026-11-01 15:00:00+07', 30, '445566', 'CLOSED')
ON CONFLICT DO NOTHING;

-- 9. GÁN CÂU HỎI VÀO ĐỀ THI (EXAM_QUESTIONS)
INSERT INTO exam_questions (exam_id, question_id, question_order, score)
VALUES
    (1, 1, 1, 2.50),
    (1, 2, 2, 2.50),
    (1, 3, 3, 2.50),
    (1, 4, 4, 2.50),
    (3, 5, 1, 10.00)
ON CONFLICT (exam_id, question_id) DO NOTHING;

-- 10. BẢNG LƯỢT LÀM BÀI (EXAM_ATTEMPTS)
INSERT INTO exam_attempts (id, exam_id, student_id, started_at, deadline, submitted_at, total_score, status)
VALUES
    (1, 1, 4, '2026-11-09 08:30:00+07', '2026-11-09 09:15:00+07', '2026-11-09 09:14:22+07', 8.50, 'SUBMITTED'),
    (2, 1, 6, '2026-11-09 08:35:00+07', '2026-11-09 09:20:00+07', '2026-11-09 09:18:05+07', 9.00, 'SUBMITTED'),
    (3, 1, 7, '2026-11-09 08:40:00+07', '2026-11-09 09:25:00+07', '2026-11-09 09:22:40+07', 7.00, 'SUBMITTED'),
    (4, 1, 8, '2026-11-09 08:45:00+07', '2026-11-09 09:30:00+07', '2026-11-09 09:30:00+07', 6.50, 'AUTO_SUBMITTED'),
    (5, 1, 9, '2026-11-09 08:35:00+07', '2026-11-09 09:20:00+07', '2026-11-09 09:20:11+07', 8.00, 'SUBMITTED')
ON CONFLICT (exam_id, student_id) DO NOTHING;

-- 11. BẢNG CÂU TRẢ LỜI (EXAM_ANSWERS & OPTIONS)
INSERT INTO exam_answers (id, attempt_id, question_id, answer_text, score)
VALUES
    (1, 1, 1, NULL, 2.50),
    (2, 1, 2, NULL, 2.50),
    (3, 1, 3, 'final', 2.50),
    (4, 1, 4, NULL, 1.00)
ON CONFLICT (attempt_id, question_id) DO NOTHING;

INSERT INTO exam_answer_options (answer_id, option_id)
VALUES
    (1, 1),
    (2, 5), (2, 6), (2, 7),
    (4, 11)
ON CONFLICT DO NOTHING;

-- 12. TIẾN TRÌNH SINH CÂU HỎI AI (AI_GENERATION_JOBS)
INSERT INTO ai_generation_jobs (id, teacher_id, file_path, status, result, created_at, completed_at)
VALUES
    (1, 2, 'uploads/lectures/Spring_Security_JWT_Guide.pdf', 'COMPLETED',
     '{"generatedQuestionsCount": 5, "model": "gemini-1.5-pro", "focus": "Spring Security & JWT"}',
     '2026-11-08 14:00:00+07', '2026-11-08 14:01:25+07')
ON CONFLICT DO NOTHING;

-- ĐỒNG BỘ SEQUENCE AUTO_INCREMENT
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('classes', 'id'), COALESCE(MAX(id), 1)) FROM classes;
SELECT setval(pg_get_serial_sequence('subjects', 'id'), COALESCE(MAX(id), 1)) FROM subjects;
SELECT setval(pg_get_serial_sequence('teacher_groups', 'id'), COALESCE(MAX(id), 1)) FROM teacher_groups;
SELECT setval(pg_get_serial_sequence('questions', 'id'), COALESCE(MAX(id), 1)) FROM questions;
SELECT setval(pg_get_serial_sequence('options', 'id'), COALESCE(MAX(id), 1)) FROM options;
SELECT setval(pg_get_serial_sequence('exams', 'id'), COALESCE(MAX(id), 1)) FROM exams;
SELECT setval(pg_get_serial_sequence('exam_attempts', 'id'), COALESCE(MAX(id), 1)) FROM exam_attempts;
SELECT setval(pg_get_serial_sequence('exam_answers', 'id'), COALESCE(MAX(id), 1)) FROM exam_answers;
SELECT setval(pg_get_serial_sequence('ai_generation_jobs', 'id'), COALESCE(MAX(id), 1)) FROM ai_generation_jobs;
