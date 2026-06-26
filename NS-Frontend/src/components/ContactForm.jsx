import { useState } from 'react'
import { Building2, Mail, MessageSquare, Send, ShieldCheck, User } from 'lucide-react'
import ServiceDropdown from './ServiceDropdown'

function ContactForm() {
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    company: '',
    service: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
  }

  function updateService(serviceTitle) {
    setFormValues((currentValues) => ({ ...currentValues, service: serviceTitle }))
    setErrors((currentErrors) => ({ ...currentErrors, service: '' }))
  }

  function validateForm() {
    const nextErrors = {}

    if (!formValues.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.'
    }

    if (!/^\S+@\S+\.\S+$/.test(formValues.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!formValues.service.trim()) {
      nextErrors.service = 'Choose a service need.'
    }

    if (formValues.message.trim().length < 12) {
      nextErrors.message = 'Message should be at least 12 characters.'
    }

    return nextErrors
  }

  function submitContact(event) {
    event.preventDefault()
    const nextErrors = validateForm()

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setIsSubmitted(false)
      return
    }

    setIsSubmitted(true)
    setFormValues({ fullName: '', email: '', company: '', service: '', message: '' })
  }

  return (
    <form className="contact-form" onSubmit={submitContact} noValidate>
      <label>
        <span className="field-label"><User aria-hidden="true" />Full Name</span>
        <input name="fullName" value={formValues.fullName} onChange={updateField} />
        {errors.fullName && <small>{errors.fullName}</small>}
      </label>
      <label>
        <span className="field-label"><Mail aria-hidden="true" />Email Address</span>
        <input name="email" type="email" value={formValues.email} onChange={updateField} />
        {errors.email && <small>{errors.email}</small>}
      </label>
      <label>
        <span className="field-label"><Building2 aria-hidden="true" />Company Name</span>
        <input name="company" value={formValues.company} onChange={updateField} />
      </label>
      <ServiceDropdown value={formValues.service} error={errors.service} onChange={updateService} />
      <label className="message-field">
        <span className="field-label"><MessageSquare aria-hidden="true" />Message</span>
        <textarea name="message" value={formValues.message} onChange={updateField} rows="6"></textarea>
        {errors.message && <small>{errors.message}</small>}
      </label>
      <button className="primary-action contact-submit" type="submit">
        <span>Send Message</span>
        <Send aria-hidden="true" />
      </button>
      <p className="privacy-note"><ShieldCheck aria-hidden="true" />We respect your privacy. Your information is safe with us.</p>
      {isSubmitted && <p className="form-success">Message received. We will get back to you shortly.</p>}
    </form>
  )
}

export default ContactForm
