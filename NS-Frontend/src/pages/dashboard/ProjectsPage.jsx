import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { dashboardProjects } from '../../data/dashboardData'

function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [priority, setPriority] = useState('All')
  const [client, setClient] = useState('All')
  const statuses = ['All', ...new Set(dashboardProjects.map((project) => project.status))]
  const priorities = ['All', ...new Set(dashboardProjects.map((project) => project.priority))]
  const clients = ['All', ...new Set(dashboardProjects.map((project) => project.client))]

  const filteredProjects = useMemo(
    () =>
      dashboardProjects.filter((project) => {
        const matchesSearch = `${project.name} ${project.client} ${project.type}`.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = status === 'All' || project.status === status
        const matchesPriority = priority === 'All' || project.priority === priority
        const matchesClient = client === 'All' || project.client === client

        return matchesSearch && matchesStatus && matchesPriority && matchesClient
      }),
    [client, priority, search, status],
  )

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Projects</p>
        <h1>Assigned Projects</h1>
      </div>

      <div className="dashboard-filters">
        <label className="dashboard-search">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
          {statuses.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Filter by priority">
          {priorities.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={client} onChange={(event) => setClient(event.target.value)} aria-label="Filter by client">
          {clients.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="dashboard-project-grid">
        {filteredProjects.map((project) => (
          <article className="dashboard-project-card" key={project.id}>
            <div className="dashboard-project-top">
              <div>
                <h2>{project.name}</h2>
                <p>{project.client}</p>
              </div>
              <span className={`status-badge ${project.status.toLowerCase().replaceAll(' ', '-')}`}>{project.status}</span>
            </div>
            <div className="dashboard-project-meta">
              <span>{project.type}</span>
              <span>{project.priority} Priority</span>
              <span>{project.deadline}</span>
            </div>
            <div className="dashboard-progress">
              <div><span style={{ width: `${project.progress}%` }}></span></div>
              <strong>{project.progress}%</strong>
            </div>
            <p>{project.developers.join(', ')}</p>
            <Link className="dashboard-action-link" to={`/developer/dashboard/project/${project.id}`}>View Project</Link>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ProjectsPage
