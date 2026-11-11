import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { adminApi } from '../admin/adminApi'

type ImportExcelModalProps = {
  isOpen: boolean
  onClose: () => void
  onImport: (file: File) => Promise<void>
  onDownloadTemplate: () => void | Promise<void>
}

type ParsedRow = {
  code: string
  fullName: string
  classes: string[]
  dateOfBirth: string
  email: string
  isValid: boolean
  error?: string
}

export function ImportExcelModal({
  isOpen,
  onClose,
  onImport,
  onDownloadTemplate,
}: ImportExcelModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload')
  const [fileName, setFileName] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [pasteContent, setPasteContent] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  function resetState() {
    setFileName(null)
    setSelectedFile(null)
    setParsedRows([])
    setPasteContent('')
    setParseError(null)
  }

  function handleClose() {
    resetState()
    onClose()
  }

  function parseCsvContent(text: string) {
    try {
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

      if (lines.length < 2) {
        setParseError('Tệp không có dữ liệu hoặc chỉ có dòng tiêu đề.')
        setParsedRows([])
        return
      }

      // Check delimiter: comma, semicolon, tab
      const firstLine = lines[0]
      let delimiter = ','
      if (firstLine.includes('\t')) delimiter = '\t'
      else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';'

      // Detect header indexes
      const headers = lines[0]
        .split(delimiter)
        .map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase())

      let codeIdx = headers.findIndex((h) => h.includes('mã') || h.includes('code') || h.includes('mssv'))
      let nameIdx = headers.findIndex((h) => h.includes('họ') || h.includes('tên') || h.includes('name'))
      let classIdx = headers.findIndex((h) => h.includes('lớp') || h.includes('class'))
      let dobIdx = headers.findIndex((h) => h.includes('sinh') || h.includes('dob') || h.includes('birth'))
      let emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('thư'))

      // Fallbacks if standard headers not found (e.g. row 0 is STT, Mã, Tên, Lớp, Ngày sinh, Email)
      if (codeIdx === -1 && headers.length >= 6) {
        codeIdx = 1
        nameIdx = 2
        classIdx = 3
        dobIdx = 4
        emailIdx = 5
      } else if (codeIdx === -1 && headers.length >= 5) {
        codeIdx = 0
        nameIdx = 1
        classIdx = 2
        dobIdx = 3
        emailIdx = 4
      }

      const rows: ParsedRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        // Basic csv line split handling quotes
        const cols = line.split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim())

        const code = (cols[codeIdx] ?? '').trim()
        const fullName = (cols[nameIdx] ?? '').trim()
        const rawClass = (cols[classIdx] ?? '').trim()
        const dateOfBirth = (cols[dobIdx] ?? '').trim()
        const email = (cols[emailIdx] ?? '').trim()

        if (!code && !fullName && !email) continue

        const classes = rawClass
          ? rawClass
              .split(/[/;,+]+/)
              .map((c) => c.trim().toUpperCase())
              .filter((c) => c.length > 0)
          : ['THH1525']

        const isValid = Boolean(code && fullName && /^\S+@\S+\.\S+$/.test(email) && /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth))
        const error = !code
          ? 'Thiếu mã SV'
          : !fullName
          ? 'Thiếu họ tên'
          : !/^\S+@\S+\.\S+$/.test(email)
          ? 'Email không hợp lệ'
          : !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)
          ? 'Ngày sinh phải theo yyyy-MM-dd'
          : undefined

        rows.push({
          code,
          fullName,
          classes: classes.length > 0 ? classes : ['THH1525'],
          dateOfBirth,
          email,
          isValid,
          error,
        })
      }

      if (rows.length === 0) {
        setParseError('Không tìm thấy dòng dữ liệu sinh viên hợp lệ trong tệp.')
      } else {
        setParseError(null)
      }
      setParsedRows(rows)
    } catch {
      setParseError('Không thể phân tích dữ liệu tệp. Vui lòng kiểm tra định dạng CSV/Excel.')
      setParsedRows([])
    }
  }

  async function handleFileSelected(file: File) {
    setFileName(file.name)
    setSelectedFile(file)
    if (/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setParseError(null)
      try {
        const rows = await adminApi.previewStudents(file)
        setParsedRows(rows.map((row) => ({ code: row.code, fullName: row.fullName, classes: row.classes,
          dateOfBirth: row.dateOfBirth ?? '', email: row.email, isValid: row.valid,
          error: row.errors.join(', ') || undefined })))
      } catch (error) {
        setParseError(error instanceof Error ? error.message : 'Không đọc được tệp Excel')
        setParsedRows([])
      }
      return
    }
    setParseError('Chỉ hỗ trợ .xlsx, .xls hoặc .csv')
    setParsedRows([])
  }

  function onFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelected(file)
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelected(file)
    }
  }

  async function handlePasteParse() {
    if (!pasteContent.trim()) {
      setParseError('Vui lòng dán dữ liệu vào ô trước khi phân tích.')
      return
    }
    setSelectedFile(null)
    parseCsvContent(pasteContent)
    try {
      const rows=await adminApi.previewStudents(new File([pasteContent],'pasted-students.csv',{type:'text/csv'}))
      setParsedRows(rows.map((row)=>({code:row.code,fullName:row.fullName,classes:row.classes,dateOfBirth:row.dateOfBirth??'',email:row.email,isValid:row.valid,error:row.errors.join(', ')||undefined})))
      setParseError(null)
    } catch(error) {setParseError(error instanceof Error?error.message:'Không phân tích được dữ liệu đã dán')}
  }

  async function handleConfirmImport() {
    if (validCount === 0) return
    const file = selectedFile ?? new File([pasteContent], 'student-list.csv', { type: 'text/csv' })
    setIsImporting(true)
    try { await onImport(file); handleClose() }
    catch (error) { setParseError(error instanceof Error ? error.message : 'Import sinh viên thất bại') }
    finally { setIsImporting(false) }
  }

  const validCount = parsedRows.filter((r) => r.isValid).length

  return (
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-badge">
            <span className="excel-badge">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="17" />
                <line x1="16" y1="13" x2="8" y2="17" />
              </svg>
            </span>
            <h3 className="modal-title">Import danh sách sinh viên</h3>
          </div>
          <button className="modal-close-btn" onClick={handleClose} type="button" aria-label="Đóng">
            &times;
          </button>
        </div>

        <div className="import-modal-body">
          {/* Tabs */}
          <div className="import-tabs">
            <button
              type="button"
              className={`import-tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              Tải tệp Excel / CSV lên
            </button>
            <button
              type="button"
              className={`import-tab ${activeTab === 'paste' ? 'active' : ''}`}
              onClick={() => setActiveTab('paste')}
            >
              Dán dữ liệu trực tiếp
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div
              className={`dropzone ${isDragging ? 'dropzone-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .txt"
                style={{ display: 'none' }}
                onChange={onFileInputChange}
              />
              <div className="dropzone-icon">
                <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="dropzone-text">
                Kéo thả tệp Excel / CSV vào đây, hoặc <span className="dropzone-link">chọn từ máy tính</span>
              </p>
              <p className="dropzone-hint">
                Hỗ trợ định dạng .csv, .xlsx, .xls (STT, Mã sinh viên, Họ và tên, Lớp, Ngày Sinh, Email)
              </p>
              {fileName && (
                <div className="dropzone-filename">
                  <span>📄 Tệp đã chọn: <strong>{fileName}</strong></span>
                </div>
              )}
            </div>
          ) : (
            <div className="paste-area">
              <textarea
                className="paste-textarea"
                rows={5}
                placeholder={`Dán dòng dữ liệu theo định dạng CSV hoặc bảng tính:
Mã sinh viên,Họ và tên,Lớp,Ngày Sinh,Email
1651229001,Trần Tuấn Anh,THH1525,2002-04-15,tuananh@example.com
1651229002,Vũ Mai Linh,KTTC125,2003-08-20,mailinh@example.com`}
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handlePasteParse}
                style={{ marginTop: 8 }}
              >
                Phân tích dữ liệu đã dán
              </button>
            </div>
          )}

          {parseError && (
            <div className="modal-alert" role="alert" style={{ marginTop: 14 }}>
              {parseError}
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="preview-container">
              <div className="preview-header">
                <h4>
                  Xem trước dữ liệu ({validCount}/{parsedRows.length} sinh viên hợp lệ)
                </h4>
              </div>
              <div className="preview-table-wrapper">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Trạng thái</th>
                      <th>Mã SV</th>
                      <th>Họ và tên</th>
                      <th>Lớp</th>
                      <th>Ngày sinh</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? '' : 'row-invalid'}>
                        <td>
                          {row.isValid ? (
                            <span className="badge-valid">✓ Hợp lệ</span>
                          ) : (
                            <span className="badge-invalid">✗ {row.error}</span>
                          )}
                        </td>
                        <td><strong>{row.code}</strong></td>
                        <td>{row.fullName}</td>
                        <td>
                          {row.classes.map((cls) => (
                            <span key={cls} className="badge-class" style={{ marginRight: 3 }}>
                              {cls}
                            </span>
                          ))}
                        </td>
                        <td>{row.dateOfBirth}</td>
                        <td>{row.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="import-hint-box">
            <button
              type="button"
              className="download-template-link"
              onClick={onDownloadTemplate}
            >
              📥 Chưa có tệp mẫu? Bấm vào đây để tải về tệp Excel mẫu
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Đóng
          </button>
          <button
            type="button"
            className="btn btn-green"
            disabled={validCount === 0 || validCount !== parsedRows.length || isImporting}
            onClick={handleConfirmImport}
          >
            {isImporting ? 'Đang import…' : `Import ${validCount > 0 ? `(${validCount} sinh viên)` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
