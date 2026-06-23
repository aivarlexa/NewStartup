import { developerProfile } from '../../data/dashboardData'

function ProfilePage() {
  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Developer Profile</p>
        <h1>Profile</h1>
      </div>

      <section className="dashboard-panel profile-panel">
        <div className="profile-avatar">{developerProfile.name.slice(0, 2).toUpperCase()}</div>
        <div className="profile-copy">
          <h2>{developerProfile.name}</h2>
          <p>{developerProfile.role}</p>
          <a href={`mailto:${developerProfile.email}`}>{developerProfile.email}</a>
          <span>{developerProfile.availability}</span>
          <button type="button">Edit Profile</button>
        </div>
        <div className="profile-stack">
          <h3>Skills</h3>
          <div className="developer-chip-row">
            {developerProfile.skills.map((skill) => <span key={skill}>{skill}</span>)}
          </div>
          <h3>Assigned projects</h3>
          {developerProfile.projects.map((project) => <p key={project}>{project}</p>)}
        </div>
      </section>
    </div>
  )
}

export default ProfilePage
