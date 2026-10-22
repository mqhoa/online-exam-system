## Trạng thái API

API đang triển khai dùng base path `/api` (chưa có version prefix). Các endpoint câu hỏi bên dưới đã được triển khai; những nhóm còn lại là kế hoạch, chưa phải API hoạt động.

| Nhóm | Endpoint hiện có | Trạng thái |
| :--- | :--- | :--- |
| **Subjects** | `GET/POST /api/subjects` | Đã triển khai |
| **Questions** | `GET /api/questions?teacherGroupId={id}`, `GET/POST /api/questions`, `PUT/DELETE /api/questions/{id}` | Đã triển khai |

Các endpoint mục tiêu sau đây vẫn là thiết kế dự kiến. Cần chốt version prefix đồng nhất trước khi triển khai:

| Nhóm | Endpoint dự kiến |
| :--- | :--- |
| **Auth** | `POST /api/v1/auth/login`, `GET /api/v1/auth/me` |
| **Users** | `GET/POST /api/v1/users`, `PATCH /api/v1/users/{id}` |
| **Teacher Groups** | `GET/POST /api/v1/teacher-groups` |
| **Exams** | `GET/POST /api/v1/exams`, `GET/PUT /api/v1/exams/{id}`, `POST /api/v1/exams/{id}/publish` |
| **Attempts** | `POST /api/v1/exams/{id}/attempts`, `GET /api/v1/attempts/{id}` |
| **Answers** | `PUT /api/v1/attempts/{id}/answers/{questionId}` |
| **Submit** | `POST /api/v1/attempts/{id}/submit` |
| **Results** | `GET /api/v1/attempts/{id}/result` |

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
