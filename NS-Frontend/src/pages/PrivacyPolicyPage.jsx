import { privacySections } from '../data/siteData'

function PrivacyPolicyPage() {
  return (
    <section className="page-shell policy-page">
      <div className="page-heading">
        <p className="eyebrow">Privacy Policy</p>
        <h1>Privacy built for modern digital systems.</h1>
        <p>This policy describes how Varlexa AI handles information collected through this website and related business conversations.</p>
      </div>

      <div className="policy-panel">
        {privacySections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PrivacyPolicyPage
