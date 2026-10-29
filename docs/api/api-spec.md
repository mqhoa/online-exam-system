## Trạng thái API

API đang triển khai dùng base path `/api` (chưa có version prefix). Các endpoint câu hỏi bên dưới đã được triển khai; những nhóm còn lại là kế hoạch, chưa phải API hoạt động.

| Nhóm | Endpoint hiện có | Trạng thái |
| :--- | :--- | :--- |
| **Subjects** | `GET/POST /api/subjects` | Đã triển khai |
| **Questions** | `GET /api/questions?teacherGroupId={id}`, `GET/POST /api/questions`, `PUT/DELETE /api/questions/{id}` | Đã triển khai |

Các endpoint mục tiêu sau đây vẫn là thiết kế dự kiến. Cần chốt version prefix đồng nhất trước khi triển khai:

| Nhóm | Endpoint dự kiến |
| :--- | :--- |
| **Auth** | `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout` |
| **Users** | `GET/POST /api/v1/users`, `PATCH /api/v1/users/{id}` |
| **Teacher Groups** | `GET/POST /api/v1/teacher-groups` |
| **Exams** | `GET/POST /api/v1/exams`, `GET/PUT /api/v1/exams/{id}`, `POST /api/v1/exams/{id}/publish` |
| **Attempts** | `POST /api/v1/exams/{id}/attempts`, `GET /api/v1/attempts/{id}` |
| **Answers** | `PUT /api/v1/attempts/{id}/answers/{questionId}` |
| **Submit** | `POST /api/v1/attempts/{id}/submit` |
| **Results** | `GET /api/v1/attempts/{id}/result` |

### Hợp đồng đăng nhập dự kiến cho frontend

Các endpoint xác thực bên dưới là hợp đồng tích hợp frontend, chưa được triển khai ở backend:

`POST /api/v1/auth/login`

```json
{
  "username": "student01",
  "password": "••••••••"
}
```

Thành công trả `200 OK`, đặt cookie phiên `HttpOnly`, `SameSite=Lax` (bật `Secure` trên HTTPS) và trả hồ sơ tài khoản. Vai trò được gán ở backend, frontend không nhận vai trò từ form đăng nhập:

```json
{
  "user": {
    "id": 42,
    "username": "student01",
    "fullName": "Trần Minh Anh",
    "role": "STUDENT"
  }
}
```

`GET /api/v1/auth/me` trả `{ "user": { ... } }` cho phiên hợp lệ hoặc `401` nếu chưa đăng nhập. `POST /api/v1/auth/logout` hủy phiên và cookie; frontend gửi cookie bằng `credentials: include`. Khi frontend chạy bằng Vite, proxy `/api` chuyển tiếp tới backend `localhost:8080`. Nếu triển khai frontend và backend khác origin, backend phải cấu hình CORS có credentials cho đúng origin; không dùng wildcard.

Không trả access token trong URL hoặc lưu token vào `localStorage`/`sessionStorage`. Backend phải kiểm tra role trên mọi endpoint được bảo vệ, không dựa vào điều hướng hay hiển thị giao diện phía frontend.

```
online-exam-system/
├── backend/
│   └── src/main/
│       ├── java/com/mqhoa/onlineexam/
│       │   ├── auth/
│       │   ├── user/
│       │   ├── subject/
│       │   ├── teacher_group/
│       │   ├── question/
│       │   ├── exam/
│       │   ├── attempt/
│       │   ├── grading/
│       │   ├── ai/
│       │   └── common/
│       └── resources/
│           └── application.properties
├── frontend/
├── docs/
│   └── api/
│       └── api-spec.md
├── docker-compose.yml
├── .gitignore
└── README.md
```
