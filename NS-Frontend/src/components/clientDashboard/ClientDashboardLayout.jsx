import { useContext, useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, CalendarDays, ClipboardList, LayoutDashboard, LogOut, Menu, MessageCircle, Settings, User, X } from 'lucide-react'
import { io } from 'socket.io-client' 
import AuthContext from '../../context/AuthContext'
import api from '../../services/api'
import BrandWordmark from '../BrandWordmark'
import '../dashboard/Dashboard.css'

const clientNav = [
  { label: 'Dashboard', to: '/client/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Project Requirements', to: '/client/dashboard/requirements', icon: ClipboardList },
  { label: 'Chat with Developers', to: '/client/dashboard/chat', icon: MessageCircle },
  { label: 'Meetings', to: '/client/dashboard/meetings', icon: CalendarDays },
  { label: 'Notifications', to: '/client/dashboard/notifications', icon: Bell },
  { label: 'Profile', to: '/client/dashboard/profile', icon: User },
  { label: 'Settings', to: '/client/dashboard/settings', icon: Settings },
]

function ClientDashboardLayout() {
  const { user, token, logout } = useContext(AuthContext) // 1. Pull dynamic token from context
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [onlineDevCount, setOnlineDevCount] = useState(0) 

  useEffect(() => {
    document.body.classList.add('dashboard-mode')
    return () => document.body.classList.remove('dashboard-mode')
  }, [])

  // 2. HTTP Fetch: Watch the token state and attach Authorization headers explicitly
  useEffect(() => {
    if (!token) return

    api.get('/client/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(({ data }) => setUnreadCount((data.notifications || []).filter((item) => !item.read).length))
      .catch(() => setUnreadCount(0))
  }, [token])

  // 3. WebSockets: Manage connection cleanly using context state and strict connection options
  useEffect(() => {
    if (!token) return undefined

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
    
    // Using strict websocket transports prevents polling conflicts with the Chat page instance
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      upgrade: false
    })

    socket.on('developers:count_update', (count) => {
      setOnlineDevCount(count)
    })

    return () => {
      socket.disconnect()
    }
  }, [token])

  function handleLogout() {
    logout()
    navigate('/client/login')
  }

  return (
    <section className="developer-dashboard client-dashboard">
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="dashboard-sidebar-head">
          <NavLink to="/client/dashboard" aria-label="Varlexa AI Client Dashboard">
            <BrandWordmark className="dashboard-wordmark" alt="VARLEXA AI" />
          </NavLink>
          <button className="dashboard-icon-button mobile-close" type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close dashboard menu"><X size={18} /></button>
        </div>
        <nav className="dashboard-nav" aria-label="Client dashboard navigation">
          {clientNav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink className={({ isActive }) => `dashboard-nav-link ${isActive ? 'active' : ''}`} end={item.end} key={item.label} to={item.to} onClick={() => setIsSidebarOpen(false)}>
                <Icon size={18} />
                <span>{item.label}</span>
                {item.label === 'Chat with Developers' && onlineDevCount > 0 && (
                  <span className="online-dev-badge">{onlineDevCount} Online</span>
                )}
              </NavLink>
            )
          })}
          <button className="dashboard-nav-link dashboard-logout" type="button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>
      <div className="dashboard-main-shell">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <button className="dashboard-icon-button mobile-menu" type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open dashboard menu"><Menu size={20} /></button>
          </div>
          <div>
            <span>Secure client area</span>
            <strong>Varlexa AI Workspace</strong>
          </div>
          <div className="dashboard-header-actions">
            <div className="dev-status-indicator">
              <span className={`status-dot ${onlineDevCount > 0 ? 'online' : 'offline'}`}></span>
              <small>{onlineDevCount} {onlineDevCount === 1 ? 'Developer' : 'Developers'} Available</small>
            </div>

            <NavLink className="dashboard-notification-button" to="/client/dashboard/notifications" aria-label="Open notifications">
              <Bell size={18} />
              {unreadCount > 0 && <span>{unreadCount}</span>}
            </NavLink>
            <NavLink className="dashboard-profile-pill" to="/client/dashboard/profile">
              <User size={17} />
              <span>{user?.name || 'Client'}</span>
            </NavLink>
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </section>
  )
}

export default ClientDashboardLayout