import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import varlexaLogo from '../assets/varlexa-logo.png'
import varlexaMark from '../assets/varlexa-mark.png'
import BrandWordmark from './BrandWordmark'

const DIAL_SEGMENTS = [
  { id: 'technology', label: 'CREATOR TECHNOLOGY', offset: '1%' },
  { id: 'communities', label: 'CREATOR COMMUNITIES', offset: '51%' },
]

const DIAL_SEGMENTS_INNER = [
  { id: 'products', label: 'CREATOR PRODUCTS', offset: '3%' },
  { id: 'media', label: 'CREATOR MEDIA', offset: '53%' },
]

// Neural-network background: three columns of nodes connected by smooth
// curves, confined to the right side behind the hero visual so it never
// competes with the heading text. Each link gets a small pulse that travels
// along it - alternating direction per link for a "bidirectional signal" feel.
const NEURAL_NODES = [
  // Left Column
  { id: 'a1', cx: 180, cy: 120, r: 4 },
  { id: 'a2', cx: 180, cy: 260, r: 5 },
  { id: 'a3', cx: 180, cy: 430, r: 4 },
  { id: 'a4', cx: 180, cy: 610, r: 5 },

  // Middle
  { id: 'b1', cx: 520, cy: 90, r: 4 },
  { id: 'b2', cx: 520, cy: 230, r: 5 },
  { id: 'b3', cx: 520, cy: 380, r: 4 },
  { id: 'b4', cx: 520, cy: 520, r: 5 },
  { id: 'b5', cx: 520, cy: 660, r: 4 },

  // Right
  { id: 'c1', cx: 920, cy: 130, r: 4 },
  { id: 'c2', cx: 920, cy: 280, r: 5 },
  { id: 'c3', cx: 920, cy: 470, r: 4 },
  { id: 'c4', cx: 920, cy: 640, r: 5 }
]


const NEURAL_LINKS = [
  { from: [180, 120], to: [520, 90], delay: 0, duration: 5, reverse: false },
  { from: [180, 120], to: [520, 230], delay: 0.4, duration: 6, reverse: true },
  { from: [520, 300], to: [920, 230], delay: 0.8, duration: 5.5, reverse: false },
  { from: [520, 300], to: [920, 370], delay: 1.2, duration: 6.2, reverse: true },
  { from: [520, 440], to: [920, 370], delay: 1.6, duration: 5.2, reverse: false },
  { from: [520, 440], to: [920, 510], delay: 2.0, duration: 6.4, reverse: true },
  { from: [520, 580], to: [920, 510], delay: 2.4, duration: 5.6, reverse: false },
  { from: [520, 580], to: [920, 630], delay: 2.8, duration: 6.0, reverse: true },
  { from: [920, 90], to: [1130, 140], delay: 0.2, duration: 5.4, reverse: false },
  { from: [920, 230], to: [1130, 140], delay: 0.6, duration: 5.8, reverse: true },

  { from: [920, 510], to: [1130, 300], delay: 1.8, duration: 6.3, reverse: false },
  { from: [920, 510], to: [1130, 460], delay: 2.2, duration: 5.7, reverse: true },
  { from: [920, 630], to: [1130, 460], delay: 2.6, duration: 6.0, reverse: false },
  { from: [920, 630], to: [1130, 600], delay: 3.0, duration: 5.9, reverse: true },
]

function neuralLinkPath([x1, y1], [x2, y2]) {
  const midX = (x1 + x2) / 2
  return `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`
}

// Intro sequence stages, in order. Each stage's duration lives in INTRO_TIMING.
// mark -> pulse -> flare -> dial -> reveal -> done
const INTRO_TIMING = {
  mark: 1050, // logo + swipe-line + progress count
  pulse: 550, // logo fades, single dot remains
  flare: 780, // dot blooms into a lens flare
  dial: 3200, // the creator dial resolves out of the flare and spins for a while
  reveal: 620, // whole overlay fades away to reveal the real hero
}

function Hero() {
  const heroRef = useRef(null)
  const [isHeroVideoVisible, setIsHeroVideoVisible] = useState(false)
  const [introStage, setIntroStage] = useState('mark')
  const [introPercent, setIntroPercent] = useState(0)

  // Intro sequence: logo swipe -> loading dot -> lens flare -> dial -> reveal hero
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIntroStage('done')
      return
    }

    let rafId
    const startedAt = performance.now()
    function tickProgress(now) {
      const elapsed = now - startedAt
      const percent = Math.min(100, Math.round((elapsed / INTRO_TIMING.mark) * 100))
      setIntroPercent(percent)
      if (percent < 100) {
        rafId = requestAnimationFrame(tickProgress)
      }
    }
    rafId = requestAnimationFrame(tickProgress)

    const stageOrder = ['pulse', 'flare', 'dial', 'reveal', 'done']
    const stageDelays = [
      INTRO_TIMING.mark,
      INTRO_TIMING.mark + INTRO_TIMING.pulse,
      INTRO_TIMING.mark + INTRO_TIMING.pulse + INTRO_TIMING.flare,
      INTRO_TIMING.mark + INTRO_TIMING.pulse + INTRO_TIMING.flare + INTRO_TIMING.dial,
      INTRO_TIMING.mark + INTRO_TIMING.pulse + INTRO_TIMING.flare + INTRO_TIMING.dial + INTRO_TIMING.reveal,
    ]
    const timers = stageOrder.map((stage, index) => setTimeout(() => setIntroStage(stage), stageDelays[index]))

    return () => {
      cancelAnimationFrame(rafId)
      timers.forEach(clearTimeout)
    }
  }, [])

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

  return (
    <section className={`hero-section ${isHeroVideoVisible ? 'is-video-active' : ''}`} id="top" ref={heroRef}>
      <div className="hero-bg-signature" aria-hidden="true">
        <svg className="hero-neural-svg" viewBox="0 0 1180 700" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="neuralGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b389ff" />
              <stop offset="48%" stopColor="#78a8ff" />
              <stop offset="100%" stopColor="#5ef7c8" />
            </linearGradient>
          </defs>

          {NEURAL_LINKS.map((link, index) => (
            <path key={index} className="neural-link" d={neuralLinkPath(link.from, link.to)} />
          ))}

          {NEURAL_LINKS.map((link, index) => (
            <circle
              key={`pulse-${index}`}
              className={`neural-pulse ${link.reverse ? 'is-reverse' : ''}`}
              r="3"
              style={{
                offsetPath: `path('${neuralLinkPath(link.from, link.to)}')`,
                animationDuration: `${link.duration}s`,
                animationDelay: `${link.delay}s`,
              }}
            />
          ))}

          {NEURAL_NODES.map((node) => (
            <circle key={node.id} className="neural-node" cx={node.cx} cy={node.cy} r={node.r} />
          ))}
        </svg>
      </div>

      {introStage !== 'done' && (
        <div className={`hero-intro stage-${introStage}`} aria-hidden="true">
          <div className="hero-intro-mark">
            <BrandWordmark className="intro-wordmark" alt="VARLEXA AI" />
            <span className="hero-intro-swipe" />
          </div>
          <span className="hero-intro-dot" />
          <span className="hero-intro-flare-rays" />
          {introStage === 'mark' && (
            <span className="hero-intro-progress">{String(introPercent).padStart(2, '0')}</span>
          )}

          <div className="hero-intro-dial-wrap">
            <div className="creator-dial">
              <svg className="creator-dial-svg" viewBox="0 0 420 420" aria-hidden="true">
                <defs>
                  <path id="dial-ring-outer" d="M210,32 a178,178 0 1,1 -0.1,0" />
                  <path id="dial-ring-inner" d="M210,94 a116,116 0 1,1 -0.1,0" />
                </defs>
                <circle className="dial-track dial-track-outer" cx="210" cy="210" r="178" />
                <circle className="dial-track dial-track-inner" cx="210" cy="210" r="116" />

                {DIAL_SEGMENTS.map((segment) => (
                  <text key={segment.id} className="dial-label">
                    <textPath href="#dial-ring-outer" startOffset={segment.offset}>
                      {segment.label}
                    </textPath>
                  </text>
                ))}
                {DIAL_SEGMENTS_INNER.map((segment) => (
                  <text key={segment.id} className="dial-label dial-label-inner">
                    <textPath href="#dial-ring-inner" startOffset={segment.offset}>
                      {segment.label}
                    </textPath>
                  </text>
                ))}

                <path className="dial-arrow" d="M210,32 l7,15 l-15,2 z" />
                <path className="dial-arrow" d="M210,32 l7,15 l-15,2 z" transform="rotate(180 210 210)" />
                <path className="dial-arrow dial-arrow-inner" d="M210,94 l6,13 l-13,2 z" transform="rotate(90 210 210)" />
                <path className="dial-arrow dial-arrow-inner" d="M210,94 l6,13 l-13,2 z" transform="rotate(270 210 210)" />
              </svg>
              <div className="creator-dial-center">
                <div className="lens-glass">
                  <video className="lens-video" autoPlay muted loop playsInline>
                    <source src="/media/dial-video.mp4" type="video/mp4" />
                  </video>
                  <span className="lens-highlight" />
                </div>
              </div>
            </div>
          </div>

          <p className="hero-intro-caption">AI Solutions &amp; Software Engineering</p>
        </div>
      )}

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

          </p>
          <h2>Varlexa AI Intelligence Beyond Imagination Innovation Beyond Expectations</h2>
        </div>
      </div>
      <div className="hero-copy">
        <p className="eyebrow brand-breadcrumb">

        </p>
        <h1 className="hero-title">
          <span>Transforming Businesses</span>
          <span>with Artificial Intelligence</span>
        </h1>
        <p className="hero-lede">
          Varlexa AI builds intelligent AI agents, automation systems,
          and custom software that help businesses grow faster,
          reduce costs, and make smarter decisions.
        </p>
        <div className="hero-actions">
          <Link className="primary-action" to="/contact">
            START A PROJECT
          </Link>
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
  )
}
export default Hero