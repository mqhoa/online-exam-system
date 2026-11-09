import type { DashboardMenuId } from './types'

type OtherViewsProps = {
  viewId: DashboardMenuId
  onSwitchToStudents: () => void
}

export function OtherViews({ viewId, onSwitchToStudents }: OtherViewsProps) {
  switch (viewId) {
    case 'classes':
      return (
        <div className="subview-container">
          <div className="content-top-bar">
            <div className="breadcrumb-wrapper">
              <span className="breadcrumb-home-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </span>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb-list">
                  <li><a href="#home" className="breadcrumb-link">Trang chủ</a></li>
                  <li className="breadcrumb-separator">/</li>
                  <li><span className="breadcrumb-link">Lớp Học</span></li>
                  <li className="breadcrumb-separator">/</li>
                  <li className="breadcrumb-active">Danh sách</li>
                </ol>
              </nav>
            </div>
          </div>

          <div className="table-card">
            <div className="card-header-bar">
              <h3 className="card-title">Danh sách lớp học trong hệ thống</h3>
              <button
                type="button"
                className="btn btn-teal btn-sm"
                onClick={onSwitchToStudents}
              >
                Xem danh sách sinh viên theo lớp →
              </button>
            </div>
            <div className="table-responsive">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã lớp</th>
                    <th>Tên lớp</th>
                    <th>Khoa / Chuyên ngành</th>
                    <th>Số lượng SV</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td><span className="class-badge-pill">THH1525</span></td>
                    <td>Tin học ứng dụng K15</td>
                    <td>Công nghệ thông tin</td>
                    <td>42 sinh viên</td>
                    <td><span className="badge-valid">Đang học</span></td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td><span className="class-badge-pill">KTTC125</span></td>
                    <td>Kế toán tài chính K12</td>
                    <td>Kinh tế - Tài chính</td>
                    <td>38 sinh viên</td>
                    <td><span className="badge-valid">Đang học</span></td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td><span className="class-badge-pill">CNTT01</span></td>
                    <td>Công nghệ phần mềm 01</td>
                    <td>Công nghệ thông tin</td>
                    <td>45 sinh viên</td>
                    <td><span className="badge-valid">Đang học</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )

    case 'semesters':
      return (
        <div className="subview-container">
          <div className="content-top-bar">
            <div className="breadcrumb-wrapper">
              <span className="breadcrumb-home-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </span>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb-list">
                  <li><a href="#home" className="breadcrumb-link">Trang chủ</a></li>
                  <li className="breadcrumb-separator">/</li>
                  <li><span className="breadcrumb-link">Học Kỳ</span></li>
                  <li className="breadcrumb-separator">/</li>
                  <li className="breadcrumb-active">Danh sách</li>
                </ol>
              </nav>
            </div>
          </div>

          <div className="table-card">
            <div className="card-header-bar">
              <h3 className="card-title">Quản lý học kỳ & niên khóa</h3>
            </div>
            <div className="table-responsive">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Học kỳ</th>
                    <th>Năm học</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td><strong>Học kỳ 1</strong></td>
                    <td>2026 - 2027</td>
                    <td>2026-09-01</td>
                    <td>2027-01-15</td>
                    <td><span className="badge-valid">Đang diễn ra</span></td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td><strong>Học kỳ 2</strong></td>
                    <td>2026 - 2027</td>
                    <td>2027-02-01</td>
                    <td>2027-06-30</td>
                    <td><span className="class-badge-pill">Sắp tới</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )

    case 'subjects':
      return (
        <div className="subview-container">
          <div className="content-top-bar">
            <div className="breadcrumb-wrapper">
              <span className="breadcrumb-home-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </span>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb-list">
                  <li><a href="#home" className="breadcrumb-link">Trang chủ</a></li>
                  <li className="breadcrumb-separator">/</li>
                  <li><span className="breadcrumb-link">Môn Học</span></li>
                  <li className="breadcrumb-separator">/</li>
                  <li className="breadcrumb-active">Danh sách</li>
                </ol>
              </nav>
            </div>
          </div>

          <div className="table-card">
            <div className="card-header-bar">
              <h3 className="card-title">Danh mục môn học (Subject Management)</h3>
            </div>
            <div className="table-responsive">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã môn</th>
                    <th>Tên môn học</th>
                    <th>Số tín chỉ</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td><strong>INT1001</strong></td>
                    <td>Lập trình Web nâng cao</td>
                    <td>3 tín chỉ</td>
                    <td><span className="badge-valid">Đang mở</span></td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td><strong>INT1002</strong></td>
                    <td>Cơ sở dữ liệu phân tán</td>
                    <td>4 tín chỉ</td>
                    <td><span className="badge-valid">Đang mở</span></td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td><strong>FIN2001</strong></td>
                    <td>Kế toán tài chính doanh nghiệp</td>
                    <td>3 tín chỉ</td>
                    <td><span className="badge-valid">Đang mở</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )

    case 'questions':
      return (
        <div className="subview-container">
          <div className="content-top-bar">
            <div className="breadcrumb-wrapper">
              <span className="breadcrumb-home-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </span>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb-list">
                  <li><a href="#home" className="breadcrumb-link">Trang chủ</a></li>
                  <li className="breadcrumb-separator">/</li>
                  <li><span className="breadcrumb-link">Ngân hàng câu hỏi</span></li>
                  <li className="breadcrumb-separator">/</li>
                  <li className="breadcrumb-active">Danh sách</li>
                </ol>
              </nav>
            </div>
          </div>

          <div className="table-card">
            <div className="card-header-bar">
              <h3 className="card-title">Ngân hàng câu hỏi (Question Bank)</h3>
            </div>
            <div className="table-responsive">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Nội dung câu hỏi</th>
                    <th>Loại câu hỏi</th>
                    <th>Môn học</th>
                    <th>Độ khó</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#Q101</td>
                    <td>Giao thức nào bảo mật kết nối web giữa client và server?</td>
                    <td><span className="class-badge-pill">Single Choice</span></td>
                    <td>Lập trình Web</td>
                    <td>Dễ</td>
                  </tr>
                  <tr>
                    <td>#Q102</td>
                    <td>Các đặc tính cơ bản của mô hình ACID trong giao dịch CSDL?</td>
                    <td><span className="class-badge-pill">Multiple Choice</span></td>
                    <td>Cơ sở dữ liệu</td>
                    <td>Trung bình</td>
                  </tr>
                  <tr>
                    <td>#Q103</td>
                    <td>Từ khóa nào trong Java dùng để ngăn chặn kế thừa một lớp?</td>
                    <td><span className="class-badge-pill">Short Answer</span></td>
                    <td>Lập trình Java</td>
                    <td>Dễ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )

    case 'exams':
      return (
        <div className="subview-container">
          <div className="content-top-bar">
            <div className="breadcrumb-wrapper">
              <span className="breadcrumb-home-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </span>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb-list">
                  <li><a href="#home" className="breadcrumb-link">Trang chủ</a></li>
                  <li className="breadcrumb-separator">/</li>
                  <li><span className="breadcrumb-link">Đề Thi</span></li>
                  <li className="breadcrumb-separator">/</li>
                  <li className="breadcrumb-active">Danh sách</li>
                </ol>
              </nav>
            </div>
          </div>

          <div className="table-card">
            <div className="card-header-bar">
              <h3 className="card-title">Quản lý đề thi & Kỳ thi trực tuyến</h3>
            </div>
            <div className="table-responsive">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Mã đề</th>
                    <th>Tiêu đề đề thi</th>
                    <th>Thời lượng</th>
                    <th>Số câu hỏi</th>
                    <th>Mã PIN</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>EXAM-2026-01</strong></td>
                    <td>Thi cuối kỳ Lập trình Web - Nhóm THH1525</td>
                    <td>60 phút</td>
                    <td>40 câu</td>
                    <td><code>9824</code></td>
                    <td><span className="badge-valid">PUBLISHED</span></td>
                  </tr>
                  <tr>
                    <td><strong>EXAM-2026-02</strong></td>
                    <td>Thi giữa kỳ Kế toán tài chính - Nhóm KTTC125</td>
                    <td>45 phút</td>
                    <td>30 câu</td>
                    <td><code>1145</code></td>
                    <td><span className="class-badge-pill">DRAFT</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )

    case 'schedules':
      return (
        <div className="subview-container">
          <div className="content-top-bar">
            <div className="breadcrumb-wrapper">
              <span className="breadcrumb-home-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </span>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb-list">
                  <li><a href="#home" className="breadcrumb-link">Trang chủ</a></li>
                  <li className="breadcrumb-separator">/</li>
                  <li><span className="breadcrumb-link">Lịch Thi</span></li>
                  <li className="breadcrumb-separator">/</li>
                  <li className="breadcrumb-active">Lịch biểu</li>
                </ol>
              </nav>
            </div>
          </div>

          <div className="table-card">
            <div className="card-header-bar">
              <h3 className="card-title">Lịch thi các môn học</h3>
            </div>
            <div className="table-responsive">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Môn thi</th>
                    <th>Lớp dự thi</th>
                    <th>Ngày thi</th>
                    <th>Ca thi</th>
                    <th>Phòng / Đường dẫn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Lập trình Web nâng cao</td>
                    <td>THH1525</td>
                    <td>2026-11-20</td>
                    <td>08:00 - 09:30</td>
                    <td>Phòng LAB 302 / Online</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Kế toán tài chính</td>
                    <td>KTTC125</td>
                    <td>2026-11-22</td>
                    <td>14:00 - 15:30</td>
                    <td>Phòng B204 / Online</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}
