// src/startMatch/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaCommentDots, FaTimes } from 'react-icons/fa';

const Chat = ({ socket, roomId, username }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, { ...data, isMe: false }]);
      if (!isOpen) setHasUnread(true);
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = { roomId, message: newMessage, username };
    
    // Emit to server
    socket.emit('send_message', msgData);

    // Add to local UI immediately
    setMessages((prev) => [...prev, { ...msgData, isMe: true }]);
    setNewMessage("");
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 w-80 h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FaCommentDots className="text-blue-400"/> Match Chat
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <FaTimes />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-900/90 custom-scrollbar">
            {messages.length === 0 && (
              <p className="text-gray-500 text-xs text-center mt-4">Say hello to your opponent!</p>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  msg.isMe 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                }`}>
                  {msg.message}
                </div>
                <span className="text-[10px] text-gray-500 mt-1">{msg.isMe ? 'You' : msg.username}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-2 bg-gray-800 border-t border-gray-700 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-900 text-white text-sm rounded px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded transition">
              <FaPaperPlane size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="relative w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg transition hover:scale-110"
        >
          <FaCommentDots size={24} />
          {hasUnread && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          )}
          {hasUnread && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"></span>
          )}
        </button>
      )}
    </div>
  );
};

export default Chat;