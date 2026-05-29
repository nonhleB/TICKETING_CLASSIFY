# Trackt — Issue Ticketing System

A full-stack ticketing app built with Node.js + Express (API) and React + Vite (frontend).

## Features

- 📋 Create, view, edit, and delete tickets
- 🔍 Filter by status, priority, category, and assignee
- 💬 Comment system with author names
- 📊 Dashboard with stats and activity feed
- 🎨 Dark-mode industrial UI with monospace accents
- ⚡ Live reactive updates (no page refresh needed)

## Local Development

```bash
# Install all dependencies
cd client && npm install
cd ../server && npm install

# Run server (port 3001)
cd server && npm run dev

# Run client (port 5173) in another terminal
cd client && npm run dev
```

Open http://localhost:5173

## Deploy to Render

### Option 1 — One-click via render.yaml
1. Push this repo to GitHub
2. Go to https://render.com → New → Blueprint
3. Connect your repo — Render reads `render.yaml` automatically

### Option 2 — Manual Web Service
1. New → Web Service → connect repo
2. **Build Command:**
   ```
   npm install && cd client && npm install && npm run build && cd ../server && npm install
   ```
3. **Start Command:**
   ```
   cd server && node index.js
   ```
4. Set environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (Render auto-sets this too)

## Architecture

```
ticketing-app/
├── server/          Express REST API (in-memory store)
│   └── index.js     Routes: /api/tickets, /api/stats
├── client/          React + Vite SPA
│   └── src/
│       ├── pages/   Dashboard, TicketList, TicketDetail
│       ├── components/ TicketCard, CreateTicketModal, Sidebar
│       └── context/ ToastContext
└── render.yaml      Render deployment config
```

> **Note:** Data is stored in-memory. For persistence, swap in a database (SQLite, Postgres) in `server/index.js`.
