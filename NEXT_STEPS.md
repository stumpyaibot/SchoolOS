# Architecture Decisions & Next Steps

This document records the technical decisions made when setting up the local-first backend, and tracks implementation progress.

> Originally started as "why not Supabase?" — we chose SQLite + Express for zero-ops simplicity.

## Your System

| Spec | Value |
|------|-------|
| CPU | Apple M3 Pro |
| RAM | 18 GB |
| Docker | ❌ Not installed |
| PostgreSQL | ❌ Not needed (using SQLite) |
| Ollama | ✅ Installed — `gemma3:4b` |

---

## 1. Database — Options Compared

| Option | Install Effort | Good For | Verdict |
|--------|---------------|----------|---------|
| **SQLite** | `npm install better-sqlite3` | Single-user local apps | ✅ **Recommended** |
| PostgreSQL | `brew install postgresql` + config | Multi-user production | Overkill for now |
| Supabase Local | Docker required | Full Supabase dev | Too heavy |
| JSON file (lowdb) | Zero | Quick prototypes | Too fragile for real data |
| PocketBase | Download a binary | Small apps with auth | Nice but adds complexity |

**Winner: SQLite.** Zero services to manage. Just a file (`schoolos.db`). The same SQL schema we already wrote translates directly. When you eventually need multi-user, migrating to PostgreSQL is straightforward.

---

## 2. LLM — Ollama Setup

Your M3 Pro with 18GB is ideal for Ollama. Recommended models:

| Model | Size | Good For |
|-------|------|----------|
| **gemma3:4b** | ~3GB | Fast responses, good for summarizing school comms |
| llama3.2:3b | ~2GB | Lighter alternative |
| gemma3:12b | ~8GB | Higher quality but slower |
| mistral:7b | ~4GB | Good all-rounder |

**Recommendation: `gemma3:4b`** — fast enough for real-time chat, smart enough to summarize school emails and answer questions about your children. You can always upgrade to 12b later.

---

## 3. Email Ingestion — Options Compared

| Option | How It Works | Complexity |
|--------|-------------|------------|
| **Gmail IMAP polling** | Server polls Gmail every N minutes via IMAP | ✅ Simple, one App Password |
| Gmail API (OAuth) | REST API with OAuth2 flow | More robust but complex setup |
| Email forwarding | Forward to a webhook | Needs a public URL (ngrok) |
| Manual import | Copy-paste emails | Not automated |

**Winner: Gmail IMAP polling.** You create a Gmail App Password, our backend polls every 2 minutes for new emails from school-related senders, and auto-creates feed items.

---

## 4. WhatsApp Ingestion — Options Compared

| Option | How It Works | Complexity |
|--------|-------------|------------|
| **WhatsApp chat export + import** | Export from WhatsApp → upload to app | ✅ Simplest, works now |
| **File watcher on WhatsApp export folder** | Monitor a folder for new exports | Low — no API needed |
| whatsapp-web.js | Unofficial library, QR scan | Fragile, against ToS |
| WhatsApp Business API | Meta-approved | Requires business account + review |
| Green API / similar | Third-party service | Monthly cost, dependency |

**Winner: WhatsApp export + import.** WhatsApp → Export Chat → a text file. Our backend parses it and creates feed items. No API keys, no fragile libraries, no ToS violations. Later we can add a folder watcher for semi-automation.

---

## Proposed Architecture

```
┌─────────────────────────────────────────┐
│  React App (Vite) — localhost:5173      │
│  Current frontend, unchanged            │
└──────────────┬──────────────────────────┘
               │ HTTP (fetch)
┌──────────────▼──────────────────────────┐
│  Express.js API Server — localhost:3001 │
│                                         │
│  /api/feed      → SQLite queries        │
│  /api/events    → SQLite queries        │
│  /api/messages  → SQLite queries        │
│  /api/ai        → Ollama (localhost)    │
│  /api/ingest    → Parse uploaded files  │
│                                         │
│  Background jobs:                       │
│    ⏰ Gmail IMAP poll (every 2 min)     │
└──────────────┬──────────┬───────────────┘
               │          │
    ┌──────────▼──┐  ┌────▼──────────────┐
    │  SQLite DB  │  │  Ollama           │
    │  schoolos.db│  │  localhost:11434  │
    │  (local file│  │  gemma3:4b        │
    └─────────────┘  └───────────────────┘
```

Everything runs on your machine. No cloud. No accounts (except Gmail App Password for email).

---

## Implementation Steps

### Phase 1: Core Backend ✅ Complete
1. ~~Install Ollama + pull `gemma3:4b`~~
2. ~~Create Express.js server in `/server`~~
3. ~~Set up SQLite with our existing schema~~
4. ~~Seed with current mock data~~
5. ~~Wire React app to call API instead of mock data~~

### Phase 2: Email Ingestion ✅ Complete
6. ~~Set up Gmail IMAP poller~~
7. ~~Parser extracts school emails → creates feed items~~
8. Teacher approval flow for ingested items — *deferred*

### Phase 3: WhatsApp Ingestion 🟡 Partial
9. ~~WhatsApp export parser (parses the `.txt` export format)~~
10. ~~Upload endpoint in the server~~
11. UI for uploading/reviewing WhatsApp imports — *not started*

### Phase 4: AI Assistant ✅ Complete
12. ~~Wire AI assistant to call Ollama via `/api/ai`~~
13. ~~System prompt with context from your children's data~~
14. ~~Search + summarize using the local model~~

---

## What You Need To Do (once I'm done building)

1. **Install Ollama:** Download from [ollama.com](https://ollama.com) → drag to Applications → run it
2. **Pull a model:** `ollama pull gemma3:4b`
3. **Gmail App Password:** Google Account → Security → 2-Step → App Passwords → generate one
4. **WhatsApp:** Open a class group → ⋮ → Export Chat → save the `.txt` file
