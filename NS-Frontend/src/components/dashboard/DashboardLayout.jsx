import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  Bot,
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  MessagesSquare,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import BrandWordmark from '../BrandWordmark'
import { dashboardNotifications } from '../../data/dashboardData'
import './Dashboard.css'

const dashboardNav = [
  { label: 'Overview', to: '/developer-dashboard', icon: LayoutDashboard, end: true },
  { label: 'My Projects', to: '/developer-dashboard/projects', icon: Briefcase },
  { label: 'Team Chat', to: '/developer-dashboard/team-chat', icon: MessagesSquare },
  { label: 'Client Chat', to: '/developer-dashboard/client-chat', icon: MessageCircle },
  { label: 'Meetings', to: '/developer-dashboard/meetings', icon: CalendarDays },
  { label: 'AI Developer', to: '/developer-dashboard/ai-assistant', icon: Bot },
  { label: 'Profile', to: '/developer-dashboard/profile', icon: User },
]

function DashboardLogin({ onUnlock }) {
  return (
    <section className="dashboard-auth">
      <div className="dashboard-auth-card">
        <BrandWordmark className="dashboard-auth-logo" alt="VARLEXA AI" />
        <span className="dashboard-kicker">Protected Workspace</span>
        <h1>Developer Dashboard</h1>
        <p>Frontend protected area for project work, team collaboration, client communication, meetings, and AI developer assistance.</p>
        <button type="button" onClick={onUnlock}>Enter Developer Workspace</button>
        <Link to="/">Return to Website</Link>
      </div>
    </section>
  )
}

function DashboardLayout() {
  const navigate = useNavigate()
  const [isUnlocked, setIsUnlocked] = useState(() => sessionStorage.getItem('varlexa-developer-dashboard') === 'true')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(dashboardNotifications.length)

  useEffect(() => {
    document.body.classList.add('dashboard-mode')

    return () => document.body.classList.remove('dashboard-mode')
  }, [])

  function unlockDashboard() {
    sessionStorage.setItem('varlexa-developer-dashboard', 'true')
    setIsUnlocked(true)
  }

  function logoutDashboard() {
    sessionStorage.removeItem('varlexa-developer-dashboard')
    setIsUnlocked(false)
    navigate('/')
  }

  function openNotifications() {
    setShowNotifications((isOpen) => !isOpen)
    setUnreadNotifications(0)
  }

  if (!isUnlocked) {
    return <DashboardLogin onUnlock={unlockDashboard} />
  }

  return (
    <section className="developer-dashboard">
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="dashboard-sidebar-head">
          <Link to="/developer-dashboard" aria-label="Varlexa AI Developer Dashboard">
            <BrandWordmark className="dashboard-wordmark" alt="VARLEXA AI" />
          </Link>
          <button className="dashboard-icon-button mobile-close" type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close dashboard menu">
            <X size={18} />
          </button>
        </div>

        <nav className="dashboard-nav" aria-label="Developer dashboard navigation">
          {dashboardNav.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                className={({ isActive }) => `dashboard-nav-link ${isActive ? 'active' : ''}`}
                end={item.end}
                key={item.label}
                onClick={() => setIsSidebarOpen(false)}
                to={item.to}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
          <button
            className="dashboard-nav-link"
            type="button"
            onClick={() => {
              openNotifications()
              setIsSidebarOpen(false)
            }}
          >
            <Bell size={18} />
            <span>Notifications</span>
          </button>
          <button className="dashboard-nav-link dashboard-logout" type="button" onClick={logoutDashboard}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <div className="dashboard-main-shell">
        <header className="dashboard-header">
          <button className="dashboard-icon-button mobile-menu" type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open dashboard menu">
            <Menu size={20} />
          </button>
          <div>
            <span>Secure developer area</span>
            <strong>Varlexa AI Workspace</strong>
          </div>
          <div className="dashboard-header-actions">
            <button className="dashboard-notification-button" type="button" onClick={openNotifications} aria-label="Open notifications">
              <Bell size={18} />
              {unreadNotifications > 0 && <span>{unreadNotifications}</span>}
            </button>
            <Link className="dashboard-profile-pill" to="/developer-dashboard/profile">
              <ShieldCheck size={17} />
              <span>Developer</span>
            </Link>
          </div>

          {showNotifications && (
            <div className="dashboard-notification-panel">
              <div>
                <strong>Notifications</strong>
                <span>{unreadNotifications > 0 ? `${unreadNotifications} unread` : 'All caught up'}</span>
              </div>
              {dashboardNotifications.map((notification) => (
                <p key={notification}>{notification}</p>
              ))}
            </div>
          )}
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </section>
  )
}

export default DashboardLayout

