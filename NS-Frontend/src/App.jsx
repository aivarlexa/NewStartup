import { useEffect, useRef, useState } from 'react'
import varlexaLogo from './assets/varlexa-logo.png'
import varlexaMark from './assets/varlexa-mark.png'
import varlexaWordmark from './assets/verlexaai-transparent.png'
import './App.css'


const trustSignals = [
  'ENTERPRISE SYSTEMS',
  'CYBER DEFENSE',
  'APPLIED INTELLIGENCE',
  'CLOUD PLATFORMS',
]

const capabilities = [
  {
    title: 'AI Development',
    text: 'Custom AI systems, intelligent chatbots, machine learning solutions, business automation, and AI-powered data analysis built around real business needs.',
    tags: ['AI Systems', 'Chatbots', 'ML'],
    accent: 'ai',
  },
  {
    title: 'Software Development',
    text: 'Custom web applications, SaaS platforms, enterprise software, CRM and ERP systems, API development, and seamless integrations.',
    tags: ['SaaS', 'Enterprise', 'API'],
    accent: 'software',
  },
  {
    title: 'Web Development',
    text: 'Professional business websites, e-commerce platforms, landing pages, portfolio websites, and fast Progressive Web Apps.',
    tags: ['E-commerce', 'PWA', 'Websites'],
    accent: 'web',
  },
  {
    title: 'Mobile App Development',
    text: 'Android, iOS, React Native, Flutter, and on-demand mobile applications designed for smooth user experiences.',
    tags: ['Android', 'iOS', 'Flutter'],
    accent: 'mobile',
  },
  {
    title: 'Cloud & DevOps',
    text: 'Cloud hosting, server deployment, CI/CD pipelines, database management, scalable architecture, and reliable infrastructure setup.',
    tags: ['Cloud', 'CI/CD', 'Infrastructure'],
    accent: 'cloud',
  },
  {
    title: 'Cybersecurity',
    text: 'Security audits, penetration testing, data protection, network security, monitoring, and stronger digital defense systems.',
    tags: ['Audits', 'Pentesting', 'Defense'],
    accent: 'security',
  },
  {
    title: 'Data & Analytics',
    text: 'Business dashboards, AI-powered analytics, reporting systems, data visualization, and large-scale data processing.',
    tags: ['Dashboards', 'Analytics', 'Data'],
    accent: 'ai',
  },
  {
    title: 'Automation Services',
    text: 'Business process automation, AI workflow automation, CRM automation, lead generation systems, email automation, and SMS automation.',
    tags: ['Workflows', 'CRM', 'Lead Gen'],
    accent: 'software',
  },
  {
    title: 'Digital Marketing',
    text: 'SEO, performance marketing, social media campaigns, content strategy, conversion optimization, and analytics-driven growth systems.',
    tags: ['SEO', 'Performance', 'Growth'],
    accent: 'web',
  },
]

const capabilityVisuals = [
  { label: 'AI Signal', detail: 'Intelligence Layer' },
  { label: 'System Flow', detail: 'Scalable Engine' },
  { label: 'Web Pulse', detail: 'Experience Grid' },
  { label: 'App Motion', detail: 'Mobile Ready' },
  { label: 'Live Deploy', detail: 'Cloud Network' },
  { label: 'Threat Scan', detail: 'Defense Active' },
]


const initialMessages = [
  {
    role: 'assistant',
    text: 'I can help scope an enterprise AI pilot, summarize a case study, or estimate workflow impact.',
  },
  {
    role: 'user',
    text: 'Which pilot should we launch first?',
  },
  {
    role: 'assistant',
    text: 'Start with a workflow that has high volume, measurable cost, and clear approval rules. Revenue operations and risk review usually produce fast proof.',
  },
]

const promptReplies = [
  {
    match: 'pilot',
    reply:
      'A strong first pilot is account prioritization: connect CRM, product usage, and support signals, then measure conversion lift against a control group.',
  },
  {
    match: 'security',
    reply:
      'For enterprise readiness, anchor the rollout on private deployment, audit logs, role-based access, and clear retention boundaries.',
  },
  {
    match: 'case',
    reply:
      'The strongest case study is Northstar Bank: it ties AI review automation to risk reduction, protected value, and executive-level accountability.',
  },
]


function BrandWordmark({ className = '', alt = 'VARLEXA AI' }) {
  const classNames = ['brand-wordmark', className].filter(Boolean).join(' ')

  return <img className={classNames} src={varlexaWordmark} alt={alt} />
}

const footerNavLinks = [
  { label: 'Services', href: '/#platform' },
  { label: 'Solutions', href: '/#top' },
  { label: 'Projects', href: '/#chatbot' },
  { label: 'Industries', href: '/#top' },
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/#chatbot' },
]

const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/',
    icon: 'linkedin',
    description: 'Company updates, product thinking, and enterprise AI notes.',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/',
    icon: 'github',
    description: 'Engineering experiments, open tooling, and implementation references.',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/',
    icon: 'instagram',
    description: 'Brand moments, launches, and behind-the-scenes product visuals.',
  },
  {
    name: 'X / Twitter',
    href: 'https://x.com/',
    icon: 'x',
    description: 'Short updates on AI systems, cloud delivery, and security practices.',
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/910000000000',
    icon: 'whatsapp',
    description: 'Quick business conversations and project discovery requests.',
  },
]


const aboutInfoCards = [
  {
    title: 'AI-FIRST THINKING',
    text: 'We design practical AI systems that improve operations, decision-making, and customer experiences.',
  },
  {
    title: 'ENGINEERING EXCELLENCE',
    text: 'We build secure, scalable applications, platforms, APIs, and cloud systems.',
  },
  {
    title: 'LONG-TERM PARTNERSHIP',
    text: 'We focus on systems that continue creating value as your organization grows.',
  },
]

const aboutValues = [
  {
    number: '01',
    title: 'Clarity over complexity',
    text: 'We simplify technical decisions and build systems teams can confidently operate.',
  },
  {
    number: '02',
    title: 'Security by design',
    text: 'Security, privacy, governance, and reliability are built into every layer.',
  },
  {
    number: '03',
    title: 'Outcomes that matter',
    text: 'We focus on measurable improvements, not technology for its own sake.',
  },
  {
    number: '04',
    title: 'Built to evolve',
    text: 'Our systems are designed to adapt as products, teams, and markets change.',
  },
]

const aboutCapabilityChips = [
  'Artificial Intelligence',
  'Custom Software',
  'Cloud & DevOps',
  'Cybersecurity',
  'Automation Systems',
  'Web Platforms',
  'Mobile Applications',
  'Data Intelligence',
]
const privacySections = [
  {
    title: 'Introduction',
    text: 'Varlexa AI respects privacy and handles information with care. This policy explains how we collect, use, and protect information when you interact with our website, forms, and digital services.',
  },
  {
    title: 'Information We Collect',
    text: 'We may collect contact details, company information, project requirements, messages you submit, and basic technical data such as browser type, device information, and site usage patterns.',
  },
  {
    title: 'How We Use Information',
    text: 'We use information to respond to inquiries, prepare project conversations, improve our website, maintain service quality, and communicate relevant updates when appropriate.',
  },
  {
    title: 'Cookies and Analytics',
    text: 'Our website may use cookies or analytics tools to understand performance, traffic patterns, and user experience. You can control cookies through your browser settings.',
  },
  {
    title: 'Data Security',
    text: 'We apply reasonable technical and organizational safeguards to protect information from unauthorized access, misuse, alteration, or disclosure.',
  },
  {
    title: 'Third-Party Services',
    text: 'We may rely on trusted third-party platforms for communication, analytics, hosting, or operational workflows. These providers process information according to their own privacy practices.',
  },
  {
    title: 'Your Rights',
    text: 'You may request access, correction, or deletion of your personal information, subject to applicable legal and operational requirements.',
  },
  {
    title: 'Contact Information',
    text: 'For privacy questions or requests, contact us at hello@varlexa.ai or reach us from Solapur, Maharashtra, India.',
  },
  {
    title: 'Policy Updates',
    text: 'We may update this policy as our services evolve. Updates will be posted on this page with the latest applicable information.',
  },
]

function SocialIcon({ icon }) {
  if (icon === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.2 9.4V20M7.2 5.2V5.3M11.2 20V9.4M11.2 13.8C11.2 11.1 12.9 9.2 15.5 9.2C18.1 9.2 19.4 11 19.4 13.8V20" />
      </svg>
    )
  }

  if (icon === 'github') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 19.4C4.8 20.6 4.8 17.3 3.2 16.8M14.8 21V17.7C14.8 16.8 14.9 16.4 14.3 15.8C17.1 15.5 20 14.4 20 9.8C20 8.6 19.6 7.5 18.8 6.6C18.9 6.3 19.3 5 18.7 3.7C18.7 3.7 17.7 3.4 15.4 5C14.4 4.7 13.2 4.6 12.1 4.6C11 4.6 9.8 4.7 8.8 5C6.5 3.4 5.5 3.7 5.5 3.7C4.9 5 5.3 6.3 5.4 6.6C4.6 7.5 4.2 8.6 4.2 9.8C4.2 14.4 7.1 15.5 9.9 15.8C9.3 16.3 9.1 16.9 9.1 17.8V21" />
      </svg>
    )
  }

  if (icon === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <path d="M9 12A3 3 0 1 0 15 12A3 3 0 1 0 9 12M16.8 7.2H16.9" />
      </svg>
    )
  }

  if (icon === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 20L6.2 16.5C5.5 15.3 5.1 13.9 5.1 12.5C5.1 8.2 8.5 4.8 12.7 4.8C16.9 4.8 20.3 8.2 20.3 12.5C20.3 16.7 16.9 20.1 12.7 20.1C11.3 20.1 10 19.7 8.9 19.1L5 20Z" />
        <path d="M9.4 9.1C9.6 12.6 12.4 15.2 15.6 15.8L16.5 14.1L14.8 13.2L13.8 14.1C12.5 13.5 11.5 12.5 10.9 11.3L11.8 10.3L10.9 8.6L9.4 9.1Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5L19 19M19 5L5 19" />
    </svg>
  )
}

function SiteFooter({ onNavigate }) {
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

  function goToPage(event, path) {
    event.preventDefault()
    onNavigate(path)
  }

  return (
    <footer className={`site-footer ${isVisible ? 'is-visible' : ''}`} ref={footerRef}>
      <div className="footer-inner">
        <div className="footer-brand footer-reveal">
          <a href="/#top" aria-label="Varlexa AI home">
            <BrandWordmark className="footer-wordmark" alt="VARLEXA AI" />
          </a>
          <span className="footer-glow-line"></span>
          <p>AI solutions, software engineering, cloud systems, and secure digital infrastructure for modern businesses.</p>
        </div>

        <nav className="footer-nav footer-reveal" aria-label="Footer navigation">
          <h3>Navigate</h3>
          <div>
            {footerNavLinks.map((link) => (
              <a
                href={link.href}
                key={link.label}
                onClick={link.href === '/about' ? (event) => goToPage(event, '/about') : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="footer-contact footer-reveal">
          <h3>Contact</h3>
          <a href="mailto:hello@varlexa.ai">hello@varlexa.ai</a>
          <a href="tel:+910000000000">+91 00000 00000</a>
          <span>Solapur, Maharashtra, India</span>
          <a className="footer-action" href="/contact" onClick={(event) => goToPage(event, '/contact')}>Contact Us</a>
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
          <a className="footer-page-link" href="/social" onClick={(event) => goToPage(event, '/social')}>Social Network</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Varlexa AI. All rights reserved.</span>
        <div>
          <a href="/privacy-policy" onClick={(event) => goToPage(event, '/privacy-policy')}>Privacy Policy</a>
          <a href="/#top">Terms &amp; Conditions</a>
          <a href="/#top">Cookie Policy</a>
        </div>
      </div>
    </footer>
  )
}


function AboutPage({ onNavigate }) {
  const pageRef = useRef(null)

  useEffect(() => {
    const revealItems = Array.from(pageRef.current?.querySelectorAll('.about-reveal') || [])

    if (!revealItems.length) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' },
    )

    revealItems.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  function goTo(event, target) {
    if (target === 'services') {
      return
    }

    event.preventDefault()
    onNavigate('/contact')
  }

  return (
    <section className="about-page" ref={pageRef}>
      <div className="about-hero">
        <div className="about-hero-copy about-reveal">
          <p className="eyebrow">About Varlexa AI</p>
          <h1>Engineering intelligent systems for real business impact.</h1>
          <p>
            Varlexa AI helps businesses design, build, secure, and scale intelligent digital systems. We combine AI development,
            software engineering, cloud infrastructure, automation, and cybersecurity into practical solutions that create measurable outcomes.
          </p>
          <div className="about-actions">
            <a className="primary-action" href="/#platform" onClick={(event) => goTo(event, 'services')}>EXPLORE SERVICES</a>
            <a className="secondary-action" href="/contact" onClick={(event) => goTo(event, 'contact')}>CONTACT US</a>
          </div>
        </div>

        <div className="about-visual about-reveal" aria-hidden="true">
          <div className="network-node node-one"></div>
          <div className="network-node node-two"></div>
          <div className="network-node node-three"></div>
          <div className="network-node node-four"></div>
          <span className="network-line line-one"></span>
          <span className="network-line line-two"></span>
          <span className="network-line line-three"></span>
          <div className="floating-data-card card-alpha">
            <span>AI SIGNAL</span>
            <strong>94%</strong>
          </div>
          <div className="floating-data-card card-beta">
            <span>SECURE FLOW</span>
            <strong>LIVE</strong>
          </div>
        </div>
      </div>

      <div className="about-intro about-section">
        <div className="about-reveal">
          <h2>Built for ambitious teams.</h2>
          <p>
            We work with startups, growing businesses, and enterprise teams that need reliable technology systems designed for long-term scale.
            Our approach combines strategic thinking, engineering discipline, and practical execution.
          </p>
        </div>
        <div className="about-info-grid">
          {aboutInfoCards.map((card, index) => (
            <article className="about-info-card about-reveal" style={{ transitionDelay: `${index * 90}ms` }} key={card.title}>
              <span></span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </div>


      <div className="about-values about-section">
        <div className="section-heading compact about-reveal">
          <p className="eyebrow">How we work</p>
          <h2>Principles behind every system we build.</h2>
        </div>
        <div className="about-value-grid">
          {aboutValues.map((value, index) => (
            <article className="about-value-card about-reveal" style={{ transitionDelay: `${index * 80}ms` }} key={value.title}>
              <span>{value.number}</span>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="about-capabilities about-section about-reveal">
        <h2>Capabilities that connect strategy to execution.</h2>
        <div>
          {aboutCapabilityChips.map((capability) => (
            <span key={capability}>{capability}</span>
          ))}
        </div>
      </div>

      <div className="about-cta about-section about-reveal">
        <p className="eyebrow">Ready to build?</p>
        <h2>Let’s create systems that move your business forward.</h2>
        <p>
          Whether you are exploring AI, modernizing software, strengthening security, or scaling infrastructure, Varlexa AI is ready to help.
        </p>
        <div className="about-actions">
          <a className="primary-action" href="/contact" onClick={(event) => goTo(event, 'contact')}>START A PROJECT</a>
          <a className="secondary-action" href="/#platform" onClick={(event) => goTo(event, 'services')}>VIEW SERVICES</a>
        </div>
      </div>
    </section>
  )
}
function ContactPage() {
  const serviceDropdownRef = useRef(null)
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    company: '',
    service: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false)

  useEffect(() => {
    function closeServiceDropdown(event) {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target)) {
        setIsServiceDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', closeServiceDropdown)

    return () => document.removeEventListener('mousedown', closeServiceDropdown)
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
  }

  function validateForm() {
    const nextErrors = {}

    if (!formValues.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.'
    }

    if (!/^\S+@\S+\.\S+$/.test(formValues.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!formValues.service.trim()) {
      nextErrors.service = 'Choose a service need.'
    }

    if (formValues.message.trim().length < 12) {
      nextErrors.message = 'Message should be at least 12 characters.'
    }

    return nextErrors
  }

  function selectService(serviceTitle) {
    setFormValues((currentValues) => ({ ...currentValues, service: serviceTitle }))
    setErrors((currentErrors) => ({ ...currentErrors, service: '' }))
    setIsServiceDropdownOpen(false)
  }

  function submitContact(event) {
    event.preventDefault()
    const nextErrors = validateForm()

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setIsSubmitted(false)
      return
    }

    setIsSubmitted(true)
    setFormValues({ fullName: '', email: '', company: '', service: '', message: '' })
  }

  return (
    <section className="page-shell contact-page">
      <div className="page-heading">
        <p className="eyebrow">Connect with us</p>
        <h1>Start a conversation.</h1>
        <p>Tell us what you want to build, secure, automate, or scale. We will respond with a practical next step.</p>
      </div>

      <div className="contact-layout">
        <form className="contact-form" onSubmit={submitContact} noValidate>
          <label>
            <span>Full Name</span>
            <input name="fullName" value={formValues.fullName} onChange={updateField} />
            {errors.fullName && <small>{errors.fullName}</small>}
          </label>
          <label>
            <span>Email Address</span>
            <input name="email" type="email" value={formValues.email} onChange={updateField} />
            {errors.email && <small>{errors.email}</small>}
          </label>
          <label>
            <span>Company Name</span>
            <input name="company" value={formValues.company} onChange={updateField} />
          </label>
          <label className="service-field field">
            <span>Service Needed</span>
            <div className={`dropdown ${isServiceDropdownOpen ? 'open' : ''}`} ref={serviceDropdownRef}>
              <button
                className="dropdown-trigger"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isServiceDropdownOpen}
                onClick={() => setIsServiceDropdownOpen((isOpen) => !isOpen)}
              >
                <span>{formValues.service || 'Select service'}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 10L12 15L17 10" />
                </svg>
              </button>
              {isServiceDropdownOpen && (
                <div className="dropdown-menu" role="listbox" aria-label="Service Needed">
                  {capabilities.map((capability) => (
                    <button
                      className={`dropdown-option ${formValues.service === capability.title ? 'selected' : ''}`}
                      type="button"
                      role="option"
                      aria-selected={formValues.service === capability.title}
                      key={capability.title}
                      onClick={() => selectService(capability.title)}
                    >
                      <span className="dropdown-dot"></span>
                      <span>{capability.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.service && <small>{errors.service}</small>}
          </label>
          <label className="message-field">
            <span>Message</span>
            <textarea name="message" value={formValues.message} onChange={updateField} rows="6"></textarea>
            {errors.message && <small>{errors.message}</small>}
          </label>
          <button className="primary-action" type="submit">Send Message</button>
          {isSubmitted && <p className="form-success">Message received. We will get back to you shortly.</p>}
        </form>

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
      </div>
    </section>
  )
}

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

function PrivacyPolicyPage() {
  return (
    <section className="page-shell policy-page">
      <div className="page-heading">
        <p className="eyebrow">Privacy Policy</p>
        <h1>Privacy built for modern digital systems.</h1>
        <p>This policy describes how Varlexa AI handles information collected through this website and related business conversations.</p>
      </div>

      <div className="policy-panel">
        {privacySections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
function App() {
  const heroRef = useRef(null)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isHeroVideoVisible, setIsHeroVideoVisible] = useState(false)
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)

  useEffect(() => {
    function updateRoute() {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', updateRoute)

    return () => window.removeEventListener('popstate', updateRoute)
  }, [])

  function navigateTo(path) {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    function updateHeroVideo() {
      const heroElement = heroRef.current

      if (!heroElement) {
        return
      }

      const heroBounds = heroElement.getBoundingClientRect()
      const heroHasScrolledUp = heroBounds.top < 0 && heroBounds.bottom > window.innerHeight * 0.35

      setIsHeroVideoVisible(heroHasScrolledUp)
    }

    updateHeroVideo()
    window.addEventListener('scroll', updateHeroVideo, { passive: true })
    window.addEventListener('resize', updateHeroVideo)

    return () => {
      window.removeEventListener('scroll', updateHeroVideo)
      window.removeEventListener('resize', updateHeroVideo)
    }
  }, [])

  useEffect(() => {
    const serviceRows = Array.from(document.querySelectorAll('.capability-row'))

    if (!serviceRows.length) {
      return undefined
    }

    const revealQueue = []
    const timeouts = new Set()
    let isAnimating = false

    function removeFromQueue(row) {
      const queuedIndex = revealQueue.indexOf(row)

      if (queuedIndex >= 0) {
        revealQueue.splice(queuedIndex, 1)
      }

      row.dataset.queued = 'false'
    }

    function resetRow(row) {
      const serviceCard = row.querySelector('.service-card, .capability-card')

      serviceCard?.classList.remove('visible')
      row.classList.remove('is-visible', 'visible', 'revealed')
      row.dataset.queued = 'false'
      row.dataset.inView = 'false'
      removeFromQueue(row)
    }

    function revealNextRow() {
      if (isAnimating || revealQueue.length === 0) {
        return
      }

      isAnimating = true
      const row = revealQueue.shift()
      row.dataset.queued = 'false'

      const revealTimeoutId = window.setTimeout(() => {
        timeouts.delete(revealTimeoutId)

        if (row.dataset.inView === 'true') {
          const serviceCard = row.querySelector('.service-card, .capability-card')

          serviceCard?.classList.add('visible')
          row.classList.remove('is-visible')
          void row.offsetWidth
          row.classList.add('is-visible', 'visible', 'revealed')
        }

        const queueTimeoutId = window.setTimeout(() => {
          timeouts.delete(queueTimeoutId)
          isAnimating = false
          revealNextRow()
        }, 360)

        timeouts.add(queueTimeoutId)
      }, 70)

      timeouts.add(revealTimeoutId)
    }

    function queueRow(row) {
      if (row.dataset.queued === 'true') {
        return
      }

      row.dataset.queued = 'true'
      revealQueue.push(row)
      revealQueue.sort((firstRow, secondRow) => {
        const firstTop = firstRow.getBoundingClientRect().top
        const secondTop = secondRow.getBoundingClientRect().top

        return firstTop - secondTop
      })
      revealNextRow()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => !entry.isIntersecting)
          .forEach((entry) => {
            resetRow(entry.target)
          })

        entries
          .filter((entry) => entry.isIntersecting)
          .sort((firstEntry, secondEntry) => firstEntry.boundingClientRect.top - secondEntry.boundingClientRect.top)
          .forEach((entry) => {
            const row = entry.target

            row.dataset.inView = 'true'
            queueRow(row)
          })

        revealNextRow()
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.35,
      },
    )

    serviceRows.forEach((row) => {
      row.dataset.queued = 'false'
      row.dataset.inView = 'false'
      observer.observe(row)
    })

    return () => {
      observer.disconnect()
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [])

  function getReply(value) {
    const normalized = value.toLowerCase()
    const matchedReply = promptReplies.find((item) => normalized.includes(item.match))

    return (
      matchedReply?.reply ||
      'I would frame this around measurable business impact: baseline the workflow, define human approvals, then compare cycle time, quality, and cost over 30 days.'
    )
  }

  function sendMessage(value) {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      return
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', text: trimmedValue },
      { role: 'assistant', text: getReply(trimmedValue) },
    ])
    setInput('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage(input)
  }

  return (
    <main className="app-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Varlexa AI home">
          <BrandWordmark className="nav-wordmark" alt="" />
        </a>
        <div className="nav-links">
          <a href="#platform">Services</a>
          <a href="#outcomes">Solutions</a>
          <a href="#security">Projects</a>
          <a href="#cases">Industries</a>
          <a className={currentPath === '/about' ? 'is-active' : ''} href="/about" onClick={(event) => { event.preventDefault(); navigateTo('/about') }}>About</a>
          <a href="#chatbot">Insights</a>
        </div>
      </nav>

      {currentPath === '/contact' ? (
        <ContactPage />
      ) : currentPath === '/social' ? (
        <SocialPage />
      ) : currentPath === '/privacy-policy' ? (
        <PrivacyPolicyPage />
      ) : currentPath === '/about' ? (
        <AboutPage onNavigate={navigateTo} />
      ) : (
        <>
      <section className={`hero-section ${isHeroVideoVisible ? 'is-video-active' : ''}`} id="top" ref={heroRef}>
        <div className="hero-video-layer" aria-hidden={!isHeroVideoVisible}>
          <video className="hero-video-media" autoPlay muted loop playsInline poster={varlexaLogo}>
            <source src="/media/varlexa-core.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-header">
            <span className="status-dot"></span>
            <span className="status-brand">
              <BrandWordmark className="status-wordmark" alt="VARLEXA AI" />
              <span>CORE</span>
            </span>
            <span>ONLINE</span>
          </div>
          <div className="hero-video-copy">
            <p className="brand-breadcrumb hero-video-breadcrumb">
            <span>/ SYSTEMS ENGINEERING / SECURITY</span>
          </p>
            <h2>Intelligence Beyond Imagination Innovation Beyond Expectations</h2>
          </div>
        </div>

        <div className="hero-copy">
          <p className="eyebrow brand-breadcrumb">
            <span>/ SYSTEMS ENGINEERING / SECURITY</span>
          </p>
          <h1 className="hero-title">
            <span>AI Solutions &amp;</span>
            <span>Software Engineering</span>
            <span>for Modern Business</span>
          </h1>
          <p className="hero-lede">
            Secure AI products, intelligent platforms and cloud systems engineered for organizations that refuse to stand still.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#platform">
              START A PROJECT
            </a>
            <a className="secondary-action" href="#cases">
              EXPLORE SYSTEMS
            </a>
          </div>
          <div className="trust-strip" aria-label="Trust signals">
            {trustSignals.map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </div>
        </div>

        <div className="hero-visual logo-hero" aria-label="Varlexa AI logo preview">
          <div className="visual-stage">
            <div className="logo-showcase">
              <div className="spinning-logo-frame" aria-hidden="true">
                <img className="spinning-logo-fig" src={varlexaMark} alt="" />
              </div>
              <div className="static-logo-name" aria-label="Varlexa AI">
                <BrandWordmark className="hero-wordmark" alt="" />
              </div>
            </div>
            <div className="signal-plane plane-one"></div>
            <div className="signal-plane plane-two"></div>
            <div className="signal-plane plane-three"></div>
          </div>
        </div>
      </section>

      <section className="logo-band" aria-label="Customer segments">
        <span>Global banks</span>
        <span>Cloud platforms</span>
        <span>Healthcare networks</span>
        <span>Industrial operations</span>
        <span>Private equity</span>
      </section>

      <section className="section-block platform-block" id="platform">
        <div className="section-heading">
          <p className="eyebrow">Capabilities</p>
          <h2 className="services-heading-rotated">From intelligent systems to scalable digital operations.</h2>
          <p>
            Varlexa helps businesses design, build, secure, automate, and scale digital products
            with practical AI, software engineering, cloud infrastructure, and data intelligence.
          </p>
        </div>

        <div className="capability-grid">
          {capabilities.map((capability, index) => {
            const visual = capabilityVisuals[index % capabilityVisuals.length]
            const isCardLeft = index % 2 === 0

            return (
              <div
                className={`capability-row ${isCardLeft ? 'card-left' : 'card-right'}`}
                data-accent={capability.accent}
                key={capability.title}
              >
                {isCardLeft && (
                  <article className="capability-card">
                    <div className="capability-title-block">
                      <span className="card-index">0{index + 1}</span>
                      <h3>{capability.title}</h3>
                    </div>
                    <p>{capability.text}</p>
                    <div className="capability-action-block">
                      <a className="capability-arrow" href="#chatbot" aria-label={`Discuss ${capability.title}`}>
                        ↗
                      </a>
                      <div className="capability-tags" aria-label={`${capability.title} categories`}>
                        {capability.tags.map((tag) => (
                          <span key={`${capability.title}-${tag}`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                )}

                <div className="capability-visual" aria-hidden="true">
                  <div className="visual-connector"></div>
                  <span className="visual-node"></span>
                  <div className="visual-mini-panel">
                    <div className="visual-mini-header">
                      <span className="visual-dot"></span>
                      <strong>{visual.label}</strong>
                    </div>
                    <div className="visual-bars">
                      {[0, 1, 2, 3, 4].map((bar) => (
                        <span key={bar}></span>
                      ))}
                    </div>
                    <span className="visual-mini-detail">{visual.detail}</span>
                  </div>
                </div>

                {!isCardLeft && (
                  <article className="capability-card">
                    <div className="capability-title-block">
                      <span className="card-index">0{index + 1}</span>
                      <h3>{capability.title}</h3>
                    </div>
                    <p>{capability.text}</p>
                    <div className="capability-action-block">
                      <a className="capability-arrow" href="#chatbot" aria-label={`Discuss ${capability.title}`}>
                        ↗
                      </a>
                      <div className="capability-tags" aria-label={`${capability.title} categories`}>
                        {capability.tags.map((tag) => (
                          <span key={`${capability.title}-${tag}`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                )}
              </div>
            )
          })}
        </div>
      </section>





      <section className="section-block chatbot-block" id="chatbot">
        <div className="chat-copy">
          <p className="eyebrow">AI chatbot</p>
          <h2>Ask the enterprise copilot.</h2>
          <p>
            The conversational layer helps teams turn strategy questions into practical rollout plans,
            stakeholder briefs, and operating metrics.
          </p>
        </div>

        <div className="chatbot">
          <div className="chat-header">
            <div>
              <span className="status-dot"></span>
              <span className="status-brand">
                <BrandWordmark className="status-wordmark" alt="VARLEXA AI" />
                <span>CORE</span>
              </span>
            </div>
            <span>ONLINE</span>
          </div>
          <div className="chat-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                {message.text}
              </div>
            ))}
          </div>
          <div className="prompt-row" aria-label="Suggested prompts">
            <button type="button" onClick={() => sendMessage('Scope a first pilot')}>
              Scope pilot
            </button>
            <button type="button" onClick={() => sendMessage('Summarize security posture')}>
              Security posture
            </button>
            <button type="button" onClick={() => sendMessage('Choose best case study')}>
              Best case study
            </button>
          </div>
          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              aria-label="Message VARLEXA AI CORE"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about rollout, ROI, or security..."
            />
            <button type="submit" aria-label="Send message">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12H19M13 6L19 12L13 18" />
              </svg>
            </button>
          </form>
        </div>
      </section>
        </>
      )}
      <SiteFooter onNavigate={navigateTo} />
    </main>
  )
}

export default App
