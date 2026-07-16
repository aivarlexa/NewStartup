import { useContext, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom' // 👈 Import useNavigate for navigation
import { Bell, Briefcase, CalendarDays, CheckCircle2, Clock, MessageCircle, RotateCcw } from 'lucide-react'
import { io } from 'socket.io-client'
import AuthContext from '../../context/AuthContext'
import api from '../../services/api'

const cards = [
  ['activeProjects', 'Active Projects', Briefcase, ['Open', 'Assigned'], '/client/dashboard/requirements'],
  ['pendingRequests', 'Pending Requests', Clock, ['Pending'], '/client/dashboard/requirements'],
  ['completedProjects', 'Completed Projects', CheckCircle2, ['Completed'], '/client/dashboard/requirements'],
  ['unreadMessages', 'Unread Messages', MessageCircle, ['Message', 'message'], '/client/dashboard/chat'], // 👈 Target Route paths
  ['upcomingMeetings', 'Upcoming Meetings', CalendarDays, ['Meeting', 'Scheduled'], '/client/dashboard/meetings'],
  ['recentNotifications', 'Recent Notifications', Bell, ['Notification', 'Updates'], '/client/dashboard/notifications'],
]

function ClientDashboardHome() {
  const { token, user } = useContext(AuthContext) // 👈 Grab user profile context to identify sender
  const navigate = useNavigate() // 👈 Initialize navigation trigger hook
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [activeFilter, setActiveFilter] = useState(null)

  const currentUserId = user?.id || user?._id || ''

  // 1. Core HTTP Initial State Data Sync
  useEffect(() => {
    if (!token) return

    api.get('/client/summary')
      .then(({ data }) => {
        setData(data)
        setStatus('success')
      })
      .catch(() => setStatus('error'))
  }, [token])

  // 2. Real-Time Socket Connection Layer to Hot-Update Unread Counters & Activity Metrics
  useEffect(() => {
    if (!token || status !== 'success') return undefined

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
    const socket = io(socketUrl, { 
      auth: { token }, 
      transports: ['websocket'],
      forceNew: true 
    })

    socket.on('message:new', (message) => {
      // FIX: Extract the sender's identifier string safely
      const senderId = typeof message.sender === 'object' ? message.sender?._id || message.sender?.id : message.sender;
      
      // FIX: Only increment the counter if the message came from someone else (e.g., the Developer)
      const isExternalMessage = senderId && String(senderId) !== String(currentUserId);

      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          summary: {
            ...prev.summary,
            unreadMessages: isExternalMessage 
              ? (prev.summary.unreadMessages || 0) + 1 
              : (prev.summary.unreadMessages || 0)
          },
          latestActivity: [
            `New message received: "${message.text?.substring(0, 20)}..."`,
            ...(prev.latestActivity || []).slice(0, 4)
          ]
        }
      })
    })

    socket.on('notification:received', (notification) => {
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          summary: {
            ...prev.summary,
            recentNotifications: (prev.summary.recentNotifications || 0) + 1
          },
          latestActivity: [
            notification.title || 'System Notification Triggered',
            ...(prev.latestActivity || []).slice(0, 4)
          ]
        }
      })
    })

    return () => {
      socket.off('message:new')
      socket.off('notification:received')
      socket.disconnect()
    }
  }, [token, status, currentUserId])

  // 3. Dynamic Timeline Computed Filtering Matrix
  const filteredTimeline = useMemo(() => {
    if (!data?.latestActivity) return []
    if (!activeFilter) return data.latestActivity

    const targetKeywords = cards.find(([key]) => key === activeFilter)?.[3] || []
    
    return data.latestActivity.filter((activity) => 
      targetKeywords.some((keyword) => activity.toLowerCase().includes(keyword.toLowerCase()))
    )
  }, [data?.latestActivity, activeFilter])

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Client Workspace</p>
        <h1>Welcome back.</h1>
        <p>Create requirements, track progress, chat with developers, and manage project meetings from one secure dashboard.</p>
      </div>

      {status === 'loading' && <section className="dashboard-panel"><p>Loading dashboard...</p></section>}
      {status === 'error' && <section className="dashboard-panel"><p>Unable to load dashboard right now.</p></section>}

      {status === 'success' && data && (
        <>
          {/* DYNAMIC METRIC INTERACTION PANELS */}
          <div className="dashboard-summary-grid client-summary-grid">
            {cards.map(([key, label, Icon, , routePath], index) => {
              const isSelected = activeFilter === key;
              return (
                <article 
                  className={`dashboard-summary-card interactive-card ${isSelected ? 'selected-metric-focus' : ''}`} 
                  style={{ 
                    animationDelay: `${index * 60}ms`,
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.02)' : 'none',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease-in-out'
                  }} 
                  key={key}
                  // FIX: Clicking explicitly routes the browser path to the workspace view tool matrix
                  onClick={() => navigate(routePath)}
                >
                  <span style={{ background: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: isSelected ? '#fff' : 'inherit' }}>
                    <Icon size={20} />
                  </span>
                  <strong>{data.summary?.[key] ?? 0}</strong>
                  <h2>{label}</h2>
                  <p>Click to open workspace area</p>
                </article>
              )
            })}
          </div>

          <div className="dashboard-two-column">
            {/* DYNAMIC TIMELINE CONTAINER BLOCK */}
            <section className="dashboard-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>
                  Latest Activity Timeline 
                  {activeFilter && <small style={{ fontSize: '0.8rem', color: '#3b82f6', marginLeft: '8px' }}>(Filtered)</small>}
                </h2>
                {activeFilter && (
                  <button 
                    type="button" 
                    onClick={() => setActiveFilter(null)}
                    style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    <RotateCcw size={12} /> Reset Timeline
                  </button>
                )}
              </div>
              <div className="dashboard-timeline">
                {filteredTimeline.length === 0 && <p style={{ color: '#666', fontStyle: 'italic' }}>No matching history records floating inside this filter.</p>}
                {filteredTimeline.map((activity, idx) => (
                  <article key={`${activity}-${idx}`}>
                    <span style={{ background: activeFilter ? '#3b82f6' : 'var(--accent-color, #2d2d2d)' }}></span>
                    <p>{activity}</p>
                  </article>
                ))}
              </div>
            </section>
            
            <section className="dashboard-panel">
              <h2>Quick Actions</h2>
              <div className="quick-action-grid">
                <a className="dashboard-action-link" href="/client/dashboard/requirements">New Requirement</a>
                <a className="dashboard-action-link" href="/client/dashboard/chat">Message Developers</a>
                <a className="dashboard-action-link" href="/client/dashboard/meetings">Schedule Meeting</a>
                <a className="dashboard-action-link" href="/client/dashboard/profile">Edit Profile</a>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default ClientDashboardHome