import { useState, useEffect } from 'react'
import { api } from '../api'
import { useToast } from '../context/ToastContext'
import { PRIORITIES, CATEGORIES } from '../utils'

export default function CreateTicketModal({ onClose, onCreated }) {
  const toast = useToast()
  const [agents, setAgents] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    category: 'bug', assignee: '', reporter: '', tags: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getStats().then(s => setAgents(s.agents)).catch(() => {})
  }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      toast('Title and description are required', 'error')
      return
    }
    setLoading(true)
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
      const ticket = await api.createTicket({ ...form, tags, assignee: form.assignee || null })
      toast('Ticket created successfully', 'success')
      onCreated(ticket)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 style={{fontFamily:'var(--font-mono)',fontSize:16}}>New Ticket</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <label style={lbl}>Title</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Short, descriptive title" />
            </div>
            <div>
              <label style={lbl}>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="What's happening? Include steps to reproduce if applicable."
                rows={4} style={{resize:'vertical'}} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <label style={lbl}>Priority</label>
                <select value={form.priority} onChange={e => set('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <label style={lbl}>Reporter</label>
                <input value={form.reporter} onChange={e => set('reporter', e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label style={lbl}>Assignee</label>
                <select value={form.assignee} onChange={e => set('assignee', e.target.value)}>
                  <option value="">Unassigned</option>
                  {agents.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Tags <span style={{color:'var(--text3)',fontWeight:400}}>(comma-separated)</span></label>
              <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. auth, safari, login" />
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '...' : '+ Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const lbl = { display:'block', fontSize:12, color:'var(--text2)', marginBottom:5, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' }
