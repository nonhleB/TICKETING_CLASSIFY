import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useToast } from '../context/ToastContext'
import { timeAgo, formatDate, STATUSES, PRIORITIES, CATEGORIES, STATUS_ICONS, PRIORITY_ICONS, getInitials, avatarColor } from '../utils'
import './TicketDetail.css'

const lbl = { display:'block', fontSize:11, color:'var(--text3)', marginBottom:5, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.06em' }

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState([])
  const [comment, setComment] = useState('')
  const [commenter, setCommenter] = useState('')
  const [savingComment, setSavingComment] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getTicket(id), api.getStats()])
      .then(([t, s]) => { setTicket(t); setAgents(s.agents) })
      .catch(() => toast('Ticket not found', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  async function update(field, val) {
    try {
      const updated = await api.updateTicket(id, { [field]: val })
      setTicket(updated)
      toast(`Updated ${field}`, 'success')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function submitComment(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setSavingComment(true)
    try {
      const c = await api.addComment(id, { author: commenter || 'Anonymous', text: comment })
      setTicket(t => ({ ...t, comments: [...t.comments, c] }))
      setComment('')
      toast('Comment added', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSavingComment(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this ticket?')) return
    setDeleting(true)
    try {
      await api.deleteTicket(id)
      toast('Ticket deleted', 'success')
      navigate('/tickets')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (loading) return <div className="page-loading">Loading…</div>
  if (!ticket) return <div className="page-loading">Ticket not found</div>

  return (
    <div className="ticket-detail fade-in">
      <div className="td-nav">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tickets')}>
          ← Back
        </button>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-sm btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="td-layout">
        <div className="td-main">
          <div className="td-badges">
            <span className={`badge status-${ticket.status}`}>{STATUS_ICONS[ticket.status]} {ticket.status.replace('-',' ')}</span>
            <span className={`badge priority-${ticket.priority}`}>{PRIORITY_ICONS[ticket.priority]} {ticket.priority}</span>
            <span className={`badge category-${ticket.category}`}>{ticket.category}</span>
          </div>
          <h1 className="td-title">{ticket.title}</h1>
          <p className="td-desc">{ticket.description}</p>

          {ticket.tags.length > 0 && (
            <div className="td-tags">
              {ticket.tags.map(tag => <span key={tag} className="ticket-tag">#{tag}</span>)}
            </div>
          )}

          <div className="td-section-header">
            Comments ({ticket.comments.length})
          </div>

          <div className="td-comments">
            {ticket.comments.length === 0 && (
              <div className="no-comments">No comments yet</div>
            )}
            {ticket.comments.map(c => (
              <div key={c.id} className="comment-item">
                <div className="comment-avatar" style={{background:avatarColor(c.author)}}>
                  {getInitials(c.author)}
                </div>
                <div className="comment-body">
                  <div className="comment-meta">
                    <span className="comment-author">{c.author}</span>
                    <span className="comment-time">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="comment-text">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form className="comment-form" onSubmit={submitComment}>
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <input value={commenter} onChange={e => setCommenter(e.target.value)} placeholder="Your name" style={{maxWidth:200}} />
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment…"
              rows={3}
              style={{resize:'vertical',marginBottom:8}}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={savingComment || !comment.trim()}>
              {savingComment ? '…' : 'Add Comment'}
            </button>
          </form>
        </div>

        <aside className="td-sidebar">
          <div className="td-meta-section">
            <div className="td-meta-item">
              <label style={lbl}>Status</label>
              <select value={ticket.status} onChange={e => update('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('-',' ')}</option>)}
              </select>
            </div>
            <div className="td-meta-item">
              <label style={lbl}>Priority</label>
              <select value={ticket.priority} onChange={e => update('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="td-meta-item">
              <label style={lbl}>Category</label>
              <select value={ticket.category} onChange={e => update('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="td-meta-item">
              <label style={lbl}>Assignee</label>
              <select value={ticket.assignee || ''} onChange={e => update('assignee', e.target.value || null)}>
                <option value="">Unassigned</option>
                {agents.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="td-info-section">
            <div className="td-info-row">
              <span className="td-info-lbl">Reporter</span>
              <span className="td-info-val">{ticket.reporter}</span>
            </div>
            <div className="td-info-row">
              <span className="td-info-lbl">Created</span>
              <span className="td-info-val" title={formatDate(ticket.createdAt)}>{timeAgo(ticket.createdAt)}</span>
            </div>
            <div className="td-info-row">
              <span className="td-info-lbl">Updated</span>
              <span className="td-info-val" title={formatDate(ticket.updatedAt)}>{timeAgo(ticket.updatedAt)}</span>
            </div>
            <div className="td-info-row">
              <span className="td-info-lbl">ID</span>
              <span className="td-info-val" style={{fontFamily:'var(--font-mono)',fontSize:11}}>{ticket.id.slice(0,8)}…</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
