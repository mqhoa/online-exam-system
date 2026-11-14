# Bộ tài liệu dự án Online Exam System

Tài liệu này mô tả **trạng thái mã nguồn hiện tại**, không coi các ý tưởng trong kế hoạch ban đầu là chức năng đã hoàn thành. Cập nhật lần cuối: 11/11/2026.

## Đọc theo mục đích

| Mục đích | Tài liệu |
|---|---|
| Chuẩn bị thuyết trình/bảo vệ, phạm vi, nghiệp vụ, quyết định công nghệ, câu hỏi phản biện | [presentation/defense-guide.md](presentation/defense-guide.md) |
| Hiểu kiến trúc, các luồng, state machine, ERD và migration | [architecture/system-design.md](architecture/system-design.md) |
| Tra cứu API đang triển khai | [api/api-spec.md](api/api-spec.md) |
| Tìm code: package, file, trách nhiệm và hàm xử lý | [implementation/code-map.md](implementation/code-map.md) |
| Tìm đặc tả Excel và AI PDF | [api/import-and-ai.md](api/import-and-ai.md) |
| Xem mô hình dữ liệu và chính sách migration | [database/README.md](database/README.md) |
| Xem đặc tả nghiệp vụ gốc/phạm vi dự kiến | [diagrams/plan.md](diagrams/plan.md) |

## Quy ước trạng thái

- **Đã triển khai:** có API/backend/frontend hoặc migration tương ứng trong repository.
- **Có giới hạn:** đã có luồng nhưng còn ràng buộc được nói rõ trong tài liệu.
- **Chưa triển khai:** chỉ là kế hoạch hoặc ngoài phạm vi; không trình bày như chức năng chạy được.

Khi tài liệu cũ mâu thuẫn với mã nguồn, kiểm tra API, migration và file code được liệt kê trong code map; cập nhật tài liệu theo implementation. Database mới được tạo/cập nhật bằng Flyway, không dùng `docs/database/full-schema.sql` để nâng cấp database đang có dữ liệu.
