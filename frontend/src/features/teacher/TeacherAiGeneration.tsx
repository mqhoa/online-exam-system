import { useState } from 'react'

interface GeneratedQuestionPreview {
  id: number
  content: string
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SHORT_ANSWER'
  options: Array<{ content: string; correct: boolean }>
  explanation: string
  approved: boolean
}

export function TeacherAiGeneration() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [questionCount, setQuestionCount] = useState<number>(5)
  const [difficulty, setDifficulty] = useState<string>('Trung bình')
  const [focusTopic, setFocusTopic] = useState<string>('Kiến trúc RESTful API & Spring Boot Security')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionPreview[]>([])
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  function handleStartGeneration() {
    setIsGenerating(true)
    setCurrentStep('1/3: Đang trích xuất văn bản từ tệp PDF bằng PDFBox...')

    setTimeout(() => {
      setCurrentStep('2/3: Gửi ngữ cảnh bài giảng tới Gemini API để tạo cấu trúc câu hỏi JSON...')
      setTimeout(() => {
        setCurrentStep('3/3: Kiểm tra tính hợp lệ dữ liệu sinh và định dạng đáp án...')
        setTimeout(() => {
          setIsGenerating(false)
          setCurrentStep('')
          // Simulated generated questions based on curriculum
          setGeneratedQuestions([
            {
              id: 1,
              content: 'Annotation nào trong Spring Security được dùng để bảo vệ một endpoint theo quyền người dùng?',
              questionType: 'SINGLE_CHOICE',
              options: [
                { content: '@PreAuthorize("hasRole(\'ADMIN\')")', correct: true },
                { content: '@SecuredByHttp', correct: false },
                { content: '@AllowOnly("ADMIN")', correct: false },
                { content: '@RestrictedRole', correct: false },
              ],
              explanation: '@PreAuthorize hỗ trợ biểu thức SpEL mạnh mẽ để kiểm tra quyền truy cập trước khi hàm thực thi.',
              approved: true,
            },
            {
              id: 2,
              content: 'Trong Spring Security 6 / Spring Boot 3, lớp cấu hình nào thay thế cho WebSecurityConfigurerAdapter?',
              questionType: 'SINGLE_CHOICE',
              options: [
                { content: 'SecurityFilterChain (Bean)', correct: true },
                { content: 'DefaultSecurityAdapter', correct: false },
                { content: 'WebSecurityInterceptor', correct: false },
                { content: 'AuthManagerRegistry', correct: false },
              ],
              explanation: 'WebSecurityConfigurerAdapter đã bị loại bỏ; việc cấu hình hiện nay dùng @Bean SecurityFilterChain.',
              approved: true,
            },
            {
              id: 3,
              content: 'Những thành phần nào cấu thành một JSON Web Token (JWT)?',
              questionType: 'MULTIPLE_CHOICE',
              options: [
                { content: 'Header (Chứa thuật toán và kiểu token)', correct: true },
                { content: 'Payload (Chứa claims và thông tin phiên)', correct: true },
                { content: 'Signature (Chữ ký điện tử xác thực)', correct: true },
                { content: 'Cookie Jar', correct: false },
              ],
              explanation: 'Cấu trúc JWT gồm 3 phần ngăn cách bởi dấu chấm: Header.Payload.Signature.',
              approved: true,
            },
            {
              id: 4,
              content: 'Kỹ thuật nào giúp phòng ngừa tấn công SQL Injection khi truy vấn cơ sở dữ liệu?',
              questionType: 'MULTIPLE_CHOICE',
              options: [
                { content: 'Sử dụng PreparedStatement / Parameterized Query', correct: true },
                { content: 'Sử dụng ORM như Hibernate / Spring Data JPA', correct: true },
                { content: 'Ghép chuỗi SQL trực tiếp', correct: false },
                { content: 'Kiểm tra và chuẩn hóa dữ liệu đầu vào (Input Validation)', correct: true },
              ],
              explanation: 'Tuyệt đối không ghép chuỗi SQL trực tiếp từ người dùng.',
              approved: true,
            },
            {
              id: 5,
              content: 'Tên viết tắt của cơ chế kiểm soát chia sẻ tài nguyên giữa các nguồn gốc khác nhau trên trình duyệt web?',
              questionType: 'SHORT_ANSWER',
              options: [
                { content: 'CORS', correct: true },
                { content: 'Cross-Origin Resource Sharing', correct: true },
              ],
              explanation: 'CORS là chuẩn W3C cho phép server chỉ định các origin khác được phép truy cập tài nguyên.',
              approved: true,
            },
          ])
          showToast('Gemini đã sinh thành công 5 câu hỏi từ tài liệu!')
        }, 800)
      }, 900)
    }, 700)
  }

  function toggleApprove(id: number) {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, approved: !q.approved } : q))
    )
  }

  function handleSaveAllToQuestionBank() {
    const approved = generatedQuestions.filter((q) => q.approved)
    if (approved.length === 0) {
      alert('Chưa có câu hỏi nào được chọn duyệt!')
      return
    }
    showToast(`Đã lưu ${approved.length} câu hỏi AI vào Ngân hàng câu hỏi của nhóm!`)
    setGeneratedQuestions([])
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
              <li className="breadcrumb-active">Sinh câu hỏi bằng AI (Gemini)</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Configuration & Upload Card */}
      <div className="table-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #138496, #20c997)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
            }}
          >
            ✦
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              Module AI sinh câu hỏi từ tài liệu PDF (Gemini API)
            </h3>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          {/* File Upload Box */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Tải lên tệp bài giảng / giáo trình (PDF, TXT, DOCX)
            </label>
            <div
              className="dropzone"
              style={{ padding: '24px 16px' }}
              onClick={() => document.getElementById('ai-file-upload')?.click()}
            >
              <input
                id="ai-file-upload"
                type="file"
                accept=".pdf,.txt,.docx"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div className="dropzone-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <p className="dropzone-text" style={{ fontSize: 13.5 }}>
                {selectedFile ? `📄 ${selectedFile.name}` : 'Bấm để chọn tệp PDF giáo trình hoặc kéo thả vào đây'}
              </p>
              <p className="dropzone-hint">
                Ví dụ: Giao_trinh_Lap_trinh_Web_Spring_Boot_Chuong4.pdf
              </p>
            </div>
          </div>

          {/* Prompt Parameters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label>Chủ đề trọng tâm cần sinh câu hỏi</label>
              <input
                type="text"
                className="form-control"
                value={focusTopic}
                onChange={(e) => setFocusTopic(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Số lượng câu hỏi</label>
                <select
                  className="form-control"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                >
                  <option value={5}>5 câu</option>
                  <option value={10}>10 câu</option>
                  <option value={15}>15 câu</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mức độ khó</label>
                <select
                  className="form-control"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Dễ">Dễ (Cơ bản)</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Khó">Khó (Vận dụng)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-teal"
              style={{ marginTop: 'auto', height: 40 }}
              disabled={isGenerating}
              onClick={handleStartGeneration}
            >
              {isGenerating ? 'Đang phân tích và sinh câu hỏi…' : '✦ Bắt đầu sinh câu hỏi bằng AI'}
            </button>
          </div>
        </div>

        {isGenerating && (
          <div style={{ marginTop: 18, padding: 14, background: '#ebf8ff', borderRadius: 6, border: '1px solid #bee3f8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="spinner" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #3182ce', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <strong style={{ color: '#2b6cb0', fontSize: 13.5 }}>{currentStep}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Preview Section */}
      {generatedQuestions.length > 0 && (
        <div className="table-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
              Xem trước và duyệt câu hỏi AI sinh ({generatedQuestions.filter((q) => q.approved).length}/{generatedQuestions.length} câu được chọn)
            </h4>
            <button
              type="button"
              className="btn btn-green"
              onClick={handleSaveAllToQuestionBank}
            >
              ✓ Duyệt lưu vào Ngân hàng câu hỏi
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {generatedQuestions.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  border: q.approved ? '1px solid #b2f5ea' : '1px solid #e2e8f0',
                  background: q.approved ? '#f0fff4' : '#f7fafc',
                  borderRadius: 6,
                  padding: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={q.approved}
                      onChange={() => toggleApprove(q.id)}
                      style={{ cursor: 'pointer', width: 18, height: 18 }}
                      title="Chọn duyệt"
                    />
                    <strong style={{ fontSize: 14 }}>Câu {idx + 1}: {q.content}</strong>
                    <span className="class-badge-pill" style={{ fontSize: 10 }}>
                      {q.questionType}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: q.approved ? '#28a745' : '#718096', fontWeight: 600 }}>
                    {q.approved ? '✓ Sẵn sàng duyệt' : 'Đã bỏ qua'}
                  </span>
                </div>

                <div style={{ marginTop: 10, paddingLeft: 26 }}>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13 }}>
                    {q.options.map((opt, oIdx) => (
                      <li
                        key={oIdx}
                        style={{
                          color: opt.correct ? '#22543d' : '#4a5568',
                          fontWeight: opt.correct ? 700 : 400,
                        }}
                      >
                        {opt.content} {opt.correct && '(Đáp án đúng)'}
                      </li>
                    ))}
                  </ul>
                  {q.explanation && (
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: '#718096', fontStyle: 'italic' }}>
                      💡 Giải thích: {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
