import { useState, useRef, useEffect } from 'react'
import type { DashboardMenuId } from './types'
import { StudentManagement } from './StudentManagement'
import { AccountManagement } from '../admin/AccountManagement'
import { AdminCatalogManagement } from '../admin/AdminCatalogManagement'
import { OtherViews } from './OtherViews'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { ChangePasswordDialog } from '../auth/components/ChangePasswordDialog'
import { useI18n } from '../../i18n'
import type { AuthenticatedUser } from '../auth/types'
import './Dashboard.css'

type DashboardLayoutProps = {
  user: AuthenticatedUser
  onSignOut: () => void
  isSigningOut?: boolean
}

interface MenuItemDef {
  id: DashboardMenuId
  label: string
  icon: (collapsed: boolean) => React.ReactNode
}

export function DashboardLayout({ user, onSignOut, isSigningOut }: DashboardLayoutProps) {
  const { t } = useI18n()
  const [activeMenu, setActiveMenu] = useState<DashboardMenuId>('students')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems: MenuItemDef[] = [
    {
      id: 'classes',
      label: 'Nhóm Giảng Viên',
      icon: () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
    {
      id: 'semesters',
      label: 'Quản Lý Học Kỳ',
      icon: () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
    },
    {
      id: 'subjects',
      label: 'Quản Lý Môn Học',
      icon: () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
    {
      id: 'questions',
      label: 'Quản Lý Câu Hỏi',
      icon: () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
    {
      id: 'exams',
      label: 'Quản Lý Đề Thi',
      icon: () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      id: 'schedules',
      label: 'Quản Lý Lịch Thi',
      icon: () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: 'students',
      label: 'Quản Lý Sinh Viên',
      icon: () => (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'Quản Lý Tài Khoản',
      icon: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="4"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M19 8v6M16 11h6"/></svg>,
    },
  ]

  return (
    <div className={`dashboard-root ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Top Header Bar */}
      <header className="dashboard-header">
        <div className="header-brand-section">
          <div className="header-brand-logo">
            <span className="brand-circle-a">A</span>
          </div>
          {!isSidebarCollapsed && <span className="header-brand-title">Quản lý</span>}
        </div>

        <div className="header-main-bar">
          <button
            type="button"
            className="hamburger-toggle-btn"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            aria-label="Thu gọn hoặc mở rộng thanh điều hướng"
            title="Thu gọn / mở rộng menu"
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
                aria-expanded={isUserMenuOpen}
                aria-label="Menu tài khoản"
              >
                <div className="avatar-circle">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="user-menu-dropdown" style={{ width: 240 }}>
                  <div className="user-menu-info">
                    <p className="user-menu-name">{user.fullName || 'Admin'}</p>
                    <p className="user-menu-role">{user.role} ({user.username})</p>
                  </div>                  
                  <div className="user-menu-divider" />
                  <div className="user-menu-language">
                    <LanguageSwitcher />
                  </div>
                  <div className="user-menu-divider" />
                  <button type="button" className="user-menu-signout" onClick={() => {setIsPasswordDialogOpen(true);setIsUserMenuOpen(false)}}>
                    <span>{t('changePassword')}</span>
                  </button>
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

      {/* Main Container: Sidebar + Content */}
      <div className="dashboard-body">
        {/* Left Sidebar */}
        <aside className="dashboard-sidebar" aria-label="Thanh điều hướng bên trái">
          <div className="sidebar-user-block">
            <div className="sidebar-user-avatar">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#adb5bd">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            {!isSidebarCollapsed && (
              <span className="sidebar-user-name">
                {user.fullName || 'Admin'}
              </span>
            )}
          </div>

          <nav className="sidebar-nav">
            <ul className="sidebar-menu-list">
              {menuItems.map((item) => {
                const isActive = activeMenu === item.id
                return (
                  <li key={item.id} className="sidebar-menu-item">
                    <button
                      type="button"
                      className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveMenu(item.id)}
                      title={item.label}
                    >
                      <span className="sidebar-item-icon">{item.icon(isSidebarCollapsed)}</span>
                      {!isSidebarCollapsed && (
                        <span className="sidebar-item-label">{item.label}</span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="dashboard-main-content">
          {activeMenu === 'students' ? (
            <StudentManagement />
          ) : activeMenu === 'users' ? (
            <AccountManagement />
          ) : activeMenu === 'classes' || activeMenu === 'subjects' ? (
            <AdminCatalogManagement viewId={activeMenu} />
          ) : (
            <OtherViews
              viewId={activeMenu}
              onSwitchToStudents={() => setActiveMenu('students')}
            />
          )}
        </main>
      </div>
      {isPasswordDialogOpen&&<ChangePasswordDialog onClose={()=>setIsPasswordDialogOpen(false)}/>}
    </div>
  )
}
