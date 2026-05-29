import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const nav = [
  { to: '/', label: 'Dashboard', icon: '⬡' },
  { to: '/tickets', label: 'All Tickets', icon: '≡' },
  { to: '/tickets?status=open', label: 'Open', icon: '○', sub: true },
  { to: '/tickets?status=in-progress', label: 'In Progress', icon: '◑', sub: true },
  { to: '/tickets?status=resolved', label: 'Resolved', icon: '●', sub: true },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-mark">T</span>
        <span className="logo-text">Trackt</span>
      </div>
      <nav className="sidebar-nav">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${item.sub ? ' sub' : ''}${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  )
}
