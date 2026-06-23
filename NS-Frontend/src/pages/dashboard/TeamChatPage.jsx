import { useState } from 'react'
import { Paperclip, Send, Smile } from 'lucide-react'
import { developers, teamChannels, teamMessages } from '../../data/dashboardData'

function TeamChatPage() {
  const [messages, setMessages] = useState(teamMessages)
  const [input, setInput] = useState('')
  const [activeChannel, setActiveChannel] = useState('General')

  function sendMessage(event) {
    event.preventDefault()

    if (!input.trim()) return

    setMessages((current) => [...current, { sender: 'You', time: 'Now', text: input.trim() }])
    setInput('')
  }

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Team Collaboration</p>
        <h1>Team Chat</h1>
      </div>

      <div className="chat-workspace team-chat-layout">
        <aside className="chat-side-panel">
          <h2>Channels</h2>
          {teamChannels.map((channel) => (
            <button className={activeChannel === channel.name ? 'active' : ''} type="button" key={channel.name} onClick={() => setActiveChannel(channel.name)}>
              <span>{channel.name}</span>
              {channel.unread > 0 && <strong>{channel.unread}</strong>}
            </button>
          ))}
          <h2>Developers</h2>
          {developers.map((developer) => <p key={developer}>{developer}</p>)}
        </aside>

        <section className="chat-main-panel">
          <div className="chat-room-header">
            <div>
              <span>#{activeChannel}</span>
              <strong>Developer team conversation</strong>
            </div>
          </div>
          <div className="dashboard-chat-messages">
            {messages.map((message, index) => (
              <article className="dashboard-chat-message" key={`${message.sender}-${index}`}>
                <span>{message.sender.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{message.sender} <small>{message.time}</small></strong>
                  <p>{message.text}</p>
                  <em>Reactions</em>
                </div>
              </article>
            ))}
            <p className="typing-indicator">Priya is typing...</p>
          </div>
          <form className="dashboard-chat-form" onSubmit={sendMessage}>
            <button type="button" aria-label="Attach file"><Paperclip size={18} /></button>
            <button type="button" aria-label="Add emoji"><Smile size={18} /></button>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Message the team..." />
            <button type="submit" aria-label="Send message"><Send size={18} /></button>
          </form>
        </section>

        <aside className="chat-info-panel">
          <h2>Project Details</h2>
          <p>Shared workspace for development decisions, sprint updates, technical reviews, and project coordination.</p>
          <span>Online: Rohit, Priya, Aman</span>
        </aside>
      </div>
    </div>
  )
}

export default TeamChatPage
