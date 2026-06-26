import { socialLinks } from '../data/siteData'
import SocialIcon from './SocialIcon'
import { Mail, MapPin, Phone } from 'lucide-react'

function ContactDetails() {
  return (
    <aside className="contact-details">
      <h2>Contact details</h2>
      <span className="contact-detail-wave" aria-hidden="true"></span>
      <div className="contact-detail-item detail-email">
        <span className="contact-detail-icon"><Mail aria-hidden="true" /></span>
        <a href="mailto:hello@varlexa.ai">hello@varlexa.ai</a>
      </div>
      <div className="contact-detail-item detail-phone">
        <span className="contact-detail-icon"><Phone aria-hidden="true" /></span>
        <a href="tel:+910000000000">+91 00000 00000</a>
      </div>
      <div className="contact-detail-item detail-location">
        <span className="contact-detail-icon"><MapPin aria-hidden="true" /></span>
        <span>Solapur, Maharashtra, India</span>
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
