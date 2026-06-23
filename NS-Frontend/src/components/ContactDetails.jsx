import { socialLinks } from '../data/siteData'
import SocialIcon from './SocialIcon'

function ContactDetails() {
  return (
    <aside className="contact-details">
      <h2>Contact details</h2>
      <a href="mailto:hello@varlexa.ai">hello@varlexa.ai</a>
      <a href="tel:+910000000000">+91 00000 00000</a>
      <span>Solapur, Maharashtra, India</span>
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
