import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { aiQuickActions, dashboardProjects, recentActivities } from '../../data/dashboardData'
import api, { getApiErrorMessage } from '../../services/api'

function AIAssistantPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Select a quick action or ask me to turn project context into a development plan.' },
  ])
  const selectedProject = dashboardProjects[0]

  function promptFromAction(action) {
    setInput(`${action} for ${selectedProject.name}.`)
  }

  async function sendPrompt(event) {
    event.preventDefault()

    const trimmedInput = input.trim()
    if (!trimmedInput || loading) return

    // 1. Add User Message
    const userMessage = { role: 'user', text: trimmedInput }
    setMessages((current) => [...current, userMessage])
    setInput('')
    setLoading(true)

    try {
      // 2. Call Backend Gemini API Endpoint
      const { data } = await api.post('/insights', {
        input: trimmedInput,
        context: {
          name: selectedProject.name,
          client: selectedProject.client,
          progress: selectedProject.progress,
          developers: selectedProject.developers,
          requirements: selectedProject.requirements,
        },
      })

      // 3. Append Real AI Response
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: data.answer || 'No response received from AI assistant.',
        },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: getApiErrorMessage(error, 'Error connecting to AI service. Please try again.'),
        },
      ])
    } finally {
      setLoading(false)
    }
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
              <button 
                type="button" 
                key={action} 
                onClick={() => promptFromAction(action)}
                disabled={loading}
              >
                {action}
              </button>
            ))}
          </div>

          <div className="dashboard-chat-messages">
            {messages.map((message, index) => (
              <article className={`ai-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.text}
              </article>
            ))}
            {loading && (
              <article className="ai-message assistant loading">
                <Loader2 className="animate-spin" size={18} /> Generating response...
              </article>
            )}
          </div>

          <form className="dashboard-chat-form" onSubmit={sendPrompt}>
            <input 
              value={input} 
              onChange={(event) => setInput(event.target.value)} 
              placeholder="Ask the AI developer assistant..." 
              disabled={loading}
            />
            <button type="submit" aria-label="Send prompt" disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
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