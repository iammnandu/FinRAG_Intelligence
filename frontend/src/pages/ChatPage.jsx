import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, Copy, Database, LoaderCircle, Send, Trash2, Upload, Shield, Activity, History } from 'lucide-react'
import { healthCheck, ingestDocuments, listDocuments, sendChat, uploadDocument } from '../lib/api'

const starterPrompts = [
  'How should we respond to a likely account takeover alert?',
  'What controls help reduce phishing-based fraud?',
  'Summarize card fraud velocity rules from our playbook.',
]

const defaultMessages = [
  {
    role: 'assistant',
    content:
      'I am your Cybersecurity & Fraud Intelligence Assistant. Ask about fraud controls, investigations, policies, or incident response.',
    citations: [],
  },
]

const memoryKey = 'finrag_chat_memory_v1'

function ChatPage() {
  const [messages, setMessages] = useState(() => {
    try {
      const cached = localStorage.getItem(memoryKey)
      if (!cached) return defaultMessages
      const parsed = JSON.parse(cached)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultMessages
    } catch {
      return defaultMessages
    }
  })
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('Checking backend...')
  const [topK, setTopK] = useState(4)
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const chatRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadHealth()
    loadDocuments()
  }, [])

  useEffect(() => {
    localStorage.setItem(memoryKey, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function loadHealth() {
    try {
      const data = await healthCheck()
      setStatus(`Backend online · Chat: ${data.chat_model} · Embed: ${data.embed_model} · Index: ${data.index_chunks}`)
    } catch {
      setStatus('Backend offline. Start Python API at http://localhost:8000.')
    }
  }

  async function loadDocuments() {
    try {
      const data = await listDocuments()
      setDocuments(data.documents || [])
    } catch {
      setDocuments([])
    }
  }

  const historyPayload = useMemo(
    () =>
      messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content })),
    [messages],
  )

  async function handleSend(customPrompt) {
    const question = (customPrompt ?? prompt).trim()
    if (!question || loading) return

    const nextMessages = [...messages, { role: 'user', content: question }]
    setMessages(nextMessages)
    setPrompt('')
    setLoading(true)

    try {
      const response = await sendChat(question, historyPayload, topK)
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: response.answer,
          citations: response.citations || [],
        },
      ])
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: error?.response?.data?.detail || 'Unable to get response from backend.',
          citations: [],
        },
      ])
    } finally {
      setLoading(false)
      loadHealth()
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadDocument(file)
      await ingestDocuments()
      await loadDocuments()
      await loadHealth()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Document "${file.name}" uploaded and indexed successfully.`,
          citations: [],
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Could not upload/index "${file.name}". Check backend logs.`,
          citations: [],
        },
      ])
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  function clearChat() {
    setMessages(defaultMessages)
  }

  async function reindexAll() {
    setUploading(true)
    try {
      await ingestDocuments()
      await loadDocuments()
      await loadHealth()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Knowledge base reindexed successfully.',
          citations: [],
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Reindex failed. Verify Ollama is running and models are available.',
          citations: [],
        },
      ])
    } finally {
      setUploading(false)
    }
  }

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // ignore copy failures
    }
  }

  return (
    <div className="workspace-v2">
      <header className="workspace-header">
        <div>
          <h1>Fraud Intelligence Workspace</h1>
          <p>Enterprise chat console for cybersecurity and fraud decision support.</p>
        </div>
        <div className="workspace-header-actions">
          <span className="workspace-status">{status}</span>
          <Link className="outline-btn" to="/">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="workspace-body">
        <section className="conversation-panel">
          <div className="action-ribbon">
            <button
              className="outline-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.pdf"
              onChange={handleUpload}
              hidden
              disabled={uploading}
            />
            <button className="outline-btn" onClick={reindexAll} disabled={uploading}>
              <Database size={14} /> Update Database
            </button>
            <button className="outline-btn" onClick={clearChat}>
              <Trash2 size={14} /> New Chat
            </button>
          </div>

          <div className="prompt-starters-v2">
            {starterPrompts.map((item) => (
              <button key={item} onClick={() => handleSend(item)} disabled={loading}>
                {item}
              </button>
            ))}
          </div>

          <div className="messages-v2" ref={chatRef}>
            {messages.map((message, index) => (
              <article key={`${message.role}-${index}`} className={`message-v2 ${message.role}`}>
                <div className="message-v2-head">
                  <span>{message.role === 'assistant' ? 'Assistant' : 'Analyst'}</span>
                  <button className="icon-btn" onClick={() => copyText(message.content)}>
                    <Copy size={14} />
                  </button>
                </div>
                <p>{message.content}</p>
                {message.role === 'assistant' && message.citations?.length > 0 ? (
                  <div className="citations-v2">
                    {message.citations.map((citation) => (
                      <span key={`${citation.source}-${citation.score}`}>
                        {citation.source} ({citation.score})
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
            {loading ? (
              <article className="message-v2 assistant">
                <div className="message-v2-head">
                  <span>Assistant</span>
                </div>
                <p className="typing-row">
                  <LoaderCircle className="spin" size={16} /> Generating grounded response...
                </p>
              </article>
            ) : null}
          </div>

          <div className="composer-v2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a fraud/cybersecurity question with policy context..."
              rows={3}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSend()
                }
              }}
            />
            <button className="solid-btn" onClick={() => handleSend()} disabled={loading || !prompt.trim()}>
              {loading ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />}
              Send
            </button>
            <button className="outline-btn" onClick={() => handleSend(prompt)} disabled={loading || !prompt.trim()}>
              <ArrowUp size={15} /> Ask
            </button>
          </div>
        </section>

        <aside className="insight-panel">
          <article>
            <h4>
              <Shield size={16} /> Session Controls
            </h4>
            <p>Conversation memory remains active across refresh for continuity.</p>
            <span className="chip">Memory Active</span>
          </article>

          <article>
            <h4>
              <Activity size={16} /> Retrieval Depth
            </h4>
            <input type="range" min={1} max={8} value={topK} onChange={(e) => setTopK(Number(e.target.value))} />
            <p>Top K chunks: {topK}</p>
          </article>

          <article>
            <h4>
              <History size={16} /> Indexed Documents
            </h4>
            <ul className="doc-list-v2">
              {documents.length === 0 ? <li>No documents available</li> : documents.map((doc) => <li key={doc}>{doc}</li>)}
            </ul>
          </article>
        </aside>
      </main>
    </div>
  )
}

export default ChatPage
