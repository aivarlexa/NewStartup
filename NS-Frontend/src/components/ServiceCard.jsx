import { Link, useNavigate } from 'react-router-dom'

function ServiceCard({ capability, index }) {
  const navigate = useNavigate()
  const isContactCard = capability.title === 'AI Development'

  function openContactPage() {
    navigate('/contact')
  }

  function handleCardKeyDown(event) {
    if (!isContactCard) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openContactPage()
    }
  }

  return (
    <article
      className={`capability-card${isContactCard ? ' is-contact-card' : ''}`}
      onClick={isContactCard ? openContactPage : undefined}
      onKeyDown={isContactCard ? handleCardKeyDown : undefined}
      role={isContactCard ? 'link' : undefined}
      tabIndex={isContactCard ? 0 : undefined}
      aria-label={isContactCard ? 'Contact us about AI Development' : undefined}
    >
      <div className="capability-title-block">
        <span className="card-index">0{index + 1}</span>
        <h3>{capability.title}</h3>
      </div>
      <span className="capability-divider" aria-hidden="true"></span>
      <p>{capability.text}</p>
      <div className="capability-action-block">
        {isContactCard ? (
          <span className="capability-arrow" aria-hidden="true">
            ↗
          </span>
        ) : (
          <Link className="capability-arrow" to="/contact" aria-label={`Learn more about ${capability.title}`}>
            ↗
          </Link>
        )}
        <div className="capability-tags" aria-label={`${capability.title} categories`}>
          {capability.tags.map((tag) => (
            <span key={`${capability.title}-${tag}`}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default ServiceCard
