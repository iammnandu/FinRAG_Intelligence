import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 120000,
})

export async function healthCheck() {
  const response = await api.get('/health')
  return response.data
}

export async function sendChat(question, history, topK = 4) {
  const response = await api.post('/api/chat', {
    question,
    history,
    top_k: topK,
  })
  return response.data
}

export async function uploadDocument(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function ingestDocuments() {
  const response = await api.post('/api/ingest')
  return response.data
}

export async function listDocuments() {
  const response = await api.get('/api/documents')
  return response.data
}
