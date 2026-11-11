import { useState, useRef, useEffect } from 'react'
import type { AuthenticatedUser } from '../auth/types'
import { TeacherGroups } from './TeacherGroups'
import { TeacherQuestionBank } from './TeacherQuestionBank'
import { TeacherExamManagement } from './TeacherExamManagement'
import { TeacherAiGeneration } from './TeacherAiGeneration'
import { TeacherExamResults } from './TeacherExamResults'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'

type TeacherTab = 'groups' | 'questions' | 'exams' | 'ai-gen' | 'results'

type TeacherDashboardProps = {
  user: AuthenticatedUser
  onSignOut: () => void
  isSigningOut?: boolean
}

export function TeacherDashboard({
  user,
  onSignOut,
  isSigningOut,
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<TeacherTab>('questions')
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

  return (
    <div className={`dashboard-root ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Top Header Bar */}
      <header className="dashboard-header">
        <div className="header-brand-section">
          <div className="header-brand-logo">
            <span className="brand-circle-a" style={{ background: '#20c997', borderColor: '#ffffff' }}>
              T
            </span>
          </div>
          {!isSidebarCollapsed && <span className="header-brand-title">Giảng viên</span>}
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
                aria-label="Menu giảng viên"
              >
                <div className="avatar-circle" style={{ backgroundColor: '#20c997' }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="user-menu-dropdown" style={{ width: 240 }}>
                  <div className="user-menu-info">
                    <p className="user-menu-name">{user.fullName || 'Giảng viên'}</p>
                    <p className="user-menu-role">Giảng viên ({user.username})</p>
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
            <div className="sidebar-user-avatar" style={{ backgroundColor: 'rgba(32, 201, 151, 0.25)' }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#20c997">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            {!isSidebarCollapsed && (
              <span className="sidebar-user-name">
                {user.fullName || 'Giảng viên'}
              </span>
            )}
          </div>

          <nav className="sidebar-nav">
            <ul className="sidebar-menu-list">
              <li className="sidebar-menu-item">
                <button
                  type="button"
                  className={`sidebar-nav-btn ${activeTab === 'groups' ? 'active' : ''}`}
                  onClick={() => setActiveTab('groups')}
                  title="Nhóm Môn Học"
                >
                  <span className="sidebar-item-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  {!isSidebarCollapsed && <span className="sidebar-item-label">Nhóm Môn Học</span>}
                </button>
              </li>

              <li className="sidebar-menu-item">
                <button
                  type="button"
                  className={`sidebar-nav-btn ${activeTab === 'questions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('questions')}
                  title="Ngân Hàng Câu Hỏi"
                >
                  <span className="sidebar-item-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </span>
                  {!isSidebarCollapsed && <span className="sidebar-item-label">Ngân Hàng Câu Hỏi</span>}
                </button>
              </li>

              <li className="sidebar-menu-item">
                <button
                  type="button"
                  className={`sidebar-nav-btn ${activeTab === 'exams' ? 'active' : ''}`}
                  onClick={() => setActiveTab('exams')}
                  title="Quản Lý Kỳ Thi"
                >
                  <span className="sidebar-item-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </span>
                  {!isSidebarCollapsed && <span className="sidebar-item-label">Quản Lý Kỳ Thi</span>}
                </button>
              </li>

              <li className="sidebar-menu-item">
                <button
                  type="button"
                  className={`sidebar-nav-btn ${activeTab === 'ai-gen' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ai-gen')}
                  title="Sinh Câu Hỏi AI (Gemini)"
                >
                  <span className="sidebar-item-icon" style={{ color: '#20c997' }}>
                    ✦
                  </span>
                  {!isSidebarCollapsed && (
                    <span className="sidebar-item-label">Sinh Câu Hỏi AI (Gemini)</span>
                  )}
                </button>
              </li>

              <li className="sidebar-menu-item">
                <button
                  type="button"
                  className={`sidebar-nav-btn ${activeTab === 'results' ? 'active' : ''}`}
                  onClick={() => setActiveTab('results')}
                  title="Kết Quả & Báo Cáo"
                >
                  <span className="sidebar-item-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </span>
                  {!isSidebarCollapsed && <span className="sidebar-item-label">Kết Quả & Báo Cáo</span>}
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main-content">
          {activeTab === 'groups' && (
            <TeacherGroups onSelectGroupForQuestions={() => setActiveTab('questions')} />
          )}
          {activeTab === 'questions' && <TeacherQuestionBank />}
          {activeTab === 'exams' && <TeacherExamManagement />}
          {activeTab === 'ai-gen' && <TeacherAiGeneration />}
          {activeTab === 'results' && <TeacherExamResults />}
        </main>
      </div>
    </div>
  )
}
