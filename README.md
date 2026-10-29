# Online Exam System

Hệ thống thi trực tuyến hỗ trợ quản lý ngân hàng câu hỏi, tổ chức kỳ thi và tự động chấm điểm.

> **Trạng thái hiện tại:** backend có API đọc/tạo môn học, API đọc câu hỏi theo nhóm giảng viên, và migration khởi tạo schema ngân hàng câu hỏi. Cần cấu hình đúng thông tin đăng nhập PostgreSQL và chạy endpoint trên database phát triển để xác nhận vận hành.

## 1. Mục tiêu dự án

Xây dựng ứng dụng thi trực tuyến cho ba nhóm người dùng:

- **ADMIN:** quản lý tài khoản, danh mục môn học và nhóm giảng viên.
- **TEACHER:** quản lý nhóm/môn được phân công, ngân hàng câu hỏi, kỳ thi và kết quả.
- **STUDENT:** xem kỳ thi được phép tham gia, làm bài, nộp bài và xem kết quả.

Luồng nghiệp vụ cốt lõi cần ưu tiên hoàn thành đầu-cuối:

```text
Quản lý môn học / nhóm giảng viên
                ↓
       Tạo ngân hàng câu hỏi
                ↓
         Tạo và publish kỳ thi
                ↓
       Sinh viên bắt đầu làm bài
                ↓
       Lưu câu trả lời (autosave)
                ↓
        Nộp bài / tự động nộp
                ↓
       Chấm điểm phía server
                ↓
        Lưu và xem kết quả
```

Ưu tiên một luồng thi hoạt động ổn định trước khi bổ sung các tính năng mở rộng.

## 2. Công nghệ

| Thành phần | Công nghệ / lựa chọn |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Java, Spring Boot, Spring Web |
| Build backend | Maven |
| ORM / persistence | Spring Data JPA, Hibernate |
| Database | PostgreSQL 16 |
| Database local | Docker Compose |
| Kiểm tra database | DBeaver Community |
| Version control | Git, GitLab |
| Database migration | Flyway tạm tắt local; schema ngân hàng câu hỏi được tạo bằng SQL trong `docs/database/question-bank-schema.sql` |
| Authentication/Authorization | Spring Security, dự kiến dùng phiên cookie `HttpOnly` và phân quyền theo vai trò; backend auth chưa được triển khai |
| Kiểm thử API | PowerShell `Invoke-RestMethod`, sau đó có thể bổ sung Postman/JUnit |

Backend hiện được cấu hình biên dịch với Java 17. Môi trường phát triển đã sử dụng Temurin Java 25; nếu gặp lỗi tương thích, kiểm tra `java -version`, Maven và cấu hình compiler trong `backend/pom.xml`.

## 3. Cấu trúc repository

```text
online-exam-system/
├── backend/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/mqhoa/onlineexam/
│           │   ├── OnlineExamBackendApplication.java
│           │   └── subject/
│           │       ├── Subject.java
│           │       ├── controller/
│           │       │   └── SubjectController.java
│           │       ├── service/
│           │       │   └── SubjectService.java
│           │       └── repository/
│           │           └── SubjectRepository.java
│           └── resources/
│               ├── application.properties
│               └── db/migration/
│                   └── V1__init_schema.sql
├── frontend/
├── docker-compose.yml
├── .gitignore
└── README.md
```

Cấu trúc có thể thay đổi khi các module nghiệp vụ được bổ sung. Backend được tổ chức theo **modular monolith**, chia theo nghiệp vụ; không tách microservices trong phạm vi hiện tại.

## 4. Chạy môi trường local

### 4.1. Yêu cầu

- Git
- Docker Desktop đang chạy
- JDK tương thích với cấu hình trong `backend/pom.xml`
- Node.js và npm cho frontend
- DBeaver (không bắt buộc, dùng để xem dữ liệu PostgreSQL)

### 4.2. Khởi động PostgreSQL

Tại thư mục gốc repository:

```powershell
cd D:\online-exam-system
docker compose up -d postgres
docker compose ps
```

Nếu lệnh báo không kết nối được Docker Engine, hãy mở Docker Desktop, đợi trạng thái Engine sẵn sàng rồi chạy lại. Backend cần PostgreSQL hoạt động trước khi khởi động.

Cấu hình kết nối local hiện tại:

| Thuộc tính | Giá trị |
|---|---|
| Host | `localhost` |
| Port | `5433` |
| Database | `online_exam` |
| Username | `exam_user` |
| Password | Giá trị cấu hình qua biến môi trường `POSTGRES_PASSWORD` |

Port `5433` trên máy host được dùng để tránh xung đột với một PostgreSQL khác đang sử dụng port `5432`.

Không commit mật khẩu thật vào Git. Hãy dùng `.env`/biến môi trường theo cấu hình Docker Compose hiện có của dự án.

### 4.3. Kiểm tra database bằng DBeaver

Tạo PostgreSQL connection với thông tin ở mục trên. Sau khi kết nối thành công, kiểm tra dữ liệu môn học:

```sql
SELECT id, code, name
FROM subjects
ORDER BY id;
```

Đếm số môn học:

```sql
SELECT COUNT(*) AS total_subjects
FROM subjects;
```

Danh sách 10 môn học khởi tạo:

| Mã môn | Tên môn |
|---|---|
| IT2000 | Nhập môn CNTT và TT |
| IT3011 | Cấu trúc dữ liệu và giải thuật |
| IT3040 | Kỹ thuật lập trình |
| IT3070 | Nguyên lý hệ điều hành |
| IT4653 | Học sâu và ứng dụng |
| IT3090 | Cơ sở dữ liệu |
| IT3100 | Lập trình hướng đối tượng |
| IT3180 | Nhập môn công nghệ phần mềm |
| IT3160 | Nhập môn trí tuệ nhân tạo |
| IT3190 | Nhập môn học máy và khai phá dữ liệu |

### 4.4. Chạy backend

Mở terminal riêng:

```powershell
cd D:\online-exam-system\backend
```

Nếu repository có Maven Wrapper:

```powershell
.\mvnw.cmd spring-boot:run
```

Nếu không có `mvnw.cmd` nhưng Maven đã được cài:

```powershell
mvn spring-boot:run
```

Backend được cấu hình chạy tại `http://localhost:8080`.

Cấu hình database trong `backend/src/main/resources/application.properties` hiện dự kiến có dạng:

```properties
spring.application.name=online-exam-backend
server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5433/online_exam
spring.datasource.username=${POSTGRES_USER:exam_user}
spring.datasource.password=${POSTGRES_PASSWORD}

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false

spring.flyway.enabled=false
spring.flyway.locations=classpath:db/migration
```

`POSTGRES_PASSWORD` phải được cung cấp trong môi trường chạy backend. Ví dụ đặt biến trong PowerShell hiện tại (thay bằng mật khẩu local của bạn):

```powershell
$env:POSTGRES_PASSWORD = "your_local_database_password"
.\mvnw.cmd spring-boot:run
```

Nếu terminal đã có biến môi trường phù hợp thì không cần đặt lại. Không đưa mật khẩu thực vào source code hoặc commit.

Để nạp cả ba biến cấu hình từ file `.env` của repository vào terminal hiện tại mà không in mật khẩu ra màn hình:

```powershell
Get-Content ..\.env | ForEach-Object {
    if ($_ -match '^\s*(POSTGRES_DB|POSTGRES_USER|POSTGRES_PASSWORD)\s*=\s*(.*)\s*$') {
        [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
    }
}
.\mvnw.cmd spring-boot:run
```

**Lưu ý về schema:** Flyway tạm tắt theo cấu hình local để tránh chạy migration trên database chưa rõ lịch sử. `spring.jpa.hibernate.ddl-auto=validate` chỉ kiểm tra mapping, không tự tạo bảng. Sau khi kết nối PostgreSQL, chạy `docs/database/question-bank-schema.sql` trên database phát triển để thêm cột/bảng cần thiết. Khi bật lại Flyway, cần đồng bộ schema đã tạo thủ công với lịch sử migration trước khi khởi động ứng dụng.

Nếu gặp `password authentication failed for user "exam_user"`, mật khẩu PostgreSQL đã lưu trong volume có thể khác với `POSTGRES_PASSWORD` hiện tại trong `.env`. Thay đổi `.env` không tự đổi mật khẩu của database đã được khởi tạo. Giữ nguyên volume dữ liệu; mở terminal tại thư mục gốc và chạy `docker compose exec -it postgres psql -U exam_user -d online_exam`, sau đó dùng lệnh `\password exam_user` trong `psql` và nhập đúng mật khẩu đang đặt trong `.env`. Thoát bằng `\q`, nạp lại `.env` vào terminal backend theo bước trên rồi khởi động lại ứng dụng. Không xóa volume để xử lý lỗi xác thực vì thao tác đó sẽ xóa dữ liệu local.

### 4.5. Kiểm tra API môn học

Mở terminal PowerShell thứ hai, giữ backend chạy ở terminal thứ nhất:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/subjects" -Method Get
```

Endpoint mục tiêu:

```http
GET /api/subjects
```

Kết quả mong đợi là danh sách môn học từ PostgreSQL. Nếu nhận `401` hoặc `403`, kiểm tra cấu hình Spring Security; nếu nhận `500`, đọc stack trace ở terminal backend và kiểm tra mapping Entity với schema. Chỉ đánh dấu API hoàn thành sau khi endpoint thực sự trả dữ liệu đúng.

### 4.6. Chạy frontend

Mở terminal khác:

```powershell
cd D:\online-exam-system\frontend
npm install
npm run dev
```

Dùng URL mà Vite hiển thị trong terminal. Nếu frontend gọi backend từ trình duyệt, cần cấu hình URL API và CORS phù hợp; không để frontend kết nối trực tiếp tới PostgreSQL.

### 4.7. Xem wireframe và mockup

Mở [mockup tương tác](docs/wireframes/online-exam-mockup.html) trực tiếp trong trình duyệt; mô tả phạm vi và luồng màn hình nằm trong [tài liệu wireframe](docs/wireframes/README.md). Đây là prototype tĩnh với dữ liệu mẫu, chưa kết nối API.

## 5. Quy ước thiết kế backend

Tổ chức theo module nghiệp vụ, ví dụ:

```text
com.mqhoa.onlineexam
├── auth/
├── user/
├── subject/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   └── Subject.java
├── teacher_group/
├── question/
├── exam/
├── attempt/
├── grading/
├── ai/
└── common/
```

Trách nhiệm các lớp:

- **Controller:** nhận HTTP request, gọi service và trả response.
- **Service:** xử lý quy tắc nghiệp vụ.
- **Repository:** truy cập dữ liệu qua Spring Data JPA.
- **Entity:** ánh xạ đối tượng Java với bảng database.
- **DTO:** nên được bổ sung khi cần kiểm soát request/response, tránh trả trực tiếp các trường nội bộ hoặc thông tin nhạy cảm của Entity.

Không cần tạo một package `api` cấp cao riêng nếu các endpoint đã được tổ chức trong controller theo module.

## 6. Phạm vi nghiệp vụ dự kiến

### 6.1. Môn học và nhóm giảng viên

- Quản lý danh mục môn học.
- Một môn học có thể có nhiều nhóm giảng viên phụ trách.
- Một giảng viên có thể tham gia nhiều nhóm.
- Câu hỏi và kỳ thi được quản lý trong phạm vi nhóm giảng viên.
- Trong phạm vi hiện tại, chưa triển khai phân quyền phức tạp giữa OWNER/MEMBER trong nhóm.

### 6.2. Ngân hàng câu hỏi

Ba loại câu hỏi dự kiến:

- **Single Choice:** chỉ có một đáp án đúng.
- **Multiple Choice:** nhiều đáp án đúng; chấm điểm all-or-nothing.
- **Short Answer:** so khớp sau khi chuẩn hóa khoảng trắng và chữ hoa/thường; chỉ mở rộng so sánh số tương đương khi đã định nghĩa rõ quy tắc.

Câu hỏi độc lập với kỳ thi; một câu hỏi có thể được dùng trong nhiều kỳ thi thông qua bảng liên kết. Import Excel cần validate toàn bộ dữ liệu và báo lỗi theo dòng trước khi lưu; export Excel là tính năng mở rộng sau khi luồng cốt lõi ổn định.

### 6.3. Kỳ thi

Mỗi `Exam` đại diện cho một kỳ thi/ca thi trong phạm vi Project 3. Trạng thái:

```text
DRAFT → PUBLISHED → CLOSED
```

- `DRAFT`: được chỉnh sửa nội dung, thời gian, danh sách câu hỏi và điểm.
- `PUBLISHED`: nội dung kỳ thi bị khóa.
- `CLOSED`: kỳ thi đã kết thúc.

Sinh viên tham gia dựa trên tài khoản, thời gian kỳ thi và PIN. Chưa triển khai danh sách thí sinh được chỉ định riêng cho từng kỳ thi hoặc bốc ngẫu nhiên câu hỏi/đáp án.

### 6.4. Làm bài, lưu đáp án và chấm điểm

- Backend là nguồn xác định thời gian; deadline được tính và lưu ở server/database.
- PostgreSQL là **Source of Truth** cho attempt, answers và kết quả.
- Autosave đi qua Backend → PostgreSQL.
- Hỗ trợ resume attempt `IN_PROGRESS` sau F5/đóng tab hoặc mất mạng ngắn.
- Client có thể lưu tạm đáp án chưa đồng bộ; không coi đây là chế độ offline hoàn chỉnh.
- Submit thủ công và auto-submit phải idempotent.
- Chuyển trạng thái kết thúc cần bảo đảm nguyên tử để tránh submit trùng hoặc tranh chấp với auto-submit.
- Chấm điểm thực hiện ở server; không gửi `is_correct` hoặc đáp án đúng cho frontend sinh viên trong lúc làm bài.

### 6.5. Sinh câu hỏi bằng AI — tính năng mở rộng

Luồng dự kiến: giảng viên tải PDF dạng text-based → tạo job bất đồng bộ → PDFBox trích xuất text → Gemini sinh câu hỏi → backend validate → giảng viên xem trước và duyệt → mới lưu vào ngân hàng câu hỏi.

AI không được ưu tiên hơn luồng thi cốt lõi. PDF scan chỉ chứa hình chưa nằm trong phạm vi chính.

## 7. Nguyên tắc kỹ thuật và kiểm thử

Các điểm cần kiểm tra khi hoàn thiện luồng thi:

- [ ] Phân quyền: Admin, Teacher và Student chỉ được thực hiện nghiệp vụ phù hợp.
- [ ] F5/đóng tab rồi quay lại không làm mất attempt đã lưu.
- [ ] Mất mạng ngắn: dữ liệu chưa đồng bộ được nhận diện và đồng bộ lại an toàn.
- [ ] Hết giờ: backend từ chối cập nhật đáp án sau deadline và auto-submit đúng trạng thái.
- [ ] Submit nhiều lần không chấm hoặc lưu kết quả trùng.
- [ ] Submit thủ công đồng thời với auto-submit không tạo hai kết quả.
- [ ] Hai request cập nhật cùng câu trả lời không làm dữ liệu bị sai.
- [ ] Sinh viên không thể xem đáp án đúng trước khi được phép xem kết quả.
- [ ] Nội dung đề đã publish không bị thay đổi ngoài ý muốn.
- [ ] Kiểm tra API cả trường hợp thành công, dữ liệu không hợp lệ, không tìm thấy tài nguyên và không đủ quyền.

Không triển khai Redis, message broker, microservices hoặc Kubernetes trước khi luồng chính chạy ổn định. Redis nếu bổ sung chỉ là thành phần tối ưu; không thay thế PostgreSQL.

## 8. Kế hoạch triển khai

Thứ tự ưu tiên:

1. Hoàn thiện môi trường chạy và kiểm tra kết nối backend–PostgreSQL.
2. Hoàn thành API môn học và kiểm thử bằng HTTP request.
3. Hoàn thiện cấu trúc dữ liệu và API ngân hàng câu hỏi.
4. Xây dựng API tạo/chỉnh sửa/publish kỳ thi.
5. Xây dựng attempt, lưu đáp án, timer/deadline, submit và auto-submit.
6. Chấm điểm phía server và trả kết quả.
7. Tích hợp frontend cho luồng thi đầu-cuối.
8. Kiểm thử độ tin cậy và phân quyền.
9. Bổ sung import/export Excel.
10. Chỉ sau đó mới ưu tiên module AI và các tối ưu mở rộng.

## 9. Công việc trọng tâm tuần hiện tại

### Mục tiêu

Hoàn tất nền tảng backend–database và có ít nhất một API đọc dữ liệu chạy thực tế; sau đó bắt đầu module ngân hàng câu hỏi.

### Checklist

- [ ] Kiểm tra cấu trúc repository, `pom.xml`, cấu hình backend và Docker Compose.
- [ ] Khởi động PostgreSQL và xác nhận kết nối từ DBeaver.
- [ ] Chạy backend, xử lý lỗi cấu hình hoặc mapping nếu có.
- [ ] Hoàn thành và kiểm thử `GET /api/subjects`.
- [ ] Xử lý cấu hình Spring Security/CORS cần thiết cho việc kiểm thử và tích hợp.
- [ ] Chốt mô hình dữ liệu tối thiểu cho `questions` và `options`.
- [ ] Tạo Entity, Repository, Service, Controller cho câu hỏi theo cùng cấu trúc module.
- [ ] Ghi lại request/response mẫu và kết quả kiểm thử trong tài liệu dự án.
- [ ] Commit các thay đổi theo từng phần nhỏ lên nhánh `develop`.

### Tiêu chí hoàn thành tuần

- Backend khởi động ổn định và kết nối PostgreSQL.
- `GET /api/subjects` trả đúng dữ liệu đã lưu.
- Cấu trúc module và cấu hình chạy được ghi rõ trong README.
- Có thiết kế/schema ban đầu cho ngân hàng câu hỏi và bắt đầu triển khai API, không mở rộng sang các tính năng phụ trước khi API cốt lõi hoạt động.

## 10. Quản lý mã nguồn

Repository GitLab:

`https://gitlab.nqtuan0192.me/mqhoa05/online-exam-system`

Nhánh làm việc hiện tại: `develop`, remote: `gitlab/develop`.

Một quy trình làm việc cơ bản:

```powershell
git status
git add .
git commit -m "feat(subject): implement subject listing API"
git pull --rebase gitlab develop
git push gitlab develop
```

Chỉ dùng message `feat(subject): implement subject listing API` khi API đã thực sự được triển khai và kiểm thử. Nếu chưa hoàn tất, hãy đặt message phản ánh chính xác phần thay đổi. Trước khi pull/rebase, kiểm tra `git status` và xử lý các thay đổi chưa commit; không ghi đè file cấu hình môi trường của người khác.

## 11. Phạm vi chưa triển khai trong giai đoạn đầu

Để giữ tiến độ, chưa ưu tiên:

- Nhiều ca thi độc lập cho cùng một đề.
- Danh sách sinh viên được chỉ định theo từng kỳ thi.
- Xáo trộn ngẫu nhiên câu hỏi/đáp án.
- Giới hạn IP, audit log, giám sát camera/chống gian lận.
- Microservices, Kubernetes, Kafka/RabbitMQ.
- Ứng dụng mobile native.
- Thống kê nâng cao và phân quyền OWNER/MEMBER phức tạp.
- AI sinh câu hỏi trước khi luồng thi chính ổn định.

---

**Nguyên tắc xuyên suốt:** ưu tiên một luồng thi đầu-cuối chạy đúng, lưu dữ liệu an toàn và kiểm thử được; chỉ mở rộng công nghệ khi có nhu cầu rõ ràng.
