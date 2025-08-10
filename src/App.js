import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

// Connect to the local Node.js backend
const socket = io('http://localhost:3001');

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSecure, setIsSecure] = useState(false);

  useEffect(() => {
    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('status-update', (status) => {
      setMessages((prev) => [...prev, { sender: 'System', text: status }]);
      if (status.includes("Peer connected")) setIsConnected(true);
      if (status.includes("Peer disconnected")) setIsConnected(false);
      if (status.includes("Secure session established")) setIsSecure(true);
    });

    return () => {
      socket.off('new-message');
      socket.off('status-update');
    };
  }, []);

  const handleConnect = () => {
    const peerAddress = prompt("Enter the IP address of your peer's computer:");
    if (peerAddress) {
      socket.emit('connect-to-peer', peerAddress);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages((prev) => [...prev, { sender: 'You', text: inputValue }]);
      socket.emit('send-message', inputValue);
      setInputValue('');
    }
  };

  const handleGoSecure = () => {
      socket.emit('initiate-secure-session');
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Secure Chat</h1>
        {!isConnected && <button onClick={handleConnect}>Connect to Peer</button>}
        {isConnected && (
          <button onClick={handleGoSecure} disabled={isSecure}>
            {isSecure ? 'Session Secure' : 'Go Secure'}
          </button>
        )}
      </header>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message-container ${msg.sender === 'You' ? 'sent' : msg.sender === 'System' ? 'system' : 'received'}`}>
            <div className='message'>
              {msg.sender !== 'System' && <strong>{msg.sender}</strong>}
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isConnected ? "Type a message..." : "Connect to a peer to start chatting"}
          disabled={!isConnected}
        />
        <button onClick={handleSendMessage} disabled={!isConnected}>Send</button>
      </div>
    </div>
  );
}

export default App;