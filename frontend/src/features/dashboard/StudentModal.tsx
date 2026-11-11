import { useEffect, useState, type FormEvent } from 'react'
import type { Student } from './types'

type StudentModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (student: Omit<Student, 'id'>, existingId?: string) => Promise<void>
  studentToEdit?: Student | null
}

const COMMON_CLASSES = ['THH1525', 'KTTC125', 'CNTT01', 'QTKD02']

export function StudentModal({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
}: StudentModalProps) {
  const [code, setCode] = useState(studentToEdit?.code ?? '')
  const [fullName, setFullName] = useState(studentToEdit?.fullName ?? '')
  const [classesInput, setClassesInput] = useState(
    studentToEdit?.classes ? studentToEdit.classes.join(', ') : 'THH1525'
  )
  const [dateOfBirth, setDateOfBirth] = useState(studentToEdit?.dateOfBirth ?? '2000-01-01')
  const [email, setEmail] = useState(studentToEdit?.email ?? '')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if(!isOpen)return
    setCode(studentToEdit?.code??'');setFullName(studentToEdit?.fullName??'')
    setClassesInput(studentToEdit?.classes.join(', ')??'THH1525')
    setDateOfBirth(studentToEdit?.dateOfBirth??'2000-01-01');setEmail(studentToEdit?.email??'');setFormError(null)
  },[isOpen,studentToEdit])

  if (!isOpen) return null

  const isEditing = Boolean(studentToEdit)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    const trimmedCode = code.trim()
    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedCode) {
      setFormError('Vui lòng nhập Mã sinh viên')
      return
    }
    if (!trimmedName) {
      setFormError('Vui lòng nhập Họ và tên sinh viên')
      return
    }
    if (!trimmedEmail) {
      setFormError('Vui lòng nhập Email sinh viên')
      return
    }

    const parsedClasses = classesInput
      .split(/[,;\s]+/)
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0)

    if (parsedClasses.length === 0) {
      parsedClasses.push('THH1525')
    }

    setSaving(true)
    try { await onSave(
      {
        code: trimmedCode,
        fullName: trimmedName,
        classes: parsedClasses,
        dateOfBirth: dateOfBirth || '2000-01-01',
        email: trimmedEmail,
      },
      studentToEdit?.id
    );onClose() } catch(error) {setFormError(error instanceof Error?error.message:'Không thể lưu sinh viên')} finally {setSaving(false)}
  }

  function handleQuickClassToggle(className: string) {
    const currentClasses = classesInput
      .split(/[,;\s]+/)
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0)

    let updated: string[]
    if (currentClasses.includes(className)) {
      updated = currentClasses.filter((c) => c !== className)
    } else {
      updated = [...currentClasses, className]
    }
    setClassesInput(updated.join(', '))
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {isEditing ? 'Chỉnh sửa thông tin sinh viên' : 'Thêm sinh viên mới'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Đóng">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {formError && (
            <div className="modal-alert" role="alert">
              {formError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="student-code">Mã sinh viên *</label>
            <input
              id="student-code"
              type="text"
              className="form-control"
              placeholder="VD: 1651227671"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="student-name">Họ và tên *</label>
            <input
              id="student-name"
              type="text"
              className="form-control"
              placeholder="VD: Nguyễn Anh Long"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="student-class">
              Lớp (phân cách bằng dấu phẩy) *
            </label>
            <input
              id="student-class"
              type="text"
              className="form-control"
              placeholder="VD: THH1525, KTTC125"
              value={classesInput}
              onChange={(e) => setClassesInput(e.target.value)}
              required
            />
            <div className="quick-tags">
              <span className="quick-tags-label">Gợi ý nhanh:</span>
              {COMMON_CLASSES.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  className={`tag-suggestion ${classesInput.toUpperCase().includes(cls) ? 'tag-selected' : ''}`}
                  onClick={() => handleQuickClassToggle(cls)}
                >
                  +{cls}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="student-dob">Ngày sinh *</label>
            <input
              id="student-dob"
              type="date"
              className="form-control"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="student-email">Email *</label>
            <input
              id="student-email"
              type="email"
              className="form-control"
              placeholder="VD: sinhvien@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-teal" disabled={saving}>
              {saving?'Đang lưu…':isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
