import type { ExamSubmissionResult } from './StudentExamRoom'

type StudentExamResultProps = {
  result: ExamSubmissionResult
  onBackToExamList: () => void
}

export function StudentExamResult({ result, onBackToExamList }: StudentExamResultProps) {
  const isPassed = result.score >= 5.0

  return (
    <div className="student-portal-page" style={{ maxWidth: 680, margin: '20px auto' }}>
      <div className="table-card" style={{ padding: 36, textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: isPassed ? '#c6f6d5' : '#fed7d7',
            color: isPassed ? '#22543d' : '#742a2a',
            fontSize: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          {isPassed ? '✓' : '!'}
        </div>

        <span
          className="class-badge-pill"
          style={{
            backgroundColor: result.isAutoSubmitted ? '#fed7d7' : '#c6f6d5',
            color: result.isAutoSubmitted ? '#742a2a' : '#22543d',
            fontSize: 11,
          }}
        >
          {result.isAutoSubmitted ? 'TỰ ĐỘNG NỘP KHI HẾT GIỜ (AUTO_SUBMITTED)' : 'ĐÃ NỘP BÀI THÀNH CÔNG (SUBMITTED)'}
        </span>

        <h2 style={{ margin: '14px 0 6px', fontSize: 22, fontWeight: 700, color: '#2d3748' }}>
          {result.examTitle}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#718096' }}>
          {result.subjectName}
        </p>

        {/* Big Score Box */}
        <div
          style={{
            background: isPassed ? '#f0fff4' : '#fff5f5',
            border: isPassed ? '2px solid #9ae6b4' : '2px solid #feb2b2',
            borderRadius: 12,
            padding: 24,
            display: 'inline-block',
            minWidth: 240,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
            KẾT QUẢ ĐIỂM SỐ
          </span>
          <div style={{ fontSize: 44, fontWeight: 900, color: isPassed ? '#28a745' : '#e53e3e', margin: '6px 0' }}>
            {result.score.toFixed(1)} <span style={{ fontSize: 20, color: '#718096' }}>/ {result.totalScore}</span>
          </div>
          <span style={{ fontSize: 13, color: isPassed ? '#22543d' : '#742a2a', fontWeight: 600 }}>
            {isPassed ? '🎉 Đạt yêu cầu bài thi' : 'Chưa đạt yêu cầu (Dưới 5.0)'}
          </span>
        </div>

        {/* Details list */}
        <div
          style={{
            maxWidth: 380,
            margin: '0 auto 28px',
            textAlign: 'left',
            background: '#fafbfc',
            borderRadius: 8,
            padding: 16,
            border: '1px solid #e2e8f0',
            fontSize: 13.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#718096' }}>Số câu đã trả lời:</span>
            <strong>{result.answeredCount} / {result.totalQuestions} câu</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#718096' }}>Thời gian làm bài:</span>
            <strong>{result.timeTaken}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#718096' }}>Phương thức chấm điểm:</span>
            <strong>Tự động trên máy chủ</strong>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-teal"
          style={{ height: 42, padding: '0 28px', fontSize: 14 }}
          onClick={onBackToExamList}
        >
          ← Quay lại danh sách kỳ thi
        </button>
      </div>
    </div>
  )
}
