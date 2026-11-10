import { INITIAL_TEACHER_GROUPS } from './teacherMockData'

type TeacherGroupsProps = {
  onSelectGroupForQuestions: () => void
}

export function TeacherGroups({ onSelectGroupForQuestions }: TeacherGroupsProps) {
  return (
    <div className="teacher-module-page">
      {/* Top action row */}
      <div className="content-top-bar">
        <div className="breadcrumb-wrapper">
          <span className="breadcrumb-home-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </span>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb-list">
              <li><span className="breadcrumb-link">Giảng viên</span></li>
              <li className="breadcrumb-separator">/</li>
              <li className="breadcrumb-active">Nhóm môn học phụ trách</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="table-card">
        <div className="card-header-bar">
          <h3 className="card-title">Các nhóm giảng viên môn học được phân quyền</h3>
        </div>

        <div className="table-responsive">
          <table className="student-table">
            <thead>
              <tr>
                <th className="col-stt text-center">STT</th>
                <th>Mã môn</th>
                <th>Tên môn học</th>
                <th>Tên nhóm giảng viên</th>
                <th>Thành viên</th>
                <th>Câu hỏi</th>
                <th>Kỳ thi</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {INITIAL_TEACHER_GROUPS.map((g, idx) => (
                <tr key={g.id}>
                  <td className="text-center text-muted font-weight-medium">{idx + 1}</td>
                  <td><strong>{g.subjectCode}</strong></td>
                  <td>{g.subjectName}</td>
                  <td><span className="class-badge-pill">{g.name}</span></td>
                  <td>{g.memberCount} giảng viên</td>
                  <td><strong>{g.questionCount}</strong> câu</td>
                  <td><strong>{g.examCount}</strong> kỳ thi</td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-teal btn-sm"
                      onClick={onSelectGroupForQuestions}
                    >
                      Mở ngân hàng câu hỏi →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
