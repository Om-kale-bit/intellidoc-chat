import { Bot, User } from 'lucide-react'

export default function MessageBubble({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar icon */}
      <div className={`
        shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isUser ? 'bg-violet-600' : 'bg-slate-700'}
      `}>
        {isUser
          ? <User size={14} className="text-white" />
          : <Bot size={14} className="text-violet-400" />
        }
      </div>

      {/* Message bubble */}
      <div className={`
        max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isUser
          ? 'bg-violet-600 text-white rounded-tr-sm'
          : 'bg-slate-700/70 text-slate-200 rounded-tl-sm border border-slate-600/50'
        }
      `}>
        {/* Render content with line breaks */}
        {content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  )
}