import { useEffect, useState } from 'react'
import { examApi, type ExamView } from '../exam/examApi'

type BankQuestion = { id: number; content: string; questionType: string; options: { id: number; content: string; correct: boolean; position: number }[] }
const localDateTime = (hoursFromNow: number) => {
  const date = new Date(Date.now() + hoursFromNow * 3600000)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

export function TeacherExamManagement() {
  const [exams, setExams] = useState<ExamView[]>([])
  const [questions, setQuestions] = useState<BankQuestion[]>([])
  const [groups, setGroups] = useState<Array<{ id: number; name: string; subjectCode: string }>>([])
  const [groupId, setGroupId] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(45)
  const [pin, setPin] = useState('')
  const [startTime, setStartTime] = useState(localDateTime(1))
  const [endTime, setEndTime] = useState(localDateTime(3))
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [editing, setEditing] = useState<ExamView | null>(null)
  const [status, setStatus] = useState('ALL')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function refresh() {
    setExams(await examApi.list())
  }
  useEffect(() => {
    void refresh().catch((e: unknown) => setError(e instanceof Error ? e.message : 'Không tải được kỳ thi'))
    examApi.groups().then((items) => { setGroups(items); if (items[0]) setGroupId(items[0].id) })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Không tải được nhóm giảng viên'))
  }, [])
  useEffect(() => {
    fetch(`/api/questions?teacherGroupId=${groupId}`, { credentials: 'include' })
      .then(async (r) => { if (!r.ok) throw new Error('Không tải được câu hỏi trong nhóm'); return r.json() as Promise<BankQuestion[]> })
      .then(setQuestions).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Không tải được câu hỏi'))
  }, [groupId])

  function openCreate() {
    setEditing(null); setTitle(''); setDescription(''); setDuration(45); setPin(String(Math.floor(100000 + Math.random() * 900000)))
    setStartTime(localDateTime(1)); setEndTime(localDateTime(3)); setSelectedIds([]); setError('')
  }
  function openEdit(exam: ExamView) {
    setEditing(exam); setTitle(exam.title); setDescription(exam.description ?? ''); setDuration(exam.durationMinutes)
    setPin(exam.pin ?? ''); setStartTime(toLocalInput(exam.startTime)); setEndTime(toLocalInput(exam.endTime));
    setGroupId(exam.teacherGroupId); setSelectedIds(exam.questions.map((q) => q.id)); setError('')
  }
  function payload() {
    return { teacherGroupId: groupId, title, description, startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(), durationMinutes: duration, pin,
      questions: selectedIds.map((questionId) => ({ questionId, score: 1 })) }
  }
  async function save() {
    setError('')
    if (!title.trim() || selectedIds.length === 0) { setError('Nhập tiêu đề và chọn ít nhất một câu hỏi.'); return }
    setSaving(true)
    try {
      if (editing) await examApi.update(editing.id, payload())
      else await examApi.create(payload())
      await refresh(); setEditing(null); setTitle(''); setPin('')
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể lưu kỳ thi') }
    finally { setSaving(false) }
  }
  async function changeStatus(exam: ExamView, action: 'publish' | 'close') {
    try { action === 'publish' ? await examApi.publish(exam.id) : await examApi.close(exam.id); await refresh() }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thể cập nhật trạng thái') }
  }
  const visible = exams.filter((exam) => status === 'ALL' || exam.status === status)

  return <section className="teacher-module-page">
    <div className="content-top-bar"><div><h2>Quản lý kỳ thi</h2><p>Tạo đề từ ngân hàng câu hỏi, lưu bản nháp và công bố cho sinh viên.</p></div>
      <button className="btn btn-teal" onClick={openCreate}>Tạo kỳ thi</button></div>
    {error && <div className="modal-alert" role="alert">{error}</div>}
    <div className="table-card" style={{ padding: 16, marginBottom: 20 }}>
      <label>Trạng thái <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="ALL">Tất cả</option><option value="DRAFT">Bản nháp</option><option value="PUBLISHED">Đã công bố</option><option value="CLOSED">Đã đóng</option>
      </select></label>
      <div className="table-responsive"><table className="student-table"><thead><tr><th>Kỳ thi</th><th>Thời gian</th><th>Thời lượng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>{visible.map((exam) => <tr key={exam.id}><td><strong>{exam.title}</strong><br />{exam.questions.length} câu · PIN {exam.status === 'DRAFT' ? 'được cấu hình' : 'đã phát hành'}</td>
          <td>{new Date(exam.startTime).toLocaleString()}<br />đến {new Date(exam.endTime).toLocaleString()}</td><td>{exam.durationMinutes} phút</td><td>{exam.status}</td>
          <td>{exam.status === 'DRAFT' && <><button className="btn btn-teal btn-sm" onClick={() => void changeStatus(exam, 'publish')}>Công bố</button> <button className="btn btn-secondary btn-sm" onClick={() => openEdit(exam)}>Sửa</button></>}
            {exam.status === 'PUBLISHED' && <button className="btn btn-secondary btn-sm" onClick={() => void changeStatus(exam, 'close')}>Đóng thi</button>}</td></tr>)}
          {visible.length === 0 && <tr><td colSpan={5}>Chưa có kỳ thi phù hợp.</td></tr>}</tbody></table></div>
    </div>
    {(editing || title || pin) && <div className="table-card" style={{ padding: 20 }}>
      <h3>{editing ? 'Sửa bản nháp' : 'Tạo kỳ thi'}</h3>
      <div className="modal-form">
        <label>Tiêu đề<input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label>Nhóm giảng viên<select className="form-control" value={groupId} onChange={(e) => { setGroupId(Number(e.target.value)); setSelectedIds([]) }}>{groups.map((g) => <option value={g.id} key={g.id}>{g.name}</option>)}</select></label>
        <label>Mô tả<textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label>PIN<input className="form-control" value={pin} onChange={(e) => setPin(e.target.value)} /></label>
        <label>Thời lượng (phút)<input type="number" min={1} className="form-control" value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></label>
        <label>Bắt đầu<input type="datetime-local" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></label>
        <label>Kết thúc nhận bài<input type="datetime-local" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></label>
        <fieldset><legend>Chọn câu hỏi (mỗi câu 1 điểm)</legend>{questions.map((q) => <label key={q.id} style={{ display: 'block', margin: '8px 0' }}>
          <input type="checkbox" checked={selectedIds.includes(q.id)} onChange={(e) => setSelectedIds((ids) => e.target.checked ? [...ids, q.id] : ids.filter((id) => id !== q.id))} /> {q.content}
        </label>)}{questions.length === 0 && <p>Nhóm này chưa có câu hỏi khả dụng.</p>}</fieldset>
      </div>
      <button className="btn btn-teal" disabled={saving} onClick={() => void save()}>{saving ? 'Đang lưu…' : 'Lưu bản nháp'}</button>
      <button className="btn btn-secondary" onClick={() => { setEditing(null); setTitle(''); setPin('') }}>Hủy</button>
    </div>}
  </section>
}

function toLocalInput(value: string) {
  const date = new Date(value); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16)
}
