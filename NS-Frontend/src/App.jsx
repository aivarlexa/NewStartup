import { useEffect, useMemo, useRef, useState } from 'react'
import varlexaLogo from './assets/varlexa-logo.png'
import varlexaMark from './assets/varlexa-mark.png'
import varlexaWordmark from './assets/verlexaai-transparent.png'
import './App.css'

const platformMetrics = [
  {
    id: 'revenue',
    label: 'Revenue Lift',
    value: '+31%',
    detail: 'Qualified pipeline influenced across enterprise accounts',
    data: [24, 30, 34, 42, 49, 55, 62, 71],
  },
  {
    id: 'risk',
    label: 'Risk Exposure',
    value: '-42%',
    detail: 'Manual review hours removed from regulated workflows',
    data: [74, 66, 61, 54, 45, 39, 33, 28],
  },
  {
    id: 'velocity',
    label: 'Decision Velocity',
    value: '3.8x',
    detail: 'Faster signal-to-action time for operations teams',
    data: [18, 25, 36, 42, 53, 61, 69, 76],
  },
]

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
  },
  {
    title: 'Software Development',
    text: 'Custom web applications, SaaS platforms, enterprise software, CRM and ERP systems, API development, and seamless integrations.',
  },
  {
    title: 'Web Development',
    text: 'Professional business websites, e-commerce platforms, landing pages, portfolio websites, and fast Progressive Web Apps.',
  },
  {
    title: 'Mobile App Development',
    text: 'Android, iOS, React Native, Flutter, and on-demand mobile applications designed for smooth user experiences.',
  },
  {
    title: 'Cloud & DevOps',
    text: 'Cloud hosting, server deployment, CI/CD pipelines, database management, scalable architecture, and reliable infrastructure setup.',
  },
  {
    title: 'Cybersecurity',
    text: 'Security audits, penetration testing, data protection, network security, monitoring, and stronger digital defense systems.',
  },
  {
    title: 'Data & Analytics',
    text: 'Business dashboards, AI-powered analytics, reporting systems, data visualization, and large-scale data processing.',
  },
  {
    title: 'Automation Services',
    text: 'Business process automation, AI workflow automation, CRM automation, lead generation systems, email automation, and SMS automation.',
  },
  {
    title: 'Digital Marketing',
    text: 'SEO, performance marketing, social media campaigns, content strategy, conversion optimization, and analytics-driven growth systems.',
  },
]

const caseStudies = [
  {
    company: 'Northstar Bank',
    industry: 'Financial services',
    result: '$18M protected',
    text: 'Reduced exception review backlogs and surfaced high-risk transactions before settlement windows closed.',
  },
  {
    company: 'Aster Cloud',
    industry: 'B2B SaaS',
    result: '27% expansion lift',
    text: 'Prioritized enterprise accounts with buying intent, usage gaps, and support health in one view.',
  },
  {
    company: 'Vale Health',
    industry: 'Healthcare operations',
    result: '44% faster routing',
    text: 'Automated intake classification while preserving policy checks and clinical escalation rules.',
  },
]

const workflowSteps = [
  'Connect governed data',
  'Model business signals',
  'Deploy role-based copilots',
  'Measure outcomes continuously',
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
function Chart({ metric }) {
  const points = useMemo(() => {
    const max = Math.max(...metric.data)
    const min = Math.min(...metric.data)
    const range = max - min || 1

    return metric.data
      .map((value, index) => {
        const x = (index / (metric.data.length - 1)) * 100
        const y = 92 - ((value - min) / range) * 68
        return `${x},${y}`
      })
      .join(' ')
  }, [metric])

  return (
    <svg className="metric-chart" viewBox="0 0 100 100" aria-label={`${metric.label} trend`}>
      <defs>
        <linearGradient id="chartLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5ef7c8" />
          <stop offset="55%" stopColor="#78a8ff" />
          <stop offset="100%" stopColor="#f5c86b" />
        </linearGradient>
      </defs>
      <path className="chart-grid" d="M0 25H100M0 50H100M0 75H100" />
      <polyline className="chart-line" points={points} />
      {metric.data.map((value, index) => {
        const x = (index / (metric.data.length - 1)) * 100
        const max = Math.max(...metric.data)
        const min = Math.min(...metric.data)
        const y = 92 - ((value - min) / (max - min || 1)) * 68

        return <circle className="chart-point" cx={x} cy={y} r="1.8" key={`${metric.id}-${value}`} />
      })}
    </svg>
  )
}

function App() {
  const heroRef = useRef(null)
  const [activeMetric, setActiveMetric] = useState(platformMetrics[0])
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isHeroVideoVisible, setIsHeroVideoVisible] = useState(false)

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
          <a href="#top">About</a>
          <a href="#chatbot">Insights</a>
        </div>
      </nav>

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
            <h2>AI Solutions & Software Engineering for Modern Business</h2>
          </div>
        </div>

        <div className="hero-copy">
          <p className="eyebrow brand-breadcrumb">
            <span>/ SYSTEMS ENGINEERING / SECURITY</span>
          </p>
          <h1>AI Solutions & Software Engineering for Modern Business</h1>
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
          <h2>From intelligent systems to scalable digital operations.</h2>
          <p>
            Varlexa helps businesses design, build, secure, automate, and scale digital products
            with practical AI, software engineering, cloud infrastructure, and data intelligence.
          </p>
        </div>

        <div className="capability-grid">
          {capabilities.map((capability, index) => (
            <article className="capability-card" key={capability.title}>
              <span className="card-index">0{index + 1}</span>
              <h3>{capability.title}</h3>
              <p>{capability.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block analytics-block" id="outcomes">
        <div className="analytics-copy">
          <p className="eyebrow">Interactive intelligence</p>
          <h2>Executive metrics that stay connected to the work.</h2>
          <p>
            Every recommendation links back to source data, model confidence, and the operational
            outcome it is designed to improve.
          </p>
          <div className="metric-tabs" role="tablist" aria-label="Business metrics">
            {platformMetrics.map((metric) => (
              <button
                className={metric.id === activeMetric.id ? 'metric-tab is-active' : 'metric-tab'}
                key={metric.id}
                onClick={() => setActiveMetric(metric)}
                role="tab"
                type="button"
                aria-selected={metric.id === activeMetric.id}
              >
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="analytics-surface">
          <div className="surface-header">
            <span>{activeMetric.label}</span>
            <strong>{activeMetric.value}</strong>
          </div>
          <Chart metric={activeMetric} />
          <p>{activeMetric.detail}</p>
          <div className="data-table" aria-label="Operational signals">
            <div>
              <span>Coverage</span>
              <strong>87%</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong>94%</strong>
            </div>
            <div>
              <span>Cycle gain</span>
              <strong>16 days</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block workflow-block">
        <div className="section-heading compact">
          <p className="eyebrow">Operating model</p>
          <h2>Designed for enterprise rollout.</h2>
        </div>
        <div className="workflow-track">
          {workflowSteps.map((step, index) => (
            <div className="workflow-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block security-block" id="security">
        <div className="security-copy">
          <p className="eyebrow">Trust architecture</p>
          <h2>Controls that make AI accountable.</h2>
          <p>
            Governance is built into the workflow layer: approval chains, access boundaries, model
            evaluations, and traceable decisions are visible to the teams that own risk.
          </p>
        </div>
        <div className="security-grid">
          <div>
            <span>01</span>
            <strong>Policy-aware agents</strong>
            <p>Actions are constrained by business rules, user role, and model confidence.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Complete audit trails</strong>
            <p>Every answer records source context, reasoning path, and approval history.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Deployment flexibility</strong>
            <p>Run in managed cloud, private cloud, or isolated enterprise environments.</p>
          </div>
        </div>
      </section>

      <section className="section-block case-block" id="cases">
        <div className="section-heading">
          <p className="eyebrow">Case studies</p>
          <h2>Measurable results in regulated, high-stakes operations.</h2>
        </div>
        <div className="case-grid">
          {caseStudies.map((study) => (
            <article className="case-card" key={study.company}>
              <div>
                <span>{study.industry}</span>
                <h3>{study.company}</h3>
              </div>
              <strong>{study.result}</strong>
              <p>{study.text}</p>
            </article>
          ))}
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
    </main>
  )
}

export default App
