import { useContext, useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
} from 'lucide-react';
import BrandWordmark from '../BrandWordmark';
import './Dashboard.css';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';

const dashboardNav = [
  { label: 'Overview', to: '/developer/dashboard', icon: LayoutDashboard, end: true },
  { label: 'My Projects', to: '/developer/dashboard/projects', icon: Briefcase },
  { label: 'Team Chat', to: '/developer/dashboard/team-chat', icon: MessagesSquare },
  { label: 'Client Chat', to: '/developer/dashboard/client-chat', icon: MessageCircle },
  { label: 'Meetings', to: '/developer/dashboard/meetings', icon: CalendarDays },
  { label: 'AI Developer', to: '/developer/dashboard/ai-assistant', icon: Bot },
  { label: 'Profile', to: '/developer/dashboard/profile', icon: User },
]

function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    document.body.classList.add('dashboard-mode');

    // Fetch notifications from the backend
    api.get('/notifications')
      .then(({ data }) => {
        const nextNotifications = Array.isArray(data) ? data : [];
        setNotifications(nextNotifications);
        setUnreadCount(nextNotifications.length);
      })
      .catch(err => console.error("Failed to fetch notifications:", err));

    return () => document.body.classList.remove('dashboard-mode');
  }, []); // Empty dependency array ensures this runs once on mount

  const canGoBack = location.pathname !== '/developer/dashboard';

  function handleBack() {
    navigate('/');
  }

  function handleLogout() {
    logout();
    navigate('/developer/login');
  }

  function openNotifications() {
    setShowNotifications((isOpen) => !isOpen);
    setUnreadCount(0);
  }

  return (
    <section className="developer-dashboard">
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="dashboard-sidebar-head">
          <Link to="/developer/dashboard" aria-label="Varlexa AI Developer Dashboard">
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
          <button className="dashboard-nav-link dashboard-logout" type="button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <div className="dashboard-main-shell">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <button className="dashboard-icon-button mobile-menu" type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open dashboard menu">
              <Menu size={20} />
            </button>
            {canGoBack && (
              <button className="dashboard-back-button" type="button" onClick={handleBack}>
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
            )}
          </div>
          <div>
            <span>Secure developer area</span>
            <strong>Varlexa AI Workspace</strong>
          </div>
          <div className="dashboard-header-actions">
            <button className="dashboard-notification-button" type="button" onClick={openNotifications} aria-label="Open notifications">
              <Bell size={18} />
              {unreadCount > 0 && <span>{unreadCount}</span>}
            </button>
            <Link className="dashboard-profile-pill" to="/developer/dashboard/profile">
              <ShieldCheck size={17} />
              <span>{user?.name || 'Developer'}</span>
            </Link>
          </div>

          {showNotifications && (
            <div className="dashboard-notification-panel">
              <div>
                <strong>Notifications</strong>
                <span>{notifications.length > 0 ? `${unreadCount} unread` : 'All caught up'}</span>
              </div>
              {notifications.map((notification, index) => (
                <p key={index}>{notification}</p>
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


