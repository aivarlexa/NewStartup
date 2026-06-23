import { Bell, Briefcase, CalendarDays, ListChecks, MessagesSquare } from 'lucide-react'
import { dashboardMeetings, dashboardSummary, recentActivities } from '../../data/dashboardData'

const iconMap = { Briefcase, ListChecks, MessagesSquare, CalendarDays }

function DashboardOverview() {
  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Developer Workspace</p>
        <h1>Welcome back, Developer.</h1>
        <p>Manage projects, collaborate with your team, join meetings, and track client requirements from one workspace.</p>
      </div>

      <div className="dashboard-summary-grid">
        {dashboardSummary.map((item, index) => {
          const Icon = iconMap[item.icon] || Bell

          return (
            <article className="dashboard-summary-card" style={{ animationDelay: `${index * 70}ms` }} key={item.label}>
              <span><Icon size={20} /></span>
              <strong>{item.value}</strong>
              <h2>{item.label}</h2>
              <p>{item.status}</p>
            </article>
          )
        })}
      </div>

      <div className="dashboard-two-column">
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <h2>Recent Project Activity</h2>
          </div>
          <div className="dashboard-timeline">
            {recentActivities.map((activity) => (
              <article key={activity}>
                <span></span>
                <p>{activity}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <h2>Upcoming Meetings</h2>
          </div>
          <div className="dashboard-meeting-list">
            {dashboardMeetings.filter((meeting) => meeting.status === 'upcoming').slice(0, 3).map((meeting) => (
              <article className="dashboard-meeting-card compact" key={meeting.id}>
                <div>
                  <h3>{meeting.title}</h3>
                  <p>{meeting.project}</p>
                </div>
                <span>{meeting.date} · {meeting.time}</span>
                <small>{meeting.participants.join(', ')}</small>
                <button type="button">Join Meeting</button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardOverview
