import { useState } from 'react'
import { CalendarDays, ListPlus, Send } from 'lucide-react'
import { clientConversations } from '../../data/dashboardData'

function ClientChatPage() {
  const [selectedId, setSelectedId] = useState(clientConversations[0].id)
  const [conversationMessages, setConversationMessages] = useState(() =>
    Object.fromEntries(clientConversations.map((conversation) => [conversation.id, conversation.messages])),
  )
  const [input, setInput] = useState('')
  const selectedConversation = clientConversations.find((conversation) => conversation.id === selectedId)

  function sendMessage(event) {
    event.preventDefault()

    if (!input.trim()) return

    setConversationMessages((current) => ({
      ...current,
      [selectedId]: [...current[selectedId], { sender: 'Developer', time: 'Now', text: input.trim() }],
    }))
    setInput('')
  }

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Client Conversation</p>
        <h1>Client Chat</h1>
      </div>

      <div className="chat-workspace client-chat-layout">
        <aside className="chat-side-panel">
          {clientConversations.map((conversation) => (
            <button className={selectedId === conversation.id ? 'active' : ''} type="button" key={conversation.id} onClick={() => setSelectedId(conversation.id)}>
              <span>{conversation.client}</span>
              <small>{conversation.project}</small>
              <em>{conversation.latest}</em>
              {conversation.unread > 0 && <strong>{conversation.unread}</strong>}
            </button>
          ))}
        </aside>

        <section className="chat-main-panel client-main-panel">
          <div className="chat-room-header">
            <div>
              <span>Client Conversation</span>
              <strong>{selectedConversation.project}</strong>
            </div>
          </div>
          <div className="dashboard-chat-messages">
            {conversationMessages[selectedId].map((message, index) => (
              <article className={`dashboard-chat-message ${message.sender === 'Developer' ? 'own' : ''}`} key={`${message.sender}-${index}`}>
                <span>{message.sender.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{message.sender} <small>{message.time}</small></strong>
                  <p>{message.text}</p>
                </div>
              </article>
            ))}
          </div>
          <form className="dashboard-chat-form" onSubmit={sendMessage}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Reply to client..." />
            <button type="submit" aria-label="Send message"><Send size={18} /></button>
          </form>
        </section>

        <aside className="chat-info-panel client-info-panel">
          <h2>{selectedConversation.client}</h2>
          <p>{selectedConversation.project}</p>
          <span className={`status-badge ${selectedConversation.status.toLowerCase().replaceAll(' ', '-')}`}>{selectedConversation.status}</span>
          <button type="button"><ListPlus size={16} /> Create Task From Message</button>
          <button type="button"><CalendarDays size={16} /> Schedule Meeting</button>
        </aside>
      </div>
    </div>
  )
}

export default ClientChatPage
