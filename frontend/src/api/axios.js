import axios from 'axios'

// All API calls go to Django running on port 8000
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Upload a document (PDF/DOCX/TXT)
export const uploadDocument = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return API.post('/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Get list of all uploaded documents
export const getDocuments = () => API.get('/documents/')

// Send a chat message and get AI response
export const sendMessage = (documentId, message, sessionId = null) => {
  return API.post('/chat/', {
    document_id: documentId,
    message: message,
    session_id: sessionId,
  })
}

// Get chat history for a session
export const getChatHistory = (sessionId) =>
  API.get(`/chat/?session_id=${sessionId}`)