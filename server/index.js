const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── In-memory store ──────────────────────────────────────────────────────────
let tickets = [
  {
    id: uuidv4(),
    title: 'Login page throws 500 error on Safari',
    description: 'Users on Safari 16+ report a blank screen after submitting login credentials. Console shows a CORS error.',
    status: 'open',
    priority: 'high',
    category: 'bug',
    assignee: 'Alice Chen',
    reporter: 'Bob Smith',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    comments: [
      { id: uuidv4(), author: 'Alice Chen', text: 'Looking into this now. The CORS headers seem to be missing on the auth endpoint.', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() }
    ],
    tags: ['auth', 'safari', 'cors']
  },
  {
    id: uuidv4(),
    title: 'Add dark mode support',
    description: 'Multiple users have requested a dark mode toggle. Should follow system preferences by default.',
    status: 'in-progress',
    priority: 'medium',
    category: 'feature',
    assignee: 'Carol Davis',
    reporter: 'Alice Chen',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    comments: [],
    tags: ['ui', 'accessibility']
  },
  {
    id: uuidv4(),
    title: 'Performance regression on dashboard',
    description: 'Dashboard load time increased from ~400ms to ~2.1s after the v2.3 release. Profile shows excessive re-renders.',
    status: 'open',
    priority: 'critical',
    category: 'bug',
    assignee: null,
    reporter: 'Dave Wilson',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    comments: [],
    tags: ['performance', 'dashboard']
  },
  {
    id: uuidv4(),
    title: 'Update billing documentation',
    description: 'The billing docs are outdated and reference old pricing tiers. Need a full refresh.',
    status: 'resolved',
    priority: 'low',
    category: 'task',
    assignee: 'Eve Martinez',
    reporter: 'Frank Lee',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    comments: [
      { id: uuidv4(), author: 'Eve Martinez', text: 'Done! Updated all pricing pages and the FAQ section.', createdAt: new Date(Date.now() - 86400000 * 4).toISOString() }
    ],
    tags: ['docs', 'billing']
  },
  {
    id: uuidv4(),
    title: 'CSV export missing timezone info',
    description: 'When exporting reports as CSV, timestamps are in UTC but there\'s no indication. Users in different timezones are confused.',
    status: 'open',
    priority: 'medium',
    category: 'bug',
    assignee: 'Bob Smith',
    reporter: 'Grace Kim',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    comments: [],
    tags: ['export', 'datetime']
  },
  {
    id: uuidv4(),
    title: 'Implement webhook notifications',
    description: 'Enterprise customers need webhook support so they can integrate ticket updates with their internal systems.',
    status: 'in-progress',
    priority: 'high',
    category: 'feature',
    assignee: 'Alice Chen',
    reporter: 'Henry Brown',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    comments: [],
    tags: ['integrations', 'enterprise', 'webhooks']
  }
];

const agents = ['Alice Chen', 'Bob Smith', 'Carol Davis', 'Dave Wilson', 'Eve Martinez'];

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/tickets
app.get('/api/tickets', (req, res) => {
  const { status, priority, category, search, assignee } = req.query;
  let result = [...tickets];

  if (status && status !== 'all') result = result.filter(t => t.status === status);
  if (priority && priority !== 'all') result = result.filter(t => t.priority === priority);
  if (category && category !== 'all') result = result.filter(t => t.category === category);
  if (assignee && assignee !== 'all') result = result.filter(t => t.assignee === assignee);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(result);
});

// GET /api/tickets/:id
app.get('/api/tickets/:id', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

// POST /api/tickets
app.post('/api/tickets', (req, res) => {
  const { title, description, priority, category, assignee, reporter, tags } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'Title and description required' });

  const ticket = {
    id: uuidv4(),
    title,
    description,
    status: 'open',
    priority: priority || 'medium',
    category: category || 'task',
    assignee: assignee || null,
    reporter: reporter || 'Anonymous',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    tags: tags || []
  };

  tickets.unshift(ticket);
  res.status(201).json(ticket);
});

// PATCH /api/tickets/:id
app.patch('/api/tickets/:id', (req, res) => {
  const idx = tickets.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Ticket not found' });

  const allowed = ['title', 'description', 'status', 'priority', 'category', 'assignee', 'tags'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  tickets[idx] = { ...tickets[idx], ...updates, updatedAt: new Date().toISOString() };
  res.json(tickets[idx]);
});

// DELETE /api/tickets/:id
app.delete('/api/tickets/:id', (req, res) => {
  const idx = tickets.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Ticket not found' });
  tickets.splice(idx, 1);
  res.json({ success: true });
});

// POST /api/tickets/:id/comments
app.post('/api/tickets/:id/comments', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const { author, text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment text required' });

  const comment = { id: uuidv4(), author: author || 'Anonymous', text, createdAt: new Date().toISOString() };
  ticket.comments.push(comment);
  ticket.updatedAt = new Date().toISOString();
  res.status(201).json(comment);
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    critical: tickets.filter(t => t.priority === 'critical').length,
    byCategory: {
      bug: tickets.filter(t => t.category === 'bug').length,
      feature: tickets.filter(t => t.category === 'feature').length,
      task: tickets.filter(t => t.category === 'task').length,
    },
    agents
  };
  res.json(stats);
});

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
