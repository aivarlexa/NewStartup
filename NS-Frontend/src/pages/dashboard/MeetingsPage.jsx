import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CalendarOff, Link as LinkIcon, Settings, X } from 'lucide-react'
import AuthContext from '../../context/AuthContext'
import api, { getApiErrorMessage } from '../../services/api'

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
]

function MeetingsPage() {
  const { token } = useContext(AuthContext)
  const [meetings, setMeetings] = useState([])
  const [settings, setSettings] = useState(null)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [rescheduleMeeting, setRescheduleMeeting] = useState(null)
  const [rescheduleDraft, setRescheduleDraft] = useState({ date: '', time: '', duration: 30 })
  const [availableSlots, setAvailableSlots] = useState([])
  const [blockedDraft, setBlockedDraft] = useState({ date: '', reason: '' })

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  const apiFetch = useCallback(async function apiFetch(path, options = {}) {
    try {
      const { data } = await api.request({
        url: path,
        ...options,
        headers: {
          ...authHeaders,
          ...(options.headers || {}),
        },
      })

      if (!data.success) {
        throw new Error(data.message || 'Request failed.')
      }

      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, error.message || 'Request failed.'), { cause: error })
    }
  }, [authHeaders])

  const loadMeetings = useCallback(async function loadMeetings() {
    setStatus('loading')
    setMessage('')

    try {
      const [meetingData, settingsData] = await Promise.all([
        apiFetch('/bookings/admin?status=all'),
        apiFetch('/bookings/settings'),
      ])
      setMeetings(meetingData.bookings || [])
      setSettings(settingsData.settings)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }, [apiFetch])

  useEffect(() => {
    if (!token) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      loadMeetings()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadMeetings, token])

  useEffect(() => {
    if (!rescheduleDraft.date || !rescheduleDraft.duration) {
      const timeoutId = window.setTimeout(() => setAvailableSlots([]), 0)
      return () => window.clearTimeout(timeoutId)
    }

    const controller = new AbortController()

    async function loadSlots() {
      try {
        const { data } = await api.get('/bookings/slots', {
          params: { date: rescheduleDraft.date, duration: rescheduleDraft.duration },
          signal: controller.signal,
        })
        setAvailableSlots(data.success ? data.slots || [] : [])
      } catch (error) {
        if (error.name !== 'AbortError' && error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') setAvailableSlots([])
      }
    }

    loadSlots()
    return () => controller.abort()
  }, [rescheduleDraft.date, rescheduleDraft.duration])

  function formatMeeting(booking) {
    return `${booking.date} · ${booking.time} · ${booking.duration} min`
  }

  function updateSettingsField(event) {
    const { name, value } = event.target
    setSettings((current) => ({ ...current, [name]: name.includes('Duration') || name === 'slotStepMinutes' ? Number(value) : value }))
  }

  function toggleWorkingDay(day) {
    setSettings((current) => {
      const workingDays = current.workingDays.includes(day)
        ? current.workingDays.filter((item) => item !== day)
        : [...current.workingDays, day].sort()
      return { ...current, workingDays }
    })
  }

  function addBlockedDate() {
    if (!blockedDraft.date) return
    setSettings((current) => ({
      ...current,
      blockedDates: [
        ...(current.blockedDates || []).filter((item) => item.date !== blockedDraft.date),
        blockedDraft,
      ],
    }))
    setBlockedDraft({ date: '', reason: '' })
  }

  function removeBlockedDate(date) {
    setSettings((current) => ({
      ...current,
      blockedDates: (current.blockedDates || []).filter((item) => item.date !== date),
    }))
  }

  async function saveSettings(event) {
    event.preventDefault()
    setMessage('')

    try {
      const data = await apiFetch('/bookings/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      })
      setSettings(data.settings)
      setMessage('Working hours updated.')
      setIsSettingsOpen(false)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function cancelMeeting(booking) {
    const reason = window.prompt('Cancellation reason', 'Cancelled by admin')
    if (reason === null) return

    try {
      await apiFetch(`/bookings/admin/${booking.id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      })
      await loadMeetings()
    } catch (error) {
      setMessage(error.message)
    }
  }

  function openReschedule(booking) {
    setRescheduleMeeting(booking)
    setRescheduleDraft({ date: booking.date, time: '', duration: booking.duration })
  }

  async function submitReschedule(event) {
    event.preventDefault()

    try {
      await apiFetch(`/bookings/admin/${rescheduleMeeting.id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify(rescheduleDraft),
      })
      setRescheduleMeeting(null)
      await loadMeetings()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function connectGoogleCalendar() {
    try {
      const data = await apiFetch('/bookings/google/auth-url')
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      setMessage(error.message)
    }
  }
  const upcomingMeetings = meetings.filter((meeting) => meeting.status === 'scheduled')
  const pastMeetings = meetings.filter((meeting) => meeting.status !== 'scheduled')

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading split">
        <div>
          <p className="dashboard-kicker">Collaboration</p>
          <h1>Meetings</h1>
          {message && <p>{message}</p>}
        </div>
        <div className="dashboard-heading-actions">
          <button className="dashboard-primary-button" type="button" onClick={connectGoogleCalendar}>Connect Google Calendar</button>
          <button className="dashboard-primary-button" type="button" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={17} /> Configure Availability
          </button>
        </div>
      </div>

      {status === 'loading' && <section className="dashboard-panel"><p>Loading meetings...</p></section>}
      {status === 'error' && <section className="dashboard-panel"><p>{message}</p></section>}

      {status === 'success' && (
        <div className="meetings-layout">
          <section className="dashboard-panel">
            <h2>Upcoming meetings</h2>
            <div className="dashboard-meeting-list">
              {upcomingMeetings.length === 0 && <p>No upcoming meetings.</p>}
              {upcomingMeetings.map((meeting) => (
                <article className="dashboard-meeting-card" key={meeting.id}>
                  <div>
                    <h3>{meeting.purpose}</h3>
                    <p>{meeting.company || meeting.name}</p>
                  </div>
                  <span>{formatMeeting(meeting)}</span>
                  <small>{meeting.name} · {meeting.email}</small>
                  <em>{meeting.status}</em>
                  <div>
                    {meeting.meetLink && <a className="dashboard-primary-button" href={meeting.meetLink} target="_blank" rel="noreferrer"><LinkIcon size={16} /> Join</a>}
                    <button type="button" onClick={() => openReschedule(meeting)}>Reschedule</button>
                    <button type="button" onClick={() => cancelMeeting(meeting)}>Cancel</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="dashboard-panel calendar-panel">
            <h2>Availability</h2>
            {settings && (
              <div className="admin-settings-summary">
                <p>{settings.startTime} - {settings.endTime}</p>
                <p>{settings.timezone}</p>
                <div className="developer-chip-row">
                  {settings.workingDays.map((day) => <span key={day}>{DAYS.find((item) => item.value === day)?.label}</span>)}
                </div>
                <h3>Blocked dates</h3>
                {(settings.blockedDates || []).length === 0 && <p>No blocked dates.</p>}
                {(settings.blockedDates || []).map((blocked) => (
                  <p key={blocked.date}><CalendarOff size={14} /> {blocked.date} {blocked.reason ? `- ${blocked.reason}` : ''}</p>
                ))}
              </div>
            )}
          </aside>

          <section className="dashboard-panel">
            <h2>Cancelled and past meetings</h2>
            {pastMeetings.length === 0 && <p>No cancelled or past meetings.</p>}
            {pastMeetings.map((meeting) => (
              <article className="past-meeting-card" key={meeting.id}>
                <h3>{meeting.purpose}</h3>
                <p>{meeting.company || meeting.name} · {formatMeeting(meeting)}</p>
                <p>{meeting.status}</p>
              </article>
            ))}
          </section>
        </div>
      )}

      {isSettingsOpen && settings && (
        <div className="dashboard-modal-backdrop">
          <form className="dashboard-modal booking-admin-modal" onSubmit={saveSettings}>
            <button className="dashboard-modal-close" type="button" onClick={() => setIsSettingsOpen(false)} aria-label="Close modal">
              <X size={18} />
            </button>
            <h2>Configure Availability</h2>
            <input name="adminEmail" value={settings.adminEmail || ''} onChange={updateSettingsField} placeholder="Admin email" />
            <input name="timezone" value={settings.timezone || ''} onChange={updateSettingsField} placeholder="Timezone" />
            <div className="dashboard-modal-grid">
              <input name="startTime" type="time" value={settings.startTime || ''} onChange={updateSettingsField} />
              <input name="endTime" type="time" value={settings.endTime || ''} onChange={updateSettingsField} />
              <input name="slotStepMinutes" type="number" min="5" max="120" value={settings.slotStepMinutes || 30} onChange={updateSettingsField} />
              <input name="defaultDuration" type="number" min="15" max="240" value={settings.defaultDuration || 30} onChange={updateSettingsField} />
            </div>
            <div className="admin-day-grid">
              {DAYS.map((day) => (
                <button className={settings.workingDays.includes(day.value) ? 'active' : ''} type="button" key={day.value} onClick={() => toggleWorkingDay(day.value)}>
                  {day.label}
                </button>
              ))}
            </div>
            <div className="dashboard-modal-grid">
              <input type="date" value={blockedDraft.date} onChange={(event) => setBlockedDraft((current) => ({ ...current, date: event.target.value }))} />
              <input value={blockedDraft.reason} onChange={(event) => setBlockedDraft((current) => ({ ...current, reason: event.target.value }))} placeholder="Block reason" />
            </div>
            <button type="button" onClick={addBlockedDate}>Block Date</button>
            <div className="developer-chip-row">
              {(settings.blockedDates || []).map((blocked) => (
                <span key={blocked.date}>{blocked.date} <button type="button" onClick={() => removeBlockedDate(blocked.date)}>x</button></span>
              ))}
            </div>
            <button className="dashboard-primary-button" type="submit">Save Availability</button>
          </form>
        </div>
      )}

      {rescheduleMeeting && (
        <div className="dashboard-modal-backdrop">
          <form className="dashboard-modal" onSubmit={submitReschedule}>
            <button className="dashboard-modal-close" type="button" onClick={() => setRescheduleMeeting(null)} aria-label="Close modal">
              <X size={18} />
            </button>
            <h2>Reschedule Meeting</h2>
            <input type="date" value={rescheduleDraft.date} onChange={(event) => setRescheduleDraft((current) => ({ ...current, date: event.target.value, time: '' }))} />
            <select value={rescheduleDraft.duration} onChange={(event) => setRescheduleDraft((current) => ({ ...current, duration: Number(event.target.value), time: '' }))}>
              {[30, 45, 60, 90].map((duration) => <option value={duration} key={duration}>{duration} minutes</option>)}
            </select>
            <div className="admin-day-grid">
              {availableSlots.length === 0 && <p>No available slots.</p>}
              {availableSlots.map((slot) => (
                <button className={rescheduleDraft.time === slot.time ? 'active' : ''} type="button" key={slot.time} onClick={() => setRescheduleDraft((current) => ({ ...current, time: slot.time }))}>
                  {slot.label}
                </button>
              ))}
            </div>
            <button className="dashboard-primary-button" type="submit" disabled={!rescheduleDraft.time}>Save New Time</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default MeetingsPage



