import { useEffect, useState } from 'react'
import type { Question, QuestionOption } from './teacherMockData'
import { examApi, csrfHeaders } from '../exam/examApi'
import { authApi } from '../auth/api/authApi'

export function TeacherQuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [groups, setGroups] = useState<Array<{ id: number; name: string }>>([])
  const [selectedGroup, setSelectedGroup] = useState<number>(0)
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal add/edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [formContent, setFormContent] = useState('')
  const [formType, setFormType] = useState<'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SHORT_ANSWER'>('SINGLE_CHOICE')
  const [formGroupId, setFormGroupId] = useState(1)
  const [formDifficulty, setFormDifficulty] = useState<'Dễ' | 'Trung bình' | 'Khó'>('Trung bình')
  const [formOptions, setFormOptions] = useState<Array<{ content: string; correct: boolean }>>([
    { content: '', correct: true },
    { content: '', correct: false },
    { content: '', correct: false },
    { content: '', correct: false },
  ])
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => { examApi.groups().then((items) => { setGroups(items); if (items[0]) setFormGroupId(items[0].id) })
    .catch((error: unknown) => alert(error instanceof Error ? error.message : 'Không tải được nhóm')) }, [])

  useEffect(() => {
    if (!groups.length) return
    Promise.all(groups.map(async (group) => {
      const response = await fetch(`/api/questions?teacherGroupId=${group.id}`, { credentials: 'include' })
      if (!response.ok) throw new Error('Không tải được ngân hàng câu hỏi')
      return response.json() as Promise<Array<{ id: number; teacherGroupId: number; content: string; questionType: Question['questionType']; createdAt: string; options: QuestionOption[] }>>
    })).then((batches) => setQuestions(batches.flat().map((q) => ({ ...q,
      teacherGroupName: groups.find((g) => g.id === q.teacherGroupId)?.name ?? '',
      difficulty: 'Trung bình', points: 0.5 }))))
      .catch((error: unknown) => alert(error instanceof Error ? error.message : 'Không tải được câu hỏi'))
  }, [groups])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const filteredQuestions = questions.filter((q) => {
    const matchGroup = selectedGroup === 0 || q.teacherGroupId === selectedGroup
    const matchType = selectedType === 'ALL' || q.questionType === selectedType
    const matchSearch =
      !searchQuery ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some((o) => o.content.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchGroup && matchType && matchSearch
  })

  function handleOpenAdd() {
    setEditingQuestion(null)
    setFormContent('')
    setFormType('SINGLE_CHOICE')
    setFormGroupId(1)
    setFormDifficulty('Trung bình')
    setFormOptions([
      { content: '', correct: true },
      { content: '', correct: false },
      { content: '', correct: false },
      { content: '', correct: false },
    ])
    setIsModalOpen(true)
  }

  function handleOpenEdit(q: Question) {
    setEditingQuestion(q)
    setFormContent(q.content)
    setFormType(q.questionType)
    setFormGroupId(q.teacherGroupId)
    setFormDifficulty(q.difficulty)
    setFormOptions(q.options.map((o) => ({ content: o.content, correct: o.correct })))
    setIsModalOpen(true)
  }

  function handleDelete(id: number) {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng câu hỏi?')) {
      fetch(`/api/questions/${id}`, { method: 'DELETE', credentials: 'include', headers: csrfHeaders() }).then((response) => {
        if (!response.ok) throw new Error('Không thể xóa câu hỏi')
        setQuestions((prev) => prev.filter((q) => q.id !== id))
        showToast('Đã xóa câu hỏi')
      }).catch((error: unknown) => alert(error instanceof Error ? error.message : 'Không thể xóa câu hỏi'))
    }
  }

  function handleOptionCorrectChange(index: number, isCorrect: boolean) {
    if (formType === 'SINGLE_CHOICE') {
      setFormOptions((prev) =>
        prev.map((opt, i) => ({
          ...opt,
          correct: i === index,
        }))
      )
    } else {
      setFormOptions((prev) =>
        prev.map((opt, i) => (i === index ? { ...opt, correct: isCorrect } : opt))
      )
    }
  }

  async function handleSaveQuestion() {
    if (!formContent.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!')
      return
    }

    const validOptions: QuestionOption[] = formOptions
      .filter((o) => o.content.trim().length > 0)
      .map((o, idx) => ({
        id: Date.now() + idx,
        content: o.content.trim(),
        correct: formType === 'SHORT_ANSWER' ? true : o.correct,
        position: idx + 1,
      }))

    if (formType !== 'SHORT_ANSWER' && validOptions.length < 2) {
      alert('Câu hỏi trắc nghiệm cần ít nhất 2 đáp án!')
      return
    }

    if (!validOptions.some((o) => o.correct)) {
      alert('Vui lòng đánh dấu ít nhất 1 đáp án đúng!')
      return
    }

    const user = await authApi.getCurrentUser()
    if (!user) { alert('Phiên đăng nhập đã hết hạn'); return }
    const payload = { content: formContent.trim(), questionType: formType,
      options: validOptions.map((option) => ({ content: option.content, correct: option.correct })) }
    let saved: { id: number; options: QuestionOption[] }
    try {
      const response = await fetch(editingQuestion ? `/api/questions/${editingQuestion.id}` : '/api/questions', {
        method: editingQuestion ? 'PUT' : 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        body: JSON.stringify(editingQuestion ? payload : { ...payload, teacherGroupId: formGroupId, createdBy: user.id }),
      })
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? 'Không thể lưu câu hỏi')
      saved = await response.json() as typeof saved
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Không thể lưu câu hỏi')
      return
    }
    const group = groups.find((g) => g.id === formGroupId)

    if (editingQuestion) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                content: formContent.trim(),
                questionType: formType,
                teacherGroupId: formGroupId,
                teacherGroupName: group ? group.name : q.teacherGroupName,
                difficulty: formDifficulty,
                options: saved.options,
              }
            : q
        )
      )
      showToast('Đã cập nhật câu hỏi!')
    } else {
      const newQ: Question = {
        id: saved.id,
        content: formContent.trim(),
        questionType: formType,
        teacherGroupId: formGroupId,
        teacherGroupName: group ? group.name : 'Nhóm chung',
        difficulty: formDifficulty,
        points: formType === 'SINGLE_CHOICE' ? 0.25 : 0.5,
        createdAt: new Date().toISOString(),
        options: saved.options,
      }
      setQuestions((prev) => [newQ, ...prev])
      showToast('Đã thêm mới câu hỏi vào ngân hàng!')
    }

    setIsModalOpen(false)
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
              <li className="breadcrumb-active">Ngân hàng câu hỏi</li>
            </ol>
          </nav>
        </div>

        <div className="action-buttons-group">
          <button type="button" className="action-btn btn-teal-action" onClick={handleOpenAdd}>
            <span className="btn-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </span>
            <span>Thêm câu hỏi</span>
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="table-card">
        {/* Filters */}
        <div className="table-toolbar">
          <div className="search-filter-inputs">
            <div className="search-box">
              <span className="search-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Tìm nội dung câu hỏi, đáp án..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-select-wrapper">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(Number(e.target.value))}
                className="filter-select"
              >
                <option value={0}>Tất cả nhóm môn học</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-select-wrapper">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">Tất cả loại câu hỏi</option>
                <option value="SINGLE_CHOICE">Single Choice (1 đáp án)</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice (Nhiều đáp án)</option>
                <option value="SHORT_ANSWER">Short Answer (Câu ngắn)</option>
              </select>
            </div>
          </div>
          <div className="items-count-text">
            Tổng cộng: <strong>{filteredQuestions.length}</strong> câu hỏi
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="student-table">
            <thead>
              <tr>
                <th className="col-stt text-center">STT</th>
                <th>Nội dung câu hỏi</th>
                <th>Loại câu</th>
                <th>Nhóm môn học</th>
                <th>Độ khó</th>
                <th>Các lựa chọn / Đáp án đúng</th>
                <th className="col-action text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-data-cell">
                    Không tìm thấy câu hỏi phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q, idx) => (
                  <tr key={q.id}>
                    <td className="text-center text-muted font-weight-medium">{idx + 1}</td>
                    <td style={{ maxWidth: 280, fontWeight: 500 }}>
                      <p style={{ margin: 0 }}>{q.content}</p>
                    </td>
                    <td>
                      <span className="class-badge-pill" style={{ fontSize: 10 }}>
                        {q.questionType === 'SINGLE_CHOICE'
                          ? '1 Đáp án'
                          : q.questionType === 'MULTIPLE_CHOICE'
                          ? 'Nhiều đáp án'
                          : 'Trả lời ngắn'}
                      </span>
                    </td>
                    <td><span style={{ fontSize: 12.5, color: '#334e68' }}>{q.teacherGroupName}</span></td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 3,
                          backgroundColor:
                            q.difficulty === 'Dễ'
                              ? '#e6fffa'
                              : q.difficulty === 'Trung bình'
                              ? '#fefcbf'
                              : '#fed7d7',
                          color:
                            q.difficulty === 'Dễ'
                              ? '#234e52'
                              : q.difficulty === 'Trung bình'
                              ? '#744210'
                              : '#742a2a',
                        }}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5 }}>
                        {q.options.map((opt) => (
                          <li
                            key={opt.id}
                            style={{
                              color: opt.correct ? '#2b6cb0' : '#4a5568',
                              fontWeight: opt.correct ? 700 : 400,
                            }}
                          >
                            {opt.content} {opt.correct && '✓'}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="text-center actions-cell">
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="btn-row-action btn-row-edit"
                          onClick={() => handleOpenEdit(q)}
                          title="Sửa câu hỏi"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="btn-row-action btn-row-delete"
                          onClick={() => handleDelete(q.id)}
                          title="Xóa câu hỏi"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Question */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm mới câu hỏi vào ngân hàng'}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Nhóm môn học</label>
                  <select
                    className="form-control"
                    value={formGroupId}
                    onChange={(e) => setFormGroupId(Number(e.target.value))}
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Loại câu hỏi</label>
                  <select
                    className="form-control"
                    value={formType}
                    onChange={(e) => {
                      const val = e.target.value as 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SHORT_ANSWER'
                      setFormType(val)
                      if (val === 'SHORT_ANSWER') {
                        setFormOptions([{ content: '', correct: true }])
                      }
                    }}
                  >
                    <option value="SINGLE_CHOICE">Single Choice (1 đáp án)</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice (Nhiều đáp án)</option>
                    <option value="SHORT_ANSWER">Short Answer (Câu ngắn)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Độ khó</label>
                  <select
                    className="form-control"
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as 'Dễ' | 'Trung bình' | 'Khó')}
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Nội dung câu hỏi *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Nhập nội dung câu hỏi..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  style={{ height: 'auto', padding: 8 }}
                />
              </div>

              <div className="form-group">
                <label>
                  {formType === 'SHORT_ANSWER'
                    ? 'Các đáp án mẫu chấp nhận (chuẩn hóa tự động):'
                    : 'Các lựa chọn (Tích chọn đáp án đúng):'}
                </label>
                {formOptions.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    {formType === 'SINGLE_CHOICE' && (
                      <input
                        type="radio"
                        name="correct-opt"
                        checked={opt.correct}
                        onChange={() => handleOptionCorrectChange(idx, true)}
                        title="Đánh dấu đáp án đúng"
                      />
                    )}
                    {formType === 'MULTIPLE_CHOICE' && (
                      <input
                        type="checkbox"
                        checked={opt.correct}
                        onChange={(e) => handleOptionCorrectChange(idx, e.target.checked)}
                        title="Đánh dấu đáp án đúng"
                      />
                    )}
                    <input
                      type="text"
                      className="form-control"
                      style={{ flex: 1 }}
                      placeholder={`Đáp án ${idx + 1}`}
                      value={opt.content}
                      onChange={(e) => {
                        const val = e.target.value
                        setFormOptions((prev) =>
                          prev.map((o, i) => (i === idx ? { ...o, content: val } : o))
                        )
                      }}
                    />
                    {formOptions.length > 1 && (
                      <button
                        type="button"
                        style={{ border: 0, background: 'transparent', color: '#e53e3e', cursor: 'pointer' }}
                        onClick={() => setFormOptions((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: 'flex-start', marginTop: 8 }}
                  onClick={() =>
                    setFormOptions((prev) => [
                      ...prev,
                      { content: '', correct: formType === 'SHORT_ANSWER' },
                    ])
                  }
                >
                  + Thêm lựa chọn
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Hủy
              </button>
              <button type="button" className="btn btn-teal" onClick={handleSaveQuestion}>
                Lưu câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
