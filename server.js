const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fetch   = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── In-memory store ───────────────────────────────────────────────
const store = {
  tickets: [
    { id:'TK-041', subject:'Database service down — production impacted', category:'Infrastructure', priority:'Critical', status:'Open',        assigned:'Sipho N.',  created:'10 min ago', desc:'Our primary database is unreachable. Error 503 on all write operations. Affecting all users on Pro plan.' },
    { id:'TK-040', subject:'Double charge on subscription renewal',        category:'Billing',        priority:'High',     status:'In progress', assigned:'Amara O.',  created:'2h ago',     desc:'Customer was charged twice for May subscription. Needs immediate refund.' },
    { id:'TK-039', subject:'Login fails with SSO provider',                category:'Security',       priority:'High',     status:'In progress', assigned:'Lee M.',    created:'4h ago',     desc:'SAML SSO integration returning 401 on callback. Affects 3 enterprise customers.' },
    { id:'TK-038', subject:'API response time > 10s on search endpoint',   category:'Bug report',     priority:'Medium',   status:'Resolved',    assigned:'Sipho N.',  created:'6h ago',     desc:'Search endpoint degraded. P95 latency is 10.2 seconds. Normal is <200ms.' },
    { id:'TK-037', subject:'Export to CSV missing custom fields',          category:'Bug report',     priority:'Medium',   status:'Open',        assigned:'Yara H.',   created:'1d ago',     desc:'Custom field columns are absent from the CSV export. Introduced in v2.3.' },
    { id:'TK-036', subject:'Dark mode toggle not persisting on refresh',   category:'UX/UI',          priority:'Low',      status:'Open',        assigned:'Amara O.',  created:'2d ago',     desc:'User preference for dark mode resets on page reload. LocalStorage not being written.' },
    { id:'TK-035', subject:'Request: bulk ticket import via CSV',          category:'Feature request', priority:'Low',     status:'Closed',      assigned:'Unassigned',created:'3d ago',     desc:'Customer wants to migrate 200 historical tickets from Zendesk via CSV upload.' },
    { id:'TK-034', subject:'Webhook not firing on status change',          category:'Bug report',     priority:'High',     status:'Resolved',    assigned:'Sipho N.',  created:'4d ago',     desc:'Status change webhooks stopped firing after the v2.2 deploy. Affects 12 integrations.' },
  ],
  users: [
    { id:1, name:'Wandile N.',   email:'admin@ticketai.io',  role:'admin', status:'active',   lastSeen:'Now'     },
    { id:2, name:'Sipho N.',     email:'sipho@ticketai.io',  role:'agent', status:'active',   lastSeen:'5m ago'  },
    { id:3, name:'Amara O.',     email:'amara@ticketai.io',  role:'agent', status:'active',   lastSeen:'1h ago'  },
    { id:4, name:'Yara H.',      email:'yara@ticketai.io',   role:'agent', status:'active',   lastSeen:'2h ago'  },
    { id:5, name:'Thabo C.',     email:'thabo@acme.co',      role:'user',  status:'active',   lastSeen:'2h ago'  },
    { id:6, name:'Lee M.',       email:'lee.m@ticketai.io',  role:'user',  status:'inactive', lastSeen:'3d ago'  },
  ],
  settings: {
    autoAssignCritical: true,
    workloadBalancing:  true,
    skillBasedRouting:  true,
    slaBreachAlerts:    true,
    emailOnNew:         true,
    slackOnCritical:    true,
    dailyDigest:        false,
  },
};

// ── Health ─────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status:'ok', ts: new Date().toISOString() }));

// ── Tickets ────────────────────────────────────────────────────────
app.get('/api/tickets', (_, res) => res.json(store.tickets));

app.post('/api/tickets', (req, res) => {
  const { subject, desc, product, severity, category, priority, team } = req.body;
  if (!subject) return res.status(400).json({ error: 'subject required' });
  const id = 'TK-' + (parseInt(store.tickets[0].id.split('-')[1]) + 1).toString().padStart(3,'0');
  const ticket = { id, subject, category: category||'General', priority: priority||severity||'Medium',
    status:'Open', assigned:'Unassigned', created:'Just now', desc: desc||'' };
  store.tickets.unshift(ticket);
  res.status(201).json(ticket);
});

app.patch('/api/tickets/:id/status', (req, res) => {
  const t = store.tickets.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({ error:'not found' });
  t.status = req.body.status || t.status;
  t.assigned = req.body.assigned || t.assigned;
  res.json(t);
});

// ── Users ──────────────────────────────────────────────────────────
app.get('/api/users', (_, res) => res.json(store.users));

app.patch('/api/users/:id', (req, res) => {
  const u = store.users.find(x => x.id === parseInt(req.params.id));
  if (!u) return res.status(404).json({ error:'not found' });
  if (req.body.role)   u.role   = req.body.role;
  if (req.body.status !== undefined) u.status = req.body.status;
  res.json(u);
});

// ── Analytics ──────────────────────────────────────────────────────
app.get('/api/analytics', (_, res) => {
  const all = store.tickets;
  res.json({
    total:    all.length,
    open:     all.filter(t=>t.status==='Open'||t.status==='In progress').length,
    resolved: all.filter(t=>t.status==='Resolved').length,
    critical: all.filter(t=>t.priority==='Critical').length,
    avg_resolution: '3.2h',
    ai_accuracy: 94,
    fcr: 71,
    csat: 4.7,
    volume_by_day: { Mon:8, Tue:12, Wed:7, Thu:15, Fri:11, Sat:4, Sun:6 },
    agents: [
      { name:'Sipho N.', resolved:24, avg_time:'2.8h' },
      { name:'Amara O.', resolved:19, avg_time:'3.5h' },
      { name:'Lee M.',   resolved:17, avg_time:'4.1h' },
      { name:'Yara H.',  resolved:22, avg_time:'3.1h' },
    ],
  });
});

// ── Settings ────────────────────────────────────────────────────────
app.get('/api/settings', (_, res) => res.json(store.settings));
app.patch('/api/settings', (req, res) => {
  Object.assign(store.settings, req.body);
  res.json(store.settings);
});

// ── AI classify (Anthropic proxy) ──────────────────────────────────
app.post('/api/classify', async (req, res) => {
  const { subject, desc, product, severity } = req.body;
  if (!subject && !desc) return res.status(400).json({ error: 'subject or desc required' });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

  // Fallback rule-based classifier if no API key set
  if (!ANTHROPIC_KEY) {
    const text = ((subject||'') + ' ' + (desc||'')).toLowerCase();
    let category='General', priority='Medium', team='Support', confidence=80, reason='Classified by keyword rules.';
    const tags = [];
    if (/database|server|down|outage|503|infra/.test(text))  { category='Infrastructure'; priority='Critical'; team='DevOps';      confidence=92; reason='Infrastructure keyword detected.'; tags.push('infra','outage'); }
    else if (/charg|refund|billing|invoice|payment/.test(text)) { category='Billing';    priority='High';     team='Finance';     confidence=95; reason='Billing keyword detected.';        tags.push('billing','refund'); }
    else if (/login|sso|auth|password|access|401/.test(text)) { category='Security';     priority='High';     team='Security';    confidence=91; reason='Authentication issue detected.';   tags.push('auth','security'); }
    else if (/bug|error|crash|fail|broken/.test(text))        { category='Bug report';   priority='High';     team='Engineering'; confidence=90; reason='Bug keyword detected.';            tags.push('bug','engineering'); }
    else if (/feature|request|add|improve|suggest/.test(text)){ category='Feature request'; priority='Low';  team='Product';     confidence=87; reason='Feature request detected.';        tags.push('feature','product'); }
    else if (/ui|ux|design|display|dark mode/.test(text))     { category='UX/UI';        priority='Low';      team='Design';      confidence=85; reason='UI/UX keyword detected.';          tags.push('ux','design'); }
    if (/urgent|critical|emergency|asap/.test(text)) priority = 'Critical';
    return res.json({ category, priority, team, confidence, reason, tags });
  }

  try {
    const prompt = `You are a support ticket classifier. Analyze this ticket and respond ONLY in JSON (no markdown, no preamble) with this exact structure:
{"category":"one of: Bug report|Billing|Infrastructure|Security|Feature request|UX/UI","priority":"one of: Critical|High|Medium|Low","team":"one of: Engineering|Finance|DevOps|Security|Product|Design","confidence":85,"reason":"one short sentence","tags":["tag1","tag2","tag3"]}

Ticket subject: ${subject||'(none)'}
Description: ${desc||'(none)'}
Product area: ${product||'(none)'}
Severity: ${severity||'(none)'}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role:'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const raw = data.content.map(i => i.text||'').join('').replace(/```json|```/g,'').trim();
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Classify error:', err.message);
    res.status(500).json({ error: 'Classification failed: ' + err.message });
  }
});

// ── Export ─────────────────────────────────────────────────────────
app.get('/api/export/tickets.csv', (_, res) => {
  const header = 'id,subject,category,priority,status,assigned,created\n';
  const rows = store.tickets.map(t =>
    `${t.id},"${t.subject}",${t.category},${t.priority},${t.status},"${t.assigned}","${t.created}"`
  ).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="tickets.csv"');
  res.send(header + rows);
});

// ── SPA fallback ───────────────────────────────────────────────────
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`TicketAI → http://localhost:${PORT}`));
