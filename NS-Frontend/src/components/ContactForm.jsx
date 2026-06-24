import { useState } from 'react'
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

  async function submitContact(event) {
  event.preventDefault();

  const nextErrors = validateForm();

  if (Object.keys(nextErrors).length) {
    setErrors(nextErrors);
    setIsSubmitted(false);
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      }
    );

    const data = await response.json();

    if (data.success) {
      setIsSubmitted(true);

      setFormValues({
        fullName: "",
        email: "",
        company: "",
        service: "",
        message: "",
      });
    } else {
      alert(data.message);
    }

  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
}

  return (
    <form className="contact-form" onSubmit={submitContact} noValidate>
      <label>
        <span>Full Name</span>
        <input name="fullName" value={formValues.fullName} onChange={updateField} />
        {errors.fullName && <small>{errors.fullName}</small>}
      </label>
      <label>
        <span>Email Address</span>
        <input name="email" type="email" value={formValues.email} onChange={updateField} />
        {errors.email && <small>{errors.email}</small>}
      </label>
      <label>
        <span>Company Name</span>
        <input name="company" value={formValues.company} onChange={updateField} />
      </label>
      <ServiceDropdown value={formValues.service} error={errors.service} onChange={updateService} />
      <label className="message-field">
        <span>Message</span>
        <textarea name="message" value={formValues.message} onChange={updateField} rows="6"></textarea>
        {errors.message && <small>{errors.message}</small>}
      </label>
      <button className="primary-action" type="submit">Send Message</button>
      {isSubmitted && <p className="form-success">Message received. We will get back to you shortly.</p>}
    </form>
  )
}

export default ContactForm
