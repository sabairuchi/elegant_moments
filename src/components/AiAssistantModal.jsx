import React, { useState } from 'react';
import { X, ChevronRight, User } from './Icons';

export default function AiAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Welcome to Elegant Moments. I am your luxury wedding AI concierge. How can I assist with your celebration vision today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (data && data.reply) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: 'I am here to guide your luxury wedding planning journey. Please visit our Services or Consultation page for more information.' },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Thank you for reaching out. Please connect with our team through the Consultation or Contact page.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '360px',
        maxWidth: '90vw',
        height: '480px',
        backgroundColor: '#FAF6F0',
        border: '1px solid #D4AF37',
        borderRadius: '8px',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#4A0E17',
          color: '#FDFBF7',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#D4AF37', letterSpacing: '1px' }}>
            ELEGANT AI ASSISTANT
          </div>
          <div style={{ fontSize: '0.65rem', color: '#E5D5C5', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Luxury Concierge & Planning Guidance
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#FDFBF7', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '82%',
              backgroundColor: m.sender === 'user' ? '#4A0E17' : '#FFFFFF',
              color: m.sender === 'user' ? '#FDFBF7' : '#2A1810',
              padding: '10px 14px',
              borderRadius: m.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              border: m.sender === 'ai' ? '1px solid #E5D5C5' : 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', fontSize: '0.78rem', color: '#888', fontStyle: 'italic' }}>
            Consulting Elegant Moments AI...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ borderTop: '1px solid #E5D5C5', display: 'flex', padding: '10px', backgroundColor: '#FFFFFF' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about venues, services, budget..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.82rem',
            padding: '8px 12px',
            backgroundColor: '#FAF6F0',
            borderRadius: '4px',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            backgroundColor: '#4A0E17',
            color: '#D4AF37',
            border: 'none',
            padding: '8px 14px',
            marginLeft: '8px',
            borderRadius: '4px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
