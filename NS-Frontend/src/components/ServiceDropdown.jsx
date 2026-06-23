import { useEffect, useRef, useState } from 'react'
import { capabilities } from '../data/siteData'

function ServiceDropdown({ value, error, onChange }) {
  const serviceDropdownRef = useRef(null)
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

  function selectService(serviceTitle) {
    onChange(serviceTitle)
    setIsServiceDropdownOpen(false)
  }

  return (
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
          <span>{value || 'Select service'}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10L12 15L17 10" />
          </svg>
        </button>
        {isServiceDropdownOpen && (
          <div className="dropdown-menu" role="listbox" aria-label="Service Needed">
            {capabilities.map((capability) => (
              <button
                className={`dropdown-option ${value === capability.title ? 'selected' : ''}`}
                type="button"
                role="option"
                aria-selected={value === capability.title}
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
      {error && <small>{error}</small>}
    </label>
  )
}

export default ServiceDropdown
