import { useState } from 'react'
import { deleteDocument } from '../api/axios'

export default function DocumentList({ documents, activeDoc, onSelect, onDelete }) {
  const [deletingId, setDeletingId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  if (documents.length === 0) return null

  const handleDelete = async (e, docId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this document? This cannot be undone.')) return

    setDeletingId(docId)
    try {
      await deleteDocument(docId)
      onDelete(docId)
    } catch {
      alert('Failed to delete. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        color: 'var(--text-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '8px',
      }}>
        Documents ({documents.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {documents.map(doc => {
          const isActive = activeDoc?.id === doc.id
          const isDeleting = deletingId === doc.id
          const isHovered = hoveredId === doc.id

          return (
            <div
              key={doc.id}
              onMouseEnter={() => setHoveredId(doc.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--accent-light)' : isHovered ? 'var(--bg-tertiary)' : 'transparent',
                transition: 'background 0.15s',
                opacity: isDeleting ? 0.5 : 1,
              }}
            >
              {/* Clickable doc name area */}
              <button
                onClick={() => onSelect(doc)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: 0,
                  minWidth: 0,
                }}
              >
                {/* File icon */}
                <div style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  flexShrink: 0
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>

                {/* File name */}
                <span style={{
                  fontSize: '12px',
                  fontWeight: isActive ? '500' : '400',
                  color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}>
                  {doc.name}
                </span>

                {/* Status dot */}
                <div style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: doc.processed ? '#16A34A' : '#F59E0B',
                  flexShrink: 0,
                }}/>
              </button>

              {/* Delete button — only visible on hover */}
              {(isHovered || isDeleting) && (
                <button
                  onClick={(e) => handleDelete(e, doc.id)}
                  disabled={isDeleting}
                  title="Delete document"
                  style={{
                    width: '22px', height: '22px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: isDeleting ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#DC2626',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#FEE2E2'
                    e.currentTarget.style.borderColor = '#DC2626'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--bg-primary)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {isDeleting ? (
                    <div style={{
                      width: '10px', height: '10px',
                      border: '1.5px solid var(--border)',
                      borderTop: '1.5px solid #DC2626',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}/>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}