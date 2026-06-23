function ServiceVisualPanel({ visual }) {
  return (
    <div className="capability-visual" aria-hidden="true">
      <div className="visual-connector"></div>
      <span className="visual-node"></span>
      <div className="visual-mini-panel">
        <div className="visual-mini-header">
          <span className="visual-dot"></span>
          <strong>{visual.label}</strong>
        </div>
        <div className="visual-bars">
          {[0, 1, 2, 3, 4].map((bar) => (
            <span key={bar}></span>
          ))}
        </div>
        <span className="visual-mini-detail">{visual.detail}</span>
      </div>
    </div>
  )
}

export default ServiceVisualPanel
