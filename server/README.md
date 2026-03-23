# SchoolOS — Backend

Express.js API server with SQLite, email ingestion, and Ollama AI integration.

## Quick Start

```bash
npm install

# First time — seed the database with demo data:
npm run seed

# Start the server:
npm run dev      # → http://localhost:3001
```

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
# Gmail IMAP — for email ingestion (optional)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Ollama — for AI assistant (optional, defaults shown)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma3:4b
```

**Gmail App Password setup:** Google Account → Security → 2-Step Verification → App Passwords → generate one.

## API Routes

### Core Data

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/feed` | All feed items (newest first) |
| `GET` | `/api/feed/:id` | Single feed item |
| `POST` | `/api/feed` | Create feed item |
| `POST` | `/api/feed/:id/reactions` | Toggle reaction (❤️ 👏 🌟) |
| `POST` | `/api/feed/:id/read` | Mark as read |
| `GET` | `/api/events` | Calendar events |
| `GET` | `/api/events/:id` | Single event |
| `GET` | `/api/users/:id` | User profile |
| `GET` | `/api/students` | All students |
| `GET` | `/api/students/:id` | Single student |
| `GET` | `/api/classes` | All classes |
| `GET` | `/api/conversations` | User's conversations |
| `GET` | `/api/conversations/:id/messages` | Messages in a conversation |
| `POST` | `/api/conversations/:id/messages` | Send a message |
| `GET` | `/api/settings/:userId` | User settings |

### Ingestion

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ingest/whatsapp` | Upload WhatsApp export (multipart) |
| `POST` | `/api/ingest/email` | Webhook for forwarded emails |
| `POST` | `/api/ingest/check-now` | Manually trigger Gmail poll |
| `POST` | `/api/ingest/screenshot` | Upload Bloomz screenshots for OCR |

### AI

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Send a message to the AI assistant |

### File Uploads

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload a file (10MB max) |

Uploaded files are served from `/uploads/<filename>`.

## Database

SQLite database stored at `server/schoolos.db`. Schema is auto-created on first run via `src/db.js`.

Key tables:
- `users` — Parents, teachers, admins
- `students` — Student profiles
- `classes`, `class_students`, `teacher_classes` — Class structure
- `feed_items` — All posts, announcements, ingested content
- `reactions`, `read_receipts` — Engagement tracking
- `calendar_events` — School & class events
- `conversations`, `messages` — Direct messaging
- `user_settings` — Notification preferences
- `processed_emails` — Deduplication log for email ingestion

## Email Ingestion

The server polls Gmail via IMAP every 2 minutes for new school-related emails:

1. **Connects** to Gmail using App Password
2. **Fetches** unread emails from the last 3 days
3. **Parses** with AI (Ollama) to extract title, summary, dates, action items
4. **Cleans** forwarded headers, Bloomz boilerplate, email chains
5. **Creates** structured feed items

Trigger a manual check: `POST /api/ingest/check-now`

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with `--watch` (auto-restart on changes) |
| `npm start` | Start without watch |
| `npm run seed` | Seed database with demo data |

## Project Structure

```
server/
├── src/
│   ├── index.js          # Express app, all routes, server entry
│   ├── db.js             # SQLite connection & schema creation
│   ├── seed.js           # Demo data seeding
│   ├── emailPoller.js    # Gmail IMAP polling loop
│   ├── emailParser.js    # Email content extraction & AI parsing
│   ├── whatsappParser.js # WhatsApp chat export parser
│   ├── ingestRoutes.js   # /api/ingest/* endpoints
│   ├── aiRoutes.js       # /api/ai/* endpoints (Ollama)
│   └── cleanupFeed.js    # Feed deduplication utility
├── uploads/              # User-uploaded media files
├── schoolos.db           # SQLite database (auto-created)
├── start-tunnel.sh       # Cloudflare tunnel for email webhook
├── .env                  # Environment config (not in git)
└── package.json
```
