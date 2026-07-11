import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

const TYPES = ['All', 'New Message', 'Meeting Reminder', 'Project Updates', 'Developer Accepted Request', 'Developer Rejected Request', 'System Notifications']

function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [type, setType] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/client/notifications', { params: { type, search } }).then(({ data }) => setNotifications(data.notifications || [])).catch(() => setNotifications([]))
  }, [type, search])

  async function markAsRead(id) {
    await api.patch(`/client/notifications/${id}/read`)
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item))
  }

  async function deleteNotification(id) {
    await api.delete(`/client/notifications/${id}`)
    setNotifications((current) => current.filter((item) => item.id !== id))
  }

  const unread = useMemo(() => notifications.filter((item) => !item.read).length, [notifications])

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading"><p className="dashboard-kicker">Notifications</p><h1>Notification center.</h1><p>{unread} unread notifications</p></div>
      <div className="dashboard-filters"><div className="dashboard-search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notifications" /></div><select value={type} onChange={(event) => setType(event.target.value)}>{TYPES.map((item) => <option key={item}>{item}</option>)}</select></div>
      <section className="dashboard-panel"><div className="dashboard-meeting-list">{notifications.map((item) => <article className="dashboard-meeting-card" key={item.id}><div><h3>{item.title}</h3><span className="status-badge">{item.type}</span></div><p>{item.message}</p><small>{item.read ? 'Read' : 'Unread'}</small><div><button type="button" onClick={() => markAsRead(item.id)}>Mark as Read</button><button type="button" onClick={() => deleteNotification(item.id)}>Delete Notification</button></div></article>)}</div></section>
    </div>
  )
}

export default ClientNotificationsPage
