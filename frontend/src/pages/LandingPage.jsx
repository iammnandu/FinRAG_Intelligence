import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  ShieldAlert,
  SearchCode,
  Landmark,
  FileScan,
  MessageSquareLock,
  AlertTriangle,
  Activity,
  DatabaseZap,
  Radar,
} from 'lucide-react'

const features = [
  {
    icon: ShieldAlert,
    title: 'Real-Time Fraud Defense',
    desc: 'Triage account takeover, card abuse, and phishing with guided response playbooks.',
  },
  {
    icon: SearchCode,
    title: 'Grounded Intelligence',
    desc: 'Every response is rooted in approved policies, regulatory controls, and historical case records.',
  },
  {
    icon: DatabaseZap,
    title: 'Private Model Stack',
    desc: 'Runs with Ollama and local retrieval for controlled enterprise-grade deployment.',
  },
  {
    icon: Landmark,
    title: 'Audit-Ready Outputs',
    desc: 'Citations and policy-linked answers support banking operations and compliance teams.',
  },
]

const workflows = [
  {
    id: 'ops',
    label: 'Fraud Operations',
    icon: AlertTriangle,
    detail: 'Get immediate triage guidance for account takeover, card fraud bursts, and phishing incidents.',
  },
  {
    id: 'support',
    label: 'Customer Support',
    icon: MessageSquareLock,
    detail: 'Provide policy-aligned customer responses quickly with sources from approved internal documents.',
  },
  {
    id: 'compliance',
    label: 'Compliance Teams',
    icon: FileScan,
    detail: 'Trace regulatory controls, retention rules, and investigation standards with citation-backed answers.',
  },
]

function LandingPage() {
  const [activeWorkflow, setActiveWorkflow] = useState(workflows[0])

  return (
    <div className="landing-v2">
      <header className="landing-nav">
        <div className="brand-line">
          <div className="brand-badge">
            <Building2 size={16} />
          </div>
          <div>
            <p>FinRAG Intelligence</p>
            <small>Cybersecurity & Fraud Decision Workspace</small>
          </div>
        </div>
        <div className="nav-actions">
          <span className="outline-pill">Enterprise RAG</span>
          <Link className="outline-btn" to="/chat">
            Open Workspace
          </Link>
        </div>
      </header>

      <section className="hero-v2">
        <div className="hero-copy">
          <div className="hero-kicker">Cybersecurity & Fraud Intelligence Chatbot</div>
          <h1>Secure your banking decisions with context-verified AI intelligence.</h1>
          <p>
            Built for bank operations, support, and compliance teams. Ask in natural language, get policy-grounded
            responses with clear evidence and practical next actions.
          </p>

          <div className="hero-actions-v2">
            <Link className="solid-btn" to="/chat">
              Launch Secure Chat <ArrowRight size={16} />
            </Link>
            <button className="outline-btn" onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })}>
              View Platform
            </button>
          </div>

          <div className="metric-grid">
            <div>
              <strong>Policy-Grounded</strong>
              <span>Response quality with source context</span>
            </div>
            <div>
              <strong>Conversation Memory</strong>
              <span>Session continuity across refresh</span>
            </div>
            <div>
              <strong>RAG + Ollama</strong>
              <span>Local-first enterprise deployment</span>
            </div>
          </div>
        </div>

        <article className="hero-console">
          <div className="console-head">
            <Activity size={15} />
            <span>Operational Snapshot</span>
          </div>

          <div className="console-cards">
            <article>
              <Radar size={16} />
              <h4>Threat Monitoring</h4>
              <p>Review suspicious patterns and recommended actions in one place.</p>
            </article>
            <article>
              <FileScan size={16} />
              <h4>Policy Retrieval</h4>
              <p>Answers are backed by fraud playbooks and regulatory documents.</p>
            </article>
          </div>

          <Link className="console-cta" to="/chat">
            Enter Analyst Workspace
          </Link>
        </article>
      </section>

      <section className="workflow-v2">
        <div>
          <h2>Configured for high-impact banking teams</h2>
          <p>Select a role to preview how FinRAG supports day-to-day decisions.</p>
        </div>

        <div className="workflow-layout">
          <div className="workflow-menu">
            {workflows.map((workflow) => {
              const Icon = workflow.icon
              const isActive = activeWorkflow.id === workflow.id
              return (
                <button
                  key={workflow.id}
                  className={`workflow-menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveWorkflow(workflow)}
                >
                  <Icon size={16} />
                  {workflow.label}
                </button>
              )
            })}
          </div>

          <article className="workflow-panel">
            <h3>{activeWorkflow.label}</h3>
            <p>{activeWorkflow.detail}</p>

            <div className="tag-list">
              <span>Risk triage prompts</span>
              <span>RAG source citations</span>
              <span>Document ingestion controls</span>
              <span>Adjustable retrieval strategy</span>
            </div>
          </article>
        </div>
      </section>

      <section className="feature-grid-v2">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <article key={feature.title} className="feature-card-v2">
              <Icon size={20} />
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          )
        })}
      </section>

      <section className="pipeline-v2">
        <article>
          <span>1</span>
          <h4>Ingest Knowledge</h4>
          <p>Upload banking documents and trigger secure indexing.</p>
        </article>
        <article>
          <span>2</span>
          <h4>Retrieve Context</h4>
          <p>RAG matches top relevant policy chunks for each query.</p>
        </article>
        <article>
          <span>3</span>
          <h4>Respond with Evidence</h4>
          <p>Ollama generates clear action guidance with citations.</p>
        </article>
      </section>

      <section className="cta-v2">
        <h3>Ready for enterprise-grade fraud intelligence?</h3>
        <p>Launch the workspace and test real cybersecurity and fraud scenarios now.</p>
        <Link className="solid-btn" to="/chat">
          Open Analyst Workspace <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  )
}

export default LandingPage
