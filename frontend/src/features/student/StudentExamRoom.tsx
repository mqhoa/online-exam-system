import { useState, useEffect, useRef, useCallback } from 'react'
import type { StudentExam, StudentExamQuestion } from './studentMockData'
import { MOCK_EXAM_QUESTIONS } from './studentMockData'

export interface ExamSubmissionResult {
  examTitle: string
  subjectName: string
  totalQuestions: number
  answeredCount: number
  score: number
  totalScore: number
  timeTaken: string
  isAutoSubmitted: boolean
}

type StudentExamRoomProps = {
  exam: StudentExam
  onFinishExam: (result: ExamSubmissionResult) => void
  onExit?: () => void
}

export function StudentExamRoom({ exam, onFinishExam, onExit }: StudentExamRoomProps) {
  const [questions] = useState<StudentExamQuestion[]>(MOCK_EXAM_QUESTIONS)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Answers store: map questionId -> selectedOptionId(s) or text
  const [singleAnswers, setSingleAnswers] = useState<Record<number, number>>({})
  const [multiAnswers, setMultiAnswers] = useState<Record<number, number[]>>({})
  const [shortAnswers, setShortAnswers] = useState<Record<number, string>>({})

  // Countdown timer in seconds
  const [secondsRemaining, setSecondsRemaining] = useState(exam.durationMinutes * 60)
  const [saveCounter, setSaveCounter] = useState(0)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

  const isQuestionAnswered = useCallback((q: StudentExamQuestion): boolean => {
    if (q.questionType === 'SINGLE_CHOICE') {
      return singleAnswers[q.id] !== undefined
    }
    if (q.questionType === 'MULTIPLE_CHOICE') {
      return (multiAnswers[q.id] || []).length > 0
    }
    if (q.questionType === 'SHORT_ANSWER') {
      return Boolean((shortAnswers[q.id] || '').trim())
    }
    return false
  }, [singleAnswers, multiAnswers, shortAnswers])

  const calculateScore = useCallback((): number => {
    let score = 0
    questions.forEach((q) => {
      if (q.id === 1 && singleAnswers[1] === 101) score += 2.0
      if (q.id === 2) {
        const selected = multiAnswers[2] || []
        if (selected.includes(105) && selected.includes(106) && selected.includes(107) && !selected.includes(108)) {
          score += 2.0
        }
      }
      if (q.id === 3 && (shortAnswers[3] || '').trim().toLowerCase() === 'final') score += 2.0
      if (q.id === 4 && singleAnswers[4] === 111) score += 2.0
      if (q.id === 5) {
        const ans = (shortAnswers[5] || '').trim().toLowerCase()
        if (ans.includes('jwt') || ans.includes('token')) score += 2.0
      }
    })
    return score
  }, [questions, singleAnswers, multiAnswers, shortAnswers])

  const handleAutoSubmit = useCallback(() => {
    const score = calculateScore()
    const answeredCount = questions.filter(isQuestionAnswered).length
    onFinishExam({
      examTitle: exam.title,
      subjectName: exam.subjectName,
      totalQuestions: questions.length,
      answeredCount,
      score,
      totalScore: 10.0,
      timeTaken: `${exam.durationMinutes} phút`,
      isAutoSubmitted: true,
    })
  }, [calculateScore, questions, isQuestionAnswered, onFinishExam, exam])

  const autoSubmitRef = useRef(handleAutoSubmit)
  useEffect(() => {
    autoSubmitRef.current = handleAutoSubmit
  }, [handleAutoSubmit])

  // Countdown effect
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          autoSubmitRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  function formatTime(totalSeconds: number) {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  function handleSelectSingle(qId: number, optionId: number) {
    setSingleAnswers((prev) => ({ ...prev, [qId]: optionId }))
    setSaveCounter((prev) => prev + 1)
  }

  function handleToggleMulti(qId: number, optionId: number) {
    setMultiAnswers((prev) => {
      const current = prev[qId] || []
      const exists = current.includes(optionId)
      const updated = exists ? current.filter((id) => id !== optionId) : [...current, optionId]
      return { ...prev, [qId]: updated }
    })
    setSaveCounter((prev) => prev + 1)
  }

  function handleShortAnswerChange(qId: number, text: string) {
    setShortAnswers((prev) => ({ ...prev, [qId]: text }))
    setSaveCounter((prev) => prev + 1)
  }

  const answeredCount = questions.filter(isQuestionAnswered).length

  function handleManualSubmit() {
    setIsSubmitModalOpen(false)
    const score = calculateScore()
    const usedSeconds = exam.durationMinutes * 60 - secondsRemaining
    const usedMins = Math.max(1, Math.ceil(usedSeconds / 60))

    onFinishExam({
      examTitle: exam.title,
      subjectName: exam.subjectName,
      totalQuestions: questions.length,
      answeredCount,
      score,
      totalScore: 10.0,
      timeTaken: `${usedMins} phút`,
      isAutoSubmitted: false,
    })
  }

  const currentQ = questions[currentIndex]
  const isUrgentTimer = secondsRemaining < 300 // < 5 mins

  return (
    <div className="exam-room-container" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Exam Header Bar */}
      <div
        className="table-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          background: '#ffffff',
          position: 'sticky',
          top: 54,
          zIndex: 900,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <div>
          <span className="class-badge-pill" style={{ fontSize: 10, marginBottom: 4 }}>
            {exam.subjectCode}
          </span>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#2d3748' }}>
            {exam.title}
          </h2>
          <span style={{ fontSize: 12, color: '#718096' }}>
            💾 Trạng thái: <strong style={{ color: '#28a745' }}>Đã tự động lưu đáp án ({saveCounter} lượt) ✓</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* Countdown Clock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 6,
              backgroundColor: isUrgentTimer ? '#fff5f5' : '#f0fff4',
              border: isUrgentTimer ? '1px solid #feb2b2' : '1px solid #c6f6d5',
              color: isUrgentTimer ? '#e53e3e' : '#22543d',
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: 1,
            }}
          >
            <span>⏱</span>
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {onExit && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ height: 38 }}
              onClick={() => {
                if (window.confirm('Bạn có muốn tạm dừng và rời khỏi phòng thi? Hệ thống sẽ lưu tiến trình hiện tại.')) {
                  onExit()
                }
              }}
            >
              Thoát phòng thi
            </button>
          )}

          <button
            type="button"
            className="btn btn-green"
            style={{ height: 38, padding: '0 20px', fontWeight: 700 }}
            onClick={() => setIsSubmitModalOpen(true)}
          >
            Nộp bài thi
          </button>
        </div>
      </div>

      {/* Main Room Body */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 18 }}>
        {/* Active Question Box */}
        <div className="table-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: 14, marginBottom: 18 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#138496' }}>
                CÂU HỎI {currentQ.questionOrder} / {questions.length}
              </span>
              <span style={{ fontSize: 12, color: '#718096', marginLeft: 10 }}>
                ({currentQ.points} điểm)
              </span>
            </div>
            <span className="class-badge-pill" style={{ fontSize: 10 }}>
              {currentQ.questionType === 'SINGLE_CHOICE'
                ? 'Chọn 1 đáp án'
                : currentQ.questionType === 'MULTIPLE_CHOICE'
                ? 'Chọn nhiều đáp án'
                : 'Nhập câu trả lời ngắn'}
            </span>
          </div>

          {/* Question Content */}
          <h3 style={{ margin: '0 0 20px', fontSize: 16, lineHeight: 1.6, fontWeight: 600, color: '#1a202c' }}>
            {currentQ.content}
          </h3>

          {/* Option Controls based on type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {/* Single Choice */}
            {currentQ.questionType === 'SINGLE_CHOICE' &&
              currentQ.options?.map((opt) => {
                const isSelected = singleAnswers[currentQ.id] === opt.id
                return (
                  <label
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 6,
                      border: isSelected ? '2px solid #138496' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#e6fffa' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <input
                      type="radio"
                      name={`single-q-${currentQ.id}`}
                      checked={isSelected}
                      onChange={() => handleSelectSingle(currentQ.id, opt.id)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 14, color: isSelected ? '#138496' : '#2d3748', fontWeight: isSelected ? 600 : 400 }}>
                      {opt.content}
                    </span>
                  </label>
                )
              })}

            {/* Multiple Choice */}
            {currentQ.questionType === 'MULTIPLE_CHOICE' &&
              currentQ.options?.map((opt) => {
                const isChecked = (multiAnswers[currentQ.id] || []).includes(opt.id)
                return (
                  <label
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 6,
                      border: isChecked ? '2px solid #138496' : '1px solid #e2e8f0',
                      backgroundColor: isChecked ? '#e6fffa' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleMulti(currentQ.id, opt.id)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 14, color: isChecked ? '#138496' : '#2d3748', fontWeight: isChecked ? 600 : 400 }}>
                      {opt.content}
                    </span>
                  </label>
                )
              })}

            {/* Short Answer */}
            {currentQ.questionType === 'SHORT_ANSWER' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ height: 44, fontSize: 15 }}
                  placeholder="Nhập câu trả lời ngắn của bạn tại đây..."
                  value={shortAnswers[currentQ.id] || ''}
                  onChange={(e) => handleShortAnswerChange(currentQ.id, e.target.value)}
                  autoFocus
                />
                <span style={{ fontSize: 12, color: '#718096' }}>
                  Lưu ý: Hệ thống tự động chuẩn hóa khoảng trắng và chữ hoa/thường khi chấm điểm.
                </span>
              </div>
            )}
          </div>

          {/* Navigation controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid #edf2f7', paddingTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
            >
              ← Câu trước
            </button>
            <button
              type="button"
              className="btn btn-teal"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
            >
              Câu tiếp theo →
            </button>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="table-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#2d3748' }}>
            Danh sách câu hỏi
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
            {questions.map((q, idx) => {
              const answered = isQuestionAnswered(q)
              const isCurrent = idx === currentIndex
              return (
                <button
                  key={q.id}
                  type="button"
                  style={{
                    height: 38,
                    borderRadius: 4,
                    border: isCurrent ? '2px solid #ef7c3d' : '1px solid #cbd5e0',
                    backgroundColor: answered ? '#138496' : '#ffffff',
                    color: answered ? '#ffffff' : '#2d3748',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 100ms ease',
                  }}
                  onClick={() => setCurrentIndex(idx)}
                  title={`Câu ${idx + 1}: ${answered ? 'Đã làm' : 'Chưa làm'}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div style={{ fontSize: 12.5, color: '#718096', borderTop: '1px solid #edf2f7', paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Đã hoàn thành:</span>
              <strong style={{ color: '#138496' }}>{answeredCount} / {questions.length} câu</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <span style={{ width: 12, height: 12, backgroundColor: '#138496', borderRadius: 2, display: 'inline-block' }} />
              <span style={{ fontSize: 11.5 }}>Đã trả lời</span>
              <span style={{ width: 12, height: 12, backgroundColor: '#ffffff', border: '1px solid #cbd5e0', borderRadius: 2, display: 'inline-block', marginLeft: 8 }} />
              <span style={{ fontSize: 11.5 }}>Chưa làm</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-green"
            style={{ width: '100%', marginTop: 20, height: 42, fontWeight: 700 }}
            onClick={() => setIsSubmitModalOpen(true)}
          >
            Nộp bài ngay
          </button>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {isSubmitModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsSubmitModalOpen(false)}>
          <div className="modal-content modal-content-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Xác nhận nộp bài thi</h3>
              <button className="modal-close-btn" onClick={() => setIsSubmitModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body-padding">
              <p style={{ margin: 0, fontSize: 14 }}>
                Bạn đã hoàn thành <strong>{answeredCount}</strong> trên tổng số <strong>{questions.length}</strong> câu hỏi.
              </p>
              {answeredCount < questions.length && (
                <p style={{ margin: '8px 0 0', color: '#c53030', fontSize: 13 }}>
                  ⚠️ Bạn vẫn còn <strong>{questions.length - answeredCount}</strong> câu chưa trả lời. Bạn có chắc chắn muốn nộp bài sớm?
                </p>
              )}
              <p style={{ margin: '10px 0 0', fontSize: 12.5, color: '#718096' }}>
                Sau khi nộp, hệ thống sẽ tự động chấm điểm và không thể tiếp tục chỉnh sửa câu trả lời.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsSubmitModalOpen(false)}>
                Quay lại làm tiếp
              </button>
              <button type="button" className="btn btn-green" onClick={handleManualSubmit}>
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
