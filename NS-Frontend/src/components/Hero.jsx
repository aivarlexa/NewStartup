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

// Intro sequence stages, in order. Each stage's duration lives in INTRO_TIMING.
// mark -> pulse -> flare -> dial -> reveal -> done
const INTRO_TIMING = {
  mark: 1050, // logo + swipe-line + progress count
  pulse: 550, // logo fades, single dot remains
  flare: 780, // dot blooms into a lens flare
  dial: 1500, // the creator dial resolves out of the flare and spins briefly
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
      {/* Signature animated background: flowing traces + drifting color blooms + scan beam */}
      <div className="hero-bg-signature" aria-hidden="true">
        <div className="hero-bg-blob blob-one"></div>
        <div className="hero-bg-blob blob-two"></div>
        <div className="hero-bg-blob blob-three"></div>
        <svg className="hero-bg-traces" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <defs>
            <linearGradient id="traceGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5ef7c8" />
              <stop offset="50%" stopColor="#78a8ff" />
              <stop offset="100%" stopColor="#b389ff" />
            </linearGradient>
          </defs>
          <path className="trace-path trace-one" d="M-50,620 C220,520 380,700 620,560 C860,420 980,540 1250,380" />
          <path className="trace-path trace-two" d="M-50,180 C200,260 360,120 640,220 C900,310 1000,160 1250,240" />
          <path className="trace-path trace-three" d="M-50,420 C260,380 460,460 700,380 C940,300 1050,400 1250,340" />
        </svg>
        <div className="hero-bg-scanline"></div>
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
                <img src={varlexaMark} alt="" />
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
          <h2>Verlexa AI Intelligence Beyond Imagination Innovation Beyond Expectations</h2>
        </div>
      </div>
      <div className="hero-copy">
        <p className="eyebrow brand-breadcrumb">
      
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