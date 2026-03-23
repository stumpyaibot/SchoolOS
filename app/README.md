# SchoolOS — Frontend

React + TypeScript + Vite PWA for parents and teachers.

## Quick Start

```bash
npm install
npm run dev      # → http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` requests to the backend at `localhost:3001`. Make sure the backend is running first (`cd ../server && npm run dev`).

## Tech Stack

| | |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build** | Vite 8 |
| **Styling** | Tailwind CSS 4 |
| **Routing** | React Router 7 |
| **Icons** | Lucide React |

## Project Structure

```
src/
├── App.tsx                 # Router & route definitions
├── main.tsx                # Entry point
├── index.css               # Global styles & Tailwind config
├── types/index.ts          # TypeScript interfaces
├── lib/
│   └── dataAccess.ts       # API client — all backend calls go through here
├── data/
│   ├── mockData.ts         # Parent-side mock/fallback data
│   └── teacherMockData.ts  # Teacher-side mock/fallback data
├── components/
│   └── layout/
│       ├── Header.tsx      # Top navigation bar
│       ├── BottomTabBar.tsx # Bottom tab navigation (parent)
│       └── TeacherNav.tsx   # Bottom tab navigation (teacher)
└── pages/
    ├── RoleSelect.tsx       # Landing — choose parent or teacher role
    ├── HomeFeed.tsx         # Main feed with morning digest
    ├── PostDetail.tsx       # Full post view with reactions
    ├── ActionDetail.tsx     # Action item response view
    ├── Calendar.tsx         # School & class events calendar
    ├── EventDetail.tsx      # Single event detail
    ├── Messages.tsx         # Conversation list
    ├── ChatThread.tsx       # Individual chat thread
    ├── AIAssistant.tsx      # AI chatbot (Ollama-powered)
    ├── ClassView.tsx        # Class feed & student work
    ├── MediaGallery.tsx     # Photo gallery / lightbox
    ├── Search.tsx           # Search across feed items
    ├── Settings.tsx         # Notification & language preferences
    └── teacher/
        ├── TeacherDashboard.tsx  # Teacher home — classes & stats
        ├── NewPost.tsx           # Compose new post with media
        ├── ResponseDashboard.tsx # Action item response tracking
        ├── StudentProfile.tsx    # Individual student view
        └── TeacherMessages.tsx   # Teacher message inbox
```

## Data Flow

The app uses a **data access layer** (`src/lib/dataAccess.ts`) that:
1. Calls the backend API (`/api/feed`, `/api/events`, etc.)
2. Falls back to local mock data if the API is unreachable
3. Maps API responses to TypeScript interfaces

This means the app works both with and without the backend running.

## PWA

The app includes PWA support:
- `public/manifest.json` — App manifest
- `public/icon-192.png` / `public/icon-512.png` — App icons
- `public/apple-touch-icon.png` — iOS home screen icon

To install on mobile: open the app in Safari → Share → **Add to Home Screen**.

## Proxy Config

Vite proxies API calls to the backend server (see `vite.config.ts`):

| Path | Target |
|---|---|
| `/api/*` | `http://localhost:3001` |
| `/uploads/*` | `http://localhost:3001` |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
