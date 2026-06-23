import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './chat.css';

// Socket connection endpoint array configuration
const socket = io('http://localhost:5000');

function Chat() {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user')) || { id: null, name: '' };
  const token = localStorage.getItem('token');
  const messagesEndRef = useRef(null);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/chat/rooms/all', config);
        setRooms(res.data || []);
        if (res.data.length > 0) handleSelectRoom(res.data[0]); 
      } catch (err) {
        console.error("Channels fetching error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchRooms();
  }, [token]);

  useEffect(() => {
    socket.on('receive_message', (incomingMsg) => {
      if (activeRoom && Number(incomingMsg.room_id) === Number(activeRoom.id)) {
        setMessages((prev) => [...prev, incomingMsg]);
      }
    });
    return () => socket.off('receive_message');
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectRoom = async (room) => {
    setActiveRoom(room);
    socket.emit('join_room', { room_id: room.id });
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/messages/${room.id}`, config);
      setMessages(res.data || []);
    } catch (err) {
      console.error("Message threads retrieval logs failed:", err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;

    const payload = {
      room_id: activeRoom.id,
      sender_id: user.id,
      message_text: newMessage
    };

    socket.emit('send_message', payload);
    setNewMessage('');
  };

  if (loading) return <div className="chat-loading-viewport"><div className="spinner"></div><p>Syncing encrypted deal network matrices...</p></div>;

  return (
    <div className="chat-interface-viewport">
      <div className="chat-dashboard-layout">
        
        {/* CONVERSATION SIDEPANEL CARDS ARRAY */}
        <aside className="chat-rooms-sidebar">
          <div className="sidebar-header">
            <h3>💬 Negotiation Desks</h3>
            <span className="channels-count-badge">{rooms.length} Channels</span>
          </div>
          <div className="rooms-stack-list">
            {rooms.length === 0 ? <p className="empty-rooms-label">No active inquiries registered.</p> : rooms.map((room) => {
              const channelTitleDisplay = user.id === room.buyer_id ? room.seller_name : room.buyer_name;
              const isSelected = activeRoom && activeRoom.id === room.id;
              return (
                <div key={room.id} onClick={() => handleSelectRoom(room)} className={`room-channel-card ${isSelected ? 'active-channel-accent' : ''}`}>
                  <div className="avatar-placeholder">{channelTitleDisplay?.charAt(0).toUpperCase()}</div>
                  <div className="room-meta-info">
                    <h4>{channelTitleDisplay}</h4>
                    <span>Item Ref: <strong>{room.product_title}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* THREAD REALTIME STREAM DESK */}
        <main className="chat-thread-stream">
          {activeRoom ? (
            <>
              <div className="thread-header-bar">
                <div>
                  <h3>Desk Anchor with: {user.id === activeRoom.buyer_id ? activeRoom.seller_name : activeRoom.buyer_name}</h3>
                  <span className="item-tracker-tag">Listing Track: {activeRoom.product_title}</span>
                </div>
              </div>

              <div className="messages-scroller-viewport">
                {messages.map((msg, index) => {
                  const isOwnMessage = Number(msg.sender_id) === Number(user.id);
                  return (
                    <div key={msg.id || index} className={`message-bubble-row ${isOwnMessage ? 'row-alignment-right' : 'row-alignment-left'}`}>
                      <div className={`message-bubble-payload ${isOwnMessage ? 'bubble-own-dark' : 'bubble-external-light'}`}>
                        <p>{msg.message_text}</p>
                        <span className="timestamp-tracker-label">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="message-input-gateway-bar">
                <input 
                  type="text" 
                  placeholder="Type your strategic price proposal..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  required 
                />
                <button type="submit" className="send-payload-btn">Send</button>
              </form>
            </>
          ) : (
            <div className="fallback-empty-thread-view">
              <span>💬</span>
              <h3>No Negotiation Desk Active</h3>
              <p>Select a conversations matrix channel card component on the left layout to start trading.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default Chat;