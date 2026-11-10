import { useEffect, useState } from 'react'
import { examApi, type ExamView, type ResultView } from '../exam/examApi'

export function TeacherExamResults() {
  const [exams, setExams] = useState<ExamView[]>([])
  const [examId, setExamId] = useState<number | null>(null)
  const [results, setResults] = useState<ResultView[]>([])
  const [error, setError] = useState('')
  useEffect(() => { examApi.list().then((items) => { setExams(items); if (items[0]) setExamId(items[0].id) })
    .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Không tải được kỳ thi')) }, [])
  useEffect(() => { if (examId === null) return; examApi.results(examId).then(setResults)
    .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Không tải được kết quả')) }, [examId])
  const selected = exams.find((exam) => exam.id === examId)
  const average = results.length ? results.reduce((sum, r) => sum + (r.score ?? 0), 0) / results.length : 0
  function exportCsv() {
    const rows = [['Mã sinh viên', 'Họ tên', 'Trạng thái', 'Điểm', 'Tổng điểm', 'Thời gian nộp'],
      ...results.map((r) => [r.studentUsername, r.studentName, r.status, String(r.score ?? 0), String(r.totalScore), r.submittedAt ?? ''])]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
    link.download = `results-${selected?.id ?? 'exam'}.csv`; link.click(); URL.revokeObjectURL(link.href)
  }
  return <section className="teacher-module-page">
    <div className="content-top-bar"><div><h2>Kết quả kỳ thi</h2><p>Điểm được tính ở backend và đọc từ attempt đã nộp.</p></div>
      <button className="btn btn-teal" disabled={!results.length} onClick={exportCsv}>Xuất CSV</button></div>
    {error && <div className="modal-alert" role="alert">{error}</div>}
    <div className="table-card" style={{ padding: 16 }}><label>Kỳ thi <select className="form-control" value={examId ?? ''} onChange={(e) => setExamId(Number(e.target.value))}>
      {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title}</option>)}</select></label>
      <p>{results.length} bài nộp · Điểm trung bình {average.toFixed(2)}</p>
      <div className="table-responsive"><table className="student-table"><thead><tr><th>Sinh viên</th><th>Trạng thái</th><th>Điểm</th><th>Thời gian nộp</th></tr></thead>
        <tbody>{results.map((result) => <tr key={result.attemptId}><td>{result.studentName} ({result.studentUsername})</td><td>{result.status}</td>
          <td>{result.score ?? 0} / {result.totalScore}</td><td>{result.submittedAt ? new Date(result.submittedAt).toLocaleString() : '—'}</td></tr>)}
          {!results.length && <tr><td colSpan={4}>Chưa có bài nộp.</td></tr>}</tbody></table></div>
    </div>
  </section>
}
