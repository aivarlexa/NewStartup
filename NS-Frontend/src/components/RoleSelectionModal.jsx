import { useEffect, useRef } from 'react'
import { ArrowLeft, BriefcaseBusiness, Code2, ShieldCheck, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ROLE_CARDS = [
  {
    role: 'Client',
    icon: BriefcaseBusiness,
    description: 'I want to hire developers and manage projects.',
    action: 'Continue as Client',
    to: '/client/login',
  },
  {
    role: 'Developer',
    icon: Code2,
    description: 'I want to work on client projects.',
    action: 'Continue as Developer',
    to: '/developer/login',
  },
  {
    role: 'Admin',
    icon: ShieldCheck,
    description: 'I want to manage clients, developers, projects, and reports.',
    action: 'Continue as Admin',
    to: '/admin/login',
  },
]

function RoleSelectionModal({ isOpen, onClose, onSelect }) {
  const navigate = useNavigate()
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const previousActiveElement = document.activeElement
    const focusable = dialogRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    focusable?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousActiveElement?.focus?.()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleBack() {
    onClose()
    navigate('/')
  }

  return (
    <div className="role-modal-backdrop" onMouseDown={onClose}>
      <section
        className="role-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-title"
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="role-modal-close" type="button" onClick={onClose} aria-label="Close role selection">
          <X size={18} />
        </button>
        <button className="login-back-button role-modal-back-button" type="button" onClick={handleBack}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <div className="role-modal-heading">
          <span>Choose workspace</span>
          <h2 id="role-modal-title">How do you want to continue?</h2>
        </div>
        <div className="role-card-grid">
          {ROLE_CARDS.map((item) => {
            const Icon = item.icon
            return (
              <article className="role-card" key={item.role}>
                <span className="role-card-icon"><Icon size={28} /></span>
                <h3>{item.role}</h3>
                <p>{item.description}</p>
                <button type="button" onClick={() => onSelect(item.to)}>{item.action}</button>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default RoleSelectionModal
