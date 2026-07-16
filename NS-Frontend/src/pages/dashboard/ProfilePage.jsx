import { useEffect, useState } from 'react'
import api from '../../services/api'

const initialDeveloperProfile = {
  name: '',
  role: '',
  email: '',
  availability: '',
  skills: [],
  projects: []
}

function ProfilePage() {
  const [profile, setProfile] = useState(initialDeveloperProfile)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    api.get('/developer/profile')
      .then(({ data }) => {
        setProfile({
          ...initialDeveloperProfile,
          ...data.profile
        })
        setStatus('success')
      })
      .catch(() => {
        setStatus('error')
      })
  }, [])

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Developer Profile</p>
        <h1>Profile</h1>
      </div>

      {status === 'loading' && (
        <section className="dashboard-panel">
          <p>Loading profile...</p>
        </section>
      )}

      {status === 'error' && (
        <section className="dashboard-panel">
          <p>Unable to load profile data right now.</p>
        </section>
      )}

      {status === 'success' && (
        <section className="dashboard-panel profile-panel">
          {/* Optional chaining check handles empty states gracefully */}
          <div className="profile-avatar">
            {profile.name?.slice(0, 2).toUpperCase() || 'DV'}
          </div>
          
          <div className="profile-copy">
            <h2>{profile.name}</h2>
            <p>{profile.role}</p>
            {profile.email && (
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            )}
            <span>{profile.availability}</span>
            <button type="button">Edit Profile</button>
          </div>

          <div className="profile-stack">
            <h3>Skills</h3>
            <div className="developer-chip-row">
              {(profile.skills || []).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            <h3>Assigned projects</h3>
            {(profile.projects || []).map((project, index) => (
              <p key={`${project}-${index}`}>{project}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProfilePage