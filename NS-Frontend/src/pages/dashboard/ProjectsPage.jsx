import { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import AuthContext from '../../context/AuthContext'
import api, { getApiErrorMessage } from '../../services/api'

function ProjectsPage() {
  const { token } = useContext(AuthContext)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter States
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [priority, setPriority] = useState('All')
  const [clientFilter, setClientFilter] = useState('All')

  // 1. Fetch live assigned developer projects upon initial page mounting
  useEffect(() => {
    if (!token) return

    setLoading(true)
    setError('')

    api.get('/developer/projects')
      .then(({ data }) => {
        setProjects(data.projects || [])
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, 'Failed to fetch assigned project modules.'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token])

  // 2. Derive unique filter options dynamically from the live datastore response matrix
  const statuses = useMemo(() => {
    return ['All', ...new Set(projects.map((p) => p.status).filter(Boolean))]
  }, [projects])

  const priorities = useMemo(() => {
    return ['All', ...new Set(projects.map((p) => p.priority).filter(Boolean))]
  }, [projects])

  const clientCompanies = useMemo(() => {
    return ['All', ...new Set(projects.map((p) => p.client?.companyName || p.client?.name).filter(Boolean))]
  }, [projects])

  // 3. Compute structural filter combinations against search parameters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const clientName = project.client?.companyName || project.client?.name || 'Independent Client'
      const projectTitle = project.projectTitle || 'Untitled Project'
      const category = project.category || 'General'

      const matchesSearch = `${projectTitle} ${clientName} ${category}`
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesStatus = status === 'All' || project.status === status
      const matchesPriority = priority === 'All' || project.priority === priority
      
      const matchesClient = clientFilter === 'All' || clientName === clientFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesClient
    })
  }, [projects, search, status, priority, clientFilter])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '12px', color: '#8b949e' }}>
        <Loader2 className="animate-spin" size={32} style={{ color: '#1f6feb' }} />
        <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>Compiling active developer registries...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Projects</p>
        <h1>Assigned Projects</h1>
      </div>

      {error && (
        <div style={{ background: 'rgba(248, 81, 73, 0.1)', border: '1px solid #f85149', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#f85149', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* FILTER PANEL DEPLOYMENT MATRIX */}
      <div className="dashboard-filters">
        <label className="dashboard-search">
          <Search size={18} />
          <input 
            value={search} 
            onChange={(event) => setSearch(event.target.value)} 
            placeholder="Search projects, clients, or stacks..." 
          />
        </label>
        
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
          {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        
        <select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Filter by priority">
          {priorities.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        
        <select value={clientFilter} onChange={(event) => setClientFilter(event.target.value)} aria-label="Filter by client">
          {clientCompanies.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {/* DYNAMIC KANBAN CARD RENDER SECTION */}
      <div className="dashboard-project-grid">
        {filteredProjects.map((project) => {
          const clientCompany = project.client?.companyName || project.client?.name || 'Independent Client'
          const deadlineDate = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Deadline Assigned'
          
          // Calculate project lanes progress index safely based on status
          let progressPercentage = 0
          if (project.status === 'Assigned') progressPercentage = 25
          if (project.status === 'In Progress') progressPercentage = 60
          if (project.status === 'Completed') progressPercentage = 100

          return (
            <article className="dashboard-project-card" key={project._id}>
              <div className="dashboard-project-top">
                <div>
                  <h2>{project.projectTitle || 'Untitled Requirement'}</h2>
                  <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '2px' }}>{clientCompany}</p>
                </div>
                <span className={`status-badge ${String(project.status || 'pending').toLowerCase().replaceAll(' ', '-')}`}>
                  {project.status || 'Pending'}
                </span>
              </div>

              <div className="dashboard-project-meta">
                <span>{project.category || 'General Development'}</span>
                <span>{project.priority || 'Medium'} Priority</span>
                <span style={{ color: project.priority === 'High' ? '#f85149' : '#8b949e' }}>
                  {deadlineDate}
                </span>
              </div>

              {/* PROGRESS STATUS TELEMETRY MAPPING */}
              <div className="dashboard-progress">
                <div>
                  <span style={{ 
                    width: `${progressPercentage}%`,
                    background: progressPercentage === 100 ? '#22c55e' : '#1f6feb'
                  }}></span>
                </div>
                <strong>{progressPercentage}%</strong>
              </div>

              {/* TECHNOLOGY KEYWORDS SYNC PILLS */}
              {project.technologyStack && project.technologyStack.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '12px 0' }}>
                  {project.technologyStack.slice(0, 3).map((tech, idx) => (
                    <span key={idx} style={{ background: '#161b22', border: '1px solid #30363d', color: '#c9d1d9', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px' }}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <Link 
                className="dashboard-action-link" 
                to={`/developer/dashboard/project/${project._id}`}
                style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}
              >
                View Project Details
              </Link>
            </article>
          )
        })}
      </div>

      {filteredProjects.length === 0 && !loading && (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed #30363d', borderRadius: '8px', color: '#8b949e', fontStyle: 'italic', marginTop: '1.5rem' }}>
          No project requirements tracked matching the selected parameter queries.
        </div>
      )}
    </div>
  )
}

export default ProjectsPage