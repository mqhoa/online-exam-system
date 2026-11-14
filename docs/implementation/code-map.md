# Code map — lần theo nghiệp vụ từ màn hình đến hàm xử lý

Tài liệu tra cứu nhanh để giải thích code trong buổi bảo vệ. Đường dẫn tương đối tính từ repository root. Tên hàm dưới đây đối chiếu với code hiện tại ngày 11/11/2026; tìm nhanh bằng `rg -n "methodName" backend/src frontend/src`.

## 1. Cách lần theo một request

```text
React component
  → API client (fetch, session cookie, CSRF, DTO)
  → Spring @RestController (HTTP mapping, input/output)
  → @Service (quy tắc nghiệp vụ, authorization, transaction)
  → Repository / JdbcTemplate / Spring Data JPA
  → PostgreSQL (constraint, index, Flyway schema)
```

Ví dụ: thao tác student lưu đáp án đi từ `StudentExamRoom.saveAnswer` → `examApi.saveAnswer` → `ExamController.save` → `ExamService.saveAnswer` → `exam_answers` và `exam_answer_options`.

## 2. Backend: bootstrap, bảo mật, lỗi dùng chung

| File | Hàm/điểm vào | Trách nhiệm |
|---|---|---|
| `backend/.../OnlineExamBackendApplication.java` | `main`, annotations | Khởi động Spring; bật async/scheduled jobs. |
| `common/SecurityConfig.java` | `passwordEncoder()` | Tạo BCrypt encoder. |
| | `daoAuthenticationProvider(...)` | Nối `UserRepository` và BCrypt để xác minh credential. |
| | `authenticationManager(...)` | Cung cấp provider cho `AuthService`. |
| | `apiSecurity(...)` | Cấu hình session, CSRF, public auth routes và bắt đăng nhập cho API còn lại. |
| `common/ApiExceptionHandler.java` | `handleBadRequest`, `handleNotFound`, `handleForbidden`, `handleConflict`, `handleIntegrityConflict` | Chuyển exception/constraint thành status + JSON `{error}`. |
| `common/InvalidRequestException.java` | constructor | Báo validation/quy tắc nghiệp vụ không hợp lệ. |
| `common/ForbiddenOperationException.java` | constructor | Báo không đủ quyền. |
| `common/ResourceNotFoundException.java` | constructor | Báo tài nguyên không tồn tại. |

## 3. Backend: auth, account, danh mục

| File | Hàm | Chức năng |
|---|---|---|
| `auth/AuthController.java` | `csrf` | Trả/khởi tạo CSRF token. |
| | `login` | Gọi xác thực, đổi session ID, lưu security context, trả user DTO. |
| | `me`, `logout` | Trả user hiện tại / invalidates session. |
| | `forgotPassword`, `resetPassword`, `changePassword` | Public email recovery, reset bằng token, hoặc đổi khi đã đăng nhập. |
| `auth/service/AuthService.java` | `authenticate` | Tạo authentication request và gọi `AuthenticationManager`. |
| | `findUser` | Lấy user view không bao gồm hash. |
| `auth/repository/UserRepository.java` | `loadUserByUsername` | Đọc username/hash/role/enabled cho Spring Security; hash đi vào provider để BCrypt match. |
| | `findEnabledViewByUsername` | Lấy hồ sơ user đã bật. |
| `auth/service/PasswordRecoveryService.java` | `requestReset` | Tìm email, throttle theo user, tạo token ngẫu nhiên, lưu digest và gửi link SMTP; phản hồi không tiết lộ user có tồn tại. |
| | `resetPassword` | Kiểm tra digest/expiry/used dưới row lock, cập nhật hash và vô hiệu token. |
| | `changePassword` | Kiểm tra mật khẩu hiện tại, chống dùng lại mật khẩu cũ, hash mật khẩu mới. |
| | `validateNewPassword`, `sha256` | Rule độ dài và digest token. |
| `user/UserManagementController.java` | mapping `/api/users` | Endpoint admin cho accounts/roster. |
| `user/service/UserManagementService.java` | `create` | Chỉ admin tạo teacher/student; BCrypt encode trước khi lưu. |
| | `setEnabled`, `resetPassword`, `list` | Khóa/mở user, admin đặt lại password, liệt kê account. |
| `user/service/StudentRosterService.java` | `list`, `create`, `update` | CRUD roster/class assignment. |
| | `preview`, `parse`, `parseCsv`, `validateUniqueRows` | Đọc workbook/CSV và trả lỗi/duplicate theo dòng trước khi ghi. |
| | `importWorkbook` | Import sinh viên transactionally, hash mật khẩu random và trả credential một lần. |
| | `template`, `generatePassword`, `replaceClasses` | Tạo mẫu Excel, password tạm và cập nhật quan hệ lớp. |
| `teacher_group/TeacherGroupController.java` | `list`, `create`, `update`, `status`, `teachers`, `teacherIds` | HTTP routes quản lý nhóm và phân công. |
| `teacher_group/service/TeacherGroupService.java` | `listFor`, `listAllForAdmin` | Lọc nhóm enabled theo role/membership hoặc toàn bộ cho admin. |
| | `create`, `update`, `setEnabled`, `assignTeachers`, `teacherIds` | Thực thi admin policy và thay đổi membership. |
| `subject/controller/SubjectController.java` | `getAllSubjects`, `createSubject`, `updateSubject` | REST môn học; ghi chỉ cho admin. |
| `subject/service/SubjectService.java` | `getAllSubjects`, `createSubject`, `updateSubject` | Business/persistence boundary cho môn. |

### BCrypt: giải thích miệng

Khi tạo/reset: `passwordEncoder.encode(raw)` tạo chuỗi hash có salt và cost; database chỉ giữ chuỗi trong `users.password_hash`. Lúc login, `UserRepository.loadUserByUsername` trả hash đã lưu; `DaoAuthenticationProvider` gọi BCrypt `matches(rawInput, storedHash)`. Không có hàm giải mã để xem password ban đầu.

## 4. Backend: câu hỏi, Excel, kỳ thi và AI

| File | Hàm | Chức năng |
|---|---|---|
| `question/controller/QuestionController.java` | `getByTeacherGroup`, `get`, `create`, `update`, `delete` | REST question CRUD. |
| `question/service/QuestionService.java` | `listByTeacherGroup`, `get` | Đọc câu và options sau khi kiểm tra group permission. |
| | `create`, `update`, `delete` | Ghi câu; khóa câu được đề PUBLISHED/CLOSED tham chiếu. |
| | `validateOptions` | Rule options cho 3 loại question. |
| | `validateImportedQuestion` | Dùng lại validation khi import/AI. |
| `question/service/QuestionMapper.java` | `toResponse` | Entity → public question DTO. |
| `question/service/QuestionExcelService.java` | `importWorkbook` | Parse, validate qua QuestionService và ghi trong transaction. |
| | `readRows`, `parseCorrect` | Chuyển hàng/cột workbook thành question/options và nhận diện cờ đúng/sai. |
| | `exportWorkbook`, `template`, `writeHeader` | Xuất ngân hàng/mẫu workbook. |
| `question/controller/QuestionExcelController.java` | `importQuestions`, `export`, `template` | Multipart và download endpoints. |
| `exam/ExamController.java` | controller mappings | Khai báo REST routes; ủy quyền service. |
| `exam/ExamService.java` | `create`, `update`, `changeStatus`, `list`, `get` | Tạo/sửa/lifecycle đề và lọc theo role/group; chỉ DRAFT được sửa. |
| | `start`, `getAttempt` | PIN gate, giới hạn sai, tạo một lượt hoặc resume. |
| | `saveAnswer` | Validate attempt/ownership/question/options/deadline; upsert câu trả lời. |
| | `submit`, `result`, `results`, `myResults` | Chốt, chấm và đọc kết quả theo quyền. |
| | `finalizeExpiredAttempts`, `submitAsSystem` | Scheduler auto-submit các bài hết deadline. |
| `exam/repository/ExamRepository.java` | queries | Actor/group/PIN attempt persistence helper. |
| `ai/AiGenerationController.java` | `create`, `get`, `approve` | Tạo job, poll và duyệt câu. |
| `ai/service/AiGenerationService.java` | `create` | Validate file/group/options; lưu file/job; khởi chạy worker. |
| | `get`, `approve`, `find`, `view`, `decode` | Ownership, trạng thái job và lưu câu được chọn. |
| `ai/service/AiGenerationWorker.java` | `generate` | Async: trích text bằng PDFBox, gọi Gemini `generateContent`, validate kết quả, complete/fail job, xóa PDF tạm. |
| `ai/repository/AiGenerationRepository.java` | CRUD/status | Lưu và cập nhật job AI. |

## 5. Database: file làm nguồn tra cứu

| File | Trách nhiệm |
|---|---|
| `backend/src/main/resources/db/migration/V1__init_schema.sql` | users, subjects, teacher groups, membership. |
| `V2__question_bank_and_subject_timestamp.sql` | questions/options và thời điểm môn. |
| `V3__complete_exam_and_attempt_schema.sql` | classes, exams, attempts/answers, AI jobs. |
| `V4__seed_initial_data.sql` | Dữ liệu demo. |
| `V5__fix_seed_passwords_and_limit_admin.sql` | Hash seed, unique partial index admin. |
| `V6__pin_attempt_limits.sql` | PIN failed attempt state. |
| `V7__ai_job_group_and_filename.sql` | group và original filename cho job. |
| `V8__password_recovery_tokens.sql` | Token phục hồi password. |

Flyway là schema lịch sử có thể áp dụng; `docs/database/full-schema.sql` có lệnh DROP ở đầu nên là tài liệu/script legacy, không phải migration an toàn.

## 6. Frontend: app và auth

| File | Hàm/component | Chức năng |
|---|---|---|
| `frontend/src/main.tsx` | `createRoot` | Mount React và i18n provider. |
| `app/App.tsx` | `App` | Kiểm tra session khi load; điều hướng state auth; sign-out/login. |
| `app/pages/AuthenticatedPage.tsx` | `AuthenticatedPage` | Chọn dashboard theo role từ user do backend trả. |
| `features/apiClient.ts` | `apiRequest`, `apiUpload`, `apiDownload` | Gửi cookie/CSRF, parse JSON, multipart và download. |
| `features/auth/api/authApi.ts` | `login`, `getCurrentUser`, `logout` | Session authentication client. |
| | `requestPasswordReset`, `resetPassword`, `changePassword` | Password recovery/change routes. |
| `features/auth/components/LoginForm.tsx` | `LoginForm.handleSubmit` | Chuyển giữa login, quên mật khẩu, reset từ link token. |
| `features/auth/components/ChangePasswordDialog.tsx` | `submit` | Form đổi password khi user đang đăng nhập. |
| `features/auth/pages/LoginPage.tsx` + `.css` | `LoginPage` | Banner/form login, responsive và style. |
| `i18n/locales.ts` | `messages.vi`, `messages.en` | Chuỗi giao diện song ngữ. |

## 7. Frontend: vai trò và tính năng

| File | Hàm/component quan trọng | Chức năng |
|---|---|---|
| `features/dashboard/DashboardLayout.tsx` | `DashboardLayout` | Admin shell, menu, profile/password dialog, route nội bộ. |
| `features/admin/adminApi.ts` | `adminApi.*` | Hợp đồng client cho accounts, students, subjects, teacher-groups. |
| `features/admin/AccountManagement.tsx` | `refresh`, `create`, `toggle`, `reset` | UI tài khoản admin. |
| `features/admin/AdminCatalogManagement.tsx` | `refresh`, `saveSubject`, `saveGroup`, `toggleGroup` | UI môn/nhóm/phân công. |
| `features/dashboard/StudentManagement.tsx` | `refreshStudents`, `handleSaveStudent`, `handleImportStudents`, `handleDownloadTemplate`, `downloadInitialPasswords` | Roster UI; gọi preview/import API; hiển thị credential một lần. |
| `features/dashboard/ImportExcelModal.tsx` | modal submit/preview handlers | Chọn/tải file và xem lỗi trước import. |
| `features/teacher/TeacherDashboard.tsx` | `TeacherDashboard` | Shell cho teacher. |
| `features/teacher/TeacherQuestionBank.tsx` | `refreshQuestions`, `importExcel`, `downloadQuestions`, `handleSaveQuestion`, `handleDelete` | CRUD và Excel question bank. |
| `features/teacher/questionExcelApi.ts` | API funcs | Template/import/export câu hỏi. |
| `features/teacher/TeacherExamManagement.tsx` | `refresh`, `payload`, `save`, `changeStatus` | Tạo/sửa/publish/close đề. |
| `features/teacher/TeacherAiGeneration.tsx` | `startGeneration`, `toggle`, `approve` | Upload PDF, poll AI job, chọn câu, approve. |
| `features/teacher/aiApi.ts` | API funcs | Create/poll/approve AI job. |
| `features/teacher/TeacherExamResults.tsx` | `TeacherExamResults` | Kết quả teacher theo đề. |
| `features/student/StudentDashboard.tsx` | `handleStartExam`, `handleFinishExam`, resume effect | Student shell, khôi phục attempt và route nội bộ. |
| `features/student/StudentExamList.tsx` | `start` | Tải đề, nhập PIN, bắt đầu/resume. |
| `features/student/StudentExamRoom.tsx` | `restoredAnswers`, `saveAnswer`, `retryPending`, `submitToServer`, `handleManualSubmit`, `handleAutoSubmit` | Lưu local pending, autosave, timer, retry và submit. `calculateScore` client không phải nguồn điểm. |
| `features/student/StudentExamResult.tsx` | `StudentExamResult` | Hiển thị kết quả server trả. |
| `features/exam/examApi.ts` | `examApi.*` | Client cho exams, attempts, answers, submit/results. |

## 8. Màn hình mock và giới hạn phân biệt

`features/dashboard/OtherViews.tsx`, `dashboard/mockData.ts`, `student/studentMockData.ts`, `teacher/teacherMockData.ts` chứa nội dung demo/legacy. Không phải phần nào trong các file này cũng được lưu vào backend. Các màn được nối API rõ ràng gồm account/roster, subjects/teacher groups, questions/Excel, exams, AI PDF, exam attempts/results. Trước demo hãy thao tác thử và chỉ trình bày số liệu đọc từ API/database như dữ liệu thật.

## 9. Cách giải thích layering

- **Controller:** HTTP path/status, deserialize request, serialize response; nên mỏng.
- **DTO:** hợp đồng input/output, không để entity/database password hash lọt ra frontend.
- **Service:** nghiệp vụ, role/resource ownership, validation, transaction, phối hợp repository.
- **Repository:** query/ghi PostgreSQL; `JdbcTemplate` cho query rõ ràng, JPA cho entity/repository question/catalog.
- **Common:** exception nghiệp vụ và mapper lỗi thống nhất ở mức cơ bản; không phải nơi gom mọi logic.
- **Migration:** thay đổi schema có thứ tự; không sửa database bằng tay hoặc chạy destructive full schema.

## 10. File cấu hình khi chạy

| File/biến | Vai trò |
|---|---|
| `docker-compose.yml` | PostgreSQL local và persistent volume. |
| `backend/src/main/resources/application.properties` | Port, datasource, Flyway, upload, Gemini, SMTP. |
| `.env.example` | Danh sách biến mẫu; copy/tải vào tiến trình phù hợp, không chứa secret thật. |
| `frontend/vite.config.ts` | Proxy `/api` sang backend local. |
| `backend/pom.xml`, `frontend/package.json` | Dependency và build script. |
