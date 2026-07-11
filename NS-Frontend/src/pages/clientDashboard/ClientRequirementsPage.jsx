import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../../services/api'

const initialForm = {
  projectTitle: '', category: '', description: '', skillsRequired: '', technologyStack: '', budget: '', deadline: '', priority: 'Medium', projectType: '', experienceRequired: '', attachments: '', additionalNotes: '',
}

function ClientRequirementsPage() {
  const [form, setForm] = useState(initialForm)
  const [requirements, setRequirements] = useState([])
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    api.get('/client/requirements').then(({ data }) => setRequirements(data.requirements || [])).catch(() => {})
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submitRequirement(status) {
    setIsSaving(true)
    setMessage('')
    try {
      const { data } = await api.post('/client/requirements', { ...form, status })
      setRequirements((current) => [data.requirement, ...current])
      setForm(initialForm)
      setMessage(status === 'Draft' ? 'Draft saved.' : 'Requirement submitted.')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to save requirement.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Project Requirements</p>
        <h1>Create a requirement.</h1>
        {message && <p>{message}</p>}
      </div>
      <section className="dashboard-panel client-form-panel">
        <div className="client-form-grid">
          <input name="projectTitle" value={form.projectTitle} onChange={updateField} placeholder="Project Title" />
          <input name="category" value={form.category} onChange={updateField} placeholder="Category" />
          <textarea name="description" value={form.description} onChange={updateField} placeholder="Description" />
          <input name="skillsRequired" value={form.skillsRequired} onChange={updateField} placeholder="Skills Required" />
          <input name="technologyStack" value={form.technologyStack} onChange={updateField} placeholder="Technology Stack" />
          <input name="budget" value={form.budget} onChange={updateField} placeholder="Budget" />
          <input name="deadline" type="date" value={form.deadline} onChange={updateField} />
          <select name="priority" value={form.priority} onChange={updateField}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select>
          <input name="projectType" value={form.projectType} onChange={updateField} placeholder="Project Type" />
          <input name="experienceRequired" value={form.experienceRequired} onChange={updateField} placeholder="Experience Required" />
          <input name="attachments" value={form.attachments} onChange={updateField} placeholder="Attachments URLs" />
          <textarea name="additionalNotes" value={form.additionalNotes} onChange={updateField} placeholder="Additional Notes" />
        </div>
        <div className="dashboard-heading-actions">
          <button className="dashboard-primary-button" type="button" disabled={isSaving} onClick={() => submitRequirement('Draft')}>Save Draft</button>
          <button className="dashboard-primary-button" type="button" disabled={isSaving} onClick={() => submitRequirement('Pending')}>Submit Requirement</button>
        </div>
      </section>
      <section className="dashboard-panel">
        <h2>Saved Requirements</h2>
        <div className="dashboard-project-grid">
          {requirements.map((item) => (
            <article className="dashboard-project-card" key={item.id}>
              <div className="dashboard-project-top"><h2>{item.projectTitle}</h2><span className="status-badge">{item.status}</span></div>
              <p>{item.description}</p>
              <div className="developer-chip-row"><span>{item.priority}</span><span>{item.budget || 'Budget TBD'}</span><span>{item.deadline || 'No deadline'}</span></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ClientRequirementsPage
