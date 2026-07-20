import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCheck, Loader2, Search, Trash2 } from 'lucide-react'
import { io } from 'socket.io-client'
import AuthContext from '../../context/AuthContext'
import api, { getApiErrorMessage } from '../../services/api'

const TYPES = [
  'All',
  'New Message',
  'Meeting Reminder',
  'Project Updates',
  'Developer Accepted Request',
  'Developer Rejected Request',
  'System Notifications'
]

function ClientNotificationsPage() {
  const { token, user } = useContext(AuthContext)
  const [notifications, setNotifications] = useState([])
  const [type, setType] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const socketRef = useRef(null)
  const currentUserId = user?.id || user?._id || ''

  // 1. Fetch notifications with clean error handling
  const fetchNotifications = async () => {
    if (!token) return
    try {
      setLoading(true)
      setError('')
      const { data } = await api.get('/client/notifications', {
        params: { type, search }
      })
      setNotifications(data.notifications || [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load notifications.'))
    } finally {
      setLoading(false)
    }
  }

  // Debounced fetch for search & category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications()
    }, 300)

    return () => clearTimeout(timer)
  }, [type, search, token])

  // 2. Real-time Socket Listener for incoming alerts
  useEffect(() => {
    if (!token || !currentUserId) return undefined

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    })
    socketRef.current = socket

    // Direct user room alert listener
    socket.on('notification:new', (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev])
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token, currentUserId])

  // 3. Mark single notification as read (Optimistic UI)
  async function markAsRead(id) {
    if (!id) return
    const targetId = String(id)

    setNotifications((current) =>
      current.map((item) =>
        String(item.id || item._id) === targetId ? { ...item, read: true } : item
      )
    )

    try {
      await api.patch(`/client/notifications/${targetId}/read`)
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      fetchNotifications() // Revert state if backend request fails
    }
  }

  // 4. Mark ALL as read
  async function markAllAsRead() {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))

    try {
      await api.post('/client/notifications/mark-all-read')
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      fetchNotifications()
    }
  }

  // 5. Delete notification (Optimistic UI)
  async function deleteNotification(id) {
    if (!id) return
    const targetId = String(id)

    setNotifications((current) =>
      current.filter((item) => String(item.id || item._id) !== targetId)
    )

    try {
      await api.delete(`/client/notifications/${targetId}`)
    } catch (err) {
      console.error('Failed to delete notification:', err)
      fetchNotifications() // Revert state if backend request fails
    }
  }

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  )

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="dashboard-kicker">Notifications</p>
          <h1>Notification Center</h1>
          <p style={{ color: unreadCount > 0 ? '#58a6ff' : '#8b949e', fontWeight: unreadCount > 0 ? '600' : 'normal' }}>
            {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            style={{
              background: '#161b22',
              border: '1px solid #30363d',
              color: '#f0f6fc',
              padding: '8px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem'
            }}
          >
            <CheckCheck size={16} style={{ color: '#22c55e' }} />
            Mark All as Read
          </button>
        )}
      </div>

      {/* FILTER AND SEARCH BAR */}
      <div className="dashboard-filters">
        <label className="dashboard-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notification title or body..."
          />
        </label>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          {TYPES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ background: 'rgba(248, 81, 73, 0.1)', border: '1px solid #f85149', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#f85149', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* NOTIFICATION FEED SECTION */}
      <section className="dashboard-panel">
        {loading ? (
          <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#8b949e' }}>
            <Loader2 className="animate-spin" size={28} style={{ color: '#1f6feb' }} />
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>Retrieving notification feed...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#8b949e', fontStyle: 'italic' }}>
            No notifications found matching selected filters.
          </div>
        ) : (
          <div className="dashboard-meeting-list">
            {notifications.map((item) => {
              const notifId = item.id || item._id
              const formattedDate = item.createdAt
                ? new Date(item.createdAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })
                : ''

              return (
                <article
                  className="dashboard-meeting-card"
                  key={notifId}
                  style={{
                    background: item.read ? 'transparent' : 'rgba(31, 111, 235, 0.04)',
                    borderLeft: item.read ? '3px solid transparent' : '3px solid #1f6feb',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3>{item.title}</h3>
                    <span className={`status-badge ${String(item.type || 'system').toLowerCase().replaceAll(' ', '-')}`}>
                      {item.type || 'Notification'}
                    </span>
                  </div>

                  <p style={{ margin: '8px 0', color: item.read ? '#8b949e' : '#c9d1d9' }}>
                    {item.message}
                  </p>

                  {formattedDate && (
                    <small style={{ color: '#8b949e', display: 'block', marginBottom: '12px' }}>
                      {formattedDate}
                    </small>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notifId)}
                        style={{
                          background: '#161b22',
                          border: '1px solid #30363d',
                          color: '#58a6ff',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteNotification(notifId)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #30363d',
                        color: '#f85149',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default ClientNotificationsPage