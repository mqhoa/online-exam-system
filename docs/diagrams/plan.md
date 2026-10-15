
# 1. Tổng quan đề tài
## 1.1. Tên đề tài
XÂY DỰNG HỆ THỐNG THI TRỰC TUYẾN HỖ TRỢ QUẢN LÝ NGÂN HÀNG CÂU HỎI, TỔ CHỨC KỲ THI VÀ TỰ ĐỘNG CHẤM ĐIỂM

## 1.2. Mô tả nghiệp vụ
- Đối tượng sử dụng:
    + ADMIN: tài khoản khởi tạo sẵn, tạo và quản lý tài khoản giảng viên/sinh viên
    + TEACHER: tham gia một hoặc nhiều nhóm giảng viên phụ trách môn học; quản lý ngân hàng câu hỏi, lập kỳ thi, cấu hình thời gian thi, xem kết quả và sử dụng module AI.
    + STUDENT: vào thi, làm bài, xem điểm

- Ngân hàng câu hỏi và đề thi:
    + Ba loại câu hỏi được sử dụng trong phiên bản triển khai: Single Choice, Multiple Choice và Short Answer.
    + Ngân hàng câu hỏi độc lập với kỳ thi: một câu hỏi có thể được sử dụng trong nhiều kỳ thi thông qua bảng trung gian exam_questions
    + Với Multiple Choice, Project 3 áp dụng chấm điểm all-or-nothing: chọn đúng toàn bộ đáp án đúng mới được điểm.
    + Short Answer: mỗi đáp án chấp nhận được lưu thành một dòng trong bảng OPTIONS với is_correct = true. Câu trả lời của sinh viên được chuẩn hóa (trim, lowercase, chuẩn hóa khoảng trắng) rồi so khớp với từng đáp án đã được chuẩn hóa tương tự; có thể hỗ trợ tương đương số đơn giản như 3 và 3.0.
    + Import câu hỏi hàng loạt từ Excel:
    + Export Excel ở mức cơ bản.

- Mô hình: Mỗi kỳ thi có một đề cố định, nội dung giống nhau cho mọi sinh viên. Một kỳ thi chứa:
    + môn học/nhóm giảng viên phụ trách;
    + danh sách câu hỏi;
    + thứ tự câu hỏi;
    + điểm từng câu;
    + thời gian bắt đầu/kết thúc;
    + thời lượng;
    + mã PIN;
    + trạng thái DRAFT/PUBLISHED/CLOSED. 

- Quyền tham gia thi: quyền vào thi được kiểm soát bằng tài khoản sinh viên, thời gian thi và mã PIN.
    + Sinh viên chỉ nhìn thấy các kỳ thi có trạng thái PUBLISHED.
    + API trả đề thi cho sinh viên dùng DTO riêng, tuyệt đối không trả trường is_correct hay đáp án.
    + Giới hạn số lần nhập sai PIN (ví dụ 5 lần / sinh viên / kỳ thi, khóa tạm vài phút). Dùng bộ đếm trong DB hoặc bộ nhớ ứng dụng, không cần Redis.
    + Mọi API câu hỏi và kỳ thi của Teacher phải kiểm tra Teacher thuộc group tương ứng (teacher_group_members).
    + Mỗi sinh viên chỉ có một attempt cho mỗi kỳ thi.

- Quy tắc khóa đề: sau khi đề thi được công bố, không cho thay đổi danh sách câu hỏi, điểm số, thời gian thi. Câu hỏi và đáp án thuộc đề đã công bố không được chỉnh sửa hoặc xóa; điều này cũng bảo toàn kết quả của các bài đã thi. Mọi thay đổi chỉ được thực hiện ở trạng thái DRAFT.

- Luồng làm bài và chịu lỗi:
    + Server là nguồn xác định thời gian: deadline = min(started_at + duration, exam.end_time), lưu trong PostgreSQL.
    + PostgreSQL là Source of Truth cho attempt, answers và kết quả.
    + Autosave bài làm trước hết được thực hiện qua Backend → PostgreSQL. Redis chỉ là thành phần mở rộng/tối ưu, không phải nguồn dữ liệu chính.
    + Trình duyệt có thể lưu tạm các đáp án chưa đồng bộ để giảm rủi ro mất dữ liệu khi mất mạng ngắn; đây không phải chế độ offline hoàn chỉnh.
    + Sinh viên có thể resume attempt IN_PROGRESS sau F5/đóng tab hoặc khôi phục kết nối.
    + Tự động nộp khi hết giờ: lazy khi có request kết hợp scheduler quét định kỳ.
    + Submit và auto-submit phải idempotent; xử lý tranh chấp bằng chuyển trạng thái nguyên tử IN_PROGRESS → SUBMITTED/AUTO_SUBMITTED.
    + Chấm điểm được thực hiện phía server.


# 2. Thiết kế kiến trúc + ERD
## 2.1. Kiến trúc hệ thống
```mermaid
flowchart TB
    USER["Người dùng"]
    FE["Frontend<br/>React + TypeScript"]
    API["Backend<br/>Spring Boot"]
    SECURITY["Spring Security<br/>JWT + RBAC"]

    SUBJ["Subject Management"]
    GROUP["Teacher Group Management"]
    QUESTION["Question Management"]
    EXAM["Exam Management"]
    ATTEMPT["Exam Attempt"]
    GRADING["Grading"]
    AI["AI Generation"]

    PG["PostgreSQL<br/>Source of Truth"]
    REDIS["Redis<br/>Optional Cache / Temporary State / Rate Limit"]
    GEMINI["Gemini API"]

    USER --> FE
    FE -->|"REST API + JWT"| API
    API --> SECURITY
    SECURITY --> SUBJ
    SECURITY --> GROUP
    SECURITY --> QUESTION
    SECURITY --> EXAM
    SECURITY --> ATTEMPT
    SECURITY --> GRADING
    SECURITY --> AI

    SUBJ --> PG
    GROUP --> PG
    QUESTION --> PG
    EXAM --> PG
    ATTEMPT --> PG
    GRADING --> PG
    AI --> PG

    API -.-> REDIS
    AI -.-> GEMINI
```

### Nguyên tắc kiến trúc
```mermaid
flowchart LR
    FE["React + TypeScript"]
    API["Spring Boot REST API<br/>Modular Monolith"]
    PG["PostgreSQL<br/>Source of Truth"]
    REDIS["Redis<br/>Optional Extension"]

    FE --> API
    API --> PG
    API -.-> REDIS
```


## 2.2. ERD
```mermaid
erDiagram
    USERS {
        bigint id PK
        varchar username UK
        varchar password_hash
        varchar full_name
        varchar email
        enum role
        boolean enabled
        datetime created_at
    }

    SUBJECTS {
        bigint id PK
        varchar code UK
        varchar name
        text description
        boolean enabled
    }

    TEACHER_GROUPS {
        bigint id PK
        bigint subject_id FK
        varchar name
        text description
        boolean enabled
        datetime created_at
    }

    TEACHER_GROUP_MEMBERS {
        bigint group_id PK,FK
        bigint teacher_id PK,FK
    }

    QUESTIONS {
        bigint id PK
        bigint group_id FK
        text content
        enum type
        text explanation
        bigint created_by FK
        datetime created_at
        datetime updated_at
    }

    OPTIONS {
        bigint id PK
        bigint question_id FK
        text content
        boolean is_correct
    }

    EXAMS {
        bigint id PK
        bigint group_id FK
        varchar title
        text description
        bigint created_by FK
        datetime start_time
        datetime end_time
        int duration_minutes
        varchar pin
        enum status
        datetime created_at
    }

    EXAM_QUESTIONS {
        bigint exam_id PK,FK
        bigint question_id PK,FK
        int question_order
        decimal score
    }

    EXAM_ATTEMPTS {
        bigint id PK
        bigint exam_id FK
        bigint student_id FK
        datetime started_at
        datetime deadline
        datetime submitted_at
        decimal total_score
        enum status
    }

    EXAM_ANSWERS {
        bigint id PK
        bigint attempt_id FK
        bigint question_id FK
        text answer_text
        decimal score
        datetime answered_at
    }

    EXAM_ANSWER_OPTIONS {
        bigint answer_id PK,FK
        bigint option_id PK,FK
    }

    AI_GENERATION_JOBS {
        bigint id PK
        bigint teacher_id FK
        varchar file_path
        enum status
        text result
        text error_message
        datetime created_at
        datetime completed_at
    }

    SUBJECTS ||--o{ TEACHER_GROUPS : has
    TEACHER_GROUPS ||--o{ TEACHER_GROUP_MEMBERS : contains
    USERS ||--o{ TEACHER_GROUP_MEMBERS : joins

    TEACHER_GROUPS ||--o{ QUESTIONS : manages
    USERS ||--o{ QUESTIONS : creates
    QUESTIONS ||--o{ OPTIONS : contains

    TEACHER_GROUPS ||--o{ EXAMS : organizes
    USERS ||--o{ EXAMS : creates
    EXAMS ||--o{ EXAM_QUESTIONS : contains
    QUESTIONS ||--o{ EXAM_QUESTIONS : belongs_to

    USERS ||--o{ EXAM_ATTEMPTS : takes
    EXAMS ||--o{ EXAM_ATTEMPTS : has
    EXAM_ATTEMPTS ||--o{ EXAM_ANSWERS : contains
    QUESTIONS ||--o{ EXAM_ANSWERS : answered
    EXAM_ANSWERS ||--o{ EXAM_ANSWER_OPTIONS : selects
    OPTIONS ||--o{ EXAM_ANSWER_OPTIONS : selected

    USERS ||--o{ AI_GENERATION_JOBS : creates
```

### Ràng buộc bổ sung
- UNIQUE (exam_id, student_id) trên EXAM_ATTEMPTS: mỗi sinh viên một attempt cho mỗi kỳ thi, nền tảng cho start/resume idempotent.
- UNIQUE (attempt_id, question_id) trên EXAM_ANSWERS: nền tảng cho upsert autosave.
- Short Answer: đáp án chấp nhận được lưu trong OPTIONS với is_correct = true (mỗi dòng một đáp án).
- Tầng service kiểm tra: câu hỏi thêm vào kỳ thi phải cùng group_id với kỳ thi.
- Tầng service kiểm tra: câu hỏi đang thuộc kỳ thi PUBLISHED/CLOSED không được sửa hoặc xóa.
- Giá trị enum:
  - users.role: ADMIN, TEACHER, STUDENT
  - questions.type: SINGLE_CHOICE, MULTIPLE_CHOICE, SHORT_ANSWER
  - exams.status: DRAFT, PUBLISHED, CLOSED
  - exam_attempts.status: IN_PROGRESS, SUBMITTED, AUTO_SUBMITTED
  - ai_generation_jobs.status: PENDING, PROCESSING, COMPLETED, FAILED

# 3. Thiết kế luồng
## 3.1. Use Case Diagram
```mermaid
flowchart LR
    ADMIN["Admin"]
    TEACHER["Teacher"]
    STUDENT["Student"]

    AUTH(["Đăng nhập"])
    USER(["Quản lý tài khoản"])
    SUBJECT(["Quản lý môn học"])
    GROUP(["Quản lý nhóm giảng viên"])
    QB(["Quản lý ngân hàng câu hỏi"])
    EXAM(["Quản lý kỳ thi"])
    AI(["Sinh câu hỏi bằng AI"])
    EXCEL(["Import / Export Excel"])
    RESULT_T(["Xem kết quả kỳ thi"])

    LIST(["Xem kỳ thi"])
    START(["Bắt đầu làm bài"])
    ANSWER(["Trả lời câu hỏi"])
    RESUME(["Tiếp tục bài làm"])
    SUBMIT(["Nộp bài"])
    RESULT_S(["Xem kết quả"])

    ADMIN --> AUTH
    ADMIN --> USER
    ADMIN --> SUBJECT
    ADMIN --> GROUP
    TEACHER --> AUTH
    TEACHER --> GROUP
    TEACHER --> QB
    TEACHER --> EXAM
    TEACHER --> AI
    TEACHER --> EXCEL
    TEACHER --> RESULT_T
    STUDENT --> AUTH
    STUDENT --> LIST
    STUDENT --> START
    STUDENT --> ANSWER
    STUDENT --> RESUME
    STUDENT --> SUBMIT
    STUDENT --> RESULT_S
```



## 3.2. Activity Diagram - luồng làm bài
```mermaid
flowchart TD
    A([Student chọn kỳ thi])
    B{Kỳ thi đang mở?}
    C[Nhập PIN]
    D{PIN hợp lệ?}
    E[Tạo / khôi phục Exam Attempt]
    F[Tính deadline phía Server]
    G[Hiển thị đề thi]
    H[Student trả lời]
    I[Lưu đáp án qua Backend → PostgreSQL<br/>Client Storage lưu tạm khi cần]
    J{Tiếp tục làm bài?}
    K{Đã đến deadline?}
    L[Student nộp bài]
    M[Auto Submit]
    N[Atomic Finalize Attempt]
    O[Chấm điểm]
    P[Lưu kết quả PostgreSQL]
    Q[Hiển thị kết quả]
    R([Kết thúc])

    A --> B
    B -- Không --> R
    B -- Có --> C
    C --> D
    D -- Không --> C
    D -- Có --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J -- Có --> K
    K -- Chưa --> H
    K -- Đã đến hạn --> M
    J -- Không --> L
    L --> N
    M --> N
    N --> O
    O --> P
    P --> Q
    Q --> R
```


## 3.3. Sequence Diagram - làm bài
```mermaid
sequenceDiagram
    actor Student
    participant React
    participant Backend as Spring Boot
    participant PostgreSQL
    participant Browser as Client Storage

    Student->>React: Chọn kỳ thi
    React->>Backend: GET exam
    Backend->>PostgreSQL: Kiểm tra kỳ thi
    PostgreSQL-->>Backend: Exam data
    Backend-->>React: Exam information

    Student->>React: Nhập PIN
    React->>Backend: POST /attempts/start
    Backend->>PostgreSQL: Create / Resume Attempt
    Backend-->>React: Attempt + deadline

    loop Trong quá trình làm bài
        Student->>React: Chọn đáp án
        React->>Browser: Lưu tạm khi cần
        React->>Backend: Autosave answer
        Backend->>PostgreSQL: Upsert answer
    end

    Student->>React: Submit
    React->>Backend: POST /attempts/{id}/submit
    Backend->>PostgreSQL: Atomic finalize
    Backend->>PostgreSQL: Grade + save result
    Backend-->>React: Result
    React-->>Student: Hiển thị điểm
```

## 3.4. Sequence Diagram - AI sinh câu hỏi
```mermaid
sequenceDiagram
    actor Teacher
    participant React
    participant Backend as Spring Boot
    participant PDF as PDFBox
    participant Gemini
    participant PostgreSQL

    Teacher->>React: Upload PDF
    React->>Backend: Upload document
    Backend->>PostgreSQL: Create AI Job
    Backend-->>React: Job ID
    Backend->>PDF: Extract text
    PDF-->>Backend: Extracted text
    Backend->>Gemini: Generate questions
    Gemini-->>Backend: Generated JSON
    Backend->>Backend: Validate generated data
    Backend->>PostgreSQL: Save generation result
    Teacher->>React: Open preview
    React->>Backend: Get AI result
    Backend-->>React: Generated questions
    Teacher->>React: Approve
    React->>Backend: Approve questions
    Backend->>PostgreSQL: Save to Question Bank
    Backend-->>React: Success
```

# 4. Thiết kế giao diện

```mermaid
flowchart TB
    LOGIN["Login"]
    LOGIN --> ROLE{Role}
    ROLE --> ADMIN["Admin Dashboard"]
    ROLE --> TEACHER["Teacher Dashboard"]
    ROLE --> STUDENT["Student Dashboard"]
    ADMIN --> A1["User Management"]
    ADMIN --> A2["Subject Management"]
    ADMIN --> A3["Teacher Group Management"]
    TEACHER --> T0["My Subjects / Teacher Groups"]
    TEACHER --> T1["Question Bank"]
    TEACHER --> T2["Question Editor"]
    TEACHER --> T3["Exam Management"]
    TEACHER --> T4["Create / Edit Exam"]
    TEACHER --> T5["AI Question Generation"]
    TEACHER --> T6["Exam Results"]
    STUDENT --> S1["Exam List"]
    STUDENT --> S2["Exam Information + PIN"]
    STUDENT --> S3["Exam Room"]
    STUDENT --> S4["Exam Result"]
```

# 5. Bài toán + Công nghệ + Kế hoạch
## 5.1. Bảng giải pháp
| Bài toán | Phương pháp | Công cụ |
| :--- | :--- | :--- |
| Kiểm soát thời gian | Server-side timer, deadline lưu DB | Spring Boot + PostgreSQL |
| Mất bài khi F5 | Backend autosave + Resume | Spring Boot + PostgreSQL |
| Mất mạng ngắn | Client-side storage + sync | React |
| Submit trùng | Idempotent operation | Transaction |
| Race Submit/Auto-submit | Atomic state transition | PostgreSQL |
| Hết giờ | Lazy auto-submit + scheduler | Spring Scheduler |
| LLM chậm | Async processing | Spring Async |
| LLM sinh sai | Validation + human review | Gemini + Backend |
| Lộ đáp án cho sinh viên | DTO riêng cho Student, không trả is_correct | Spring Boot |
| Dò PIN (brute-force) | Giới hạn số lần nhập sai PIN | Spring Boot (bộ đếm DB / bộ nhớ) |


## 5.2. Tech stack
| Layer | Technology |
| :--- | :--- |
| Frontend | React + TypeScript |
| Backend | Spring Boot 4.1.1 / Java 17 |
| Database | PostgreSQL |
| Temporary storage | Redis (tùy chọn, chỉ làm sau mốc MVP nếu còn thời gian) |
| Authentication | Spring Security + JWT |
| AI | Gemini API |
| PDF | PDFBox |
| Excel | Apache POI |
| Deployment | Docker Compose |

## 5.3. Kế hoạch 12 tuần
```mermaid
gantt
    title Kế hoạch Project 3
    dateFormat  YYYY-MM-DD
    axisFormat  %W
 
    section Nền tảng
    Khởi tạo + Docker + Flyway + Auth/RBAC + khung React/login :w1, 2026-10-12, 14d
 
    section Core
    Subject + Teacher Group (BE + FE)                          :w3, after w1, 7d
    Question Bank (BE + FE)                                    :w4, after w3, 7d
    Exam Management + khóa đề (BE + FE)                        :w5, after w4, 7d
    Exam Attempt (start, autosave PG, resume, timer, submit, chấm, kết quả) :w6, after w5, 14d
 
    section Reliability
    Auto-submit + Idempotency + Race + test song song          :w8, after w6, 7d
    Mốc MVP chạy được từ đầu đến cuối                          :milestone, after w8, 0d
 
    section Extension
    Excel Import / Export                                      :w9, after w8, 7d
    AI Question Generation + Review                            :w10, after w9, 14d
 
    section Hoàn thiện
    Buffer + Testing + Hoàn thiện báo cáo                      :w12, after w10, 7d
```

**Lưu ý:** Các chức năng mở rộng dưới đây sẽ được xem xét bổ sung tùy theo tiến độ thực hiện:
- Excel import/export
- Redis
- Docker
- AI hỗ trợ sinh câu hỏi từ PDF

| Tuần    | Nội dung                                                        | Mức độ    |
| ------- | --------------------------------------------------------------- | --------- |
| **W1**  | Project setup + Git + Docker + PostgreSQL + Spring Boot + React | Bắt buộc  |
| **W2**  | Flyway + User + Login + JWT + RBAC                              | Bắt buộc  |
| **W3**  | Subject + Teacher Group                                         | Bắt buộc  |
| **W4**  | Question Bank + Question CRUD                                   | Bắt buộc  |
| **W5**  | Exam Management + publish/lock                                  | Bắt buộc  |
| **W6**  | Student Exam + Start Attempt + PIN                              | Bắt buộc  |
| **W7**  | Answer + Autosave + Resume + Timer                              | Bắt buộc  |
| **W8**  | Submit + Auto-submit + Grading + Result                         | **MVP**   |
| **W9**  | Fix bug + integration test + hoàn thiện UI                      | Bắt buộc  |
| **W10** | Excel Import/Export                                             | Extension |
| **W11** | AI PDF → Gemini → Review                                        | Extension |
| **W12** | Testing + Redis nếu còn thời gian + báo cáo                     | Buffer    |
