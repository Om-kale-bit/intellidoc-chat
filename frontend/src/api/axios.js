import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const uploadDocument = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return API.post('/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getDocuments = () => API.get('/documents/')

export const deleteDocument = (id) => API.delete(`/documents/${id}/`)

export const sendMessage = (documentId, message, sessionId = null) => {
  return API.post('/chat/', {
    document_id: documentId,
    message: message,
    session_id: sessionId,
  })
}

export const getChatHistory = (sessionId) =>
  API.get(`/chat/?session_id=${sessionId}`)