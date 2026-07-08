import { Link, useNavigate } from 'react-router-dom'

function ServiceCard({ capability, index }) {
  const navigate = useNavigate()

  function openContactPage() {
    navigate('/contact')
  }

  function handleCardKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openContactPage()
    }
  }

  return (
    <article
      className="capability-card"
      onClick={openContactPage}
      onKeyDown={handleCardKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`Contact us about ${capability.title}`}
    >
      <div className="capability-title-block">
        <span className="card-index">0{index + 1}</span>
        <h3>{capability.title}</h3>
      </div>
      <span className="capability-divider" aria-hidden="true"></span>
      <p>{capability.text}</p>
      <div className="capability-action-block">
        <span className="capability-arrow" aria-hidden="true">
          ↗
        </span>
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
