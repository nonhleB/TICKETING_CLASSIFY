import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { avatarColor, getInitials } from '../utils'
import './Dashboard.css'

function StatCard({ label, value, color, onClick }) {
  return (
    <div className="stat-card" style={{ '--c': color }} onClick={onClick}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error)
    api.getTickets({ limit: 5 }).then(t => setRecent(t.slice(0, 5))).catch(console.error)
  }, [])

  if (!stats) return <div className="page-loading">Loading…</div>

  const criticalTickets = recent.filter(t => t.priority === 'critical' || t.priority === 'high')

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your support queue</p>
        </div>
        <div className="dash-date">{new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Tickets" value={stats.total} color="var(--accent)" onClick={() => navigate('/tickets')} />
        <StatCard label="Open" value={stats.open} color="var(--blue)" onClick={() => navigate('/tickets?status=open')} />
        <StatCard label="In Progress" value={stats.inProgress} color="var(--amber)" onClick={() => navigate('/tickets?status=in-progress')} />
        <StatCard label="Resolved" value={stats.resolved} color="var(--green)" onClick={() => navigate('/tickets?status=resolved')} />
        <StatCard label="Critical" value={stats.critical} color="var(--red)" onClick={() => navigate('/tickets?priority=critical')} />
      </div>

      <div className="dash-grid">
        <div className="dash-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-list">
            {recent.map(ticket => (
              <div key={ticket.id} className="activity-item" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                <span className={`badge status-${ticket.status}`} style={{fontSize:11}}>
                  {ticket.status.replace('-',' ')}
                </span>
                <span className="activity-title">{ticket.title}</span>
                <span className={`badge priority-${ticket.priority}`} style={{fontSize:11}}>
                  {ticket.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-right">
          <div className="dash-section">
            <h2 className="section-title">By Category</h2>
            <div className="category-bars">
              {Object.entries(stats.byCategory).map(([cat, count]) => (
                <div key={cat} className="cat-bar" onClick={() => navigate(`/tickets?category=${cat}`)}>
                  <div className="cat-bar-label">
                    <span className={`badge category-${cat}`}>{cat}</span>
                    <span className="cat-count">{count}</span>
                  </div>
                  <div className="cat-bar-track">
                    <div className="cat-bar-fill" style={{
                      width: `${stats.total ? (count / stats.total) * 100 : 0}%`,
                      background: cat === 'bug' ? 'var(--red)' : cat === 'feature' ? 'var(--accent)' : 'var(--teal)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {criticalTickets.length > 0 && (
            <div className="dash-section">
              <h2 className="section-title">Needs Attention</h2>
              <div className="attention-list">
                {criticalTickets.slice(0, 3).map(t => (
                  <div key={t.id} className="attention-item" onClick={() => navigate(`/tickets/${t.id}`)}>
                    <div className="attention-dot" style={{background: t.priority === 'critical' ? 'var(--red)' : 'var(--pink)'}} />
                    <div>
                      <div className="attention-title">{t.title}</div>
                      <div className="attention-meta">
                        {t.assignee ? (
                          <div style={{display:'flex',alignItems:'center',gap:4}}>
                            <div className="avatar avatar-sm" style={{background:avatarColor(t.assignee)}}>
                              {getInitials(t.assignee)}
                            </div>
                            <span>{t.assignee}</span>
                          </div>
                        ) : <span style={{color:'var(--red)',fontSize:12}}>Unassigned</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dash-section">
            <h2 className="section-title">Team</h2>
            <div className="team-list">
              {stats.agents.map(a => (
                <div key={a} className="team-member" onClick={() => navigate(`/tickets?assignee=${encodeURIComponent(a)}`)}>
                  <div className="avatar avatar-sm" style={{background:avatarColor(a)}}>{getInitials(a)}</div>
                  <span className="team-name">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
