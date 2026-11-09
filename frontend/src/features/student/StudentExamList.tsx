import { useState } from 'react'
import type { StudentExam } from './studentMockData'
import { STUDENT_AVAILABLE_EXAMS } from './studentMockData'

type StudentExamListProps = {
  onStartExam: (exam: StudentExam) => void
}

export function StudentExamList({ onStartExam }: StudentExamListProps) {
  const [exams] = useState<StudentExam[]>(STUDENT_AVAILABLE_EXAMS)
  const [selectedExamForPin, setSelectedExamForPin] = useState<StudentExam | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [wrongPinCount, setWrongPinCount] = useState(0)

  function handleOpenPinModal(exam: StudentExam) {
    setSelectedExamForPin(exam)
    setPinInput('')
    setPinError(null)
  }

  function handleVerifyPin() {
    if (!selectedExamForPin) return

    if (!pinInput.trim()) {
      setPinError('Vui lòng nhập mã PIN do giảng viên cung cấp!')
      return
    }

    if (wrongPinCount >= 5) {
      setPinError('Bạn đã nhập sai mã PIN quá 5 lần. Vui lòng liên hệ giảng viên để được trợ giúp!')
      return
    }

    if (pinInput.trim() === selectedExamForPin.pin) {
      const examToStart = selectedExamForPin
      setSelectedExamForPin(null)
      onStartExam(examToStart)
    } else {
      const nextCount = wrongPinCount + 1
      setWrongPinCount(nextCount)
      setPinError(`Mã PIN không chính xác! (Đã sai ${nextCount}/5 lần). Gợi ý thử nghiệm: ${selectedExamForPin.pin}`)
    }
  }

  return (
    <div className="student-portal-page">
      {/* Top bar */}
      <div className="content-top-bar">
        <div className="breadcrumb-wrapper">
          <span className="breadcrumb-home-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </span>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb-list">
              <li><span className="breadcrumb-link">Sinh viên</span></li>
              <li className="breadcrumb-separator">/</li>
              <li className="breadcrumb-active">Danh sách kỳ thi trực tuyến</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Available Exams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
        {exams.map((exam) => {
          const isOpen = exam.status === 'PUBLISHED'
          return (
            <div
              key={exam.id}
              className="table-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 20,
                borderTop: isOpen ? '4px solid #138496' : '4px solid #a0aec0',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="class-badge-pill" style={{ fontSize: 10 }}>
                    {exam.subjectCode}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: isOpen ? '#c6f6d5' : '#edf2f7',
                      color: isOpen ? '#22543d' : '#718096',
                    }}
                  >
                    {isOpen ? 'ĐANG MỞ THI' : 'ĐÃ ĐÓNG'}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#2d3748' }}>
                  {exam.title}
                </h3>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#4a5568' }}>
                  {exam.subjectName}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: '#718096', borderTop: '1px solid #edf2f7', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>⏱ Thời lượng:</span>
                    <strong style={{ color: '#2d3748' }}>{exam.durationMinutes} phút</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>📝 Số câu hỏi:</span>
                    <strong style={{ color: '#2d3748' }}>{exam.totalQuestions} câu ({exam.totalPoints} điểm)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>📅 Thời gian:</span>
                    <strong style={{ color: '#2d3748' }}>{exam.startTime.split(' ')[0]}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18, borderTop: '1px solid #edf2f7', paddingTop: 14 }}>
                {isOpen ? (
                  <button
                    type="button"
                    className="btn btn-teal"
                    style={{ width: '100%', height: 38 }}
                    onClick={() => handleOpenPinModal(exam)}
                  >
                    Nhập PIN & Vào thi
                  </button>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#a0aec0' }}>Kỳ thi đã kết thúc</span>
                    {exam.score !== undefined && (
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#28a745' }}>
                        Điểm: {exam.score} / 10.0
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal PIN Entry */}
      {selectedExamForPin && (
        <div className="modal-backdrop" onClick={() => setSelectedExamForPin(null)}>
          <div className="modal-content modal-content-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Xác thực mã PIN vào phòng thi</h3>
              <button className="modal-close-btn" onClick={() => setSelectedExamForPin(null)}>
                &times;
              </button>
            </div>

            <div className="modal-form">
              <p style={{ margin: 0, fontSize: 13.5, color: '#4a5568' }}>
                Kỳ thi: <strong>{selectedExamForPin.title}</strong>
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#718096' }}>
                Thời lượng làm bài: <strong>{selectedExamForPin.durationMinutes} phút</strong>. Sau khi bắt đầu, hệ thống sẽ tính giờ tự động phía máy chủ.
              </p>

              {pinError && (
                <div className="modal-alert" role="alert" style={{ marginTop: 8 }}>
                  {pinError}
                </div>
              )}

              <div className="form-group" style={{ marginTop: 8 }}>
                <label htmlFor="pin-input">Nhập mã PIN dự thi (6 ký tự) *</label>
                <input
                  id="pin-input"
                  type="password"
                  maxLength={10}
                  className="form-control"
                  style={{ textAlign: 'center', fontSize: 20, letterSpacing: 6, fontWeight: 700 }}
                  placeholder="••••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleVerifyPin()
                    }
                  }}
                />
                <span style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>
                  (Mã PIN thử nghiệm của đề thi này: <strong style={{ color: '#138496' }}>{selectedExamForPin.pin}</strong>)
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedExamForPin(null)}>
                Hủy bỏ
              </button>
              <button type="button" className="btn btn-teal" onClick={handleVerifyPin}>
                Bắt đầu làm bài thi →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
