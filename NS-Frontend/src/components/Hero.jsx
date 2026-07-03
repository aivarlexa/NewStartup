import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import varlexaLogo from '../assets/varlexa-logo.png'
import varlexaMark from '../assets/varlexa-mark.png'
import BrandWordmark from './BrandWordmark'

function Hero() {
  const heroRef = useRef(null)
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

  return (
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
