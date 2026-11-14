# Online Exam System

Hệ thống thi trực tuyến hỗ trợ quản lý câu hỏi, tổ chức kỳ thi, làm bài và chấm điểm.

> **Trạng thái:** tài liệu mô tả implementation tại 11/11/2026. Auth/role, môn/nhóm, question bank, kỳ thi/attempt/result, Excel, AI PDF và password change/recovery đã có backend/frontend. Gemini và email recovery cần credentials được cấu hình. Một số trang phụ vẫn là mock; xem phạm vi chi tiết trong bộ docs.

## Tài liệu dự án

- [Mục lục tài liệu](docs/README.md)
- [Hồ sơ trình bày trước hội đồng](docs/presentation/defense-guide.md)
- [Kiến trúc, workflow, state machine và ERD](docs/architecture/system-design.md)
- [API reference hiện hành](docs/api/api-spec.md)
- [Code map: file/hàm và trách nhiệm](docs/implementation/code-map.md)
- [Database, migration và cách khởi tạo](docs/database/README.md)
- [Import/export Excel và AI PDF](docs/api/import-and-ai.md)
- [Plan nghiệp vụ gốc](docs/diagrams/plan.md) — baseline, không phải toàn bộ trạng thái as-built.

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Java 17+, Spring Boot, Spring Security |
| Dữ liệu | PostgreSQL 16, Flyway; Spring Data/JDBC |
| Import/export | Apache POI |
| Trích xuất PDF | Apache PDFBox |
| Gợi ý câu hỏi | Gemini API, tùy cấu hình |
| Local development | Docker Compose, Maven Wrapper, npm |

Backend là modular monolith. Browser gọi REST API; PostgreSQL là source of truth. Phiên đăng nhập dựa trên cookie session và CSRF, không dùng JWT. Redis chưa được triển khai.

## Chạy local

### 1. Cấu hình PostgreSQL

Tại thư mục root, tạo `.env` từ `.env.example` và đặt password local riêng. `.env` không commit:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Khởi động DB:

```powershell
docker compose up -d postgres
docker compose ps
```

PostgreSQL lắng nghe host `localhost:5433`, database/user theo `.env`. DBeaver cũng kết nối đến host/port/database/user/password đó.

### 2. Chạy backend

PowerShell cần nạp password vào process vì Maven không tự đọc `.env`:

```powershell
cd backend
Get-Content ..\.env | ForEach-Object {
  if ($_ -match '^\s*(POSTGRES_DB|POSTGRES_USER|POSTGRES_PASSWORD)\s*=\s*(.*)\s*$') {
    [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
  }
}
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

Backend mặc định chạy cổng `8080`. Flyway tự validate và áp dụng migration V1–V8 lúc khởi động. Nếu database đã tồn tại, không chạy script `full-schema.sql`; script legacy có DROP statements. Xem [Database guide](docs/database/README.md).

Các tích hợp ngoài mặc định không bật. Để dùng AI, đặt biến `GEMINI_API_KEY` và tùy chọn `GEMINI_MODEL` trong process backend. Để dùng quên mật khẩu email, bật `MAIL_ENABLED=true` và cấu hình `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAIL_FROM`, `FRONTEND_BASE_URL`. Không đặt secret trong frontend hoặc commit.

### 3. Chạy frontend

Mở terminal mới tại thư mục repository root:

```powershell
cd frontend
npm install
npm run dev
```

Vite proxy gửi `/api` đến `http://localhost:8080`. Mở URL mà Vite in ra terminal.

## Tài khoản và bảo mật cơ bản

- Không có đăng ký tự do; admin cấp account và vai trò.
- Password được BCrypt hash; hệ thống không đọc lại password gốc.
- Người đã đăng nhập đổi password từ menu tài khoản. Quên password gửi reset link nếu SMTP bật; nếu chưa, admin reset.
- Mật khẩu tạm sau import student chỉ được trả một lần để admin bàn giao.
- Khi triển khai thật, bật HTTPS, cấu hình cookie secure/origin/SMTP và rà soát checklist ở [defense guide](docs/presentation/defense-guide.md).

## Kiểm tra build

```powershell
cd frontend
npm run build
cd ..\backend
.\mvnw.cmd -DskipTests compile
```

Build không thay thế kiểm thử nghiệp vụ. Các tình huống cần nghiệm thu gồm quyền theo role/group, F5/resume, mất mạng ngắn, deadline, submit cạnh tranh, dữ liệu Excel lỗi và reset email.

## Giới hạn đã biết

PDF scan chưa OCR; AI là gợi ý cần teacher duyệt. Browser chỉ giữ tạm đáp án chưa đồng bộ, không phải thi offline hoàn chỉnh. Một số màn quản lý học kỳ/lịch thi cũ dùng dữ liệu mock. Xem bảng trạng thái đầy đủ trong [defense guide](docs/presentation/defense-guide.md).
