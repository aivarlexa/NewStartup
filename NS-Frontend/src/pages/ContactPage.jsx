import ContactDetails from '../components/ContactDetails'
import ContactForm from '../components/ContactForm'

function ContactPage() {
  return (
    <section className="page-shell contact-page">
      <div className="page-heading">
        <p className="eyebrow">Connect with us</p>
        <h1>Start a conversation.</h1>
        <p>Tell us what you want to build, secure, automate, or scale. We will respond with a practical next step.</p>
      </div>

      <div className="contact-layout">
        <ContactForm />
        <ContactDetails />
      </div>
    </section>
  )
}

export default ContactPage
