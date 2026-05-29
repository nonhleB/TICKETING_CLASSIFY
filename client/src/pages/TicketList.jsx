import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import TicketCard from '../components/TicketCard'
import CreateTicketModal from '../components/CreateTicketModal'
import { useToast } from '../context/ToastContext'
import { STATUSES, PRIORITIES, CATEGORIES } from '../utils'
import './TicketList.css'

export default function TicketList() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [agents, setAgents] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()

  const filters = {
    status: searchParams.get('status') || 'all',
    priority: searchParams.get('priority') || 'all',
    category: searchParams.get('category') || 'all',
    assignee: searchParams.get('assignee') || 'all',
    search: searchParams.get('search') || '',
  }

  function setFilter(key, val) {
    setSearchParams(p => {
      const n = new URLSearchParams(p)
      if (val === 'all' || !val) n.delete(key)
      else n.set(key, val)
      return n
    })
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.status !== 'all') params.status = filters.status
      if (filters.priority !== 'all') params.priority = filters.priority
      if (filters.category !== 'all') params.category = filters.category
      if (filters.assignee !== 'all') params.assignee = filters.assignee
      if (filters.search) params.search = filters.search
      const data = await api.getTickets(params)
      setTickets(data)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    api.getStats().then(s => setAgents(s.agents)).catch(() => {})
  }, [])

  function handleCreated(ticket) {
    setTickets(t => [ticket, ...t])
    setShowCreate(false)
  }

  const activeFilters = Object.entries(filters).filter(([k, v]) => v && v !== 'all' && k !== 'search').length

  return (
    <div className="ticket-list-page">
      <div className="tl-header">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="page-subtitle">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Ticket
        </button>
      </div>

      <div className="tl-toolbar">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            placeholder="Search tickets…"
          />
          {filters.search && (
            <button className="search-clear" onClick={() => setFilter('search', '')}>✕</button>
          )}
        </div>

        <div className="filters">
          <select value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('-',' ')}</option>)}
          </select>
          <select value={filters.priority} onChange={e => setFilter('priority', e.target.value)}>
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filters.category} onChange={e => setFilter('category', e.target.value)}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.assignee} onChange={e => setFilter('assignee', e.target.value)}>
            <option value="all">All Agents</option>
            {agents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {activeFilters > 0 && (
            <button className="btn btn-sm btn-ghost" onClick={() => setSearchParams({})}>
              Clear ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="tl-loading">
          <div className="loader" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="tl-empty">
          <div className="empty-icon">○</div>
          <p>No tickets found</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create First Ticket</button>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
        </div>
      )}

      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </div>
  )
}
