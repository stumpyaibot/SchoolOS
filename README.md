# SchoolOS 🏫

> **One app. Every update. Every class. Every child. — Powered by AI so nobody has to change how they work.**

SchoolOS is an AI-powered school-home communication platform that replaces the fragmented mess of WhatsApp groups, buggy portfolio apps (Bloomz), and scattered emails with a single, intelligent mobile web app.

Built for **EtonHouse Broadrick (Singapore)** as a pilot — designed for international schools globally.

---

## ✨ What It Does

| For Parents | For Teachers |
|---|---|
| One feed for **all** children across classes | Post class updates in **< 30 seconds** |
| AI-summarised emails & WhatsApp messages | Keep using WhatsApp/email — AI ingests it |
| "What do I need to do?" action items | Response tracking & auto-reminders |
| AI assistant answers school questions 24/7 | Read receipts & engagement stats |
| Weekly digest — never miss anything | Structured messaging (no 10pm WhatsApp) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────┐
│  React + Vite (PWA)  — localhost:5173   │
│  Parent & Teacher views, role-switching │
└──────────────┬──────────────────────────┘
               │ HTTP (Vite proxy → /api)
┌──────────────▼──────────────────────────┐
│  Express.js API      — localhost:3001   │
│                                         │
│  /api/feed        → Feed items (CRUD)   │
│  /api/events      → Calendar events     │
│  /api/conversations → Messaging         │
│  /api/ai/chat     → AI assistant        │
│  /api/ingest/*    → Email & WhatsApp    │
│                                         │
│  Background: Gmail IMAP poll (2 min)    │
└──────────────┬──────────┬───────────────┘
               │          │
    ┌──────────▼──┐  ┌────▼──────────────┐
    │  SQLite     │  │  Ollama           │
    │  schoolos.db│  │  localhost:11434   │
    │  (local)    │  │  gemma3:4b        │
    └─────────────┘  └───────────────────┘
```

Everything runs on your machine. No cloud services required.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| **Backend** | Express.js 5, Node.js (ESM) |
| **Database** | SQLite via `better-sqlite3` |
| **AI/LLM** | Ollama (local) — `gemma3:4b` |
| **Email Ingestion** | IMAP polling via `imap-simple` + `mailparser` |
| **File Uploads** | Multer → local `server/uploads/` |
| **Remote Access** | Cloudflare Tunnel (for mobile testing) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (`node -v`)
- **Ollama** — [ollama.com](https://ollama.com) (optional, for AI features)

### 1. Clone & install

```bash
git clone https://github.com/stumpyaibot/SchoolOS.git
cd SchoolOS

# Frontend
cd app && npm install && cd ..

# Backend
cd server && npm install && cd ..
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your Gmail credentials (optional — for email ingestion)
```

### 3. Seed the database

```bash
cd server && npm run seed && cd ..
```

### 4. Run

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd app && npm run dev
```

Open **http://localhost:5173** in your browser.

### 5. Mobile access (optional)

```bash
# Requires: brew install cloudflared
./start-remote.sh
```

Open the tunnel URL on your phone → Share → **Add to Home Screen** for the PWA experience.

---

## 📁 Project Structure

```
SchoolOS/
├── app/                    # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── pages/          # Parent screens (HomeFeed, Calendar, etc.)
│   │   │   └── teacher/    # Teacher screens (Dashboard, NewPost, etc.)
│   │   ├── components/     # Shared layout components
│   │   ├── data/           # Mock data & fallbacks
│   │   ├── lib/            # Data access layer (API client)
│   │   └── types/          # TypeScript interfaces
│   └── public/             # PWA manifest & icons
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── index.js        # API routes & server entry
│   │   ├── db.js           # SQLite schema & connection
│   │   ├── seed.js         # Database seeding
│   │   ├── emailPoller.js  # Gmail IMAP polling
│   │   ├── emailParser.js  # Email content extraction & cleanup
│   │   ├── whatsappParser.js # WhatsApp export parser
│   │   ├── ingestRoutes.js # Ingestion API endpoints
│   │   ├── aiRoutes.js     # AI assistant (Ollama integration)
│   │   └── cleanupFeed.js  # Feed item deduplication
│   └── uploads/            # User-uploaded media files
├── mockups/                # UI design mockups (PNG + HTML)
├── samples/                # Bloomz screenshot samples (reference data)
├── supabase/               # Original Supabase schema (archived)
├── product_spec.md         # Full product specification
├── NEXT_STEPS.md           # Architecture decisions & roadmap
└── start-remote.sh         # Cloudflare tunnel launcher
```

---

## 📖 Documentation

- **[Product Spec](product_spec.md)** — Full vision, features, competitive analysis, roadmap
- **[Architecture & Next Steps](NEXT_STEPS.md)** — Technical decisions, implementation phases
- **[Frontend README](app/README.md)** — Frontend development guide
- **[Backend README](server/README.md)** — API reference & server setup

---

## 📱 Screens

**Parent App:**
Home Feed · Post Detail · Calendar · Event Detail · Messages · Chat Thread · AI Assistant · Class View · Media Gallery · Search · Settings

**Teacher App:**
Dashboard · New Post · Response Dashboard · Student Profile · Messages

---

## 📝 License

Private — not open source.
