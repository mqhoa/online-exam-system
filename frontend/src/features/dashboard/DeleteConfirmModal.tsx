import { useState } from 'react'
import type { Student } from './types'

type DeleteConfirmModalProps = {
  isOpen: boolean
  student: Student | null
  onClose: () => void
  onConfirm: (studentId: string) => Promise<void>
}

export function DeleteConfirmModal({
  isOpen,
  student,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')
  if (!isOpen || !student) return null

  async function confirm(){if(!student)return;setSaving(true);setError('');try{await onConfirm(student.id);onClose()}catch(e){setError(e instanceof Error?e.message:'Không thể vô hiệu hóa tài khoản')}finally{setSaving(false)}}

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title text-danger">{student.enabled===false?'Mở lại tài khoản sinh viên':'Vô hiệu hóa tài khoản sinh viên'}</h3>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Đóng">
            &times;
          </button>
        </div>

        <div className="modal-body-padding">
          <p>
            Bạn có chắc chắn muốn {student.enabled===false?'mở lại':'vô hiệu hóa'} tài khoản <strong>{student.fullName}</strong> (Mã sinh viên:{' '}
            <code>{student.code}</code>)? Tài khoản sẽ không thể đăng nhập.
          </p>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 8 }}>
            {student.enabled===false?'Tài khoản sẽ đăng nhập được trở lại.':'Dữ liệu sinh viên và lịch sử thi vẫn được giữ nguyên.'}
          </p>
          {error&&<div className="modal-alert" role="alert">{error}</div>}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={saving}
            onClick={() => void confirm()}
          >
            {saving?'Đang xử lý…':student.enabled===false?'Mở lại tài khoản':'Vô hiệu hóa'}
          </button>
        </div>
      </div>
    </div>
  )
}
