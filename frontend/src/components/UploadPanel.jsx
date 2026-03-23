import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadDocument } from '../api/axios'

export default function UploadPanel({ onDocumentUploaded }) {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setStatus('uploading')
    setMessage(`Processing...`)
    try {
      const response = await uploadDocument(file)
      setStatus('success')
      setMessage(`Done — ${response.data.chunks} chunks indexed`)
      onDocumentUploaded(response.data)
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.error || 'Upload failed')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }, [onDocumentUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: status === 'uploading',
  })

  return (
    <div>
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        color: 'var(--text-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '10px',
      }}>
        Upload
      </div>

      <div
        {...getRootProps()}
        style={{
          border: `1.5px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '20px 16px',
          textAlign: 'center',
          cursor: status === 'uploading' ? 'not-allowed' : 'pointer',
          background: isDragActive ? 'var(--accent-light)' : 'var(--bg-primary)',
          transition: 'all 0.2s',
        }}
      >
        <input {...getInputProps()} />

        {status === 'uploading' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px', height: '20px',
              border: '2px solid var(--border)',
              borderTop: '2px solid var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}/>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{message}</span>
          </div>
        ) : status === 'success' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', color: 'var(--accent)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '500' }}>{message}</span>
          </div>
        ) : status === 'error' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#DC2626' }}>{message}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ color: isDragActive ? 'var(--accent)' : 'var(--text-muted)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>
                {isDragActive ? 'Drop to upload' : 'Drop file here'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                PDF, DOCX, TXT
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}