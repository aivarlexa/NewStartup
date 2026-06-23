import { Link, useLocation } from 'react-router-dom'
import BrandWordmark from './BrandWordmark'

function Navbar() {
  const location = useLocation()

  return (
    <nav className="topbar" aria-label="Primary navigation">
      <Link className="brand" to="/#top" aria-label="Varlexa AI home">
        <BrandWordmark className="nav-wordmark" alt="" />
      </Link>
      <div className="nav-links">
        <Link to="/#platform">Services</Link>
        <Link to="/#outcomes">Solutions</Link>
        <Link to="/#security">Projects</Link>
        <Link to="/#cases">Industries</Link>
        <Link className={location.pathname === '/about' ? 'is-active' : ''} to="/about">About</Link>
        <Link to="/#chatbot">Insights</Link>
      </div>
    </nav>
  )
}

export default Navbar
