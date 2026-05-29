export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export const STATUSES = ['open', 'in-progress', 'resolved', 'closed']
export const PRIORITIES = ['critical', 'high', 'medium', 'low']
export const CATEGORIES = ['bug', 'feature', 'task']

export const STATUS_ICONS = {
  'open': '○',
  'in-progress': '◑',
  'resolved': '●',
  'closed': '×'
}

export const PRIORITY_ICONS = {
  critical: '▲▲',
  high: '▲',
  medium: '—',
  low: '▽'
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const AVATAR_COLORS = [
  '#7c6af7', '#4cc98a', '#f06060', '#f0a040', '#5ab4f0', '#e86cac', '#3ecfba'
]

export function avatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let c of name) hash = hash * 31 + c.charCodeAt(0)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
