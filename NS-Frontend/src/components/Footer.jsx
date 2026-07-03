import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { footerNavLinks, socialLinks } from '../data/siteData'
import BrandWordmark from './BrandWordmark'
import SocialIcon from './SocialIcon'

function Footer() {
  const footerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const footerElement = footerRef.current

    if (!footerElement) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(footerElement)

    return () => observer.disconnect()
  }, [])

  return (
    <footer className={`site-footer ${isVisible ? 'is-visible' : ''}`} ref={footerRef}>
      <div className="footer-inner">
        <div className="footer-brand footer-reveal">
          <Link to="/#top" aria-label="Varlexa AI home">
            <BrandWordmark className="footer-wordmark" alt="VARLEXA AI" />
          </Link>
          <span className="footer-glow-line"></span>
          <p>AI solutions, software engineering, cloud systems, and secure digital infrastructure for modern businesses.</p>
        </div>

        <nav className="footer-nav footer-reveal" aria-label="Footer navigation">
          <h3>Navigate</h3>
          <div>
            {footerNavLinks.map((link) => (
              <Link to={link.href} key={link.label}>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="footer-contact footer-reveal">
          <h3>Contact</h3>
          <a href="mailto:aivarlexa@gmail.com">aivarlexa@gmail.com</a>
          <a href="tel:+919130067841">+91 9130 067841</a>
          <span>Solapur, Maharashtra, India</span>
          <Link className="footer-action" to="/contact">Contact Us</Link>
        </div>

        <div className="footer-social footer-reveal">
          <h3>Social Network</h3>
          <div className="social-icons" aria-label="Social links">
            {socialLinks.map((social) => (
              <a href={social.href} key={social.name} target="_blank" rel="noreferrer" aria-label={social.name}>
                <SocialIcon icon={social.icon} />
              </a>
            ))}
          </div>
          <Link className="footer-page-link" to="/social">Social Network</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Varlexa AI. All rights reserved.</span>
        <div>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/#top">Terms &amp; Conditions</Link>
          <Link to="/#top">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
