import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, ChevronRight } from './Icons';

export default function AiAssistantModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 'init-greeting',
      sender: 'ai',
      text: '"How may I help you create your perfect celebration?"',
      isGreetingHeader: true,
      suggestions: [
        'Find a venue',
        'Explore wedding services',
        'Plan my budget',
        'Start planning my wedding',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const isSubmittingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, loading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend) => {
    const userMsg = (textToSend || input).trim();
    if (!userMsg || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setInput('');

    const newUserMsg = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: 'user',
      text: userMsg,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => !m.isGreetingHeader)
        .map((m) => ({ sender: m.sender, text: m.text }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: historyPayload }),
      });

      if (!res.ok) {
        throw new Error('API response not ok');
      }

      const data = await res.json();

      if (data && data.reply) {
        const newAiMsg = {
          id: `ai-${Date.now()}-${Math.random()}`,
          sender: 'ai',
          text: data.reply,
          suggestions: data.suggestions || ['Find Venues', 'Explore Services', 'Plan My Budget'],
          actionRequired: data.actionRequired,
        };
        setMessages((prev) => [...prev, newAiMsg]);
      } else {
        throw new Error('Empty reply');
      }
    } catch (err) {
      console.error('[AI CONCIERGE] Connection error:', err);
      const newErrorMsg = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        isError: true,
        text: "I'm having a little trouble connecting right now.\n\nYou can still explore our services or request a consultation.",
        suggestions: ['Explore Services', 'Book Consultation'],
      };
      setMessages((prev) => [...prev, newErrorMsg]);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === 'Explore Services' || suggestion === 'Explore wedding services') {
      navigate('/services');
      onClose();
    } else if (suggestion === 'Book Consultation') {
      navigate('/contact');
      onClose();
    } else if (suggestion === 'Explore Venues' || suggestion === 'Find a venue' || suggestion === 'Find Venues') {
      navigate('/venues');
      onClose();
    } else if (suggestion === 'Client Dashboard') {
      navigate('/dashboard');
      onClose();
    } else {
      handleSendMessage(suggestion);
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .typing-dot {
          display: inline-block;
          font-weight: bold;
          font-size: 1.1rem;
          line-height: 1;
          animation: pulseDot 1.4s infinite ease-in-out;
        }
        @media (max-width: 640px) {
          .concierge-widget-container {
            width: calc(100vw - 24px) !important;
            right: 12px !important;
            bottom: 12px !important;
            height: calc(100vh - 76px) !important;
            max-height: 600px !important;
          }
        }
      `}</style>
      <div
        className="concierge-widget-container"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          maxWidth: '92vw',
          height: '560px',
          backgroundColor: '#FAF6F0',
          border: '1px solid #D4AF37',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(42, 24, 16, 0.25)',
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
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid #D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D4AF37',
              }}
            >
              <Sparkles size={18} color="#D4AF37" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: '#D4AF37',
                  letterSpacing: '0.08em',
                  lineHeight: '1.2',
                }}
              >
                ELEGANT AI CONCIERGE
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.62rem',
                  color: 'rgba(253, 251, 247, 0.8)',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginTop: '2px',
                }}
              >
                PRIVATE WEDDING PLANNING GUIDANCE
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close AI Concierge"
            style={{
              background: 'none',
              border: 'none',
              color: '#FDFBF7',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Feed */}
        <div
          style={{
            flex: 1,
            padding: '18px 16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            backgroundColor: '#FAF6F0',
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: '6px',
              }}
            >
              {/* Bubble */}
              <div
                style={{
                  maxWidth: m.sender === 'user' ? '75%' : '82%',
                  backgroundColor: m.sender === 'user' ? '#4A0E17' : '#FFFFFF',
                  color: m.sender === 'user' ? '#FDFBF7' : '#2A1810',
                  padding: '12px 16px',
                  borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '0.88rem',
                  lineHeight: '1.55',
                  border: m.sender === 'ai' ? '1px solid #E5D5C5' : 'none',
                  boxShadow: '0 2px 8px rgba(42, 24, 16, 0.04)',
                  whiteSpace: 'pre-line',
                }}
              >
                {m.isGreetingHeader && (
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#4A0E17',
                      marginBottom: '6px',
                    }}
                  >
                    Elegant AI Concierge
                  </div>
                )}
                <div style={{ fontStyle: m.isGreetingHeader ? 'italic' : 'normal' }}>
                  {m.text}
                </div>
              </div>

              {/* Quick Action / Suggestion Pills */}
              {m.sender === 'ai' && m.suggestions && m.suggestions.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '4px',
                    maxWidth: '92%',
                  }}
                >
                  {m.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(sug)}
                      style={{
                        backgroundColor: '#F4EDE2',
                        color: '#4A0E17',
                        border: '1px solid #D4AF37',
                        borderRadius: '20px',
                        padding: '5px 12px',
                        fontSize: '0.74rem',
                        fontFamily: 'var(--font-sans)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4A0E17';
                        e.currentTarget.style.color = '#D4AF37';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F4EDE2';
                        e.currentTarget.style.color = '#4A0E17';
                      }}
                    >
                      <span>{sug}</span>
                      <ChevronRight size={12} color="currentColor" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5D5C5',
                borderRadius: '14px 14px 14px 2px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: '#6B1D28',
                fontStyle: 'italic',
                boxShadow: '0 2px 8px rgba(42, 24, 16, 0.04)',
              }}
            >
              <span>Elegant AI is thinking</span>
              <span style={{ display: 'inline-flex', gap: '3px' }}>
                <span className="typing-dot" style={{ animationDelay: '0s' }}>.</span>
                <span className="typing-dot" style={{ animationDelay: '0.2s' }}>.</span>
                <span className="typing-dot" style={{ animationDelay: '0.4s' }}>.</span>
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleFormSubmit}
          style={{
            borderTop: '1px solid #E5D5C5',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 14px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about venues, services, budget..."
            aria-label="Ask about venues, services, budget"
            style={{
              flex: 1,
              border: '1px solid #E5D5C5',
              outline: 'none',
              fontSize: '0.85rem',
              padding: '10px 14px',
              backgroundColor: '#FAF6F0',
              borderRadius: '8px',
              color: '#2A1810',
              fontFamily: 'var(--font-sans)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#D4AF37';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(212, 175, 55, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E5D5C5';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            style={{
              backgroundColor: '#4A0E17',
              color: '#D4AF37',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.82rem',
              letterSpacing: '0.05em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: loading || !input.trim() ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            <span>Send</span>
          </button>
        </form>
      </div>
    </>
  );
}
