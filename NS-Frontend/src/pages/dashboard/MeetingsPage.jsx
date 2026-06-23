import { useState } from 'react'
import { X } from 'lucide-react'
import { dashboardMeetings, dashboardProjects } from '../../data/dashboardData'

function MeetingsPage() {
  const [meetings, setMeetings] = useState(dashboardMeetings)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draft, setDraft] = useState({
    title: '',
    project: dashboardProjects[0].name,
    date: '',
    time: '',
    participants: '',
    type: 'Team Standup',
    notes: '',
  })

  function updateDraft(event) {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: value }))
  }

  function createMeeting(event) {
    event.preventDefault()

    setMeetings((current) => [
      {
        id: `m-${Date.now()}`,
        title: draft.title || draft.type,
        project: draft.project,
        date: draft.date || 'Scheduled date',
        time: draft.time || 'Scheduled time',
        participants: draft.participants.split(',').map((item) => item.trim()).filter(Boolean),
        type: draft.type,
        status: 'upcoming',
      },
      ...current,
    ])
    setIsModalOpen(false)
  }

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading split">
        <div>
          <p className="dashboard-kicker">Collaboration</p>
          <h1>Meetings</h1>
        </div>
        <button className="dashboard-primary-button" type="button" onClick={() => setIsModalOpen(true)}>Schedule New Meeting</button>
      </div>

      <div className="meetings-layout">
        <section className="dashboard-panel">
          <h2>Upcoming meetings</h2>
          <div className="dashboard-meeting-list">
            {meetings.filter((meeting) => meeting.status === 'upcoming').map((meeting) => (
              <article className="dashboard-meeting-card" key={meeting.id}>
                <div>
                  <h3>{meeting.title}</h3>
                  <p>{meeting.project}</p>
                </div>
                <span>{meeting.date} · {meeting.time}</span>
                <small>{meeting.participants.join(', ')}</small>
                <em>{meeting.type}</em>
                <div>
                  <button type="button">Join</button>
                  <button type="button">Reschedule</button>
                  <button type="button">Notes</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="dashboard-panel calendar-panel">
          <h2>Mini calendar</h2>
          <div className="mini-calendar">
            {Array.from({ length: 30 }, (_, index) => <span className={[24, 25, 26].includes(index + 1) ? 'active' : ''} key={index}>{index + 1}</span>)}
          </div>
        </aside>

        <section className="dashboard-panel">
          <h2>Past meetings</h2>
          {meetings.filter((meeting) => meeting.status === 'past').map((meeting) => (
            <article className="past-meeting-card" key={meeting.id}>
              <h3>{meeting.title}</h3>
              <p>{meeting.project} · {meeting.date}</p>
            </article>
          ))}
        </section>
      </div>

      {isModalOpen && (
        <div className="dashboard-modal-backdrop">
          <form className="dashboard-modal" onSubmit={createMeeting}>
            <button className="dashboard-modal-close" type="button" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
              <X size={18} />
            </button>
            <h2>Schedule New Meeting</h2>
            <input name="title" value={draft.title} onChange={updateDraft} placeholder="Meeting title" />
            <select name="project" value={draft.project} onChange={updateDraft}>
              {dashboardProjects.map((project) => <option key={project.id}>{project.name}</option>)}
            </select>
            <input name="date" type="date" value={draft.date} onChange={updateDraft} />
            <input name="time" type="time" value={draft.time} onChange={updateDraft} />
            <input name="participants" value={draft.participants} onChange={updateDraft} placeholder="Participants" />
            <select name="type" value={draft.type} onChange={updateDraft}>
              <option>Team Standup</option>
              <option>Client Requirement Meeting</option>
              <option>Project Review</option>
              <option>Sprint Planning</option>
              <option>Technical Discussion</option>
            </select>
            <textarea name="notes" value={draft.notes} onChange={updateDraft} placeholder="Notes"></textarea>
            <button className="dashboard-primary-button" type="submit">Create Meeting</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default MeetingsPage
