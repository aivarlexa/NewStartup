import { socialLinks } from '../data/siteData'
import SocialIcon from '../components/SocialIcon'

function SocialPage() {
  return (
    <section className="page-shell social-page">
      <div className="page-heading">
        <p className="eyebrow">Social Network</p>
        <h1>Connect with Varlexa AI.</h1>
        <p>Follow the channels where we share build notes, launch updates, and practical thinking on secure AI systems.</p>
      </div>

      <div className="social-card-grid">
        {socialLinks.map((social) => (
          <article className="social-card" key={social.name}>
            <span className="social-card-icon"><SocialIcon icon={social.icon} /></span>
            <h2>{social.name}</h2>
            <p>{social.description}</p>
            <a className="secondary-action" href={social.href} target="_blank" rel="noreferrer">Visit Profile</a>
          </article>
        ))}
      </div>
    </section>
  )
}

export default SocialPage
