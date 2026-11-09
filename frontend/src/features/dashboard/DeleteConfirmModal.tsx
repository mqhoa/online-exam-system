import type { Student } from './types'

type DeleteConfirmModalProps = {
  isOpen: boolean
  student: Student | null
  onClose: () => void
  onConfirm: (studentId: string) => void
}

export function DeleteConfirmModal({
  isOpen,
  student,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen || !student) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title text-danger">Xác nhận xóa sinh viên</h3>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Đóng">
            &times;
          </button>
        </div>

        <div className="modal-body-padding">
          <p>
            Bạn có chắc chắn muốn xóa sinh viên <strong>{student.fullName}</strong> (Mã sinh viên:{' '}
            <code>{student.code}</code>) khỏi danh sách?
          </p>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 8 }}>
            Hành động này sẽ xóa dữ liệu sinh viên khỏi hệ thống.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onConfirm(student.id)
              onClose()
            }}
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  )
}
