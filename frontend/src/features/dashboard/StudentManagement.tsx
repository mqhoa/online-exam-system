import { useState, useMemo, useEffect } from 'react'
import type { Student } from './types'
import { StudentModal } from './StudentModal'
import { ImportExcelModal } from './ImportExcelModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { adminApi, type StudentImportResult } from '../admin/adminApi'

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [importCredentials, setImportCredentials] = useState<StudentImportResult['credentials']>([])

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filter & Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    void refreshStudents()
  }, [])

  async function refreshStudents() {
    setIsLoading(true)
    try {
      const rows = await adminApi.students()
      setStudents(rows.map((row) => ({ id: String(row.id), code: row.code, fullName: row.fullName,
        email: row.email, dateOfBirth: row.dateOfBirth ?? '', classes: row.classes, enabled: row.enabled })))
      setApiError('')
    } catch (error) { setApiError(error instanceof Error ? error.message : 'Không tải được danh sách sinh viên') }
    finally { setIsLoading(false) }
  }

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 3500)
  }

  // Extract all distinct classes for the filter dropdown
  const allClasses = useMemo(() => {
    const set = new Set<string>()
    students.forEach((s) => s.classes.forEach((c) => set.add(c)))
    return Array.from(set).sort()
  }, [students])

  // Filtered students
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return students.filter((student) => {
      const matchSearch =
        !q ||
        student.code.toLowerCase().includes(q) ||
        student.fullName.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        student.classes.some((c) => c.toLowerCase().includes(q))

      const matchClass =
        selectedClass === 'ALL' || student.classes.includes(selectedClass)

      return matchSearch && matchClass
    })
  }, [students, searchQuery, selectedClass])

  // Paginated students
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, currentPage, pageSize])



  // CRUD handlers
  async function handleSaveStudent(
    studentData: Omit<Student, 'id'>,
    existingId?: string
  ): Promise<void> {
    if (existingId) {
      await adminApi.updateStudent(Number(existingId), studentData)
      await refreshStudents()
      showToast(`Đã cập nhật sinh viên "${studentData.fullName}"`)
    } else {
      const created = await adminApi.createStudent(studentData)
      setImportCredentials([{username:studentData.code,initialPassword:created.initialPassword}])
      await refreshStudents()
      showToast(`Đã tạo tài khoản ${studentData.code}. Tải mật khẩu ban đầu ở khung phía trên.`)
    }
  }

  async function handleDeleteStudent(studentId: string) {
    const s = students.find((item) => item.id === studentId)
    const enable=s?.enabled===false
    await adminApi.setStudentEnabled(Number(studentId), enable)
    await refreshStudents()
    if (s) showToast(enable?`Đã mở lại tài khoản "${s.fullName}"`:`Đã vô hiệu hóa tài khoản "${s.fullName}"`)
  }

  async function handleImportStudents(file: File) {
    const result = await adminApi.importStudents(file)
    setImportCredentials(result.credentials)
    await refreshStudents()
    showToast(`Đã tạo ${result.importedCount} tài khoản sinh viên. Hãy tải danh sách mật khẩu ban đầu để bàn giao.`)
  }

  async function handleDownloadTemplate() { await adminApi.downloadStudentTemplate() }

  function downloadInitialPasswords() {
    const csv=['Tài khoản,Mật khẩu ban đầu',...importCredentials.map((item)=>`${item.username},${item.initialPassword}`)].join('\n')
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='student-initial-passwords.csv';link.click();URL.revokeObjectURL(url)
  }

  return (
    <div className="student-management-page">
      {/* Toast notification */}
      {toastMessage && (
        <div className="toast-notification" role="status">
          <span className="toast-icon">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
      {apiError && <div className="modal-alert" role="alert">{apiError}</div>}
      {importCredentials.length>0 && <div className="import-hint-box" role="status">
        Đã import {importCredentials.length} tài khoản. Mật khẩu chỉ hiển thị lần này.
        <button type="button" className="download-template-link" onClick={downloadInitialPasswords}>Tải thông tin đăng nhập ban đầu</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={()=>setImportCredentials([])}>Ẩn</button>
      </div>}

      {/* Top action row: Breadcrumb (left) & Action buttons (right) */}
      <div className="content-top-bar">
        <div className="breadcrumb-wrapper">
          <span className="breadcrumb-home-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </span>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb-list">
              <li><a href="#home" className="breadcrumb-link">Trang chủ</a></li>
              <li className="breadcrumb-separator">/</li>
              <li><span className="breadcrumb-link">Sinh Viên</span></li>
              <li className="breadcrumb-separator">/</li>
              <li className="breadcrumb-active" aria-current="page">Danh sách</li>
            </ol>
          </nav>
        </div>

        <div className="action-buttons-group">
          {/* Nút Tạo mới */}
          <button
            type="button"
            className="action-btn btn-teal-action"
            onClick={() => {
              setStudentToEdit(null)
              setIsAddEditOpen(true)
            }}
          >
            <span className="btn-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </span>
            <span>Tạo mới</span>
          </button>

          {/* Nút Import Excel */}
          <button
            type="button"
            className="action-btn btn-green-action"
            onClick={() => setIsImportOpen(true)}
          >
            <span className="btn-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="17" />
                <line x1="16" y1="13" x2="8" y2="17" />
              </svg>
            </span>
            <span>Import Excel</span>
          </button>

          {/* Nút Tải file mẫu */}
          <button
            type="button"
            className="action-btn btn-yellow-action"
            onClick={handleDownloadTemplate}
          >
            <span className="btn-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
              </svg>
            </span>
            <span>Tải file mẫu</span>
          </button>
        </div>
      </div>

      {/* Main card containing table & filters */}
      <div className="table-card">
        {/* Search & Filter Toolbar */}
        <div className="table-toolbar">
          <div className="search-filter-inputs">
            <div className="search-box">
              <span className="search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm mã SV, họ tên, email..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                  aria-label="Xóa tìm kiếm"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="filter-select-wrapper">
              <label htmlFor="class-filter" className="sr-only">Lọc theo lớp</label>
              <select
                id="class-filter"
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
                className="filter-select"
              >
                <option value="ALL">Tất cả lớp ({students.length})</option>
                {allClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Lớp {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-toolbar-actions" />
        </div>

        {/* Data Table */}
        <div className="table-responsive">
          <table className="student-table">
            <thead>
              <tr>
                <th className="col-stt text-center">STT</th>
                <th className="col-code">Mã sinh viên</th>
                <th className="col-name">Họ và tên</th>
                <th className="col-class">Lớp</th>
                <th className="col-dob">Ngày Sinh</th>
                <th className="col-email">Email</th>
                <th className="col-action text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="no-data-cell">Đang tải danh sách sinh viên…</td></tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-data-cell">
                    Không tìm thấy sinh viên nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student, index) => {
                  const stt = (currentPage - 1) * pageSize + index + 1
                  return (
                    <tr key={student.id}>
                      <td className="text-center text-muted font-weight-medium">{stt}</td>
                      <td className="student-code-cell">{student.code}</td>
                      <td className="student-name-cell">{student.fullName}</td>
                      <td className="student-classes-cell">
                        <div className="badge-classes-container">
                          {student.classes.map((cls) => (
                            <span key={cls} className="class-badge-pill">
                              {cls}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="student-dob-cell">{student.dateOfBirth}</td>
                      <td className="student-email-cell">{student.email}</td>
                      <td className="text-center actions-cell">
                        <div className="action-buttons-cell">
                          {/* Edit button: Blue square with pencil */}
                          <button
                            type="button"
                            className="btn-row-action btn-row-edit"
                            onClick={() => {
                              setStudentToEdit(student)
                              setIsAddEditOpen(true)
                            }}
                            title={`Chỉnh sửa ${student.fullName}`}
                            aria-label={`Chỉnh sửa ${student.fullName}`}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                          </button>

                          {/* Delete button: Red square with trash bin */}
                          <button
                            type="button"
                            className="btn-row-action btn-row-delete"
                            onClick={() => {
                              setStudentToDelete(student)
                              setIsDeleteOpen(true)
                            }}
                            title={student.enabled===false?`Mở lại ${student.fullName}`:`Vô hiệu hóa ${student.fullName}`}
                            aria-label={student.enabled===false?`Mở lại ${student.fullName}`:`Vô hiệu hóa ${student.fullName}`}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="table-footer-bar">
          <div className="table-footer-left">
            <span className="items-count-text">
              Hiển thị <strong>{filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> -{' '}
              <strong>{Math.min(currentPage * pageSize, filteredStudents.length)}</strong> trên tổng số{' '}
              <strong>{filteredStudents.length}</strong> sinh viên
            </span>

            <div className="page-size-selector">
              <label htmlFor="page-size-select">Hiển thị:</label>
              <select
                id="page-size-select"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="page-size-dropdown"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>dòng / trang</span>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                « Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`pagination-page-btn ${pageNum === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau »
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <StudentModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false)
          setStudentToEdit(null)
        }}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
      />

      {/* Import Excel Modal */}
      <ImportExcelModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportStudents}
        onDownloadTemplate={handleDownloadTemplate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        student={studentToDelete}
        onClose={() => {
          setIsDeleteOpen(false)
          setStudentToDelete(null)
        }}
        onConfirm={handleDeleteStudent}
      />
    </div>
  )
}
