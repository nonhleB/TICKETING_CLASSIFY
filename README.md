# TicketAI — Smart Classification Engine

AI-powered ticket classification and routing engine. Built with Node/Express + Claude Sonnet.

## Features
- 🔐 Role-based access: Admin / Agent / User
- 🤖 Real AI classification via Claude Sonnet (server-side proxy)
- 📊 Analytics dashboard with charts
- 🎫 Full ticket management with modal detail view
- ⚙️ Settings & routing rules
- 📋 Notifications feed

## Local development

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... npm start
# → http://localhost:3000
```

Without an API key the classifier falls back to keyword-based rules (fully functional demo mode).

## Deploy to Render

1. Push this folder to a GitHub repo.
2. Go to https://render.com → **New → Web Service**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — just click **Deploy**
5. In the Render dashboard → **Environment** tab, add:
   - `ANTHROPIC_API_KEY` = your key from https://console.anthropic.com

## Project structure

```
ticketai/
├── server.js          # Express API + Anthropic proxy
├── package.json
├── render.yaml        # Render deployment config
└── public/
    └── index.html     # Full SPA frontend
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tickets | List all tickets |
| POST | /api/tickets | Create ticket |
| PATCH | /api/tickets/:id/status | Update ticket |
| POST | /api/classify | AI classify (proxies Anthropic) |
| GET | /api/analytics | Dashboard stats |
| GET | /api/users | Team members |
| PATCH | /api/users/:id | Update user role |
| GET /PATCH | /api/settings | Routing config |
| GET | /api/export/tickets.csv | CSV export |
