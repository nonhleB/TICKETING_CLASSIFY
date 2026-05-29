import { useNavigate } from 'react-router-dom'
import { timeAgo, getInitials, avatarColor, STATUS_ICONS, PRIORITY_ICONS } from '../utils'
import './TicketCard.css'

export default function TicketCard({ ticket }) {
  const navigate = useNavigate()

  return (
    <div className="ticket-card fade-in" onClick={() => navigate(`/tickets/${ticket.id}`)}>
      <div className="ticket-card-top">
        <div className="ticket-badges">
          <span className={`badge status-${ticket.status}`}>
            {STATUS_ICONS[ticket.status]} {ticket.status.replace('-', ' ')}
          </span>
          <span className={`badge priority-${ticket.priority}`}>
            {PRIORITY_ICONS[ticket.priority]} {ticket.priority}
          </span>
          <span className={`badge category-${ticket.category}`}>
            {ticket.category}
          </span>
        </div>
        <span className="ticket-time">{timeAgo(ticket.updatedAt)}</span>
      </div>

      <h3 className="ticket-title">{ticket.title}</h3>
      <p className="ticket-desc">{ticket.description}</p>

      <div className="ticket-card-bottom">
        <div className="ticket-tags">
          {ticket.tags.slice(0, 3).map(tag => (
            <span key={tag} className="ticket-tag">#{tag}</span>
          ))}
        </div>
        <div className="ticket-meta">
          {ticket.comments.length > 0 && (
            <span className="ticket-comments">
              ⌙ {ticket.comments.length}
            </span>
          )}
          {ticket.assignee ? (
            <div
              className="avatar avatar-sm"
              style={{ background: avatarColor(ticket.assignee) }}
              title={ticket.assignee}
            >
              {getInitials(ticket.assignee)}
            </div>
          ) : (
            <div className="avatar avatar-sm unassigned" title="Unassigned">?</div>
          )}
        </div>
      </div>
    </div>
  )
}
