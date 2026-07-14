import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BrandWordmark from './BrandWordmark'
import RoleSelectionModal from './RoleSelectionModal'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
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

  const isHomeActive = location.pathname === '/' && (!location.hash || location.hash === '#top')
  const isServicesActive = location.hash === '#platform' || location.pathname === '/services'
  const isInsightsActive = location.hash === '#chatbot'
  const isLoginActive = location.pathname === '/developer-login' || location.pathname === '/developer/login' || location.pathname === '/client/login'

  const scrollToHash = (hash) => {
    window.requestAnimationFrame(() => {
      const targetElement = document.querySelector(hash)

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }
    })
  }

  const handleHashNavigation = (hash) => {
    if (location.pathname !== '/' || location.hash !== hash) {
      navigate(`/${hash}`)
      return
    }

    scrollToHash(hash)
  }

  const openRoleModal = () => {
    closeMobileMenu()
    setIsRoleModalOpen(true)
  }

  const selectRole = (loginPath) => {
    setIsRoleModalOpen(false)
    closeMobileMenu()
    navigate(loginPath)
  }

  return (
    <>
    <nav className="topbar" aria-label="Primary navigation" ref={navRef}>
      <Link className="brand" to="/#top" aria-label="Varlexa AI home">
        <BrandWordmark className="nav-wordmark" alt="" />
      </Link>
      <div className="nav-links">
        <Link className={isHomeActive ? 'is-active' : ''} to="/#top" onClick={(event) => { event.preventDefault(); handleHashNavigation('#top') }}>Home</Link>
        <Link className={isServicesActive ? 'is-active' : ''} to="/#platform" onClick={(event) => { event.preventDefault(); handleHashNavigation('#platform') }}>Services</Link>
        <Link className={location.pathname === '/about' ? 'is-active' : ''} to="/about">About</Link>
        <Link className={isInsightsActive ? 'is-active' : ''} to="/#chatbot" onClick={(event) => { event.preventDefault(); handleHashNavigation('#chatbot') }}>Insights</Link>
        <Link className={location.pathname === '/contact' ? 'is-active' : ''} to="/contact">Contact</Link>
        <button className={`nav-cta nav-login-button ${isLoginActive ? 'is-active' : ''}`} type="button" onClick={openRoleModal}>
          Login
        </button>
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
        <Link className={isHomeActive ? 'is-active' : ''} to="/#top" onClick={(event) => { event.preventDefault(); closeMobileMenu(); handleHashNavigation('#top') }}>Home</Link>
        <Link className={isServicesActive ? 'is-active' : ''} to="/#platform" onClick={(event) => { event.preventDefault(); closeMobileMenu(); handleHashNavigation('#platform') }}>Services</Link>
        <Link className={location.pathname === '/about' ? 'is-active' : ''} to="/about" onClick={closeMobileMenu}>About</Link>
        <Link className={isInsightsActive ? 'is-active' : ''} to="/#chatbot" onClick={(event) => { event.preventDefault(); closeMobileMenu(); handleHashNavigation('#chatbot') }}>Insights</Link>
        <Link className={location.pathname === '/contact' ? 'is-active' : ''} to="/contact" onClick={closeMobileMenu}>Contact</Link>
        <button className={`mobile-nav-cta nav-login-button ${isLoginActive ? 'is-active' : ''}`} type="button" onClick={openRoleModal}>
          Login
        </button>
      </div>
    </nav>
    <RoleSelectionModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} onSelect={selectRole} />
    </>
  )
}

export default Navbar
