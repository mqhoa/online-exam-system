# Activity diagram — luồng làm bài

```mermaid
flowchart TD
  A([Bắt đầu]) --> B{Đã đăng nhập Student?}
  B -- Không --> X[Đăng nhập bằng account được cấp]
  X --> C[Liệt kê exam PUBLISHED còn thời gian]
  B -- Có --> C
  C --> D[Chọn exam và nhập PIN]
  D --> E{PIN hợp lệ / chưa bị khóa?}
  E -- Sai --> F[Tăng bộ đếm PIN; đến 5 lần khóa 10 phút]
  F --> D
  E -- Đúng --> G{Có attempt IN_PROGRESS?}
  G -- Có --> H[Resume attempt và đáp án server đã lưu]
  G -- Không --> I[Tạo attempt và deadline server]
  H --> J[Làm bài]
  I --> J
  J --> K[Client ghi pending rồi PUT autosave]
  K --> L{Đã sync server?}
  L -- Chưa --> M[Giữ pending trong localStorage, retry khi online]
  M --> J
  L -- Rồi --> N{Submit hay deadline tới?}
  J --> N
  N -- Chưa --> J
  N -- Có --> O[Server khóa attempt, chấm và chuyển trạng thái một lần]
  O --> P[Hiển thị result từ API]
  P --> Q([Kết thúc])
```

Deadline server bằng `min(started_at + duration, exam.end_time)`. Local timer chỉ phục vụ trải nghiệm; PostgreSQL/backend mới có quyền quyết định. Nếu browser chưa kịp đồng bộ, localStorage không đảm bảo offline hoàn chỉnh.
