import { useEffect, useState } from 'react'
import { Bell, Briefcase, CalendarDays, CheckCircle2, Clock, MessageCircle } from 'lucide-react'
import api from '../../services/api'

const cards = [
  ['activeProjects', 'Active Projects', Briefcase],
  ['pendingRequests', 'Pending Requests', Clock],
  ['completedProjects', 'Completed Projects', CheckCircle2],
  ['unreadMessages', 'Unread Messages', MessageCircle],
  ['upcomingMeetings', 'Upcoming Meetings', CalendarDays],
  ['recentNotifications', 'Recent Notifications', Bell],
]

function ClientDashboardHome() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    api.get('/client/summary')
      .then(({ data }) => {
        setData(data)
        setStatus('success')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Client Workspace</p>
        <h1>Welcome back.</h1>
        <p>Create requirements, track progress, chat with developers, and manage project meetings from one secure dashboard.</p>
      </div>

      {status === 'loading' && <section className="dashboard-panel"><p>Loading dashboard...</p></section>}
      {status === 'error' && <section className="dashboard-panel"><p>Unable to load dashboard right now.</p></section>}

      {status === 'success' && (
        <>
          <div className="dashboard-summary-grid client-summary-grid">
            {cards.map(([key, label, Icon], index) => (
              <article className="dashboard-summary-card" style={{ animationDelay: `${index * 60}ms` }} key={key}>
                <span><Icon size={20} /></span>
                <strong>{data.summary?.[key] ?? 0}</strong>
                <h2>{label}</h2>
                <p>Updated from your workspace activity.</p>
              </article>
            ))}
          </div>

          <div className="dashboard-two-column">
            <section className="dashboard-panel">
              <h2>Latest Activity Timeline</h2>
              <div className="dashboard-timeline">
                {(data.latestActivity || []).length === 0 && <p>No recent activity yet.</p>}
                {(data.latestActivity || []).map((activity) => (
                  <article key={activity}><span></span><p>{activity}</p></article>
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
