import { useEffect, useRef, useState } from 'react'
import BrandWordmark from '../components/BrandWordmark'
import Hero from '../components/Hero'
import Services from '../components/Services'
import { initialMessages, promptReplies } from '../data/siteData'

function HomePage() {
  const messagesContainerRef = useRef(null)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 100
    const lastMessage = messages[messages.length - 1]
    const isNewUserMessage = lastMessage?.role === 'user'

    if (isScrolledToBottom || isNewUserMessage) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  function getReply(value) {
    const normalized = value.toLowerCase()
    const matchedReply = promptReplies.find((item) => normalized.includes(item.match))

    return (
      matchedReply?.reply ||
      'I would frame this around measurable business impact: baseline the workflow, define human approvals, then compare cycle time, quality, and cost over 30 days.'
    )
  }

  async function sendMessage(value) {
    const trimmedValue = value.trim()

    if (!trimmedValue || isSending) {
      return
    }

    setInput('')
    setIsSending(true)
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', text: trimmedValue },
    ])

    try {
      const response = await fetch('http://localhost:3000/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmedValue }),
      })

      if (!response.ok) {
        throw new Error('Insights service unavailable')
      }

      const data = await response.json()
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', text: data.answer || getReply(trimmedValue) },
      ])
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', text: getReply(trimmedValue) },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      <Hero />

      <section className="logo-band" aria-label="Customer segments">
       
      </section>

      <Services />

      <section className="section-block chatbot-block" id="chatbot">
        <div className="chat-copy">
          <p className="eyebrow">AI chatbot</p>
          <h2>Ask the enterprise copilot.</h2>
          <p>
            The conversational layer helps teams turn strategy questions into practical rollout plans,
            stakeholder briefs, and operating metrics.
          </p>
        </div>

        <div className="chatbot">
          <div className="chat-header">
            <div>
              <span className="status-dot"></span>
              <span className="status-brand">
                <BrandWordmark className="status-wordmark" alt="VARLEXA AI" />
                <span>CORE</span>
              </span>
            </div>
            <span>ONLINE</span>
          </div>
          <div className="chat-messages" aria-live="polite" ref={messagesContainerRef}>
            {messages.map((message, index) => (
              <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                {message.text}
              </div>
            ))}
          </div>
          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              aria-label="Message VARLEXA AI CORE"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about rollout, ROI, or security..."
            />
            <button type="submit" aria-label="Send message" disabled={isSending}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12H19M13 6L19 12L13 18" />
              </svg>
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

export default HomePage
