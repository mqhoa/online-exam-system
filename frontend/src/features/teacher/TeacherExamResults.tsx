import { useState } from 'react'
import { INITIAL_EXAMS, INITIAL_EXAM_RESULTS } from './teacherMockData'

export function TeacherExamResults() {
  const [selectedExamId, setSelectedExamId] = useState<number>(1)
  const [results] = useState(INITIAL_EXAM_RESULTS)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const currentExam = INITIAL_EXAMS.find((e) => e.id === selectedExamId) || INITIAL_EXAMS[0]
  const examResults = results.filter((r) => r.examId === selectedExamId)

  // Calculations
  const totalSubmissions = examResults.length
  const avgScore =
    totalSubmissions > 0
      ? (examResults.reduce((acc, cur) => acc + cur.score, 0) / totalSubmissions).toFixed(1)
      : '0.0'
  const maxScore =
    totalSubmissions > 0 ? Math.max(...examResults.map((r) => r.score)).toFixed(1) : '0.0'
  const minScore =
    totalSubmissions > 0 ? Math.min(...examResults.map((r) => r.score)).toFixed(1) : '0.0'
  const passedCount = examResults.filter((r) => r.score >= 5.0).length
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0

  function handleExportExcel() {
    const headers = 'STT,Mã sinh viên,Họ và tên,Lớp,Số câu đúng,Tổng điểm,Trạng thái nộp,Thời gian nộp\n'
    const rows = examResults
      .map(
        (r, idx) =>
          `${idx + 1},${r.studentCode},"${r.studentName}",${r.className},${r.correctCount}/${r.totalQuestions},${r.score},${r.status},${r.submittedAt}`
      )
      .join('\n')

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `bang_diem_${currentExam.title.replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setToastMsg('Đã xuất file bảng điểm Excel thành công!')
    setTimeout(() => setToastMsg(null), 3000)
  }

  return (
    <div className="teacher-module-page">
      {toastMsg && (
        <div className="toast-notification" role="status">
          <span className="toast-icon">✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

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
              <li className="breadcrumb-active">Kết quả thi & Báo cáo</li>
            </ol>
          </nav>
        </div>

        <div className="action-buttons-group">
          <button type="button" className="action-btn btn-green-action" onClick={handleExportExcel}>
            <span className="btn-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="17" />
                <line x1="16" y1="13" x2="8" y2="17" />
              </svg>
            </span>
            <span>Xuất Excel bảng điểm</span>
          </button>
        </div>
      </div>

      {/* Selector & KPI cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="table-card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 13.5 }}>Chọn kỳ thi xem báo cáo:</strong>
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: 320 }}
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(Number(e.target.value))}
            >
              {INITIAL_EXAMS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.subjectName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistical Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <div className="table-card" style={{ padding: 16 }}>
            <span style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>TỔNG BÀI NỘP</span>
            <h2 style={{ margin: '6px 0 0', color: '#138496', fontSize: 26 }}>{totalSubmissions}</h2>
          </div>
          <div className="table-card" style={{ padding: 16 }}>
            <span style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>ĐIỂM TRUNG BÌNH</span>
            <h2 style={{ margin: '6px 0 0', color: '#2b6cb0', fontSize: 26 }}>{avgScore}</h2>
          </div>
          <div className="table-card" style={{ padding: 16 }}>
            <span style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>ĐIỂM CAO NHẤT</span>
            <h2 style={{ margin: '6px 0 0', color: '#28a745', fontSize: 26 }}>{maxScore}</h2>
          </div>
          <div className="table-card" style={{ padding: 16 }}>
            <span style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>ĐIỂM THẤP NHẤT</span>
            <h2 style={{ margin: '6px 0 0', color: '#e53e3e', fontSize: 26 }}>{minScore}</h2>
          </div>
          <div className="table-card" style={{ padding: 16 }}>
            <span style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>TỶ LỆ ĐẠT (≥5.0)</span>
            <h2 style={{ margin: '6px 0 0', color: '#805ad5', fontSize: 26 }}>{passRate}%</h2>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="table-card">
          <div className="card-header-bar">
            <h3 className="card-title">Danh sách bài nộp và điểm số sinh viên</h3>
            <span style={{ fontSize: 12.5, color: '#718096' }}>
              Chấm điểm tự động từ hệ thống máy chủ (Server-side auto grading)
            </span>
          </div>

          <div className="table-responsive">
            <table className="student-table">
              <thead>
                <tr>
                  <th className="col-stt text-center">STT</th>
                  <th>Mã sinh viên</th>
                  <th>Họ và tên</th>
                  <th>Lớp</th>
                  <th>Số câu đúng</th>
                  <th>Điểm số</th>
                  <th>Trạng thái nộp</th>
                  <th>Thời gian nộp</th>
                </tr>
              </thead>
              <tbody>
                {examResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="no-data-cell">
                      Chưa có sinh viên nào nộp bài cho kỳ thi này.
                    </td>
                  </tr>
                ) : (
                  examResults.map((res, idx) => (
                    <tr key={res.id}>
                      <td className="text-center text-muted font-weight-medium">{idx + 1}</td>
                      <td><strong>{res.studentCode}</strong></td>
                      <td>{res.studentName}</td>
                      <td><span className="class-badge-pill">{res.className}</span></td>
                      <td>{res.correctCount} / {res.totalQuestions} câu</td>
                      <td>
                        <strong
                          style={{
                            fontSize: 15,
                            color: res.score >= 8.0 ? '#28a745' : res.score >= 5.0 ? '#2b6cb0' : '#e53e3e',
                          }}
                        >
                          {res.score.toFixed(1)} / 10.0
                        </strong>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 3,
                            backgroundColor: res.status === 'SUBMITTED' ? '#c6f6d5' : '#fed7d7',
                            color: res.status === 'SUBMITTED' ? '#22543d' : '#742a2a',
                          }}
                        >
                          {res.status === 'SUBMITTED' ? 'Sinh viên nộp' : 'Hết giờ (Auto)'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12.5, color: '#4a5568' }}>{res.submittedAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
