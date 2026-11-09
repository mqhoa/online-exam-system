import { useState } from 'react'
import type { Exam } from './teacherMockData'
import { INITIAL_EXAMS, INITIAL_TEACHER_GROUPS } from './teacherMockData'

export function TeacherExamManagement() {
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS)
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [groupId, setGroupId] = useState(1)
  const [duration, setDuration] = useState(45)
  const [pin, setPin] = useState('123456')
  const [startTime, setStartTime] = useState('2026-11-15 08:00')
  const [endTime, setEndTime] = useState('2026-11-15 11:30')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const filteredExams = exams.filter((e) => {
    return selectedStatus === 'ALL' || e.status === selectedStatus
  })

  function handleOpenCreate() {
    setEditingExam(null)
    setTitle('')
    setDescription('')
    setGroupId(1)
    setDuration(45)
    setPin(String(Math.floor(100000 + Math.random() * 900000)))
    setStartTime('2026-11-15 08:00')
    setEndTime('2026-11-15 11:30')
    setIsModalOpen(true)
  }

  function handleOpenEdit(exam: Exam) {
    if (exam.status !== 'DRAFT') {
      alert('Theo quy tắc khóa đề: Đề thi đã công bố (PUBLISHED/CLOSED) không thể chỉnh sửa để bảo toàn dữ liệu bài thi của sinh viên!')
      return
    }
    setEditingExam(exam)
    setTitle(exam.title)
    setDescription(exam.description)
    setGroupId(exam.teacherGroupId)
    setDuration(exam.durationMinutes)
    setPin(exam.pin)
    setStartTime(exam.startTime)
    setEndTime(exam.endTime)
    setIsModalOpen(true)
  }

  function handlePublish(id: number) {
    const exam = exams.find((e) => e.id === id)
    if (!exam) return

    if (
      window.confirm(
        `Xác nhận công bố kỳ thi "${exam.title}"?\n\nLưu ý: Sau khi công bố, sinh viên có thể thấy đề thi và tham gia bằng mã PIN. Đề thi sẽ được khóa và không thể chỉnh sửa nội dung!`
      )
    ) {
      setExams((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'PUBLISHED' } : e))
      )
      showToast(`Đã công bố kỳ thi "${exam.title}"!`)
    }
  }

  function handleCloseExam(id: number) {
    const exam = exams.find((e) => e.id === id)
    if (!exam) return

    if (window.confirm(`Xác nhận đóng kỳ thi "${exam.title}"? Sinh viên sẽ không thể nộp thêm bài mới.`)) {
      setExams((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'CLOSED' } : e))
      )
      showToast(`Đã đóng kỳ thi "${exam.title}"!`)
    }
  }

  function handleDelete(id: number) {
    const exam = exams.find((e) => e.id === id)
    if (!exam) return

    if (exam.status !== 'DRAFT') {
      alert('Không thể xóa kỳ thi đã công bố hoặc đã hoàn thành!')
      return
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa kỳ thi nháp "${exam.title}"?`)) {
      setExams((prev) => prev.filter((e) => e.id !== id))
      showToast('Đã xóa kỳ thi nháp!')
    }
  }

  function handleSaveExam() {
    if (!title.trim()) {
      alert('Vui lòng nhập tên kỳ thi!')
      return
    }
    const group = INITIAL_TEACHER_GROUPS.find((g) => g.id === groupId)

    if (editingExam) {
      setExams((prev) =>
        prev.map((e) =>
          e.id === editingExam.id
            ? {
                ...e,
                title: title.trim(),
                description: description.trim(),
                teacherGroupId: groupId,
                subjectName: group ? `${group.subjectName} (${group.subjectCode})` : e.subjectName,
                durationMinutes: duration,
                pin: pin.trim(),
                startTime,
                endTime,
              }
            : e
        )
      )
      showToast('Đã lưu thông tin kỳ thi!')
    } else {
      const newExam: Exam = {
        id: Date.now(),
        teacherGroupId: groupId,
        subjectName: group ? `${group.subjectName} (${group.subjectCode})` : 'Môn học',
        title: title.trim(),
        description: description.trim(),
        durationMinutes: duration,
        pin: pin.trim(),
        status: 'DRAFT',
        totalQuestions: 25,
        totalPoints: 10.0,
        startTime,
        endTime,
      }
      setExams((prev) => [newExam, ...prev])
      showToast('Đã tạo kỳ thi mới ở trạng thái DRAFT!')
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
              <li className="breadcrumb-active">Quản lý kỳ thi</li>
            </ol>
          </nav>
        </div>

        <div className="action-buttons-group">
          <button type="button" className="action-btn btn-teal-action" onClick={handleOpenCreate}>
            <span className="btn-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </span>
            <span>Tạo kỳ thi mới</span>
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="table-card">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="search-filter-inputs">
            <div className="filter-select-wrapper">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="DRAFT">DRAFT (Bản nháp - Đang soạn)</option>
                <option value="PUBLISHED">PUBLISHED (Đã công bố - Đang mở)</option>
                <option value="CLOSED">CLOSED (Đã đóng)</option>
              </select>
            </div>
          </div>
          <div className="items-count-text">
            Tổng cộng: <strong>{filteredExams.length}</strong> kỳ thi
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="student-table">
            <thead>
              <tr>
                <th className="col-stt text-center">STT</th>
                <th>Tiêu đề kỳ thi</th>
                <th>Môn học</th>
                <th>Thời lượng</th>
                <th>Thời gian mở thi</th>
                <th>Mã PIN</th>
                <th>Trạng thái</th>
                <th className="col-action text-center" style={{ width: 180 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-data-cell">
                    Không có kỳ thi nào trong danh mục.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam, idx) => (
                  <tr key={exam.id}>
                    <td className="text-center text-muted font-weight-medium">{idx + 1}</td>
                    <td style={{ maxWidth: 240 }}>
                      <strong>{exam.title}</strong>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#718096' }}>
                        {exam.totalQuestions} câu hỏi · {exam.totalPoints} điểm
                      </p>
                    </td>
                    <td><span style={{ fontSize: 12.5, color: '#2d3748' }}>{exam.subjectName}</span></td>
                    <td><strong>{exam.durationMinutes}</strong> phút</td>
                    <td style={{ fontSize: 12.5, color: '#4a5568' }}>
                      {exam.startTime} → {exam.endTime}
                    </td>
                    <td>
                      <code style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                        {exam.pin}
                      </code>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 3,
                          textTransform: 'uppercase',
                          backgroundColor:
                            exam.status === 'PUBLISHED'
                              ? '#c6f6d5'
                              : exam.status === 'DRAFT'
                              ? '#feebc8'
                              : '#e2e8f0',
                          color:
                            exam.status === 'PUBLISHED'
                              ? '#22543d'
                              : exam.status === 'DRAFT'
                              ? '#7b341e'
                              : '#4a5568',
                        }}
                      >
                        {exam.status}
                      </span>
                    </td>
                    <td className="text-center actions-cell">
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        {exam.status === 'DRAFT' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-teal btn-sm"
                              onClick={() => handlePublish(exam.id)}
                              title="Công bố đề thi cho sinh viên làm"
                            >
                              Công bố
                            </button>
                            <button
                              type="button"
                              className="btn-row-action btn-row-edit"
                              onClick={() => handleOpenEdit(exam)}
                              title="Chỉnh sửa kỳ thi"
                            >
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="btn-row-action btn-row-delete"
                              onClick={() => handleDelete(exam.id)}
                              title="Xóa kỳ thi"
                            >
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                              </svg>
                            </button>
                          </>
                        )}
                        {exam.status === 'PUBLISHED' && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleCloseExam(exam.id)}
                            title="Đóng kỳ thi"
                          >
                            Đóng đề thi
                          </button>
                        )}
                        {exam.status === 'CLOSED' && (
                          <span style={{ fontSize: 12, color: '#a0aec0' }}>Đã hoàn thành</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create/Edit Exam */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingExam ? 'Chỉnh sửa kỳ thi' : 'Thiết lập kỳ thi mới'}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Tiêu đề kỳ thi *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: Thi giữa kỳ - Lập trình Web nâng cao"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Môn học / Nhóm giảng viên phụ trách</label>
                  <select
                    className="form-control"
                    value={groupId}
                    onChange={(e) => setGroupId(Number(e.target.value))}
                  >
                    {INITIAL_TEACHER_GROUPS.map((g) => (
                      <option key={g.id} value={g.id}>{g.name} ({g.subjectCode})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mã PIN vào thi (6 chữ số) *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Thời lượng làm bài (phút) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min={5}
                    max={180}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Thời gian bắt đầu</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="YYYY-MM-DD HH:mm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Thời gian kết thúc</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="YYYY-MM-DD HH:mm"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú / Hướng dẫn sinh viên</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Nhập ghi chú cho sinh viên khi tham gia kỳ thi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Hủy
              </button>
              <button type="button" className="btn btn-teal" onClick={handleSaveExam}>
                Lưu kỳ thi (DRAFT)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
