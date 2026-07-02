import { useEffect, useMemo, useState } from 'react'
import { Building2, CalendarDays, Clock, Mail, MessageSquare, Send, ShieldCheck, User } from 'lucide-react'
import ServiceDropdown from './ServiceDropdown'
import api, { getApiErrorMessage } from '../services/api'

const DURATION_OPTIONS = [30, 45, 60, 90]

function ContactForm() {
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    company: '',
    service: '',
    message: '',
  })
  const [bookingValues, setBookingValues] = useState({
    purpose: '',
    date: '',
    time: '',
    duration: 30,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [slots, setSlots] = useState([])
  const [slotStatus, setSlotStatus] = useState('idle')
  const [bookingStatus, setBookingStatus] = useState('idle')
  const [bookingMessage, setBookingMessage] = useState('')

  const selectedDuration = useMemo(() => Number(bookingValues.duration || 30), [bookingValues.duration])

  useEffect(() => {
    if (!isBookingOpen || !bookingValues.date) {
      setSlots([])
      return undefined
    }

    const controller = new AbortController()

    async function loadSlots() {
      setSlotStatus('loading')
      setBookingStatus('idle')
      setBookingMessage('')
      setBookingValues((current) => ({ ...current, time: '' }))

      try {
        const { data } = await api.get('/bookings/slots', {
          params: { date: bookingValues.date, duration: selectedDuration },
          signal: controller.signal,
        })

        if (!data.success) {
          throw new Error(data.message || 'Unable to load available times.')
        }

        setSlots(data.slots || [])
        setSlotStatus('success')
      } catch (error) {
        if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return
        setSlots([])
        setSlotStatus('error')
        setBookingStatus('error')
        setBookingMessage(getApiErrorMessage(error, 'Unable to load available times.'))
      }
    }

    loadSlots()
    return () => controller.abort()
  }, [bookingValues.date, isBookingOpen, selectedDuration])

  function updateField(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
  }

  function updateBookingField(event) {
    const { name, value } = event.target
    setBookingValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setBookingMessage('')
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

  function validateBooking() {
    const nextErrors = {}

    if (!formValues.fullName.trim()) nextErrors.fullName = 'Full name is required.'
    if (!/^\S+@\S+\.\S+$/.test(formValues.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!bookingValues.purpose.trim()) nextErrors.purpose = 'Meeting purpose is required.'
    if (!bookingValues.date) nextErrors.date = 'Choose a meeting date.'
    if (!bookingValues.time) nextErrors.time = 'Choose an available time.'

    return nextErrors
  }

  async function submitContact(event) {
    event.preventDefault()

    const nextErrors = validateForm()

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setIsSubmitted(false)
      return
    }

    try {
      const { data } = await api.post('/contact', formValues)

      if (data.success) {
        setIsSubmitted(true)
        setFormValues({ fullName: '', email: '', company: '', service: '', message: '' })
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error(error)
      alert(getApiErrorMessage(error, 'Something went wrong'))
    }
  }

  async function submitBooking(event) {
    event.preventDefault()
    const nextErrors = validateBooking()

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setBookingStatus('loading')
    setBookingMessage('')

    try {
      const { data } = await api.post('/bookings', {
        name: formValues.fullName,
        email: formValues.email,
        company: formValues.company,
        purpose: bookingValues.purpose,
        date: bookingValues.date,
        time: bookingValues.time,
        duration: selectedDuration,
      })

      if (!data.success) {
        throw new Error(data.message || 'Unable to book meeting.')
      }

      setBookingStatus('success')
      setBookingMessage(data.booking.meetLink ? `Meeting booked. Google Meet link: ${data.booking.meetLink}` : 'Meeting booked. We will contact you with the meeting details.')
      setBookingValues({ purpose: '', date: '', time: '', duration: selectedDuration })
      setSlots([])
    } catch (error) {
      setBookingStatus('error')
      setBookingMessage(getApiErrorMessage(error, error.message || 'Unable to book meeting.'))
    }
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

      <div className="booking-panel">
        <button className="booking-toggle" type="button" onClick={() => setIsBookingOpen((isOpen) => !isOpen)}>
          <CalendarDays aria-hidden="true" />
          <span>{isBookingOpen ? 'Hide Meeting Scheduler' : 'Book a Meeting'}</span>
        </button>

        {isBookingOpen && (
          <div className="booking-fields">
            <label className="message-field">
              <span className="field-label"><MessageSquare aria-hidden="true" />Meeting Purpose</span>
              <textarea name="purpose" value={bookingValues.purpose} onChange={updateBookingField} rows="3"></textarea>
              {errors.purpose && <small>{errors.purpose}</small>}
            </label>
            <div className="booking-grid">
              <label>
                <span className="field-label"><CalendarDays aria-hidden="true" />Date</span>
                <input name="date" type="date" value={bookingValues.date} onChange={updateBookingField} />
                {errors.date && <small>{errors.date}</small>}
              </label>
              <label>
                <span className="field-label"><Clock aria-hidden="true" />Duration</span>
                <select name="duration" value={bookingValues.duration} onChange={updateBookingField}>
                  {DURATION_OPTIONS.map((duration) => <option value={duration} key={duration}>{duration} minutes</option>)}
                </select>
              </label>
            </div>
            <div>
              <span className="field-label"><Clock aria-hidden="true" />Available Time</span>
              <div className="slot-grid">
                {slotStatus === 'loading' && <span className="booking-state">Loading available times...</span>}
                {slotStatus === 'error' && <span className="booking-state error">Unable to load available times.</span>}
                {slotStatus === 'success' && slots.length === 0 && <span className="booking-state">No available slots for this date.</span>}
                {slots.map((slot) => (
                  <button
                    className={bookingValues.time === slot.time ? 'selected' : ''}
                    type="button"
                    key={slot.time}
                    onClick={() => {
                      setBookingValues((current) => ({ ...current, time: slot.time }))
                      setErrors((currentErrors) => ({ ...currentErrors, time: '' }))
                      setBookingStatus('idle')
                      setBookingMessage('')
                    }}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
              {errors.time && <small>{errors.time}</small>}
            </div>
            <button className="primary-action contact-submit" type="button" onClick={submitBooking} disabled={bookingStatus === 'loading'}>
              <span>{bookingStatus === 'loading' ? 'Booking...' : 'Confirm Meeting'}</span>
              <Send aria-hidden="true" />
            </button>
            {bookingMessage && <p className={bookingStatus === 'error' ? 'form-error' : 'form-success'}>{bookingMessage}</p>}
          </div>
        )}
      </div>

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






