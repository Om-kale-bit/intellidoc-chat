import { useState, useEffect } from 'react'
import UploadPanel from './components/UploadPanel'
import ChatWindow from './components/ChatWindow'
import DocumentList from './components/DocumentList'
import { getDocuments } from './api/axios'
import { Bot } from 'lucide-react'

export default function App() {
  const [documents, setDocuments] = useState([])
  const [activeDocument, setActiveDocument] = useState(null)

  // Load existing documents on startup
  useEffect(() => {
    getDocuments()
      .then(res => setDocuments(res.data))
      .catch(() => {}) // silently fail if backend not running
  }, [])

  const handleDocumentUploaded = (doc) => {
    // Add to list and set as active
    setDocuments(prev => [doc, ...prev])
    setActiveDocument(doc)
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">

      {/* LEFT SIDEBAR */}
      <div className="w-80 shrink-0 bg-slate-800/50 border-r border-slate-700/50
                      flex flex-col overflow-y-auto">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-base">DocChat AI</h1>
              <p className="text-xs text-slate-500">RAG-powered document Q&A</p>
            </div>
          </div>
        </div>

        {/* Upload Panel */}
        <UploadPanel onDocumentUploaded={handleDocumentUploaded} />

        {/* Divider */}
        {documents.length > 0 && (
          <div className="mx-6 border-t border-slate-700/50 mb-4" />
        )}

        {/* Document List */}
        <DocumentList
          documents={documents}
          activeDoc={activeDocument}
          onSelect={setActiveDocument}
        />
      </div>

      {/* RIGHT — CHAT AREA */}
      <div className="flex-1 flex flex-col bg-slate-900 min-w-0">
        <ChatWindow document={activeDocument} />
      </div>

    </div>
  )
}