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
  const [onlineDeveloperIds, setOnlineDeveloperIds] = useState([])
  
  // WhatsApp-style background message counter state matrix
  const [unreadCounts, setUnreadCounts] = useState({})
  
  const socketRef = useRef(null)
  const typingTimerRef = useRef(null)
  const messagesEndRef = useRef(null)

  const currentUserId = user?.id || user?._id || ''

  // Determine if the current focused conversation is the system admin card
  const isViewingAdmin = useMemo(() => {
    const selectedItem = developers.find(d => d._id === selectedDeveloper)
    return selectedItem?.isSystemAdmin === true
  }, [selectedDeveloper, developers])

  // Symmetrical conversation key mapping calculation
  const conversationKey = useMemo(() => {
    if (isViewingAdmin) {
      return `admin_${currentUserId}`
    }
    return `${currentUserId}:${selectedDeveloper || 'general'}`
  }, [selectedDeveloper, currentUserId, isViewingAdmin])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 1. Load active Developer Accounts list + Inject Admin at top
  useEffect(() => {
    if (!token) return

    api.get('/client/developers')
      .then(({ data }) => {
        const list = data.developers || []
        
        // Explicitly inject the Administrator account node context at the front of the roster array loop
        const injectedList = [
          {
            _id: 'system_admin_ref',
            name: 'System Administrator (Varlexa)',
            email: 'admin@varlexa.com',
            preferredTechnologies: ['Varlexa Support Core'],
            isSystemAdmin: true
          },
          ...list
        ]
        
        setDevelopers(injectedList)
        setSelectedDeveloper(injectedList[0]?._id || '')
      })
      .catch(() => setDevelopers([]))
  }, [token])

  // 2. Load historical chat conversations
  useEffect(() => {
    if (!token || !selectedDeveloper) return

    // If viewing the Admin, target the admin messages endpoint namespace, otherwise standard threads
    const fetchUrl = isViewingAdmin
      ? `/admin/messages/${currentUserId}`
      : `/messages/${conversationKey}`

    api.get(fetchUrl)
      .then(({ data }) => {
        setMessages(data.messages || [])
        setUnreadCounts((prev) => ({ ...prev, [selectedDeveloper]: 0 }))
      })
      .catch(() => setMessages([]))
  }, [selectedDeveloper, conversationKey, token, isViewingAdmin, currentUserId])

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

    socket.on('connect_error', () => setStatus('Realtime chat is temporarily unavailable.'))
    
    socket.on('developers:online_list', (ids) => {
      setOnlineDeveloperIds(ids || [])
    })

    socket.on('typing:start', ({ user: typingUser }) => {
      if (typingUser?.id !== currentUserId) {
        setTypingName(typingUser?.name || 'User')
      }
    })
    
    socket.on('typing:stop', () => setTypingName(''))
    
    socket.on('message:new', (message) => {
      const senderId = typeof message.sender === 'object' 
        ? message.sender?._id || message.sender?.id 
        : message.sender

      // Identify context matching channels cleanly
      let incomingMatchId = message.developer || senderId
      if (message.conversationKey && message.conversationKey.startsWith('admin_')) {
        incomingMatchId = 'system_admin_ref'
      }

      if (String(incomingMatchId) === String(selectedDeveloper)) {
        setMessages((current) => {
          const messageId = message?._id || message?.id
          if (messageId && current.some((item) => (item._id || item.id) === messageId)) {
            return current
          }
          return [...current, message]
        })
      } else {
        if (senderId && String(senderId) !== String(currentUserId)) {
          setUnreadCounts((prev) => ({
            ...prev,
            [incomingMatchId]: (prev[incomingMatchId] || 0) + 1
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
  }, [token, currentUserId, selectedDeveloper])

  // 4. Handle Room Channels Switching
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !selectedDeveloper) return undefined

    socket.emit('conversation:join', conversationKey)
    setTypingName('')

    return () => {
      socket.emit('typing:stop', conversationKey)
    }
  }, [conversationKey, selectedDeveloper])

  // 5. Typing metrics broadcast
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !selectedDeveloper) return undefined

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
  }, [conversationKey, input, selectedDeveloper])

  const filteredDevelopers = useMemo(() => developers.filter((dev) => dev.name?.toLowerCase().includes(search.toLowerCase())), [developers, search])
  const activeDeveloper = developers.find((dev) => dev._id === selectedDeveloper)

  // 6. API Post Request Delivery Transaction
  async function sendMessage(event) {
    event.preventDefault()
    if (!input.trim() || !token) return
    setStatus('')
    
    try {
      if (isViewingAdmin) {
        // Direct transactional execution targeting admin storage endpoints
        await api.post(`/admin/messages/${currentUserId}`, { 
          text: input.trim() 
        })
      } else {
        // Standard operational client-to-developer mapping logic
        await api.post(`/messages/${conversationKey}`, { 
          client: currentUserId,
          developer: selectedDeveloper, 
          text: input.trim() 
        })
      }

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
        <p className="dashboard-kicker">Messages</p>
        <h1>Chat Workspace</h1>
        {status && <p className="chat-error-banner">{status}</p>}
      </div>
      
      <div className="chat-workspace client-chat-layout">
        <aside className="chat-side-panel">
          <div className="dashboard-search">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search directory..." />
          </div>
          {filteredDevelopers.map((developer) => {
            const targetDevIdStr = String(developer._id || developer.id || '').trim().toLowerCase();
            
            const isOnline = developer.isSystemAdmin || onlineDeveloperIds.some(
              (onlineId) => String(onlineId).trim().toLowerCase() === targetDevIdStr
            );
            
            const badgeCount = unreadCounts[developer._id] || 0;

            return (
              <button 
                className={`${selectedDeveloper === developer._id ? 'active' : ''} ${isOnline ? 'online-user' : 'offline-user'}`} 
                type="button" 
                key={developer._id} 
                onClick={() => setSelectedDeveloper(developer._id)}
                style={{ 
                  position: 'relative', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  width: '100%', 
                  textAlign: 'left',
                  borderLeft: developer.isSystemAdmin ? '3px solid #f59e0b' : 'none' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontWeight: '600', color: developer.isSystemAdmin ? '#f59e0b' : 'inherit' }}>
                    {developer.name}
                  </span>
                  
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
                  {developer.isSystemAdmin ? 'System Node' : isOnline ? 'Online' : 'Offline'}
                </small>
                {developer.preferredTechnologies?.length > 0 && (
                  <em className="tech-stack-indicator">{developer.preferredTechnologies.join(', ')}</em>
                )}
                <em>{developer.email}</em>
              </button>
            )
          })}
          {filteredDevelopers.length === 0 && <p className="no-data-msg">No entries found.</p>}
        </aside>

        <section className="chat-main-panel client-main-panel">
          <div className="chat-room-header">
            <div>
              <span>{typingName ? `${typingName} is typing...` : activeDeveloper ? 'Connected' : 'Select a conversation'}</span>
              <strong>{activeDeveloper?.name || 'Communication Channel'}</strong>
            </div>
          </div>
          
          <div className="dashboard-chat-messages">
            {(() => {
              let lastDateStr = '';

              return messages.map((message) => {
                const messageSenderId = typeof message.sender === 'object' 
                  ? message.sender?._id || message.sender?.id 
                  : message.sender;
                
                // Message alignment constraints matching message context specifications
                const isOwnMessage = messageSenderId === currentUserId;
                
                let senderDisplayName = 'Developer';
                if (isOwnMessage) {
                  senderDisplayName = 'You';
                } else if (isViewingAdmin || (!message.client && !message.developer)) {
                  senderDisplayName = 'Admin';
                } else if (activeDeveloper) {
                  senderDisplayName = activeDeveloper.name;
                }

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

                    <article className={`dashboard-chat-message ${isOwnMessage ? 'own' : 'incoming'}`}
                      style={{
                        borderLeft: senderDisplayName === 'Admin' ? '3px solid #f59e0b' : 'inherit'
                      }}
                    >
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
            <button type="button" aria-label="Add emoji"><Smile size={18} /></button>
            <button type="button" aria-label="Share file"><Paperclip size={18} /></button>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type your response message payload..." />
            <button type="submit" aria-label="Send message"><Send size={18} /></button>
          </form>
        </section>

        <aside className="chat-info-panel">
          <h2>Conversation Context</h2>
          <p>History is securely stored inside MongoDB. Typing metrics and connection layers are running live.</p>
          <div className="online-tracker-badge">
            <span className="pulse-dot"></span>
            <small>{onlineDeveloperIds.length} Engineers Live Online</small>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ClientChatWithDevelopersPage;