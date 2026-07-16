import { useEffect, useState } from 'react'
import { Edit2, Check, X, Camera, Plus, Trash2 } from 'lucide-react'
import api, { getApiErrorMessage } from '../../services/api'

const initialDeveloperProfile = {
  name: '',
  role: 'Developer',
  email: '',
  phone: '',
  companyName: '',
  address: '',
  website: '',
  linkedin: '',
  bio: '',
  preferredTechnologies: [],
  avatar: '',
  settings: {}
}

function ProfilePage() {
  const [profile, setProfile] = useState(initialDeveloperProfile)
  const [editedProfile, setEditedProfile] = useState(initialDeveloperProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [status, setStatus] = useState('loading')
  const [submitStatus, setSubmitStatus] = useState('')
  const [newTechInput, setNewTechInput] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = () => {
    setStatus('loading')
    api.get('/developer/profile')
      .then(({ data }) => {
        // Ensure standard fields match our developer schema fallbacks cleanly
        const parsedProfile = {
          ...initialDeveloperProfile,
          ...data.profile,
          preferredTechnologies: data.profile?.preferredTechnologies || data.profile?.skills || []
        }
        setProfile(parsedProfile)
        setEditedProfile(parsedProfile)
        setStatus('success')
      })
      .catch(() => {
        setStatus('error')
      })
  }

  // Handle standard structural input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle dynamic programming language/tech chips management array injections
  const addTechChip = (e) => {
    e.preventDefault()
    const trimmed = newTechInput.trim()
    if (trimmed && !editedProfile.preferredTechnologies.includes(trimmed)) {
      setEditedProfile((prev) => ({
        ...prev,
        preferredTechnologies: [...prev.preferredTechnologies, trimmed]
      }))
      setNewTechInput('')
    }
  }

  const removeTechChip = (techToRemove) => {
    setEditedProfile((prev) => ({
      ...prev,
      preferredTechnologies: prev.preferredTechnologies.filter((tech) => tech !== techToRemove)
    }))
  }

  // Handle Profile Avatar Local File Upload Simulation (Integrates with Cloudinary/Backend URL endpoint parameters later)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview optimization using localized URL creation
    const localUrl = URL.createObjectURL(file)
    setEditedProfile((prev) => ({ ...prev, avatar: localUrl }))
    
    // NOTE: To upload live to your Cloudinary endpoint configuration, you would pass standard FormData here:
    // const formData = new FormData(); formData.append("file", file);
    // api.post('/upload', formData)...
  }

  // Save changes via HTTP PUT call mapping onto our updated backend schema route controllers
  const saveProfileChanges = async () => {
    setSubmitStatus('')
    try {
      const { data } = await api.put('/developer/profile', editedProfile)
      if (data.success) {
        const updated = {
          ...initialDeveloperProfile,
          ...data.profile,
          preferredTechnologies: data.profile?.preferredTechnologies || []
        }
        setProfile(updated)
        setEditedProfile(updated)
        setIsEditing(false)
        setSubmitStatus('Profile updated successfully!')
        setTimeout(() => setSubmitStatus(''), 3000)
      }
    } catch (error) {
      setSubmitStatus(getApiErrorMessage(error, 'Failed to save profile changes.'))
    }
  }

  const cancelEditing = () => {
    setEditedProfile(profile)
    setIsEditing(false)
    setSubmitStatus('')
  }

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="dashboard-kicker">Developer Settings</p>
          <h1>Profile Information</h1>
        </div>
        {status === 'success' && (
          <div>
            {!isEditing ? (
              <button type="button" className="btn-primary" onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={16} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-success" onClick={saveProfileChanges} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Save
                </button>
                <button type="button" className="btn-secondary" onClick={cancelEditing} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {submitStatus && <p className={`chat-error-banner ${submitStatus.includes('success') ? 'success-banner' : ''}`} style={{ marginBottom: '1.5rem' }}>{submitStatus}</p>}

      {status === 'loading' && (
        <section className="dashboard-panel"><p>Loading profile...</p></section>
      )}

      {status === 'error' && (
        <section className="dashboard-panel"><p>Unable to load profile data right now.</p></section>
      )}

      {status === 'success' && (
        <div className="profile-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          
          {/* LEFT PANEL: AVATAR MANAGEMENT & INTERACTION CARD */}
          <section className="dashboard-panel profile-panel-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'fit-content' }}>
            <div className="avatar-upload-container" style={{ position: 'relative', margin: '1.5rem 0' }}>
              {editedProfile.avatar ? (
                <img src={editedProfile.avatar} alt="Avatar" crossOrigin="anonymous"  className="profile-avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-color)' }} />
              ) : (
                <div className="profile-avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                  {profile.name?.slice(0, 2).toUpperCase() || 'DV'}
                </div>
              )}
              {isEditing && (
                <label htmlFor="avatar-file-input" style={{ position: 'absolute', bottom: '0', right: '0', background: '#3b82f6', color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-surface)' }}>
                  <Camera size={16} />
                  <input type="file" id="avatar-file-input" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            <h2 style={{ margin: '0.5rem 0 0.25rem 0' }}>{profile.name}</h2>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>{profile.role}</p>
            <span className="status-badge assigned" style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem' }}>Active Workspace Account</span>
          </section>

          {/* RIGHT PANEL: EDITABLE DATA FIELD MATRICES */}
          <section className="dashboard-panel profile-panel-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* SECTION A: BIOGRAPHY OR OVERVIEW SUMMARY */}
            <div>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>About Me</h3>
              {!isEditing ? (
                <p style={{ color: profile.bio ? 'inherit' : '#666', fontStyle: profile.bio ? 'normal' : 'italic' }}>{profile.bio || 'No professional bio description added yet.'}</p>
              ) : (
                <textarea name="bio" value={editedProfile.bio} onChange={handleInputChange} placeholder="Write a short summary about your development background and tech interests..." rows={4} style={{ width: '100%', padding: '10px', background: 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px', resize: 'vertical' }} />
              )}
            </div>

            {/* SECTION B: CORE SCHEMATIC FIELDS (NAME, EMAIL, WEBSITES) */}
            <div>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Contact & Professional Links</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Full Name</label>
                  <input type="text" name="name" value={editedProfile.name} onChange={handleInputChange} disabled={!isEditing} style={{ width: '100%', padding: '8px', background: !isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Email Address</label>
                  <input type="email" name="email" value={editedProfile.email} disabled={true} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.02)', color: '#888', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input type="text" name="phone" value={editedProfile.phone} onChange={handleInputChange} disabled={!isEditing} placeholder="Add mobile number" style={{ width: '100%', padding: '8px', background: !isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Location/Address</label>
                  <input type="text" name="address" value={editedProfile.address} onChange={handleInputChange} disabled={!isEditing} placeholder="City, State" style={{ width: '100%', padding: '8px', background: !isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>LinkedIn Profile Profile</label>
                  <input type="url" name="linkedin" value={editedProfile.linkedin} onChange={handleInputChange} disabled={!isEditing} placeholder="https://linkedin.com/in/username" style={{ width: '100%', padding: '8px', background: !isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Personal Portfolio Website</label>
                  <input type="url" name="website" value={editedProfile.website} onChange={handleInputChange} disabled={!isEditing} placeholder="https://yourportfolio.dev" style={{ width: '100%', padding: '8px', background: !isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                </div>
              </div>
            </div>

            {/* SECTION C: DYNAMIC PROGRAMMING SKILLS & PREFERRED TECH CHIPS ARRAY */}
            <div>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Preferred Technologies & Stack</h3>
              
              {isEditing && (
                <form onSubmit={addTechChip} style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                  <input type="text" value={newTechInput} onChange={(e) => setNewTechInput(e.target.value)} placeholder="e.g., Kotlin, Flutter, Node.js, Mongoose" style={{ flexGrow: 1, padding: '8px', background: 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                  <button type="submit" className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={16} /> Add</button>
                </form>
              )}

              <div className="developer-chip-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {editedProfile.preferredTechnologies.map((tech) => (
                  <span key={tech} className="tech-stack-indicator" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem' }}>
                    {tech}
                    {isEditing && (
                      <Trash2 size={12} style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => removeTechChip(tech)} />
                    )}
                  </span>
                ))}
                {editedProfile.preferredTechnologies.length === 0 && (
                  <p style={{ color: '#666', fontStyle: 'italic', fontSize: '0.9rem' }}>No dynamic technologies or programming keywords added yet.</p>
                )}
              </div>
            </div>

          </section>
        </div>
      )}
    </div>
  )
}

export default ProfilePage