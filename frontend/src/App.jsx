import { useState, useEffect } from 'react'
import UploadPanel from './components/UploadPanel'
import ChatWindow from './components/ChatWindow'
import DocumentList from './components/DocumentList'
import { getDocuments } from './api/axios'

export default function App() {
  const [documents, setDocuments] = useState([])
  const [activeDocument, setActiveDocument] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    getDocuments()
      .then(res => setDocuments(res.data))
      .catch(() => {})
  }, [])

  const handleDocumentUploaded = (doc) => {
    setDocuments(prev => [doc, ...prev])
    setActiveDocument(doc)
  }

  // ✅ NEW: handle delete
  const handleDocumentDeleted = (docId) => {
    setDocuments(prev => prev.filter(d => d.id !== docId))
    if (activeDocument?.id === docId) {
      setActiveDocument(null)
    }
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg-primary)',
      overflow: 'hidden'
    }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: sidebarOpen ? '300px' : '0px',
        minWidth: sidebarOpen ? '300px' : '0px',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Logo */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '30px', height: '30px',
            background: '#0f2744',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontSize: '14px', fontWeight: '600',
              color: 'var(--text-primary)', letterSpacing: '-0.2px'
            }}>
              IntelliDoc
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>
              Document Intelligence
            </div>
          </div>
        </div>

        {/* Sidebar scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <UploadPanel onDocumentUploaded={handleDocumentUploaded} />
          {documents.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <DocumentList
                documents={documents}
                activeDoc={activeDocument}
                onSelect={setActiveDocument}
                onDelete={handleDocumentDeleted}  // ✅ UPDATED
              />
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── HEADER ── */}
        <div style={{
          height: '56px',
          borderBottom: '1px solid #1a3a5c',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '12px',
          background: '#0f2744',
          flexShrink: 0,
        }}>

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: '32px', height: '32px',
              border: '1px solid #1e3a5f',
              borderRadius: '8px',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Active document */}
          {activeDocument ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: '#7dd3b0',
              }}/>
              <span style={{
                fontSize: '13px', fontWeight: '500', color: '#ffffff'
              }}>
                {activeDocument.name}
              </span>
              <span style={{
                fontSize: '11px',
                background: 'rgba(255,255,255,0.1)',
                color: '#7dd3b0',
                padding: '2px 8px',
                borderRadius: '20px',
                fontWeight: '500',
              }}>
                Active
              </span>
            </div>
          ) : (
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              No document selected
            </span>
          )}

          {/* Right badges */}
          <div style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{
              fontSize: '11px',
              color: '#94a3b8',
              padding: '3px 10px',
              border: '1px solid #1e3a5f',
              borderRadius: '20px',
            }}>
              GPT-4o-mini
            </span>
            <span style={{
              fontSize: '11px',
              color: '#94a3b8',
              padding: '3px 10px',
              border: '1px solid #1e3a5f',
              borderRadius: '20px',
            }}>
              RAG
            </span>
          </div>
        </div>

        {/* ── CHAT ── */}
        <ChatWindow document={activeDocument} />
      </div>
    </div>
  )
}