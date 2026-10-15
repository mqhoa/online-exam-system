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

| Nhóm | Endpoint chính |
| :--- | :--- |
| **Auth** | `POST /api/v1/auth/login`, `GET /api/v1/auth/me` |
| **Users** | `GET/POST /api/v1/users`, `PATCH /api/v1/users/{id}` |
| **Subjects** | `GET/POST /api/v1/subjects` |
| **Teacher Groups** | `GET/POST /api/v1/teacher-groups` |
| **Questions** | `GET/POST /api/v1/questions`, `GET/PUT/DELETE /api/v1/questions/{id}` |
| **Exams** | `GET/POST /api/v1/exams`, `GET/PUT /api/v1/exams/{id}`, `POST /api/v1/exams/{id}/publish` |
| **Attempts** | `POST /api/v1/exams/{id}/attempts`, `GET /api/v1/attempts/{id}` |
| **Answers** | `PUT /api/v1/attempts/{id}/answers/{questionId}` |
| **Submit** | `POST /api/v1/attempts/{id}/submit` |
| **Results** | `GET /api/v1/attempts/{id}/result` |