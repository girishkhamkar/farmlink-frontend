import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import { Client } from '@stomp/stompjs'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [connected, setConnected] = useState(false)
  const clientRef = useRef(null)
  const bottomRef = useRef(null)
  const role = localStorage.getItem('role')
  const userId = parseInt(localStorage.getItem('userId'))
  const name = localStorage.getItem('name')
  const navigate = useNavigate()

  useEffect(() => {
    fetchChatUsers()
    connectWebSocket()
    return () => clientRef.current?.deactivate()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchChatUsers = async () => {
    try {
      const res = await API.get('/api/products/browse')
      const farmerMap = {}
      res.data.forEach(p => {
        if (p.farmer && p.farmer.id !== userId) {
          farmerMap[p.farmer.id] = p.farmer
        }
      })
      setUsers(Object.values(farmerMap))
    } catch (err) { console.error(err) }
  }

  const connectWebSocket = () => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      onConnect: () => {
        setConnected(true)
      },
      onDisconnect: () => setConnected(false)
    })
    client.activate()
    clientRef.current = client
  }

  const getRoomId = (user) => {
    const u = user || selectedUser
    if (!u) return ''
    const farmerId = role === 'FARMER' ? userId : u.id
    const customerId = role === 'CUSTOMER' ? userId : u.id
    return `farmer${farmerId}_customer${customerId}`
  }

  const loadHistory = async (user) => {
    try {
      const farmerId = role === 'FARMER' ? userId : user.id
      const customerId = role === 'CUSTOMER' ? userId : user.id
      const res = await API.get(`/api/chat/history/${farmerId}/${customerId}`)
      setMessages(res.data.map(m => ({
        senderId: m.sender.id,
        senderName: m.sender.name,
        content: m.content,
        sentAt: m.sentAt
      })))
    } catch (err) { console.error(err) }
  }

  const selectUser = (user) => {
    setSelectedUser(user)
    setMessages([])
    loadHistory(user)
    if (clientRef.current?.connected) {
      const roomId = getRoomId(user)
      clientRef.current.subscribe('/topic/chat/' + roomId, (msg) => {
        const body = JSON.parse(msg.body)
        setMessages(prev => [...prev, body])
      })
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !clientRef.current?.connected) return
    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        senderId: userId,
        receiverId: selectedUser.id,
        content: newMessage
      })
    })
    setNewMessage('')
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">🌱 FarmLink — Chat</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(role === 'FARMER' ? '/farmer/dashboard' : '/customer/dashboard')}
            className="bg-green-100 text-green-700 px-4 py-1 rounded-lg text-sm hover:bg-green-200">
            ← Dashboard
          </button>
          <span className="text-gray-600">👤 {name}</span>
          <button onClick={logout}
            className="bg-red-100 text-red-600 px-4 py-1 rounded-lg text-sm hover:bg-red-200">
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-1 max-w-5xl mx-auto w-full p-4 gap-4">
        {/* Users List */}
        <div className="w-64 bg-white rounded-2xl shadow p-4">
          <h2 className="font-semibold text-gray-700 mb-3">
            {role === 'CUSTOMER' ? 'Farmers' : 'Customers'}
          </h2>
          {users.length === 0 && (
            <p className="text-sm text-gray-400">No contacts yet</p>
          )}
          {users.map(user => (
            <button key={user.id} onClick={() => selectUser(user)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 ${
                selectedUser?.id === user.id
                  ? 'bg-green-100 text-green-700'
                  : 'hover:bg-gray-50 text-gray-700'}`}>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl shadow flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-4xl mb-2">💬</p>
                <p>Select a contact to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                  {selectedUser.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedUser.name}</p>
                  <p className="text-xs text-green-500">
                    {connected ? '● Online' : '○ Connecting...'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{minHeight: '300px'}}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      msg.senderId === userId
                        ? 'bg-green-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderId === userId ? 'text-green-200' : 'text-gray-400'}`}>
                        {msg.senderName}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Message Input */}
              <div className="px-4 py-3 border-t flex gap-2">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button onClick={sendMessage}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700">
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}