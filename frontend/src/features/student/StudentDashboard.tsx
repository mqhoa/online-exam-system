import { useState, useRef, useEffect } from 'react'
import type { AuthenticatedUser, UserRole } from '../auth/types'
import type { StudentExam } from './studentMockData'
import type { ExamSubmissionResult } from './StudentExamRoom'
import { StudentExamList } from './StudentExamList'
import { StudentExamRoom } from './StudentExamRoom'
import { StudentExamResult } from './StudentExamResult'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { examApi, type AttemptView, type ResultView } from '../exam/examApi'

type StudentTab = 'exams' | 'history'

type StudentDashboardProps = {
  user: AuthenticatedUser
  onSignOut: () => void
  isSigningOut?: boolean
  onSwitchRole?: (role: UserRole) => void
}

export function StudentDashboard({
  user,
  onSignOut,
  isSigningOut,
  onSwitchRole,
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<StudentTab>('exams')
  const [activeExam, setActiveExam] = useState<StudentExam | null>(null)
  const [latestResult, setLatestResult] = useState<ExamSubmissionResult | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const savedId = localStorage.getItem('online_exam_current_attempt')
    if (!savedId) return
    examApi.attempt(Number(savedId)).then((attempt) => {
      if (attempt.status !== 'IN_PROGRESS') {
        localStorage.removeItem('online_exam_current_attempt')
        examApi.result(attempt.id).then((result) => setLatestResult({ examTitle: result.examTitle,
          subjectName: 'Kỳ thi trực tuyến', totalQuestions: attempt.exam.questions.length,
          answeredCount: attempt.answers.length, score: result.score, totalScore: result.totalScore,
          timeTaken: '', isAutoSubmitted: result.status === 'AUTO_SUBMITTED' }))
        return
      }
      setActiveExam(fromAttempt(attempt))
    }).catch(() => localStorage.removeItem('online_exam_current_attempt'))
  }, [])

  function handleStartExam(exam: StudentExam, _attempt: AttemptView) {
    setLatestResult(null)
    setActiveExam(exam)
  }

  function handleFinishExam(result: ExamSubmissionResult) {
    localStorage.removeItem('online_exam_current_attempt')
    setActiveExam(null)
    setLatestResult(result)
  }

  function handleBackToExamList() {
    setActiveExam(null)
    setLatestResult(null)
    setActiveTab('exams')
  }

  return (
    <div className={`dashboard-root ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Top Header Bar */}
      <header className="dashboard-header">
        <div className="header-brand-section">
          <div className="header-brand-logo">
            <span className="brand-circle-a" style={{ background: '#0d9488', borderColor: '#ffffff' }}>
              S
            </span>
          </div>
          {!isSidebarCollapsed && <span className="header-brand-title">Sinh viên</span>}
        </div>

        <div className="header-main-bar">
          <button
            type="button"
            className="hamburger-toggle-btn"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            aria-label="Thu gọn hoặc mở rộng menu"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>

          <div className="header-actions-right">
            <div className="user-dropdown-wrapper" ref={userMenuRef}>
              <button
                type="button"
                className="header-avatar-btn"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-label="Menu sinh viên"
              >
                <div className="avatar-circle" style={{ backgroundColor: '#0d9488' }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="user-menu-dropdown" style={{ width: 240 }}>
                  <div className="user-menu-info">
                    <p className="user-menu-name">{user.fullName || 'Nguyễn Anh Long'}</p>
                    <p className="user-menu-role">Sinh viên ({user.username})</p>
                  </div>
                  <div className="user-menu-divider" />
                  <div className="user-menu-language">
                    <LanguageSwitcher />
                  </div>
                  <div className="user-menu-divider" />
                  <button
                    type="button"
                    className="user-menu-signout"
                    disabled={isSigningOut}
                    onClick={onSignOut}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>{isSigningOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-user-block">
            <div className="sidebar-user-avatar" style={{ backgroundColor: 'rgba(13, 148, 136, 0.25)' }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#0d9488">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            {!isSidebarCollapsed && (
              <span className="sidebar-user-name">
                {user.fullName || 'Sinh viên'}
              </span>
            )}
          </div>

          <nav className="sidebar-nav">
            <ul className="sidebar-menu-list">
              <li className="sidebar-menu-item">
                <button
                  type="button"
                  className={`sidebar-nav-btn ${activeTab === 'exams' && !activeExam ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('exams')
                    setActiveExam(null)
                    setLatestResult(null)
                  }}
                  title="Danh Sách Kỳ Thi"
                >
                  <span className="sidebar-item-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                  {!isSidebarCollapsed && <span className="sidebar-item-label">Kỳ Thi Đang Mở</span>}
                </button>
              </li>

              <li className="sidebar-menu-item">
                <button
                  type="button"
                  className={`sidebar-nav-btn ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('history')
                    setActiveExam(null)
                    setLatestResult(null)
                  }}
                  title="Lịch Sử Điểm Thi"
                >
                  <span className="sidebar-item-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </span>
                  {!isSidebarCollapsed && <span className="sidebar-item-label">Lịch Sử Điểm Thi</span>}
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="dashboard-main-content">
          {activeExam ? (
            <StudentExamRoom
              exam={activeExam}
              onFinishExam={handleFinishExam}
              onExit={handleBackToExamList}
            />
          ) : latestResult ? (
            <StudentExamResult
              result={latestResult}
              onBackToExamList={handleBackToExamList}
            />
          ) : activeTab === 'exams' ? (
            <StudentExamList onStartExam={handleStartExam} />
          ) : activeTab === 'history' ? (
            <StudentExamHistory />
          ) : (
            /* History view */
            <div className="student-portal-page">
              <div className="content-top-bar">
                <div className="breadcrumb-wrapper">
                  <span className="breadcrumb-home-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                  </span>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb-list">
                      <li><span className="breadcrumb-link">Sinh viên</span></li>
                      <li className="breadcrumb-separator">/</li>
                      <li className="breadcrumb-active">Lịch sử điểm thi</li>
                    </ol>
                  </nav>
                </div>
              </div>

              <div className="table-card">
                <div className="card-header-bar">
                  <h3 className="card-title">Kết quả các kỳ thi đã tham gia</h3>
                </div>
                <div className="table-responsive">
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th className="col-stt text-center">STT</th>
                        <th>Kỳ thi</th>
                        <th>Môn học</th>
                        <th>Thời gian hoàn thành</th>
                        <th>Trạng thái nộp</th>
                        <th>Điểm số</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-center text-muted font-weight-medium">1</td>
                        <td><strong>Bài tập đánh giá - Kế toán tài chính doanh nghiệp</strong></td>
                        <td>Kế toán tài chính (FIN2001)</td>
                        <td>2026-11-05 10:15</td>
                        <td><span className="badge-valid">ĐÃ NỘP</span></td>
                        <td>
                          <strong style={{ fontSize: 15, color: '#28a745' }}>8.5 / 10.0</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function fromAttempt(attempt: AttemptView): StudentExam {
  const exam = attempt.exam
  return { id: exam.id, attemptId: attempt.id, deadline: attempt.deadline, title: exam.title,
    subjectCode: `GROUP-${exam.teacherGroupId}`, subjectName: 'Kỳ thi trực tuyến',
    durationMinutes: exam.durationMinutes, totalQuestions: exam.totalQuestionCount,
    totalPoints: exam.totalPoints, startTime: exam.startTime,
    endTime: exam.endTime, pin: '', status: exam.status === 'DRAFT' ? 'CLOSED' : exam.status,
    questions: exam.questions.map((q) => ({ id: q.id, questionOrder: q.position, content: q.content,
      questionType: q.questionType, options: q.options, points: q.score })), savedAnswers: attempt.answers }
}

function StudentExamHistory() {
  const [results, setResults] = useState<ResultView[]>([])
  const [error, setError] = useState('')
  useEffect(() => { examApi.myResults().then(setResults).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Không tải được kết quả')) }, [])
  return <div className="student-portal-page"><div className="table-card">
    <div className="card-header-bar"><h3 className="card-title">Lịch sử kết quả</h3></div>
    {error && <div className="modal-alert" role="alert">{error}</div>}
    <div className="table-responsive"><table className="student-table"><thead><tr><th>Kỳ thi</th><th>Thời gian nộp</th><th>Trạng thái</th><th>Điểm</th></tr></thead>
      <tbody>{results.map((r) => <tr key={r.attemptId}><td>{r.examTitle}</td><td>{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—'}</td><td>{r.status}</td><td>{r.score} / {r.totalScore}</td></tr>)}
        {!results.length && !error && <tr><td colSpan={4}>Chưa có kết quả.</td></tr>}</tbody></table></div>
  </div></div>
}
