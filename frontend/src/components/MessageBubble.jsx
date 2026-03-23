export default function MessageBubble({ role, content }) {
  const isUser = role === 'user'

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
    }}>
      {/* Avatar */}
      <div style={{
        width: '28px', height: '28px',
        borderRadius: '50%',
        background: isUser ? 'var(--user-bubble)' : 'var(--accent-light)',
        border: isUser ? 'none' : '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        fontSize: '11px',
        fontWeight: '600',
        color: isUser ? 'white' : 'var(--accent)',
      }}>
        {isUser ? 'You' : 'AI'}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '70%',
        padding: '10px 14px',
        borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
        background: isUser ? 'var(--user-bubble)' : 'var(--bg-primary)',
        border: isUser ? 'none' : '1px solid var(--border)',
        fontSize: '13px',
        lineHeight: '1.65',
        color: isUser ? 'white' : 'var(--text-primary)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {content.split('\n').map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  )
}