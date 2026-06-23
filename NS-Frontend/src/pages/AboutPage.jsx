import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { aboutCapabilityChips, aboutInfoCards, aboutValues } from '../data/siteData'

function AboutPage() {
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
            <Link className="primary-action" to="/#platform">EXPLORE SERVICES</Link>
            <Link className="secondary-action" to="/contact">CONTACT US</Link>
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
          <Link className="primary-action" to="/contact">START A PROJECT</Link>
          <Link className="secondary-action" to="/#platform">VIEW SERVICES</Link>
        </div>
      </div>
    </section>
  )
}

export default AboutPage
