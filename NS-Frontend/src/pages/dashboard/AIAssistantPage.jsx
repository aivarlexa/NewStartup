import { useState } from 'react'
import { Send } from 'lucide-react'
import { aiQuickActions, dashboardProjects, recentActivities } from '../../data/dashboardData'

function AIAssistantPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Select a quick action or ask me to turn project context into a development plan.' },
  ])
  const selectedProject = dashboardProjects[0]

  function promptFromAction(action) {
    setInput(`${action} for ${selectedProject.name}.`)
  }

  function sendPrompt(event) {
    event.preventDefault()

    if (!input.trim()) return

    setMessages((current) => [
      ...current,
      { role: 'user', text: input.trim() },
      {
        role: 'assistant',
        text: 'Mock AI response: I would break this into discovery, architecture, implementation, QA, security review, and deployment milestones with clear owners and client approval checkpoints.',
      },
    ])
    setInput('')
  }

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">AI Developer</p>
        <h1>AI Developer Assistant</h1>
        <p>Use AI to understand project requirements, generate development plans, review tasks, and improve team productivity.</p>
      </div>

      <div className="ai-assistant-layout">
        <section className="dashboard-panel ai-chat-panel">
          <div className="quick-action-grid">
            {aiQuickActions.map((action) => (
              <button type="button" key={action} onClick={() => promptFromAction(action)}>{action}</button>
            ))}
          </div>
          <div className="dashboard-chat-messages">
            {messages.map((message, index) => (
              <article className={`ai-message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</article>
            ))}
          </div>
          <form className="dashboard-chat-form" onSubmit={sendPrompt}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask the AI developer assistant..." />
            <button type="submit" aria-label="Send prompt"><Send size={18} /></button>
          </form>
        </section>

        <aside className="dashboard-panel project-context-panel">
          <h2>Project Context</h2>
          <strong>{selectedProject.name}</strong>
          <p>{selectedProject.client}</p>
          <div className="dashboard-progress">
            <div><span style={{ width: `${selectedProject.progress}%` }}></span></div>
            <strong>{selectedProject.progress}%</strong>
          </div>
          <span>{selectedProject.developers.join(', ')}</span>
          <h3>Recent activity</h3>
          {recentActivities.slice(0, 3).map((activity) => <p key={activity}>{activity}</p>)}
          <h3>Requirements preview</h3>
          <p>{selectedProject.requirements}</p>
        </aside>
      </div>
    </div>
  )
}

export default AIAssistantPage
