import { Link, useParams } from 'react-router-dom'
import { dashboardProjects, recentActivities } from '../../data/dashboardData'

function ProjectDetailsPage() {
  const { id } = useParams()
  const project = dashboardProjects.find((item) => item.id === id) || dashboardProjects[0]

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading split">
        <div>
          <p className="dashboard-kicker">Project Overview</p>
          <h1>{project.name}</h1>
          <p>{project.client} · {project.type}</p>
        </div>
        <div className="dashboard-heading-actions">
          <Link to="/developer-dashboard/client-chat">Open Client Chat</Link>
          <Link to="/developer-dashboard/meetings">Schedule Meeting</Link>
        </div>
      </div>

      <div className="project-detail-grid">
        <section className="dashboard-panel project-overview-panel">
          <h2>Project overview</h2>
          <p>{project.requirements}</p>
          <div className="dashboard-progress large">
            <div><span style={{ width: `${project.progress}%` }}></span></div>
            <strong>{project.progress}% complete</strong>
          </div>
        </section>

        <section className="dashboard-panel">
          <h2>Client requirements</h2>
          <p>{project.requirements}</p>
        </section>

        <section className="dashboard-panel">
          <h2>Project files</h2>
          <div className="file-stack">
            {project.files.map((file) => <span key={file}>{file}</span>)}
          </div>
        </section>

        <section className="dashboard-panel">
          <h2>Assigned developers</h2>
          <div className="developer-chip-row">
            {project.developers.map((developer) => <span key={developer}>{developer}</span>)}
          </div>
        </section>

        <section className="dashboard-panel">
          <h2>Task list</h2>
          <div className="task-stack">
            {project.tasks.map((task) => <label key={task}><input type="checkbox" /> {task}</label>)}
          </div>
        </section>

        <section className="dashboard-panel">
          <h2>Activity timeline</h2>
          <div className="dashboard-timeline">
            {recentActivities.map((activity) => (
              <article key={activity}>
                <span></span>
                <p>{activity}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-panel project-message-panel">
          <h2>Client messages preview</h2>
          {project.messages.map((message) => <p key={message}>{message}</p>)}
        </section>
      </div>
    </div>
  )
}

export default ProjectDetailsPage
