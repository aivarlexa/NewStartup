import { useContext, useState, useEffect, useRef } from 'react';
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
import { io } from 'socket.io-client';
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
];

function DashboardLayout() {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef(null);
  const currentUserId = user?.id || user?._id || '';

  // 1. Initial Notification Fetch
  useEffect(() => {
    document.body.classList.add('dashboard-mode');

    if (token) {
      api.get('/developer/notifications')
        .then(({ data }) => {
          const list = data.notifications || [];
          setNotifications(list);
          setUnreadCount(list.filter((n) => !n.read).length);
        })
        .catch((err) => console.error("Failed to fetch developer notifications:", err));
    }

    return () => document.body.classList.remove('dashboard-mode');
  }, [token]);

  // 2. Real-Time Socket Connection for Instant Developer Notifications
useEffect(() => {
  // Gate check: ensure both token and currentUserId exist before connecting
  if (!token || !currentUserId) return undefined;

  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

  // 1. Create a single, stable Socket instance
  const socket = io(socketUrl, {
    auth: { token },
    transports: ['polling', 'websocket'], // 👑 FIX: Polling first prevents handshake drops
    reconnectionAttempts: 5,
    timeout: 10000,
  });

  socketRef.current = socket;

  // 2. Join required rooms (e.g. Admin room if user is Admin)
  socket.emit('room:join', 'role:Admin');

  // 3. Attach event listeners
  socket.on('notification:new', (newNotif) => {
    setNotifications((prev) => [newNotif, ...prev]);
    if (typeof setUnreadCount === 'function') {
      setUnreadCount((prev) => prev + 1);
    }
  });

  // 4. Clean up listeners and disconnect on unmount
  return () => {
    socket.off('notification:new'); // Remove listener first
    socket.disconnect();
    socketRef.current = null;
  };
}, [token, currentUserId]);

  const canGoBack = location.pathname !== '/developer/dashboard';

  function handleBack() {
    navigate('/');
  }

  function handleLogout() {
    logout();
    navigate('/developer/login');
  }

function handleNotificationClick(item) {
  setShowNotifications(false);

  // Navigate directly using the target link or sender ID parameter
  if (item.link) {
    navigate(item.link);
  } else if (item.senderId) {
    navigate(`/developer/dashboard/client-chat?clientId=${item.senderId}`);
  } else if (item.type === 'New Message' || item.title?.includes('Message')) {
    navigate('/developer/dashboard/client-chat');
  } else if (item.type === 'Meeting Reminder' || item.title?.includes('Meeting')) {
    navigate('/developer/dashboard/meetings');
  }
}

  async function openNotifications() {
    setShowNotifications((isOpen) => !isOpen);

    // Mark as read when opening panel
    if (!showNotifications && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      try {
        await api.patch('/developer/notifications/mark-all-read');
      } catch (err) {
        console.error("Failed to mark notifications read:", err);
      }
    }
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
            const Icon = item.icon;

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
            );
          })}
          <button
            className="dashboard-nav-link"
            type="button"
            onClick={() => {
              openNotifications();
              setIsSidebarOpen(false);
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
  <div className="dashboard-notification-panel" style={{ width: '320px', maxHeight: '380px', overflowY: 'auto' }}>
    <div style={{ padding: '10px 12px', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <strong>Notifications</strong>
      <small style={{ color: '#8b949e' }}>{notifications.length} total</small>
    </div>

    {notifications.length === 0 ? (
      <p style={{ padding: '12px', color: '#8b949e', fontStyle: 'italic', margin: 0 }}>No notifications yet.</p>
    ) : (
      notifications.map((item, index) => {
        const timeAgo = item.createdAt 
          ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now';

        return (
          <div 
            key={item._id || index} 
            onClick={() => handleNotificationClick(item)}
            style={{ 
              padding: '10px 12px', 
              borderBottom: '1px solid #21262d', 
              cursor: 'pointer',
              background: item.read ? 'transparent' : 'rgba(31, 111, 235, 0.08)'
            }}
            className="notification-item-hover"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <strong style={{ fontSize: '0.82rem', color: '#f0f6fc' }}>
                {item.senderName ? `From ${item.senderName}` : (item.title || "System Alert")}
              </strong>
              <small style={{ fontSize: '0.72rem', color: '#8b949e' }}>{timeAgo}</small>
            </div>

            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#c9d1d9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.message || item}
            </p>
          </div>
        );
      })
    )}
  </div>
)}
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </section>
  );
}

export default DashboardLayout;