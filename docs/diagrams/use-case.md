# Use-case diagram — as-built

Các tác nhân và capability dưới đây phản ánh API hiện tại. Kiểm tra quyền backend vẫn là bắt buộc; sơ đồ này không đại diện cho authorization implementation.

```mermaid
flowchart LR
  A[Admin]
  T[Teacher]
  S[Student]
  subgraph OES[Online Exam System]
    U1((Quản lý tài khoản))
    U2((Import roster Excel))
    U3((Quản lý môn và teacher group))
    U4((Phân công teacher))
    U5((Quản lý question bank))
    U6((Import/export question Excel))
    U7((Tạo / publish / đóng exam))
    U8((Sinh câu hỏi từ PDF và duyệt))
    U9((Vào thi bằng PIN))
    U10((Làm bài và autosave))
    U11((Nộp / auto-submit))
    U12((Xem kết quả))
    U13((Đổi / reset password))
  end
  A --> U1
  A --> U2
  A --> U3
  A --> U4
  A --> U13
  T --> U5
  T --> U6
  T --> U7
  T --> U8
  T --> U12
  T --> U13
  S --> U9
  S --> U10
  S --> U11
  S --> U12
  S --> U13
```

**Chưa bao gồm:** mô hình invitation/self-registration, quản lý học kỳ/ca thi đầy đủ, audit/anti-cheat và báo cáo nâng cao.
