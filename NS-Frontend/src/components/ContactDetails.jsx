import { socialLinks } from '../data/siteData'
import SocialIcon from './SocialIcon'
import { Mail, MapPin } from 'lucide-react'

function ContactDetails() {
  return (
    <aside className="contact-details">
      <h2>Contact details</h2>
      <span className="contact-detail-wave" aria-hidden="true"></span>
      <div className="contact-detail-item detail-email">
        <span className="contact-detail-icon"><Mail aria-hidden="true" /></span>
        <a href="mailto:aivarlexa@gmail.com">aivarlexa@gmail.com</a>
      </div>
      <div className="contact-detail-item detail-location">
        <span className="contact-detail-icon"><MapPin aria-hidden="true" /></span>
        <span>Head Office: Pune, Maharashtra, India</span>
      </div>
      <span className="contact-social-divider" aria-hidden="true"></span>
      <div className="social-icons" aria-label="Contact social links">
        {socialLinks.map((social) => (
          <a href={social.href} key={social.name} target="_blank" rel="noreferrer" aria-label={social.name}>
            <SocialIcon icon={social.icon} />
          </a>
        ))}
      </div>
    </aside>
  )
}

export default ContactDetails
