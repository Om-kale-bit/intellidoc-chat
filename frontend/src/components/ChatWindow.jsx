import { useState, useRef, useEffect } from 'react'
import { sendMessage } from '../api/axios'
import MessageBubble from './MessageBubble'
import { Send, Loader, MessageSquare, Bot } from 'lucide-react'



export default function ChatWindow({ document }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const bottomRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Reset chat when document changes
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

    // Show user message immediately (feels faster)
    setMessages(prev => [...prev, { role: 'user', content: userText }])

    try {
      const response = await sendMessage(document.id, userText, sessionId)

      // Save session ID from first message
      if (!sessionId) setSessionId(response.data.session_id)

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.answer
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  // Send on Enter key (Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50">
        <h2 className="font-semibold text-slate-200 flex items-center gap-2">
          <MessageSquare size={18} className="text-violet-400" />
          {document ? `Chatting with: ${document.name}` : 'Select a document to start'}
        </h2>
        {document && (
          <p className="text-xs text-slate-500 mt-0.5">
            Ask anything about this document
          </p>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {!document && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <MessageSquare size={48} className="text-slate-700 mb-4" />
            <p className="text-slate-500 font-medium">No document selected</p>
            <p className="text-slate-600 text-sm mt-1">
              Upload a document on the left to start chatting
            </p>
          </div>
        )}

        {document && messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Bot size={48} className="text-slate-700 mb-4" />
            <p className="text-slate-400 font-medium">Ready to answer your questions</p>
            <p className="text-slate-600 text-sm mt-1">
              Ask anything about <span className="text-violet-400">{document.name}</span>
            </p>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {['Summarize this document', 'What are the key points?', 'What is this about?'].map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 bg-slate-700/60 hover:bg-slate-600/60
                             text-slate-400 rounded-full border border-slate-600/50
                             transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render all messages */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <Loader size={14} className="text-violet-400 animate-spin" />
            </div>
            <div className="bg-slate-700/70 border border-slate-600/50 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="px-6 py-4 border-t border-slate-700/50">
        <div className={`
          flex gap-3 items-end bg-slate-700/50 rounded-2xl px-4 py-3
          border transition-colors
          ${document ? 'border-slate-600 focus-within:border-violet-500' : 'border-slate-700 opacity-50'}
        `}>
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!document || loading}
            placeholder={document ? "Ask a question... (Enter to send)" : "Upload a document first"}
            className="flex-1 bg-transparent text-slate-200 placeholder-slate-500
                       text-sm outline-none py-0.5 max-h-32 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={handleSend}
            disabled={!document || !input.trim() || loading}
            className="shrink-0 w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-500
                       disabled:bg-slate-600 disabled:cursor-not-allowed
                       flex items-center justify-center transition-colors"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  )
}