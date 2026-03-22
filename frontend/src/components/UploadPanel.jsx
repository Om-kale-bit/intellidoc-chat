import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadDocument } from '../api/axios'
import { FileText, Upload, CheckCircle, Loader, AlertCircle } from 'lucide-react'

export default function UploadPanel({ onDocumentUploaded }) {
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [message, setMessage] = useState('')
  const [uploadedDoc, setUploadedDoc] = useState(null)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setStatus('uploading')
    setMessage(`Uploading and processing "${file.name}"...`)

    try {
      const response = await uploadDocument(file)
      setStatus('success')
      setUploadedDoc(response.data)
      setMessage(`✓ Ready! Split into ${response.data.chunks} chunks.`)
      onDocumentUploaded(response.data) // tell parent component
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.error || 'Upload failed. Try again.')
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
    <div className="p-6">
      <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <FileText size={20} className="text-violet-400" />
        Upload Document
      </h2>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-violet-400 bg-violet-500/10'
            : 'border-slate-600 hover:border-violet-500 hover:bg-slate-700/40'
          }
          ${status === 'uploading' ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        <Upload
          size={32}
          className={`mx-auto mb-3 ${isDragActive ? 'text-violet-400' : 'text-slate-500'}`}
        />

        {isDragActive ? (
          <p className="text-violet-400 font-medium">Drop it here!</p>
        ) : (
          <>
            <p className="text-slate-300 font-medium mb-1">
              Drag & drop your file here
            </p>
            <p className="text-slate-500 text-sm">
              or click to browse
            </p>
            <p className="text-slate-600 text-xs mt-2">
              PDF, DOCX, TXT supported
            </p>
          </>
        )}
      </div>

      {/* Status Message */}
      {status !== 'idle' && (
        <div className={`
          mt-4 p-3 rounded-lg flex items-center gap-3 text-sm
          ${status === 'uploading' ? 'bg-blue-500/10 text-blue-400' : ''}
          ${status === 'success' ? 'bg-green-500/10 text-green-400' : ''}
          ${status === 'error' ? 'bg-red-500/10 text-red-400' : ''}
        `}>
          {status === 'uploading' && <Loader size={16} className="animate-spin shrink-0" />}
          {status === 'success' && <CheckCircle size={16} className="shrink-0" />}
          {status === 'error' && <AlertCircle size={16} className="shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      {/* Uploaded Doc Info */}
      {uploadedDoc && status === 'success' && (
        <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
          <p className="text-xs text-slate-400 mb-1">Current document</p>
          <p className="text-slate-200 text-sm font-medium truncate">
            {uploadedDoc.name}
          </p>
        </div>
      )}
    </div>
  )
}