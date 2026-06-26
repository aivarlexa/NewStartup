import { Link } from 'react-router-dom'

function ServiceCard({ capability, index }) {
  return (
    <article className="capability-card">
      <div className="capability-title-block">
        <span className="card-index">0{index + 1}</span>
        <h3>{capability.title}</h3>
      </div>
      <p>{capability.text}</p>
      <div className="capability-action-block">
        <Link className="capability-arrow" to="/about" aria-label={`Learn more about ${capability.title}`}>
          ↗
        </Link>
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

