import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Paperclip, Send, Smile } from 'lucide-react'
import { io } from 'socket.io-client'
import AuthContext from '../../context/AuthContext'
import api, { getApiErrorMessage } from '../../services/api'

function ClientChatWithDevelopersPage() {
  const { token, user } = useContext(AuthContext)
  const [developers, setDevelopers] = useState([])
  const [selectedDeveloper, setSelectedDeveloper] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [typingName, setTypingName] = useState('')
  const socketRef = useRef(null)
  const typingTimerRef = useRef(null)

  const conversationKey = useMemo(() => {
    const clientId = user?.id || user?._id || 'client'
    return `${clientId}:${selectedDeveloper || 'general'}`
  }, [selectedDeveloper, user])

  useEffect(() => {
    api.get('/client/developers').then(({ data }) => {
      const list = data.developers || []
      setDevelopers(list)
      setSelectedDeveloper(list[0]?._id || '')
    }).catch(() => setDevelopers([]))
  }, [])

  useEffect(() => {
    if (!selectedDeveloper) return
    api.get('/client/messages', { params: { developerId: selectedDeveloper } })
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => setMessages([]))
  }, [selectedDeveloper])

  useEffect(() => {
    if (!token) return undefined

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
    const socket = io(socketUrl, { auth: { token }, transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect_error', () => setStatus('Realtime chat is temporarily unavailable.'))
    socket.on('typing:start', ({ user: typingUser }) => {
      if (typingUser?.id !== user?.id) {
        setTypingName(typingUser?.name || 'Developer')
      }
    })
    socket.on('typing:stop', () => setTypingName(''))
    socket.on('message:new', (message) => {
      setMessages((current) => {
        const messageId = message?._id || message?.id
        if (messageId && current.some((item) => (item._id || item.id) === messageId)) {
          return current
        }

        return [...current, message]
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current)
      }
    }
  }, [token, user?.id])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !selectedDeveloper) return undefined

    socket.emit('conversation:join', conversationKey)
    setTypingName('')

    return () => {
      socket.emit('typing:stop', conversationKey)
    }
  }, [conversationKey, selectedDeveloper])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !selectedDeveloper) return undefined

    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current)
    }

    if (input.trim()) {
      socket.emit('typing:start', conversationKey)
      typingTimerRef.current = window.setTimeout(() => {
        socket.emit('typing:stop', conversationKey)
      }, 700)
    } else {
      socket.emit('typing:stop', conversationKey)
    }

    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current)
      }
    }
  }, [conversationKey, input, selectedDeveloper])

  const filteredDevelopers = useMemo(() => developers.filter((developer) => developer.name?.toLowerCase().includes(search.toLowerCase())), [developers, search])
  const activeDeveloper = developers.find((developer) => developer._id === selectedDeveloper)

  async function sendMessage(event) {
    event.preventDefault()
    if (!input.trim()) return
    setStatus('')
    try {
      const { data } = await api.post('/client/messages', { developerId: selectedDeveloper, text: input.trim() })
      setMessages((current) => {
        const messageId = data.message?._id || data.message?.id
        if (messageId && current.some((item) => (item._id || item.id) === messageId)) {
          return current
        }

        return [...current, data.message]
      })
      setInput('')
      setTypingName('')
      socketRef.current?.emit('typing:stop', conversationKey)
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to send message.'))
    }
  }

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading"><p className="dashboard-kicker">Messages</p><h1>Chat with Developers</h1>{status && <p>{status}</p>}</div>
      <div className="chat-workspace client-chat-layout">
        <aside className="chat-side-panel">
          <div className="dashboard-search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search developers" /></div>
          {filteredDevelopers.map((developer, index) => (
            <button className={selectedDeveloper === developer._id ? 'active' : ''} type="button" key={developer._id} onClick={() => setSelectedDeveloper(developer._id)}>
              <span>{developer.name}</span><small>{index % 2 === 0 ? 'Online' : 'Offline'} · Latest conversation</small><em>{developer.email}</em>{index === 0 && <strong>2</strong>}
            </button>
          ))}
          {filteredDevelopers.length === 0 && <p>No developers found.</p>}
        </aside>
        <section className="chat-main-panel client-main-panel">
          <div className="chat-room-header"><span>{typingName ? `${typingName} is typing...` : activeDeveloper ? 'Connected' : 'Select a developer'}</span><strong>{activeDeveloper?.name || 'Developer Chat'}</strong></div>
          <div className="dashboard-chat-messages">
            {messages.map((message) => (
              <article className="dashboard-chat-message own" key={message._id || message.id}>
                <span>ME</span><div><strong>You <small>{new Date(message.createdAt || Date.now()).toLocaleTimeString()}</small></strong><p>{message.text}{message.emoji}</p><em>Sent · Read receipts enabled</em></div>
              </article>
            ))}
          </div>
          <form className="dashboard-chat-form" onSubmit={sendMessage}>
            <button type="button" aria-label="Add emoji"><Smile size={18} /></button>
            <button type="button" aria-label="Share file"><Paperclip size={18} /></button>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Message developer..." />
            <button type="submit" aria-label="Send message"><Send size={18} /></button>
          </form>
        </section>
        <aside className="chat-info-panel"><h2>Conversation</h2><p>History is stored permanently. File, image, emoji, seen, and typing states are represented in the API contract.</p><span className="typing-indicator">Developer typing</span></aside>
      </div>
    </div>
  )
}

export default ClientChatWithDevelopersPage
