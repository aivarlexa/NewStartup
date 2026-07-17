import { useContext, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Briefcase, CalendarDays, ListChecks, MessagesSquare, RotateCcw } from 'lucide-react'
import { io } from 'socket.io-client'
import AuthContext from '../../context/AuthContext'
import api from '../../services/api'

// Centralized configuration for metric card mappings and navigation actions
// Inside DashboardOverview.jsx, update the cardsConfig array entries:
const cardsConfig = [
  ['activeProjects', 'Active Projects', Briefcase, ['Open', 'Assigned', 'Project'], '/developer/dashboard/projects'],
  ['pendingTasks', 'Pending Tasks', ListChecks, ['Pending', 'Task', 'Todo', 'Open'], '/developer/dashboard/tasks'],
  ['unreadMessages', 'Unread Messages', MessagesSquare, ['Message', 'message', 'chat'], '/developer/dashboard/client-chat'], // 👈 Update from /developer/chat to /developer/dashboard/client-chat
  ['upcomingMeetings', 'Upcoming Meetings', CalendarDays, ['Meeting', 'Scheduled'], '/developer/dashboard/meetings'],
]

const iconMap = { Briefcase, ListChecks, MessagesSquare, CalendarDays }

function DashboardOverview() {
  const { token, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [activeFilter, setActiveFilter] = useState(null)

  const currentUserId = user?.id || user?._id || ''

  // 1. Initial Data Fetching from Backend Engine
  useEffect(() => {
    if (!token) return

    api.get('/developer/summary')
      .then(({ data }) => {
        setData(data)
        setStatus('success')
      })
      .catch(() => setStatus('error'))
  }, [token])

  // 2. Socket Connection Layer to Hot-Update Metrics & Timeline Logs
  useEffect(() => {
    if (!token || status !== 'success') return undefined

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
    const ioInstance = io(socketUrl, { 
      auth: { token }, 
      transports: ['websocket'],
      forceNew: true 
    })

    ioInstance.on('message:new', (message) => {
      const senderId = typeof message.sender === 'object' ? message.sender?._id || message.sender?.id : message.sender
      const isExternalMessage = senderId && String(senderId) !== String(currentUserId)

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
            `New chat message received from client: "${message.text?.substring(0, 20)}..."`,
            ...(prev.latestActivity || []).slice(0, 4)
          ]
        }
      })
    })

    ioInstance.on('notification:received', (notification) => {
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          latestActivity: [
            notification.title || 'Workspace action updated',
            ...(prev.latestActivity || []).slice(0, 4)
          ]
        }
      })
    })

    // Clean up using the isolated variable context safely
    return () => {
      ioInstance.off('message:new')
      ioInstance.off('notification:received')
      ioInstance.disconnect()
    }
  }, [token, status, currentUserId])

  // 3. Computed Activity Timeline Keyword Filtering
  const filteredTimeline = useMemo(() => {
    if (!data?.latestActivity) return []
    if (!activeFilter) return data.latestActivity

    const targetKeywords = cardsConfig.find(([key]) => key === activeFilter)?.[3] || []
    
    return data.latestActivity.filter((activity) => 
      targetKeywords.some((keyword) => activity.toLowerCase().includes(keyword.toLowerCase()))
    )
  }, [data?.latestActivity, activeFilter])

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Developer Workspace</p>
        <h1>Welcome back, Developer.</h1>
        <p>Manage projects, collaborate with your team, join meetings, and track client requirements from one workspace.</p>
      </div>

      {status === 'loading' && <section className="dashboard-panel"><p>Loading workspace statistics...</p></section>}
      {status === 'error' && <section className="dashboard-panel"><p>Unable to retrieve workspace dashboard details.</p></section>}

      {status === 'success' && data && (
        <>
          {/* INTERACTIVE METRIC CARDS GRID */}
          <div className="dashboard-summary-grid">
            {cardsConfig.map(([key, label, Icon, , routePath], index) => {
              const isSelected = activeFilter === key
              const countValue = data.summary?.[key] ?? 0

              return (
                <article 
                  className={`dashboard-summary-card interactive-card ${isSelected ? 'selected-metric-focus' : ''}`} 
                  style={{ 
                    animationDelay: `${index * 70}ms`,
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.02)' : 'none',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease-in-out'
                  }} 
                  key={key}
                  onClick={() => navigate(routePath)}
                >
                  <span style={{ background: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: isSelected ? '#fff' : 'inherit' }}>
                    <Icon size={20} />
                  </span>
                  <strong>{countValue}</strong>
                  <h2>{label}</h2>
                  <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>
                    Click to explore operational layout
                  </p>
                </article>
              )
            })}
          </div>

          <div className="dashboard-two-column">
            {/* DYNAMIC TIMELINE FEED */}
            <section className="dashboard-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>
                  Recent Project Activity
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
                {filteredTimeline.length === 0 && (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No matching history records floating inside this filter.</p>
                )}
                {filteredTimeline.map((activity, idx) => (
                  <article key={`${activity}-${idx}`}>
                    <span style={{ background: activeFilter ? '#3b82f6' : 'var(--accent-color, #2d2d2d)' }}></span>
                    <p>{activity}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* DYNAMIC MEETINGS MATRIX */}
            <section className="dashboard-panel">
              <div className="dashboard-panel-heading">
                <h2>Upcoming Meetings</h2>
              </div>
              <div className="dashboard-meeting-list">
                {(data.meetings || []).length === 0 ? (
                  <p style={{ color: '#666', fontStyle: 'italic', padding: '1rem 0' }}>No pending scheduled meetings discovered.</p>
                ) : (
                  data.meetings.slice(0, 3).map((meeting) => (
                    <article className="dashboard-meeting-card compact" key={meeting.id || meeting._id}>
                      <div>
                        <h3>{meeting.description || 'Project Consultation'}</h3>
                        <p>{meeting.developerName || 'Client Briefing'}</p>
                      </div>
                      <span>{meeting.date} · {meeting.time}</span>
                      <small>Duration: {meeting.duration || 30} Mins</small>
                      {meeting.meetingLink && (
                        <a 
                          href={meeting.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="dashboard-action-link"
                          style={{ display: 'inline-block', textAlign: 'center', marginTop: '8px', textDecoration: 'none', background: '#3b82f6', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem' }}
                        >
                          Join Meeting
                        </a>
                      )}
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default DashboardOverview