import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../../services/api'

const initialMeeting = { developerName: '', date: '', time: '', duration: 30, meetingLink: '', meetingType: 'Google Meet', description: '' }

function ClientMeetingsPage() {
  const [meetings, setMeetings] = useState([])
  const [form, setForm] = useState(initialMeeting)
  const [message, setMessage] = useState('')

  useEffect(() => { api.get('/client/meetings').then(({ data }) => setMeetings(data.meetings || [])).catch(() => {}) }, [])
  function updateField(event) { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })) }
  async function createMeeting(event) {
    event.preventDefault(); setMessage('')
    try { const { data } = await api.post('/client/meetings', form); setMeetings((current) => [data.meeting, ...current]); setForm(initialMeeting); setMessage('Meeting scheduled.') }
    catch (error) { setMessage(getApiErrorMessage(error, 'Unable to schedule meeting.')) }
  }
  async function updateMeeting(id, status) {
    const { data } = await api.patch(`/client/meetings/${id}`, { status })
    setMeetings((current) => current.map((meeting) => meeting.id === id ? data.meeting : meeting))
  }
  const upcoming = meetings.filter((meeting) => meeting.status === 'Scheduled')
  const past = meetings.filter((meeting) => meeting.status !== 'Scheduled')

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading"><p className="dashboard-kicker">Meetings</p><h1>Schedule meetings.</h1>{message && <p>{message}</p>}</div>
      <div className="meetings-layout">
        <form className="dashboard-panel client-form-panel" onSubmit={createMeeting}>
          <h2>Create Meeting</h2>
          <div className="client-form-grid compact">
            <input name="developerName" value={form.developerName} onChange={updateField} placeholder="Choose Developer" />
            <input name="date" type="date" value={form.date} onChange={updateField} />
            <input name="time" type="time" value={form.time} onChange={updateField} />
            <input name="duration" type="number" value={form.duration} onChange={updateField} placeholder="Duration" />
            <input name="meetingLink" value={form.meetingLink} onChange={updateField} placeholder="Meeting Link" />
            <select name="meetingType" value={form.meetingType} onChange={updateField}><option>Google Meet</option><option>Zoom</option><option>Microsoft Teams</option></select>
            <textarea name="description" value={form.description} onChange={updateField} placeholder="Description" />
          </div>
          <button className="dashboard-primary-button" type="submit">Create Meeting</button>
        </form>
        <section className="dashboard-panel"><h2>Upcoming Meetings</h2>{upcoming.map((meeting) => <article className="dashboard-meeting-card" key={meeting.id}><h3>{meeting.developerName || 'Developer'}</h3><p>{meeting.description}</p><span>{meeting.date} · {meeting.time} · {meeting.duration} min</span><em>{meeting.meetingType}</em><div><button type="button" onClick={() => updateMeeting(meeting.id, 'Cancelled')}>Cancel Meeting</button><button type="button" onClick={() => setForm({ ...meeting, time: '' })}>Reschedule Meeting</button></div></article>)}</section>
        <section className="dashboard-panel"><h2>Past Meetings</h2>{past.map((meeting) => <article className="past-meeting-card" key={meeting.id}><h3>{meeting.developerName || 'Developer'}</h3><p>{meeting.status} · {meeting.date}</p></article>)}</section>
      </div>
    </div>
  )
}

export default ClientMeetingsPage
