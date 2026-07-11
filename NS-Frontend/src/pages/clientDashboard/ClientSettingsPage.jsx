import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../../services/api'

const initialSettings = { theme: 'dark', language: 'English', privacy: 'standard', accountSecurity: 'standard', notifications: { email: true, messages: true, meetings: true, projectUpdates: true } }

function ClientSettingsPage() {
  const [settings, setSettings] = useState(initialSettings)
  const [message, setMessage] = useState('')

  useEffect(() => { api.get('/client/settings').then(({ data }) => setSettings({ ...initialSettings, ...data.settings, notifications: { ...initialSettings.notifications, ...(data.settings?.notifications || {}) } })).catch(() => {}) }, [])
  function updateField(event) { const { name, value } = event.target; setSettings((current) => ({ ...current, [name]: value })) }
  function toggleNotification(event) { const { name, checked } = event.target; setSettings((current) => ({ ...current, notifications: { ...current.notifications, [name]: checked } })) }
  async function saveSettings(event) { event.preventDefault(); try { const { data } = await api.put('/client/settings', settings); setSettings(data.settings); setMessage('Settings saved.') } catch (error) { setMessage(getApiErrorMessage(error, 'Unable to save settings.')) } }

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading"><p className="dashboard-kicker">Settings</p><h1>Workspace settings.</h1>{message && <p>{message}</p>}</div>
      <form className="dashboard-panel client-form-panel" onSubmit={saveSettings}>
        <div className="client-form-grid compact"><select name="theme" value={settings.theme} onChange={updateField}><option value="dark">Dark Mode</option><option value="light">Light Mode</option></select><select name="language" value={settings.language} onChange={updateField}><option>English</option><option>Hindi</option><option>Spanish</option></select><select name="privacy" value={settings.privacy} onChange={updateField}><option value="standard">Standard Privacy</option><option value="private">Private Profile</option></select><select name="accountSecurity" value={settings.accountSecurity} onChange={updateField}><option value="standard">Standard Security</option><option value="enhanced">Enhanced Security</option></select></div>
        <section className="dashboard-panel nested-settings-panel"><h2>Notification Preferences</h2>{Object.entries(settings.notifications || {}).map(([key, value]) => <label className="client-toggle-row" key={key}><span>{key.replace(/([A-Z])/g, ' $1')}</span><input name={key} type="checkbox" checked={value} onChange={toggleNotification} /></label>)}</section>
        <button className="dashboard-primary-button" type="submit">Save Settings</button>
      </form>
    </div>
  )
}

export default ClientSettingsPage
