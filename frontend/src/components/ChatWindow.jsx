import { useState, useRef, useEffect } from 'react'
import { sendMessage } from '../api/axios'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ document }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setMessages([])
    setSessionId(null)
    setInput('')
  }, [document?.id])

  const handleSend = async () => {
    if (!input.trim() || loading || !document) return
    const userText = input.trim()
    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    try {
      const response = await sendMessage(document.id, userText, sessionId)
      if (!sessionId) setSessionId(response.data.session_id)
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestions = [
    'Summarize this document',
    'What are the key points?',
    'What is this document about?'
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* ── MESSAGES AREA ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 0' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>

          {/* Empty state — no document */}
          {!document && (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
              <div style={{
                width: '48px', height: '48px',
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="var(--text-muted)" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div style={{
                fontSize: '15px', fontWeight: '500',
                color: 'var(--text-primary)', marginBottom: '8px'
              }}>
                Upload a document to begin
              </div>
              <div style={{
                fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6'
              }}>
                Upload a PDF, DOCX, or TXT file from the sidebar.<br />
                Then ask any question about its contents.
              </div>
            </div>
          )}

          {/* Ready state — document loaded, no messages yet */}
          {document && messages.length === 0 && !loading && (
            <div style={{ textAlign: 'center', paddingTop: '60px' }}>
              <div style={{
                width: '48px', height: '48px',
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="var(--text-muted)" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <div style={{
                fontSize: '15px', fontWeight: '500',
                color: 'var(--text-primary)', marginBottom: '6px'
              }}>
                Ready to answer
              </div>
              <div style={{
                fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px'
              }}>
                Ask anything about{' '}
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  {document.name}
                </span>
              </div>

              {/* Suggestion chips */}
              <div style={{
                display: 'flex', flexWrap: 'wrap',
                gap: '8px', justifyContent: 'center'
              }}>
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.target.style.borderColor = '#0f2744'
                      e.target.style.color = '#0f2744'
                    }}
                    onMouseLeave={e => {
                      e.target.style.borderColor = 'var(--border)'
                      e.target.style.color = 'var(--text-secondary)'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} content={msg.content} />
            ))}
          </div>

          {/* Loading indicator */}
          {loading && (
            <div style={{
              display: 'flex', gap: '12px',
              alignItems: 'flex-start', marginTop: '16px'
            }}>
              <div style={{
                width: '28px', height: '28px',
                borderRadius: '50%',
                background: 'var(--accent-light)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '600',
                color: 'var(--accent)', flexShrink: 0,
              }}>
                AI
              </div>
              <div style={{
                padding: '10px 14px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '4px 14px 14px 14px',
                display: 'flex', gap: '4px', alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '5px', height: '5px',
                    borderRadius: '50%',
                    background: 'var(--text-muted)',
                    animation: 'bounce 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}/>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── INPUT BAR ── */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 24px 20px',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px 6px',
            boxShadow: 'var(--shadow-sm)',
          }}>

            {/* Textarea + Send button row */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!document || loading}
                placeholder={
                  document
                    ? 'Ask a question about this document...'
                    : 'Upload a document first'
                }
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontFamily: 'DM Sans, sans-serif',
                  lineHeight: '1.5',
                  maxHeight: '120px',
                  overflowY: 'auto',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!document || !input.trim() || loading}
                style={{
                  width: '32px', height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: (!document || !input.trim() || loading)
                    ? 'var(--bg-tertiary)'
                    : '#0f2744',
                  cursor: (!document || !input.trim() || loading)
                    ? 'not-allowed'
                    : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>

            {/* ── HINT LINE INSIDE THE BOX ── */}
            <div style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              padding: '6px 2px 2px',
              borderTop: '1px solid var(--border)',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span>↵ Enter to send</span>
              <span>⇧ Shift+Enter for new line</span>
              <span style={{ marginLeft: 'auto' }}>
                Answers based only on document content
              </span>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}