import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

function PasswordInput({ className, id, ...inputProps }) {
  const [isVisible, setIsVisible] = useState(false)
  const generatedId = useId()
  const inputId = id || generatedId
  const visibilityLabel = isVisible ? 'Hide password' : 'Show password'

  return (
    <>
      <input
        {...inputProps}
        id={inputId}
        className={`password-input${className ? ` ${className}` : ''}`}
        type={isVisible ? 'text' : 'password'}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setIsVisible((currentVisibility) => !currentVisibility)}
        aria-label={visibilityLabel}
        title={visibilityLabel}
        aria-controls={inputId}
      >
        {isVisible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
      </button>
    </>
  )
}

export default PasswordInput
