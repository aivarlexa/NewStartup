import ContactDetails from '../components/ContactDetails'
import ContactForm from '../components/ContactForm'

function ContactPage() {
  return (
    <section className="page-shell contact-page">
      <div className="contact-space" aria-hidden="true">
        <span className="contact-orbit contact-orbit-one"></span>
        <span className="contact-orbit contact-orbit-two"></span>
        <span className="contact-node contact-node-one"></span>
        <span className="contact-node contact-node-two"></span>
        <span className="contact-wave contact-wave-one"></span>
        <span className="contact-wave contact-wave-two"></span>
      </div>

      <div className="page-heading contact-heading">
        <p className="eyebrow">Connect with us</p>
        <h1>
          Start a <span>conversation.</span>
        </h1>
        <span className="contact-heading-line" aria-hidden="true"></span>
        <span className="heading-spark heading-spark-one" aria-hidden="true"></span>
        <span className="heading-spark heading-spark-two" aria-hidden="true"></span>
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
