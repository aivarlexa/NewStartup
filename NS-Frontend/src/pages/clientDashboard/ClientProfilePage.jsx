import { useContext, useEffect, useState } from 'react'
import { Edit2, Check, X, Camera, Plus, Trash2, Key, UserMinus, Link } from 'lucide-react'
import AuthContext from '../../context/AuthContext'
import api, { getApiErrorMessage } from '../../services/api'

const initialProfile = { 
  avatar: '', 
  name: '', 
  companyName: '', 
  email: '', 
  phone: '', 
  address: '', 
  website: '', 
  linkedin: '', 
  bio: '', 
  preferredTechnologies: [] 
}

function ClientProfilePage() {
  const { user, login, token } = useContext(AuthContext)
  const [profile, setProfile] = useState(initialProfile)
  const [editedProfile, setEditedProfile] = useState(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [techInput, setTechInput] = useState('')
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (token) {
      loadProfile()
    }
  }, [token]) // Re-run load if token mounts late

  const loadProfile = () => {
    setStatus('loading')
    
    // Explicitly pass authorization headers to guarantee 401 bypass
    api.get('/profile/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(({ data }) => {
        const parsedProfile = {
          ...initialProfile,
          ...data.profile,
          preferredTechnologies: data.profile?.preferredTechnologies || []
        }
        setProfile(parsedProfile)
        setEditedProfile(parsedProfile)
        setStatus('success')
        setImgError(false)
      })
      .catch(() => setStatus('error'))
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setEditedProfile((current) => ({ ...current, [name]: value }))
    if (name === 'avatar') setImgError(false) 
  }

  const addTechChip = (e) => {
    e.preventDefault()
    const trimmed = techInput.trim()
    if (trimmed && !editedProfile.preferredTechnologies.includes(trimmed)) {
      setEditedProfile((prev) => ({
        ...prev,
        preferredTechnologies: [...prev.preferredTechnologies, trimmed]
      }))
      setTechInput('')
    }
  }

  const removeTechChip = (techToRemove) => {
    setEditedProfile((prev) => ({
      ...prev,
      preferredTechnologies: prev.preferredTechnologies.filter((tech) => tech !== techToRemove)
    }))
  }

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImgError(false)
    const localUrl = URL.createObjectURL(file)
    setEditedProfile((prev) => ({ ...prev, avatar: localUrl }))
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      const { data } = await api.put('/client/profile', editedProfile, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        const updated = {
          ...initialProfile,
          ...data.profile,
          preferredTechnologies: data.profile?.preferredTechnologies || []
        }
        setProfile(updated)
        setEditedProfile(updated)
        login({ ...user, ...data.profile }, token, true)
        setIsEditing(false)
        setMessage('Profile saved successfully.')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Unable to save profile.'))
    }
  }

  const cancelEditing = () => {
    setEditedProfile(profile)
    setIsEditing(false)
    setMessage('')
    setImgError(false)
  }

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="dashboard-kicker">Client Account</p>
          <h1>Profile Settings</h1>
        </div>
        {status === 'success' && (
          <div>
            {!isEditing ? (
              <button type="button" className="dashboard-primary-button" onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={16} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="dashboard-primary-button" onClick={saveProfile} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#22c55e' }}>
                  <Check size={16} /> Save
                </button>
                <button type="button" className="dashboard-primary-button" onClick={cancelEditing} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#64748b' }}>
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {message && <p className={`chat-error-banner ${message.includes('success') ? 'success-banner' : ''}`} style={{ marginBottom: '1.5rem' }}>{message}</p>}

      {status === 'loading' && <section className="dashboard-panel"><p>Loading workspace account...</p></section>}
      {status === 'error' && <section className="dashboard-panel"><p>Unable to retrieve profile metadata right now.</p></section>}

      {status === 'success' && (
        <div className="profile-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          
          {/* LEFT PANEL: AVATAR & LINKS ENGINE */}
          <section className="dashboard-panel profile-panel-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'fit-content' }}>
            <div className="avatar-upload-container" style={{ position: 'relative', margin: '1.5rem 0' }}>
              <img 
                src={editedProfile.avatar || ''} 
                alt="Avatar" 
                crossOrigin="anonymous"
                className="profile-avatar" 
                onError={() => setImgError(true)}
                style={{ 
                  display: (editedProfile.avatar && !imgError) ? 'block' : 'none',
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '3px solid var(--border-color)' 
                }} 
              />
              
              {(!editedProfile.avatar || imgError) && (
                <div className="profile-avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', background: 'var(--border-color, #2d2d2d)' }}>
                  {editedProfile.name?.slice(0, 2).toUpperCase() || 'CL'}
                </div>
              )}

              {isEditing && (
                <label htmlFor="avatar-file-input" style={{ position: 'absolute', bottom: '0', right: '0', background: '#3b82f6', color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-surface)' }}>
                  <Camera size={16} />
                  <input type="file" id="avatar-file-input" accept="image/*" onChange={handleAvatarFileChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {isEditing && (
              <div style={{ width: '100%', marginBottom: '1.5rem', padding: '0 10px' }}>
                <label style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', justifyContent: 'center' }}>
                  <Link size={12} /> Or Paste Direct Image URL
                </label>
                <input 
                  type="text" 
                  name="avatar" 
                  value={editedProfile.avatar || ''} 
                  onChange={updateField} 
                  placeholder="https://example.com/image.jpg" 
                  style={{ width: '100%', padding: '6px 10px', background: 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center' }} 
                />
                {imgError && editedProfile.avatar && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>Invalid image link or blocked by CORS.</p>
                )}
              </div>
            )}

            <h2 style={{ margin: '0.5rem 0 0.25rem 0' }}>{profile.name || 'Workspace User'}</h2>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{profile.companyName || 'Corporate Client'}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button type="button" className="dashboard-primary-button" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Key size={14} /> Change Password</button>
              <button type="button" className="dashboard-primary-button" style={{ fontSize: '0.8rem', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><UserMinus size={14} /> Delete Account</button>
            </div>
          </section>

          {/* RIGHT EDITABLE DATA FIELDS */}
          <section className="dashboard-panel profile-panel-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Company Overview & Bio</h3>
              {!isEditing ? (
                <p style={{ color: profile.bio ? 'inherit' : '#666', fontStyle: profile.bio ? 'normal' : 'italic' }}>{profile.bio || 'No business description added yet.'}</p>
              ) : (
                <textarea name="bio" value={editedProfile.bio} onChange={updateField} placeholder="Briefly describe your company, project goals..." rows={4} style={{ width: '100%', padding: '10px', background: 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px', resize: 'vertical' }} />
              )}
            </div>

            <div>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Contact & Corporate Meta Links</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Client Name</label>
                  <input type="text" name="name" value={editedProfile.name} onChange={updateField} disabled={!isEditing} style={{ width: '100%', padding: '8px', background: !isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Company Name</label>
                  <input type="text" name="companyName" value={editedProfile.companyName} onChange={updateField} disabled={!isEditing} style={{ width: '100%', padding: '8px', background: !isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Email Address</label>
                  <input type="email" name="email" value={editedProfile.email} disabled style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.02)', color: '#888', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Contact Phone</label>
                  <input type="text" name="phone" value={editedProfile.phone} onChange={updateField} disabled={!isEditing} placeholder="Add workspace number" style={{ width: '100%', padding: '8px', background: !isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>LinkedIn Network</label>
                  <input type="url" name="linkedin" value={editedProfile.linkedin} onChange={updateField} disabled={!isEditing} placeholder="https://linkedin.com/company/..." style={{ width: '100%', padding: '8px', background: !isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Corporate Website</label>
                  <input type="url" name="website" value={editedProfile.website} onChange={updateField} disabled={!isEditing} placeholder="https://yourcompany.com" style={{ width: '100%', padding: '8px', background: !isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Office Address</label>
                <input type="text" name="address" value={editedProfile.address} onChange={updateField} disabled={!isEditing} placeholder="HQ Location / Headquarters Address" style={{ width: '100%', padding: '8px', background: !isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
              </div>
            </div>

            <div>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Target Project Technologies</h3>
              
              {isEditing && (
                <form onSubmit={addTechChip} style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                  <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="e.g., React Native, Java, Flutter" style={{ flexGrow: 1, padding: '8px', background: 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                  <button type="submit" className="dashboard-primary-button" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={16} /> Add</button>
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
                  <p style={{ color: '#666', fontStyle: 'italic', fontSize: '0.9rem' }}>No chosen technologies listed.</p>
                )}
              </div>
            </div>

          </section>
        </div>
      )}
    </div>
  )
}

export default ClientProfilePage