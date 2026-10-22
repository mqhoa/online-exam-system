# API môn học và ngân hàng câu hỏi

Base URL local: `http://localhost:8080`  
Kiểu dữ liệu trao đổi: JSON, UTF-8.

## Môn học

### Liệt kê môn học

```http
GET /api/subjects
```

Response `200 OK` là mảng môn học, sắp xếp theo ID:

```json
[
  {
    "id": 1,
    "code": "IT2000",
    "name": "Nhập môn Công nghệ thông tin",
    "description": null,
    "createdAt": "2026-10-21T10:00:00"
  }
]
```

### Tạo môn học

```http
POST /api/subjects
Content-Type: application/json
```

Request:

```json
{
  "code": "IT2000",
  "name": "Nhập môn Công nghệ thông tin",
  "description": "Môn học cơ sở"
}
```

`code` bắt buộc, tối đa 50 ký tự và phải duy nhất; `name` bắt buộc, tối đa 200 ký tự. Thành công trả `201 Created` cùng đối tượng vừa tạo. Dữ liệu không hợp lệ trả `400`; mã môn đã tồn tại trả `409 Conflict`.

PowerShell:

```powershell
$body = @{ code = 'IT2000'; name = 'Nhập môn Công nghệ thông tin'; description = 'Môn học cơ sở' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8080/api/subjects' -Method Post -ContentType 'application/json' -Body $body
Invoke-RestMethod -Uri 'http://localhost:8080/api/subjects' -Method Get
```

## Ngân hàng câu hỏi

### Liệt kê câu hỏi của nhóm giảng viên

```http
GET /api/questions?teacherGroupId=1
```

Các endpoint này hiện chưa yêu cầu đăng nhập và chỉ dùng cho phát triển local. Response có cờ đáp án đúng phục vụ quản lý câu hỏi; không mở API cho sinh viên hoặc môi trường công khai trước khi triển khai xác thực và phân quyền.

Trả `200 OK` với danh sách câu hỏi mới tạo trước; danh sách rỗng nếu nhóm chưa có câu hỏi. Mỗi câu hỏi có `content`, `questionType`, `createdBy`, thời gian tạo/cập nhật và `options` sắp xếp theo `position`.

```json
[
  {
    "id": 10,
    "teacherGroupId": 1,
    "createdBy": 2,
    "content": "2 + 2 bằng bao nhiêu?",
    "questionType": "SINGLE_CHOICE",
    "createdAt": "2026-10-21T03:00:00Z",
    "updatedAt": "2026-10-21T03:00:00Z",
    "options": [
      { "id": 20, "content": "4", "correct": true, "position": 1 },
      { "id": 21, "content": "5", "correct": false, "position": 2 }
    ]
  }
]
```

`questionType` là `SINGLE_CHOICE`, `MULTIPLE_CHOICE` hoặc `SHORT_ANSWER`. Với câu trả lời ngắn, mỗi đáp án mẫu được lưu trong `options.content` và phải có `correct=true`.

### Tạo câu hỏi

```http
POST /api/questions
Content-Type: application/json
```

```json
{
  "teacherGroupId": 1,
  "createdBy": 2,
  "content": "2 + 2 bằng bao nhiêu?",
  "questionType": "SINGLE_CHOICE",
  "options": [
    { "content": "4", "correct": true },
    { "content": "5", "correct": false }
  ]
}
```

`teacherGroupId` phải là nhóm đang hoạt động; `createdBy` phải là giảng viên đang hoạt động và thuộc nhóm đó. API tự gán `position` theo thứ tự phương án trong request. Thành công trả `201 Created` và câu hỏi vừa lưu.

### Xem một câu hỏi

```http
GET /api/questions/{questionId}
```

### Cập nhật câu hỏi

```http
PUT /api/questions/{questionId}
Content-Type: application/json
```

Request có `content`, `questionType` và toàn bộ `options` mới. PUT thay thế toàn bộ phương án hiện có; `teacherGroupId` và `createdBy` không thay đổi.

### Xóa câu hỏi

```http
DELETE /api/questions/{questionId}
```

Trả `204 No Content`; phương án bị xóa cùng câu hỏi nhờ khóa ngoại cascade.

### Quy tắc kiểm tra

- `SINGLE_CHOICE`: ít nhất hai phương án và chính xác một đáp án đúng.
- `MULTIPLE_CHOICE`: ít nhất ba phương án, ít nhất hai đáp án đúng và ít nhất một đáp án sai. Chấm điểm dự kiến all-or-nothing.
- `SHORT_ANSWER`: một hoặc nhiều đáp án mẫu; tất cả phương án phải được đánh dấu đúng.
- Phương án trùng nhau sau trim và không phân biệt hoa/thường sẽ bị từ chối. Thứ tự do server gán liên tục từ 1.
- Dữ liệu request không hợp lệ trả `400`; không tìm thấy câu hỏi/nhóm trả `404`; người tạo không thuộc nhóm trả `403`; vi phạm khóa ngoại hoặc dữ liệu xung đột trả `409`.

## Lược đồ ngân hàng câu hỏi

SQL thủ công nằm tại `docs/database/question-bank-schema.sql`. Cấu hình local đang tắt Flyway; chạy toàn bộ script trong SQL Editor của DBeaver trên database phát triển trước khi khởi động backend, vì Hibernate đang dùng `ddl-auto=validate` và không tự tạo bảng. Script cần schema nền đã có các bảng `subjects`, `users`, `teacher_groups` và `teacher_group_members`. Script không xóa dữ liệu; `CREATE TABLE IF NOT EXISTS` cũng không sửa cấu trúc của bảng đã tồn tại, nên cần đối chiếu schema nếu database có sẵn bảng cùng tên. `V2__question_bank_and_subject_timestamp.sql` được giữ làm migration tương ứng cho quy trình Flyway sau này.

- `questions`: khóa ngoại bắt buộc đến `teacher_groups` và `users` (người tạo), nội dung không rỗng, loại câu hỏi có ràng buộc enum, dấu thời gian tạo/cập nhật.
- `options`: khóa ngoại đến câu hỏi, nội dung không rỗng, cờ đáp án đúng, thứ tự dương và duy nhất trong từng câu hỏi. Xóa câu hỏi sẽ xóa các phương án.

Mỗi câu hỏi thuộc một nhóm giảng viên. Bảng `teacher_groups` đã liên kết với môn học qua `subject_id`. Schema cho phép `SHORT_ANSWER` có nhiều đáp án mẫu dưới dạng các option đúng. Service kiểm tra số lượng và cờ đúng/sai theo loại câu hỏi trước khi ghi.

## Chạy backend

Từ thư mục `backend` trên Windows:

```powershell
$env:POSTGRES_PASSWORD = '<mật khẩu PostgreSQL local>'
.\mvnw.cmd spring-boot:run
```

Wrapper có tên `mvnw.cmd`; cú pháp `\.\mvnw\.cmd` (có dấu gạch chéo thư mục sau `mvnw`) không trỏ tới file hợp lệ. Các endpoint hiện được mở không cần đăng nhập để phát triển; không triển khai cấu hình này ra môi trường thật trước khi thêm xác thực và phân quyền.
