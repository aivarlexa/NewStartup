import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Paperclip, Send, Smile } from 'lucide-react'
import { io } from 'socket.io-client'
import AuthContext from '../../context/AuthContext'
import api, { getApiErrorMessage } from '../../services/api'

function TeamChatPage() {
  const { token, user } = useContext(AuthContext)
  const [channels, setChannels] = useState([])
  const [activeChannelId, setActiveChannelId] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('')
  const [typingName, setTypingName] = useState('')
  
  // Track WhatsApp-style unread notification badge counts per channel
  const [unreadCounts, setUnreadCounts] = useState({})

  const socketRef = useRef(null)
  const typingTimerRef = useRef(null)
  const messagesEndRef = useRef(null)

  const currentUserId = user?.id || user?._id || ''
  
  // Find the currently selected project channel object details
  const currentChannel = useMemo(() => {
    return channels.find(c => c._id === activeChannelId)
  }, [activeChannelId, channels])

  // Establish a consistent conversation key room target for the sockets
  const conversationKey = useMemo(() => {
    return activeChannelId ? `team_channel_${activeChannelId}` : 'general_team'
  }, [activeChannelId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 1. Fetch Approved Active Project Teams (Channels) the current user belongs to
  useEffect(() => {
    if (!token) return

    // Reuses your project aggregation routes to retrieve active development team nodes
    api.get('/developer/projects') 
      .then(({ data }) => {
        const list = data.projects || []
        setChannels(list)
        if (list.length > 0) {
          setActiveChannelId(list[0]._id)
        }
      })
      .catch(() => setChannels([]))
  }, [token])

  // 2. Fetch Historical Conversation History for the Selected Project Channel
  useEffect(() => {
    if (!token || !activeChannelId) return

    api.get(`/messages/${conversationKey}`)
      .then(({ data }) => {
        setMessages(data.messages || [])
        // Clear unread badge locally for this channel upon focus
        setUnreadCounts(prev => ({ ...prev, [activeChannelId]: 0 }))
      })
      .catch(() => setMessages([]))
  }, [activeChannelId, conversationKey, token])

  // 3. Realtime Socket Sync Configuration
  useEffect(() => {
    if (!token) return undefined

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
    
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true
    })
    socketRef.current = socket

    socket.on('connect_error', () => setStatus('Realtime channel matrix sync dropped.'))

    socket.on('typing:start', ({ user: typingUser, room }) => {
      if (room === conversationKey && typingUser?.id !== currentUserId) {
        setTypingName(typingUser?.name || 'Someone')
      }
    })

    socket.on('typing:stop', ({ room }) => {
      if (room === conversationKey) setTypingName('')
    })

    socket.on('message:new', (message) => {
      // Check if message belongs to the active focused room
      if (message.conversationKey === conversationKey) {
        setMessages(current => {
          const msgId = message._id || message.id
          if (msgId && current.some(item => (item._id || item.id) === msgId)) return current
          return [...current, message]
        })
      } else {
        // Increment background badge counters if message is in another room and not sent by self
        const senderId = message.sender?._id || message.sender?.id || message.sender
        if (senderId && String(senderId) !== String(currentUserId)) {
          const channelId = message.conversationKey.replace('team_channel_', '')
          setUnreadCounts(prev => ({
            ...prev,
            [channelId]: (prev[channelId] || 0) + 1
          }))
        }
      }
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token, currentUserId, conversationKey])

  // 4. Handle Live Room Channel Joining Actions
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !activeChannelId) return undefined

    socket.emit('conversation:join', conversationKey)
    setTypingName('')

    return () => {
      socket.emit('typing:stop', { room: conversationKey })
    }
  }, [conversationKey, activeChannelId])

  // 5. Broadcast Typing Metrics
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !activeChannelId) return undefined

    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current)

    if (input.trim()) {
      socket.emit('typing:start', { room: conversationKey })
      typingTimerRef.current = window.setTimeout(() => {
        socket.emit('typing:stop', { room: conversationKey })
      }, 1000)
    } else {
      socket.emit('typing:stop', { room: conversationKey })
    }
  }, [input, conversationKey, activeChannelId])

  // 6. Transmit New Channel Message Payload Context via API
  async function sendMessage(event) {
    event.preventDefault()
    if (!input.trim() || !token || !activeChannelId) return
    setStatus('')

    try {
      await api.post(`/messages/${conversationKey}`, {
        text: input.trim(),
        // Pass project ID wrapper reference matching your schema fields
        projectId: activeChannelId 
      })
      setInput('')
      socketRef.current?.emit('typing:stop', { room: conversationKey })
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Unable to send channel message.'))
    }
  }

  return (
    <div className="dashboard-page dashboard-reveal">
      <div className="dashboard-page-heading">
        <p className="dashboard-kicker">Team Collaboration</p>
        <h1>Team Chat</h1>
        {status && <p className="chat-error-banner">{status}</p>}
      </div>

      <div className="chat-workspace team-chat-layout">
        
        {/* LEFT CHANNEL DIRECTORY LIST */}
        <aside className="chat-side-panel">
          <h2>Active Project Channels</h2>
          {channels.map((channel) => {
            const badgeCount = unreadCounts[channel._id] || 0
            return (
              <button 
                className={activeChannelId === channel._id ? 'active' : ''} 
                type="button" 
                key={channel._id} 
                onClick={() => setActiveChannelId(channel._id)}
              >
                <span># {channel.projectTitle || channel.name}</span>
                {badgeCount > 0 && <strong>{badgeCount}</strong>}
              </button>
            )
          })}
          {channels.length === 0 && <p className="no-data-msg">No assigned project teams.</p>}
        </aside>

        {/* MAIN CHAT CONVERSATION CORE */}
        <section className="chat-main-panel">
          <div className="chat-room-header">
            <div>
              <span>{typingName ? `${typingName} is typing...` : 'Connected Room'}</span>
              <strong># {currentChannel?.projectTitle || 'Select a Channel'}</strong>
            </div>
          </div>
          
          <div className="dashboard-chat-messages">
            {messages.map((message) => {
              const messageSenderId = message.sender?._id || message.sender?.id || message.sender
              const isOwnMessage = String(messageSenderId) === String(currentUserId)
              
              const senderName = isOwnMessage ? 'You' : (message.sender?.name || 'Team Member')
              const msgTime = message.createdAt 
                ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Now'

              return (
                <article 
                  className={`dashboard-chat-message ${isOwnMessage ? 'own' : 'incoming'}`} 
                  key={message._id || Math.random()}
                >
                  <span>{senderName.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <strong>{senderName} <small>{msgTime}</small></strong>
                    <p>{message.text}</p>
                  </div>
                </article>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <form className="dashboard-chat-form" onSubmit={sendMessage}>
            <button type="button" aria-label="Attach file"><Paperclip size={18} /></button>
            <button type="button" aria-label="Add emoji"><Smile size={18} /></button>
            <input 
              value={input} 
              onChange={(event) => setInput(event.target.value)} 
              placeholder={`Message #${currentChannel?.projectTitle || 'team'}...`} 
            />
            <button type="submit" aria-label="Send message"><Send size={18} /></button>
          </form>
        </section>

        {/* RIGHT INFO SYNC SIDEBAR PANEL */}
        <aside className="chat-info-panel">
          <h2>Project Scope Details</h2>
          <p>Shared squad workspace for development decisions, pull request checkins, sprint logs, and cross-team coordination.</p>
          {currentChannel && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid #21262d', paddingTop: '1rem' }}>
              <small style={{ display: 'block', color: '#8b949e' }}>Assigned Lead:</small>
              <strong style={{ fontSize: '0.85rem' }}>{currentChannel.lead?.name || 'Unassigned'}</strong>
              <small style={{ display: 'block', color: '#8b949e', marginTop: '8px' }}>Ecosystem Budget:</small>
              <span style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 'bold' }}>{currentChannel.budget || '₹0'}</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default TeamChatPage