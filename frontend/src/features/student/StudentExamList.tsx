import { useEffect, useState } from 'react'
import type { StudentExam } from './studentMockData'
import { examApi, type AttemptView, type ExamView } from '../exam/examApi'

type Props = { onStartExam: (exam: StudentExam, attempt: AttemptView) => void }

export function StudentExamList({ onStartExam }: Props) {
  const [exams, setExams] = useState<StudentExam[]>([])
  const [selected, setSelected] = useState<StudentExam | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    examApi.list().then((items) => setExams(items.map(toStudentExam)))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Không tải được kỳ thi'))
      .finally(() => setLoading(false))
  }, [])

  async function start() {
    if (!selected) return
    setError('')
    try {
      const attempt = await examApi.start(selected.id, pin)
      const exam = { ...toStudentExam(attempt.exam), attemptId: attempt.id, deadline: attempt.deadline,
        questions: attempt.exam.questions.map((q) => ({ id: q.id, questionOrder: q.position,
          content: q.content, questionType: q.questionType, options: q.options, points: q.score })),
        savedAnswers: attempt.answers }
      localStorage.setItem('online_exam_current_attempt', String(attempt.id))
      setSelected(null)
      onStartExam(exam, attempt)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể bắt đầu bài thi')
    }
  }

  return <div className="student-portal-page">
    <div className="content-top-bar"><h2>Kỳ thi đã công bố</h2></div>
    {loading && <p>Đang tải kỳ thi…</p>}
    {error && <div className="modal-alert" role="alert">{error}</div>}
    {!loading && exams.length === 0 && <p>Hiện chưa có kỳ thi đang mở.</p>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
      {exams.map((exam) => {
        const canStart = Date.now() >= Date.parse(exam.startTime) && Date.now() < Date.parse(exam.endTime)
        return <article className="table-card" key={exam.id} style={{ padding: 20 }}>
        <span className="class-badge-pill">Nhóm {exam.id}</span>
        <h3>{exam.title}</h3>
        <p>{exam.durationMinutes} phút · {exam.totalQuestions} câu · {exam.totalPoints} điểm</p>
        <p>Mở: {new Date(exam.startTime).toLocaleString()}</p>
        <button className="btn btn-teal" disabled={!canStart} onClick={() => { setSelected(exam); setPin(''); setError('') }}>{canStart ? 'Nhập PIN & vào thi' : 'Chưa đến giờ thi'}</button>
      </article>})}
    </div>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}>
      <div className="modal-content modal-content-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3 className="modal-title">Vào phòng thi</h3></div>
        <div className="modal-form"><p>{selected.title}</p><label htmlFor="exam-pin">Mã PIN</label>
          <input id="exam-pin" className="form-control" value={pin} onChange={(e) => setPin(e.target.value)} type="password" />
          {error && <div className="modal-alert" role="alert">{error}</div>}
        </div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setSelected(null)}>Hủy</button>
          <button className="btn btn-teal" onClick={() => void start()}>Bắt đầu</button></div>
      </div>
    </div>}
  </div>
}

function toStudentExam(exam: ExamView): StudentExam {
  return { id: exam.id, title: exam.title, subjectCode: `GROUP-${exam.teacherGroupId}`,
    subjectName: 'Kỳ thi trực tuyến', durationMinutes: exam.durationMinutes,
    totalQuestions: exam.totalQuestionCount, totalPoints: exam.totalPoints,
    startTime: exam.startTime, endTime: exam.endTime, pin: '', status: 'PUBLISHED' }
}
