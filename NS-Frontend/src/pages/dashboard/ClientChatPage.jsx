import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ListPlus, Send } from 'lucide-react'
import { io } from 'socket.io-client'
import AuthContext from '../../context/AuthContext'
import api, { getApiErrorMessage } from '../../services/api'

function ClientChatPage() {
  const { token, user } = useContext(AuthContext)
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('')
  const [typingName, setTypingName] = useState('')
  const [onlineDeveloperIds, setOnlineDeveloperIds] = useState([])
  
  // WhatsApp-style background message counter state matrix
  const [unreadCounts, setUnreadCounts] = useState({})
  
  const socketRef = useRef(null)
  const typingTimerRef = useRef(null)
  const messagesEndRef = useRef(null)

  const currentUserId = user?.id || user?._id || ''

  // Build symmetrical conversation key mapping matching the backend: clientId:developerId
  const conversationKey = useMemo(() => {
    return `${selectedClient || 'general'}:${currentUserId}`
  }, [selectedClient, currentUserId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 1. Load active Client Accounts list
  useEffect(() => {
    if (!token) return

    api.get('/developer/clients')
      .then(({ data }) => {
        const list = data.clients || []
        setClients(list)
        setSelectedClient(list[0]?._id || '')
      })
      .catch(() => setClients([]))
  }, [token])

  // 2. Load historical chat conversations via the dynamic conversationKey path
  useEffect(() => {
    if (!token || !selectedClient) return

    api.get(`/messages/${conversationKey}`)
      .then(({ data }) => {
        setMessages(data.messages || [])
        // Clear WhatsApp badge count locally once the channel conversation is focused open
        setUnreadCounts((prev) => ({ ...prev, [selectedClient]: 0 }))
      })
      .catch(() => setMessages([]))
  }, [selectedClient, conversationKey, token])

  // 3. Setup Authenticated Socket Connections
  useEffect(() => {
    if (!token) return undefined

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
    
    const socket = io(socketUrl, { 
      auth: { token }, 
      transports: ['websocket'],
      forceNew: true 
    })
    socketRef.current = socket

    socket.on('connect_error', (err) => {
      console.error("Socket Connection Error:", err.message)
      setStatus('Realtime chat is temporarily offline.')
    })
    
    // Listen for live array broadcast of online developer/user IDs
    socket.on('developers:online_list', (ids) => {
      setOnlineDeveloperIds(ids || [])
    })
    
    socket.on('typing:start', ({ user: typingUser }) => {
      if (typingUser?.id !== currentUserId) {
        setTypingName(typingUser?.name || 'Client')
      }
    })
    
    socket.on('typing:stop', () => setTypingName(''))
    
    socket.on('message:new', (message) => {
      const senderId = typeof message.sender === 'object' 
        ? message.sender?._id || message.sender?.id 
        : message.sender
      const msgClientId = message.client || senderId

      // Check if the incoming message belongs to the active conversation window
      if (String(msgClientId) === String(selectedClient)) {
        setMessages((current) => {
          const messageId = message?._id || message?.id
          if (messageId && current.some((item) => (item._id || item.id) === messageId)) {
            return current
          }
          return [...current, message]
        })
      } else {
        // WhatsApp Notification Badge Increment Trigger Rules
        if (senderId && String(senderId) !== String(currentUserId)) {
          setUnreadCounts((prev) => ({
            ...prev,
            [msgClientId]: (prev[msgClientId] || 0) + 1
          }))
        }
      }
    })

    return () => {
      socket.off('connect_error')
      socket.off('developers:online_list')
      socket.off('typing:start')
      socket.off('typing:stop')
      socket.off('message:new')
      socket.disconnect()
      socketRef.current = null
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current)
    }
  }, [token, currentUserId, selectedClient])

  // 4. Handle Room Channels Switching
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !selectedClient) return undefined

    socket.emit('conversation:join', conversationKey)
    setTypingName('')

    return () => {
      socket.emit('typing:stop', conversationKey)
    }
  }, [conversationKey, selectedClient])

  // 5. Typing metrics broadcast
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !selectedClient) return undefined

    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current)

    if (input.trim()) {
      socket.emit('typing:start', conversationKey)
      typingTimerRef.current = window.setTimeout(() => {
        socket.emit('typing:stop', conversationKey)
      }, 1000)
    } else {
      socket.emit('typing:stop', conversationKey)
    }

    return () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current)
    }
  }, [conversationKey, input, selectedClient])

  const activeClient = clients.find((c) => c._id === selectedClient)

  // 6. API Post Request Delivery Transaction
  async function sendMessage(event) {
    event.preventDefault()
    if (!input.trim() || !token) return
    setStatus('')
    
    try {
      await api.post(`/messages/${conversationKey}`, { 
        client: selectedClient, 
        developer: currentUserId,
        text: input.trim() 
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
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Client Conversation</p>
        <h1>Client Chat</h1>
        {status && <p className="chat-error-banner">{status}</p>}
      </div>

      <div className="chat-workspace client-chat-layout">
        <aside className="chat-side-panel">
          {clients.map((client) => {
            const targetClientIdStr = String(client._id || client.id || '').trim().toLowerCase();
            
            // Robust lowercased item validation prevents type mapping status discrepancies
            const isOnline = onlineDeveloperIds.some(
              (onlineId) => String(onlineId).trim().toLowerCase() === targetClientIdStr
            );
            
            const badgeCount = unreadCounts[client._id] || 0;

            return (
              <button 
                className={`${selectedClient === client._id ? 'active' : ''} ${isOnline ? 'online-user' : 'offline-user'}`} 
                type="button" 
                key={client._id} 
                onClick={() => setSelectedClient(client._id)}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'left' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontWeight: '600' }}>{client.name}</span>
                  
                  {/* WhatsApp-Style Circular Counter Notification Badge Element */}
                  {badgeCount > 0 && (
                    <span style={{
                      background: '#22c55e',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {badgeCount}
                    </span>
                  )}
                </div>
                
                <small style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <span className={`status-dot ${isOnline ? 'active-green' : 'inactive-gray'}`}></span>
                  {isOnline ? 'Online' : 'Offline'} · Active Channel
                </small>
                <small>{client.companyName || 'Workspace Client'}</small>
                <em>{client.email}</em>
              </button>
            )
          })}
          {clients.length === 0 && <p className="no-data-msg">No active clients assigned.</p>}
        </aside>

        <section className="chat-main-panel client-main-panel">
          <div className="chat-room-header">
            <div>
              <span>{typingName ? `${typingName} is typing...` : activeClient ? 'Connected' : 'Select conversation'}</span>
              <strong>{activeClient?.companyName || 'Client Workspace'}</strong>
            </div>
          </div>
          
          <div className="dashboard-chat-messages">
            {(() => {
              let lastDateStr = '';

              return messages.map((message) => {
                const messageSenderId = typeof message.sender === 'object' 
                  ? message.sender?._id || message.sender?.id 
                  : message.sender;
                const isOwnMessage = messageSenderId === currentUserId;
                const senderDisplayName = isOwnMessage ? 'You' : (activeClient?.name || 'Client');

                const messageDate = new Date(message.createdAt || Date.now());
                const currentDateStr = messageDate.toLocaleDateString([], { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });

                const showDateDivider = currentDateStr !== lastDateStr;
                lastDateStr = currentDateStr;

                return (
                  <div key={message._id || message.id || Math.random()}>
                    {showDateDivider && (
                      <div className="chat-date-divider">
                        <span>{currentDateStr}</span>
                      </div>
                    )}

                    <article className={`dashboard-chat-message ${isOwnMessage ? 'own' : 'incoming'}`}>
                      <span>{senderDisplayName.slice(0, 2).toUpperCase()}</span>
                      <div>
                        <strong>
                          {senderDisplayName}{' '}
                          <small>
                            {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                        </strong>
                        <p>{message.text}</p>
                      </div>
                    </article>
                  </div>
                );
              });
            })()}
            <div ref={messagesEndRef} />
          </div>

          <form className="dashboard-chat-form" onSubmit={sendMessage}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Reply to client..." />
            <button type="submit" aria-label="Send message"><Send size={18} /></button>
          </form>
        </section>

        <aside className="chat-info-panel client-info-panel">
          <h2>{activeClient?.name || 'No Profile Loaded'}</h2>
          <p>{activeClient?.companyName || 'No Context Available'}</p>
          <span className="status-badge assigned">Active Channel</span>
          <button type="button"><ListPlus size={16} /> Create Task From Message</button>
          <button type="button"><CalendarDays size={16} /> Schedule Meeting</button>
        </aside>
      </div>
    </div>
  )
}

export default ClientChatPage;