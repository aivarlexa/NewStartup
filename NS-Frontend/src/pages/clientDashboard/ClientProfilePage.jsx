import { useContext, useEffect, useState } from 'react'
import AuthContext from '../../context/AuthContext'
import api, { getApiErrorMessage } from '../../services/api'

const initialProfile = { avatar: '', name: '', companyName: '', email: '', phone: '', address: '', website: '', linkedin: '', bio: '', preferredTechnologies: '' }

function ClientProfilePage() {
  const { user, login, token } = useContext(AuthContext)
  const [profile, setProfile] = useState(initialProfile)
  const [message, setMessage] = useState('')

// ✅ FIXED CODE
  useEffect(() => {
    api.get('/client/profile').then(({ data }) => setProfile({ ...initialProfile, ...data.profile, preferredTechnologies: (data.profile.preferredTechnologies || []).join(', ') })).catch(() => {})
  }, [])

  function updateField(event) { const { name, value } = event.target; setProfile((current) => ({ ...current, [name]: value })) }
  async function saveProfile(event) {
    event.preventDefault(); setMessage('')
    try { const { data } = await api.put('/client/profile', profile); login({ ...user, ...data.profile }, token, true); setMessage('Profile saved.') }
    catch (error) { setMessage(getApiErrorMessage(error, 'Unable to save profile.')) }
  }

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading"><p className="dashboard-kicker">Profile</p><h1>Edit profile.</h1>{message && <p>{message}</p>}</div>
      <form className="dashboard-panel client-form-panel" onSubmit={saveProfile}>
        <div className="profile-panel client-profile-panel"><div className="profile-avatar">{profile.name?.slice(0, 2).toUpperCase() || 'CL'}</div><div className="client-form-grid compact"><input name="avatar" value={profile.avatar || ''} onChange={updateField} placeholder="Profile Photo URL" /><input name="name" value={profile.name || ''} onChange={updateField} placeholder="Name" /><input name="companyName" value={profile.companyName || ''} onChange={updateField} placeholder="Company Name" /><input name="email" value={profile.email || ''} disabled placeholder="Email" /><input name="phone" value={profile.phone || ''} onChange={updateField} placeholder="Phone" /><input name="address" value={profile.address || ''} onChange={updateField} placeholder="Address" /><input name="website" value={profile.website || ''} onChange={updateField} placeholder="Website" /><input name="linkedin" value={profile.linkedin || ''} onChange={updateField} placeholder="LinkedIn" /><input name="preferredTechnologies" value={profile.preferredTechnologies || ''} onChange={updateField} placeholder="Preferred Technologies" /><textarea name="bio" value={profile.bio || ''} onChange={updateField} placeholder="Bio" /></div></div>
        <div className="dashboard-heading-actions"><button className="dashboard-primary-button" type="submit">Save Changes</button><button type="button" className="dashboard-primary-button">Change Password</button><button type="button" className="dashboard-primary-button">Delete Account</button></div>
      </form>
    </div>
  )
}

export default ClientProfilePage
