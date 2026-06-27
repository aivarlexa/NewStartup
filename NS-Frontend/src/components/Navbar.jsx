import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import BrandWordmark from './BrandWordmark'

function Navbar() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <nav className="topbar" aria-label="Primary navigation" ref={navRef}>
      <Link className="brand" to="/#top" aria-label="Varlexa AI home">
        <BrandWordmark className="nav-wordmark" alt="" />
      </Link>
      <div className="nav-links">
        <Link to="/#platform">Services</Link>
        <Link className={location.pathname === '/about' ? 'is-active' : ''} to="/about">About</Link>
        <Link to="/#chatbot">Insights</Link>
        <Link
          className={`nav-cta ${location.pathname === '/developer-login' ? 'is-active' : ''}`}
          to="/developer-login"
        >
          Developer Login
        </Link>
      </div>
      <button
        className="mobile-nav-toggle"
        type="button"
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-navigation-menu"
        onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
      >
        {isMobileMenuOpen ? <X size={22} strokeWidth={2.2} /> : <Menu size={22} strokeWidth={2.2} />}
      </button>
      <div
        className={`mobile-nav-panel ${isMobileMenuOpen ? 'is-open' : ''}`}
        id="mobile-navigation-menu"
      >
        <Link to="/#top" onClick={closeMobileMenu}>Home</Link>
        <Link to="/#platform" onClick={closeMobileMenu}>Services</Link>
        <Link className={location.pathname === '/about' ? 'is-active' : ''} to="/about" onClick={closeMobileMenu}>About</Link>
        <Link to="/#chatbot" onClick={closeMobileMenu}>Insights</Link>
        <Link className={location.pathname === '/contact' ? 'is-active' : ''} to="/contact" onClick={closeMobileMenu}>Connect With Us</Link>
        <Link
          className={`mobile-nav-cta ${location.pathname === '/developer-login' ? 'is-active' : ''}`}
          to="/developer-login"
          onClick={closeMobileMenu}
        >
          Developer Login
        </Link>
      </div>
    </nav>
  )
}

export default Navbar


