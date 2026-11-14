# Subject và Question API

Tài liệu endpoint chính thức, bao gồm auth/session, user, nhóm, question Excel, exams/attempts, AI và quyền truy cập hiện ở [API reference](api-spec.md). Schema hiện ở [Database guide](../database/README.md).

## Tóm tắt

- `GET /api/subjects`, admin `POST/PUT /api/subjects[/{id}]`.
- `GET/POST/PUT/DELETE /api/questions[/{questionId}]`; teacher chỉ trong nhóm được gán, admin theo policy. Tất cả API cần session; mutation cần CSRF.
- Câu hỏi gồm `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `SHORT_ANSWER`; quy tắc validate/chấm trong [code map](../implementation/code-map.md#4-backend-câu-hỏi-excel-kỳ-thi-và-ai).
- Câu dùng trong đề PUBLISHED/CLOSED bị khóa để bảo toàn đề và kết quả.
- Excel import/export/template ở `/api/questions/import`, `/export`, `/template`.

## Request tạo câu hỏi

```http
POST /api/questions
Content-Type: application/json
Cookie: JSESSIONID=...
X-XSRF-TOKEN: <token from /api/v1/auth/csrf>
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

Backend lấy user identity từ session, kiểm tra quyền group và gán thứ tự option; không tin user identity của client. Student exam DTO chỉ trả option hiển thị, không trả correct flag.

## Lỗi

JSON lỗi hiện có dạng `{ "error": "..." }`; status theo validation `400`, unauthenticated `401`, role/group forbidden `403`, missing `404`, conflict `409`. Hợp đồng tổng quát được cập nhật trong API reference.
