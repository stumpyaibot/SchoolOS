# SchoolOS — Product Specification

> **Version:** 1.0 (Final Architecture & Design Locked)
> **Date:** 14 March 2026
> **Author:** Jack + AI
> **Status:** 🟢 Approved for Development

---

## 1. Vision & Elevator Pitch

**SchoolOS** is an AI-powered, unified school-home communication platform that replaces the fragmented mess of WhatsApp groups, buggy portfolio apps, and scattered emails with a single, intelligent mobile app.

> *"One app. Every update. Every class. Every child. — Powered by AI so nobody has to change how they work."*

Parents open SchoolOS and instantly see everything about their children's school life — class updates, student work, upcoming events, school-wide announcements, and action items — all in one place. Parents can choose to receive all notifications via WhatsApp if that's their preferred channel — SchoolOS meets them where they already are. Teachers and admins can keep using the tools they already know (email, WhatsApp) while AI automatically pulls, structures, and routes that information into the right places.

---

## 2. The Problem

### 2.1 Current Reality (EtonHouse Broadrick, Singapore — Bloomz + WhatsApp + Email)

Communication is fractured across **3+ channels**:

| Channel | What It's Used For | Pain Points |
|---|---|---|
| **Bloomz** | Sharing student work/portfolios, class updates, scheduling parent-teacher meetings and 3-way conferences | Buggy, slow, cluttered UI, unreliable notifications, many features unused |
| **WhatsApp Groups** | Day-to-day logistics — PE days, library reminders, event details, last-minute changes | Noisy, unstructured, messages get buried, no read tracking, teacher boundaries blurred |
| **Email** | School-wide admin — re-enrollment, holidays, policy changes, formal communications | Easily missed, mixed with personal email, no easy action tracking, no response tracking |

### 2.2 What Bloomz Does Well (That We Must Match or Beat)

Based on deep analysis of Bloomz's feature set:

| Bloomz Feature | Quality | SchoolOS Target |
|---|---|---|
| Class feed with photos/videos | ⭐⭐⭐ Good | Must match — with better UX and speed |
| Student portfolios | ⭐⭐ Basic | Beat — richer media, per-student private sharing |
| Event calendar with RSVPs | ⭐⭐ Basic | Beat — with smart calendar sync and reminders |
| Volunteer coordination | ⭐⭐ Niche | Include in MVP — simple sign-up sheets |
| Parent-teacher conference scheduling | ⭐⭐⭐ Good | Match — with AI-suggested optimal slots |
| 250-language translation | ⭐⭐⭐⭐ Strong | Match — use AI for contextual translation |
| Parent-to-teacher messaging | ⭐⭐ Basic | Beat — structured in-app messaging, no need for WhatsApp DMs |
| Push + email + SMS delivery | ⭐⭐⭐ Good | Beat — add intelligent delivery routing |

### 2.3 What Bloomz Does Poorly (Our Opportunity)

- ❌ **Buggy and slow** — frequent crashes, unreliable notifications
- ❌ **No multi-child unified view** — must manually switch between classes
- ❌ **No AI** — everything is manual input, manual routing
- ❌ **No WhatsApp/email integration** — exists separately from the tools people actually use
- ❌ **No action-item tracking** — consent forms, RSVPs, excursion consent, expressions of interest are scattered across Google Forms, Bloomz, and email
- ❌ **No weekly digest** — parents who miss things stay lost
- ❌ **US-centric design** — not optimized for Singapore international school workflows
- ❌ **No smart prioritization** — all messages feel the same importance

### 2.4 Core Pain Points

**For Parents:**
- Information scattered across 3+ apps — easy to miss something important
- Parents with multiple children must track different class groups across different apps
- No single "source of truth" for what's happening this week
- No way to quickly see "what do I need to action right now?"
- Can't easily look back or search past communications

**For Teachers:**
- Posting the same update in multiple places (Bloomz + WhatsApp + sometimes email)
- No visibility into whether parents actually read the message
- WhatsApp blurs professional/personal boundaries — messages at 10pm
- Repetitive questions from parents who missed a message

**For School Administration:**
- No unified analytics on parent engagement
- Difficult to ensure critical information reaches all parents
- No structured way to collect responses — consent forms for excursions, RSVPs for events, re-enrollment confirmations, expressions of interest for programs are scattered across Google Forms, Bloomz, and email
- Compliance and record-keeping is manual and fragmented

### 2.5 Why Now?

- **Market is growing fast** — Parent-teacher communication software market ~$715M (2025), 15% CAGR
- **Asia-Pacific is the fastest-growing region** for EdTech adoption
- **Singapore** has 95%+ smartphone penetration and tech-savvy parents
- **AI is now production-ready** — LLMs can parse, summarize, translate, and route information at scale
- **Existing tools are US-centric** — none are purpose-built for Singapore international schools
- **Bloomz is showing cracks** — buggy UX + no innovation creates a switching window

---

## 3. Target Users

### 3.1 User Personas

#### 👨‍👩‍👧‍👦 Parent (Primary User)
- **Profile:** Has 1-3 children, possibly in different classes/grades
- **Needs:** Single dashboard for all children, quick overview of what's happening, action items
- **Frustration:** "I missed the PE reminder because it was buried in WhatsApp"
- **Device:** Primarily mobile (iOS/Android)

#### 👩‍🏫 Class Teacher
- **Profile:** Responsible for one class of 15-25 students
- **Needs:** Post class updates, share student work/photos, send reminders, see who's read what, schedule parent-teacher meetings and 3-way conferences (teacher + parent + student), send parents requests about homework or things to submit, get consent for excursions, notify about dress-up days, send expressions of interest for programs, reminders for sports tournaments
- **Frustration:** "I have to post the same thing on Bloomz AND WhatsApp"
- **Device:** Mobile + Desktop/Tablet

#### 🏫 School Administrator
- **Profile:** Principal, VP, admin staff
- **Needs:** Send school-wide announcements, collect responses (consent for excursions, dress-up day notices, expressions of interest for upcoming programs, sports tournament reminders), track engagement, manage calendar
- **Frustration:** "We emailed about re-enrollment but 30% of parents didn't respond"
- **Device:** Primarily desktop, some mobile

#### 👦 Student (Phase 2)
- **Profile:** Older students (age 10+) who can access age-appropriate content
- **Needs:** See their own assignments, class updates, school events
- **Note:** Content must be filtered/segregated from parent-only communications
- **Device:** Mobile + School devices

### 3.2 User Hierarchy & Permissions

```
School Admin (Top Level)
├── Can see & manage everything school-wide
├── Can create school-wide announcements
├── Can manage teachers, classes, parents
│
├── Teacher (Class Level)
│   ├── Can post to their own class(es)
│   ├── Can share student work (class-wide or per-student)
│   ├── Can send class-level reminders & action items
│   └── Can see read receipts for their class
│
└── Parent (Consumer Level)
    ├── Can view updates for their children's classes
    ├── Can respond to action items
    ├── Can message teachers (structured, not free chat)
    └── Cannot post to the class feed
```

---

## 4. AI Strategy — The Key Differentiator

> **Core Insight:** Teachers and admins shouldn't HAVE to change their workflows — AI meets them where they are. But the UX should be so magical that they'll WANT to switch.

### 4.1 AI-Powered Ingestion (The "Magic Bridge")

The single most differentiating feature: SchoolOS uses AI to automatically pull, parse, and structure information from existing channels — so schools can adopt gradually without a hard cut-over.

#### 📧 Email Ingestion
- School connects their email (e.g. `admin@school.edu.sg`) via OAuth or email forwarding
- AI scans incoming school-wide emails and:
  - **Extracts** key information (dates, events, deadlines, action items)
  - **Categorizes** (announcement, action required, FYI, holiday notice)
  - **Creates** structured posts in the SchoolOS feed automatically
  - **Identifies** which parents/classes the email applies to
- Admin reviews + approves AI-generated posts before they go live (or sets auto-approve for trusted senders)

#### 💬 WhatsApp Ingestion
- Teachers can **forward WhatsApp messages** to a SchoolOS number/bot
- AI parses the forwarded message and:
  - **Extracts** the key info (e.g. "PE tomorrow, bring kit")
  - **Creates** a structured reminder in the class feed
  - **Sets** appropriate notification priority
- Alternatively: teachers add the SchoolOS bot to their class WhatsApp group (read-only) and AI auto-extracts relevant updates
- **Privacy guardrail:** Only teacher/admin messages are processed, not parent messages

#### 📸 Photo/Document OCR Ingestion
- Based on real-world Whatsapp/Email samples, critical dates (like "Book Week" or "Camp Info Sessions") are frequently sent *only* inside attached images or PDFs.
- For MVP, the ingestion engine **must include basic OCR** to extract text from image attachments and PDF files attached to emails/WhatsApp messages.
- AI parses the extracted text from the attachment alongside the main message body to find dates, deadlines, and logistics.
- *Note on student work photos:* Images not containing text updates (like photos of children playing) are shared directly without data extraction processing.

### 4.2 AI-Powered Smart Features

#### 🧠 Smart Compose (For Teachers)
- Teacher starts typing a post → AI suggests completion
- AI can draft posts from bullet points: "PE tomorrow, bring shoes" → polished class update
- Suggests appropriate tags, priority level, and target audience
- Auto-generates translations for multilingual classrooms

#### 📋 Smart Summary & Weekly Digest
- AI generates a personalized **weekly digest per family** summarizing:
  - Key announcements they might have missed
  - Upcoming events for each child
  - Pending action items
  - Highlights of student work shared
- Parents can ask the AI: *"What do I need to do this week?"*

#### 🔔 Intelligent Notification Routing *(⏸️ Pending — v2)*
- *Parked for Phase 2 — will revisit together*
- Initial thought: AI learns parent engagement patterns and optimizes delivery channel (push/in-app/SMS/WhatsApp escalation)
- For MVP: parents manually choose their notification preferences (including WhatsApp delivery)

#### 🌐 Contextual Translation
- Beyond basic translation: AI provides **contextual, natural translations**
- Understands school-specific jargon (e.g. "PSLE", "CCA", "ECA")
- Parent can read the entire app in their preferred language
- Teacher posts once in English → AI translates for each parent's language preference

#### 🤖 Parent Assistant (Chatbot) — *Includes search functionality*
- In-app AI assistant parents can ask questions to:
  - *"What's happening at school this Friday?"*
  - *"Did Ms. Chen share any photos this week?"*
  - *"What time does the assembly start tomorrow?"* (Answers based on ingested WhatsApps/Emails)
  - *"Does Leo need to wear his PE kit or regular uniform today?"*
- Pulls answers from all available data (feed, calendar, action items, past messages, and crucially, the hidden logistics extracted via AI ingestion).
- **Data scoping:** Parents can ONLY see information that has been shared with them — the chatbot strictly respects permission boundaries.
- **Strict Fallbacks (Anti-Hallucination):** If the AI's confidence is low regarding logistics or dates, it must fallback to: *"I'm not sure, please ask the teacher or check the calendar."* (No hallucinated event dates allowed).
- Reduces repetitive questions to teachers (like parents asking each other for assembly times in WhatsApp group chats).
- Natural language understanding — no keyword matching needed

### 4.3 AI Integration Summary

| AI Feature | User Benefit | Workflow Impact |
|---|---|---|
| Email ingestion | School emails auto-appear in the feed | Admin doesn't change how they email |
| WhatsApp ingestion | WhatsApp reminders auto-appear in feed | Teacher keeps using WhatsApp if they want |
| Smart compose | Teachers post faster, better quality | Saves 5-10 min per post |
| Weekly digest | Parents never miss anything | Automatic, zero effort |
| Smart notifications | Less noise, nothing critical missed | AI handles routing (v2) |
| Contextual translation | Every parent reads in their language | Teacher posts once |
| Parent assistant | Answers questions + search 24/7 | Reduces teacher message load |

---

## 5. Core Features (MVP — v1.0)

### 5.1 Unified Feed

The heart of the app. A single, chronological feed aggregating **all** communication.

- **Sources:** Teacher posts, admin announcements, AI-ingested emails and WhatsApp messages
- **Filterable by:** Child, class, urgency
- **Each item shows:** Source (teacher name, school), timestamp, read/unread status
- **Rich media:** Photos, videos, documents, links
- **Pinned items:** Important items pinned to top by sender
- **Ingested items:** When info comes from email or WhatsApp, it's displayed as a normal post with a subtle source indicator (e.g. "via Email" or "via WhatsApp") so parents know the origin

### 5.2 Class

Dedicated view for each child's class — replaces Bloomz's portfolio and class feed (but better).

- Teachers post updates with text, photos, videos — **3 taps to share a photo**
- Each post tagged to a class (optionally to specific students)
- **Student Work Showcase:** Private area where teacher shares individual student work — visible only to that child's parents
- **Reactions:** Parents can react (❤️ 👏 🌟) — engagement without noise
- **Media gallery:** Browse all shared photos/videos by class, date, or child
- **Full-size downloads:** Parents can download original full-resolution photos (e.g. of their child's class work)

### 5.3 Announcements, Reminders & Action Items

Replaces WhatsApp groups, email blasts, and scattered Google Forms. One unified section for all outbound communication and response collection.

**Announcements & Reminders:**
- **School-wide announcements:** Posted by admin (or ingested from email)
- **Class reminders:** Posted by teacher (or ingested from WhatsApp)
- **Scheduling:** Posts can be scheduled in advance
- **Recurring reminders:** Set weekly repeats (e.g. "Library day every Wednesday")
- **Priority levels:** 🔴 Urgent / 🟡 Important / 🟢 FYI — affects notification behavior
- **Push notification controls:** Parents choose how they receive notifications for each priority level

**Action Items & Responses:**
- Create **actionable posts** that require a parent response
- Response types: Yes/No, RSVP, Form submission, File upload, Acknowledgement
- Use cases: consent for excursions, dress-up day notices, expressions of interest for programs, sports tournament sign-ups, volunteer requests, items-to-bring lists
- **Response dashboard:** Who responded, who hasn't, response rates
- **Auto-reminders** to non-respondents (configurable cadence)
- Dedicated **"Action Required"** section in parent app — nothing falls through the cracks

**Volunteer & Sign-Up Sheets:**
- Teacher/admin creates a sign-up sheet (e.g. "Field trip chaperones needed — 3 spots")
- Items to bring lists (e.g. "Class party: bring plates, cups, napkins")
- Parents claim spots — first come, first served or teacher-approved
- Automatic notifications when spots fill up or items are claimed

### 5.4 School Calendar

Shared calendar aggregating all school events, **including parent-teacher meeting scheduling**.

- School-wide events (holidays, assemblies, sports days)
- Class-specific events (field trips, presentations, special days)
- **Optional device sync:** Export to Google Calendar / Apple Calendar
- **Filterable** by child/class
- Events extracted from emails and announcements auto-added to calendar
- **Countdown reminders** before events

**Parent-Teacher Meetings & 3-Way Conferences:**
- Teachers set available time slots for parent-teacher meetings and 3-way conferences (teacher + parent + student)
- Parents choose a slot (one per child)
- Automatic reminders before the meeting
- Easy rescheduling with notification to both parties
- All bookings visible in the calendar

### 5.5 Weekly Digest (AI-Generated)

Personalized summary for every family, generated automatically.

- Delivered Sunday evening (configurable)
- Per-child breakdown for multi-child families
- Covers: Key announcements, upcoming events, pending action items, student work highlights
- Push notification + in-app summary
- One-tap to take action on any pending items

### 5.6 Direct Messaging (Structured)

Replaces WhatsApp DMs between parents and teachers.

- Parents can message their child's teacher **within the app**
- **Not real-time chat** — more like structured async messaging
- School admin can see message volume (not content) for workload insights
- **No parent-to-parent messaging** (intentional — avoids recreating WhatsApp groups)

### 5.7 Parent AI Assistant (Chatbot)

In-app AI assistant that parents can ask questions — includes search functionality.

- *"What's happening at school this Friday?"*
- *"Did Ms. Chen share any photos this week?"*
- *"What do I need to bring for the field trip?"*
- *"When is the school concert?"*
- Pulls answers from feed, calendar, action items, and past messages
- **Data scoping:** Parents can ONLY see information that has been shared with them — the chatbot strictly respects permission boundaries
- Reduces repetitive questions to teachers
- Natural language understanding — no keyword matching needed

---

## 6. Feature Roadmap (Post-MVP)

### Phase 2 — Engagement & Intelligence
- [ ] **Student Portal** — Age-appropriate view for older students
- [ ] **Analytics Dashboard** — Parent engagement metrics, read rates, response rates
- [ ] **Behavior Tracking** — PBIS-style positive/negative behavior logging (like Bloomz/ClassDojo)
- [ ] **Attendance Tracking** — Mark daily attendance, notify parents of absences
- [ ] **AI Learning** — System learns school patterns, predicts common questions, pre-generates answers

### Phase 3 — Platform Expansion
- [ ] **Homework & Assignments** — Teachers assign, students submit, parents track
- [ ] **Report Cards / Progress Reports** — Digital distribution with e-signatures
- [ ] **Fee Management** — Payment reminders, fee tracking
- [ ] **Transport Tracking** — School bus GPS for parents
- [ ] **Advanced AI Assistant** — Parent can have richer conversations about child's progress

### Phase 4 — Multi-School SaaS
- [ ] **White-labeling** — Schools brand the app with their logo/colors
- [ ] **Multi-school Admin** — Central management for school groups
- [ ] **API & Integrations** — Connect with SIS, Google Workspace, Microsoft 365
- [ ] **Marketplace** — Third-party integrations (lunch ordering, uniform shops, enrichment programs)

---

## 7. Competitive Landscape

### 7.1 Comprehensive Feature Comparison

| Feature | **SchoolOS** | Bloomz | ClassDojo | Seesaw | ParentSquare | Remind | LittleLives |
|---|---|---|---|---|---|---|---|
| **Class feed** | ✅ AI-enhanced | ✅ | ✅ | ✅ | Partial | ❌ | Partial |
| **Student portfolios** | ✅ Private per-student | ✅ Basic | ✅ | ✅ Core | ❌ | ❌ | Partial |
| **School announcements** | ✅ + AI from email | ✅ | ✅ | Partial | ✅ Core | ✅ | ✅ |
| **Action items/forms** | ✅ With auto-reminders | Partial | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Calendar with sync** | ✅ AI-populated | ✅ Basic | Partial | ❌ | ✅ | ❌ | Partial |
| **Read receipts** | ✅ + Smart routing | Partial | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Multi-child unified view** | ✅ Core design | ❌ | ❌ | ❌ | ✅ | Partial | Partial |
| **AI weekly digest** | ✅ Personalized | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Email ingestion** | ✅ Core | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **WhatsApp ingestion** | ✅ Core | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AI smart compose** | ✅ | ❌ | ❌ | Partial | ❌ | ❌ | ❌ |
| **Parent AI assistant** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Contextual translation** | ✅ AI-powered | ✅ 250 langs | ✅ 35 langs | ✅ | ✅ 100 langs | ✅ 100 langs | Partial |
| **Behavior tracking** | Phase 2 | ✅ | ✅ Core | ❌ | ❌ | ❌ | ❌ |
| **Volunteer coordination** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **P-T conference booking** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Quiet hours/boundaries** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Smart notifications** | ✅ AI-routed | Basic | Basic | Basic | Multi-channel | Basic | Basic |
| **Smart search** | ✅ NLP-powered | ❌ | ❌ | ❌ | Basic | ❌ | ❌ |
| **APAC focus** | ✅ | ❌ US | ❌ US | ❌ US | ❌ US | ❌ US | ✅ SG/MY |
| **Target** | K-12 International | K-12 | K-8 | PreK-6 | K-12 District | K-12 | Preschool |

### 7.2 Key Differentiators (Why SchoolOS Wins)

1. **WhatsApp & Email Ingestion** — Info already flowing through WhatsApp and email can be pulled into the app. Teachers don't HAVE to change (but the UX should make them want to).
2. **Multi-child, single-view** — Purpose-built for parents with multiple children across classes. Not a tab-switching afterthought.
3. **Replaces 3 tools, not 1** — Combines portfolios + messaging + announcements + action-items + calendar. Competitors do 1-2 of these well.
4. **AI Assistant for Parents** — No competitor offers a chatbot that can answer "when is the school concert?" from historical data.
5. **Parent-controlled notifications** — Parents choose exactly how and when they get notified, including via WhatsApp. No unwanted notifications.
6. **Singapore-first** — Designed for Singapore international schools first, with multilingual and cultural considerations.
7. **Minimalist, beautiful UX** — Premium design that parents actually enjoy using. Not a clunky enterprise tool.
8. **Gradual migration** — Schools can keep using email/WhatsApp during transition. The app ingests existing communication, so there's no hard cut-over needed.

---

## 8. User Experience

### 8.1 Parent App — Key Screens

```
┌─────────────────────────────────────────────┐
│               HOME / FEED                    │
│                                              │
│  [All] [Lily - 2A] [Max - 4B]               │
│                                              │
│  🔴 2 Action Items Required                  │
│                                              │
│  ── TODAY ─────────────────                   │
│  📸 Ms. Chen (Class 2A)                      │
│     "Lily's art project - watercolors!"      │
│     [Photo] [Photo] [Photo]                  │
│     ❤️ 12  👏 5                               │
│                                              │
│  📢 School Admin  ⚡ via Email               │
│     "Friday 14 March — Public Holiday"       │
│     📌 Pinned                                │
│                                              │
│  📋 Mr. Tan (Class 4B)                       │
│     "Field trip consent form — due Wed"      │
│     [✅ Respond Now]                          │
│                                              │
│  💬 Ms. Chen (Class 2A)  ⚡ via WhatsApp     │
│     "Reminder: PE tomorrow, bring kit"       │
│                                              │
│  🤖 Weekly Digest Available                  │
│     "Tap to see your week summary"           │
│                                              │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │Home │ │Class│ │ Cal │ │ Msg │ │ 🤖  │  │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │
└─────────────────────────────────────────────┘
```

**Key screens:**
1. **Home Feed** — All updates, filterable by child
2. **Class** — Dedicated view of class updates and student work for each child
3. **Calendar** — School & class events, P-T meeting scheduling
4. **Messages** — Structured parent ↔ teacher messaging
5. **AI Assistant** — Ask questions, get summaries, search across all history
6. **Settings & Preferences** — Notification routing (Push/Email/WhatsApp), quiet hours, language selection, and linked child profiles

### 8.2 Teacher App — Key Screens

1. **Class Feed** — View and manage posts for their class
2. **Compose** — Create posts (with optional AI assistance)
3. **Insights** — Read receipts, engagement stats, pending responses
4. **Messages** — Parent communications
5. **Quick Actions** — Forward from WhatsApp, snap a photo, create a sign-up
6. **Settings & Preferences** — Notification preferences, active hours (do not disturb), and display language

### 8.3 Admin Dashboard (Web)

1. **School Feed** — All posts across all classes
2. **AI Inbox** — Review AI-generated summaries before they go live (approve/edit/reject)
3. **Compose** — School-wide announcements and action items
4. **Analytics** — Engagement metrics, response rates, delivery rates by class
5. **People** — Manage teachers, parents, students, classes
6. **Settings & Configuration** — School profile, branding/colors, data retention policies (e.g., 1-year auto-delete), AI ingestion webhook setup, and SIS integration keys

### 8.4 MVP User Onboarding

Since SIS (Student Information System) integration is scheduled for Phase 4, MVP onboarding will be handled manually but efficiently:
1. **Admin CSV Import:** Admins bulk-create teachers, classes, and parent records via CSV upload.
2. **Parent Invites:** Parents receive a **Magic Link** or **Secure PIN Code** via email/WhatsApp to claim their pre-created profile and connect to their child's timeline.

---

## 9. Technical Considerations

### 9.1 Platform

| Aspect | Decision | Rationale |
|---|---|---|
| **Parent/Teacher App** | React + Vite + Tailwind CSS (PWA) | Fast iteration, strict adherence to Flat Design System, installs as app |
| **Admin Dashboard** | Web app (Next.js) | Complex data views better on desktop |
| **Backend** | Node.js (NestJS) or Python (FastAPI) | Rapid development, strong ecosystem |
| **Database** | PostgreSQL + Redis | Relational data + caching/real-time |
| **AI/LLM** | Google Gemini API, OpenAI API, locally hosted Qwen, or OpenRouter API | Flexible — can use local models for cost control or cloud APIs for capability |
| **Real-time** | WebSockets or Firebase | Live feed updates, push notifications |
| **File Storage** | Local storage + Google Cloud Storage (backup/failover) | Primary local hosting with GC as automatic failover if local goes down |
| **Push** | Firebase Cloud Messaging + APNs | Cross-platform push notifications |
| **Email Ingestion** | IMAP/OAuth or forwarding rules | Parse incoming school emails |
| **WhatsApp Ingestion** | WhatsApp Business API or forwarding bot | Capture teacher messages |
| **Auth** | Email/Password + Magic Links | Simple for non-technical parents |

### 9.2 AI Architecture

```
┌────────────────────────────────────────────────────┐
│                   AI ENGINE                        │
│                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ Email Parser │  │ WhatsApp     │  │ Photo    │ │
│  │ (LLM)       │  │ Parser (LLM) │  │ OCR+LLM  │ │
│  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │
│         │                 │               │        │
│         ▼                 ▼               ▼        │
│  ┌─────────────────────────────────────────────┐   │
│  │          CONTENT STRUCTURING LAYER          │   │
│  │  - Extract: dates, events, actions, people  │   │
│  │  - Categorize: announcement/reminder/action │   │
│  │  - Route: which class/grade/school-wide     │   │
│  │  - Prioritize: urgent/important/FYI         │   │
│  └────────────────────┬────────────────────────┘   │
│                       │                            │
│  ┌────────────────────▼────────────────────────┐   │
│  │           AI FEATURE LAYER                  │   │
│  │  - Smart Compose (teacher post assistance)  │   │
│  │  - Weekly Digest (per-family summary)       │   │
│  │  - Parent Assistant (Q&A chatbot)           │   │
│  │  - Contextual Translation                   │   │
│  │  - Smart Notification Routing               │   │
│  │  - Smart Search (NLP query)                 │   │
│  └─────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

### 9.3 Key Technical Requirements

- **Offline support** — Parents read cached feed items offline
- **Image handling** — Auto-compress for feed thumbnails, but **parents can download full-size original photos** (e.g. of their child's work in class)
- **Role-based access control (RBAC)** — Strict admin/teacher/parent separation
- **Data privacy** — PDPA (Singapore) compliant, data residency in SG/APAC
- **Multi-tenancy** — Each school is an isolated tenant
- **AI transparency** — AI-generated content clearly labeled, admin approval flow
- **Rate limiting** — AI features have usage caps to control costs
- **i18n** — English, Mandarin, and extensible to other languages

### 9.4 System Architecture (High-Level)

```
┌─────────────────────────────────────────────────────┐
│                     CLIENTS                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Parent App   │  │ Teacher App  │  │ Admin Web │ │
│  │ (React       │  │ (React       │  │ (Next.js) │ │
│  │  Native)     │  │  Native)     │  │           │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
└─────────┼────────────────┼──────────────────┼───────┘
          │                │                  │
          ▼                ▼                  ▼
┌─────────────────────────────────────────────────────┐
│                  API GATEWAY                         │
│              (REST + WebSocket)                      │
└──────────────────────┬──────────────────────────────┘
                       │
     ┌─────────────────┼─────────────────┐
     ▼                 ▼                 ▼
┌──────────┐    ┌───────────┐    ┌──────────────┐
│ Auth Svc │    │ Feed Svc  │    │ Notif. Svc   │
└──────────┘    └───────────┘    └──────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   AI ENGINE     │
              │  (LLM Service)  │
              └────────┬────────┘
                       │
     ┌─────────────────┼─────────────────┐
     ▼                 ▼                 ▼
┌──────────┐    ┌───────────┐    ┌──────────────┐
│ Email    │    │ WhatsApp  │    │ Calendar     │
│ Ingestion│    │ Ingestion │    │ Service      │
└──────────┘    └───────────┘    └──────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │  PostgreSQL + Redis    │
          │  S3 (Media Storage)    │
          └────────────────────────┘
```

### 9.5 Non-Functional Requirements (NFRs)

- **Performance:** The PWA must score 90+ on Google Lighthouse. Initial feed load must be under 1.5 seconds.
- **Accessibility (a11y):** Must meet WCAG 2.1 AA compliance (crucial for inclusive school communication).
- **Security & Privacy:** Strict Role-Based Access Control (RBAC). PDPA compliance with data residency in Singapore. Strict rate limiting for AI endpoints to prevent abuse.
- **Reliability:** Service workers must enable offline read-access to previously loaded feed content.

---

## 10. Business Model

### 10.1 Pricing Strategy

**Freemium with school-level licensing (B2B SaaS — Parents never pay):**

| Tier | Price | Includes |
|---|---|---|
| **Free** | $0 | Basic feed, announcements, up to 50 students, no AI features |
| **Standard** | ~$3-5 / student / month | Full features, action items, calendar, analytics, AI digest, translation |
| **Premium** | ~$7-10 / student / month | Everything + email/WhatsApp AI ingestion, AI assistant, white-labeling, API, priority support |

> A school of 500 students on Standard = **$1,500-2,500/month** or **$18K-30K/year**
> A school of 500 students on Premium = **$3,500-5,000/month** or **$42K-60K/year**

### 10.2 Go-to-Market Strategy

1. **Pilot with your children's school** — Free. Build the product, gather feedback, create a case study.
2. **Expand to 3-5 Singapore international schools** — Direct outreach, parent referrals, free/discounted trials.
3. **Regional expansion** — Hong Kong, Bangkok, KL, Jakarta (similar international school ecosystems).
4. **Scale** — Self-serve onboarding, school management group partnerships, conference presence.

### 10.3 Key Metrics

- **DAU/MAU** — Daily and monthly active parents
- **Time-to-Post (Teachers):** Target < 30 seconds to prove speed superiority over legacy tools like Bloomz.
- **Chatbot Deflection Rate:** % of parent questions successfully answered by AI without needing to message the teacher.
- **AI ingestion rate** — % of school communications auto-captured
- **Feed engagement** — Read rate, reaction rate
- **Action item completion rate** — % parents responding within 48h
- **Teacher posting frequency** — Are teachers actually using it (or still on WhatsApp)?
- **NPS** — From parents and teachers
- **Churn** — School retention rate year-over-year

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Schools resist change** | No adoption | Free pilot, ROI proof, WhatsApp/email ingestion so no hard cut-over |
| **Teachers won't use it** | No content = no parent value | WhatsApp ingestion means content flows even if teachers still use WhatsApp |
| **Parents default to WhatsApp** | Low DAU | WhatsApp ingestion captures content. Notifications can be sent TO WhatsApp too. Weekly digest pulls parents back. |
| **AI generates incorrect summaries** | Trust issue | Lower risk — AI is used lightly (summaries, translation, chatbot). Admin reviews AI summaries before posting. Not over-engineered. |
| **Privacy / data concerns** | Regulatory risk | PDPA compliance, SG data residency, clear consent flows, no ad-based model |
| **WhatsApp API restrictions** | Ingestion breaks | Multiple ingestion methods (API, forwarding, bot). Email ingestion as fallback. |
| **Feature creep** | Bloated app | Strict MVP scope. Minimalist, beautiful UX. Solve communication first, everything else is Phase 2+. |
| **LLM costs** | Margin pressure | Use locally hosted Qwen or Gemini Flash (cheap). Cache common queries. Don't over-engineer AI. |
| **Chicken-and-egg** | Need both sides | School-level adoption (top-down). Admin mandates teacher use. WhatsApp/email ingestion bootstraps content. |

---

## 12. MVP Scope & Timeline

### In the MVP:
- ✅ Strict Flat Design System (High density, Inter font, 1px borders, no shadows)
- ✅ Code Architecture: React + Vite + Tailwind CSS with JSON Mock Data state
- ✅ Parent & Teacher Web App (PWA capable)
- ✅ One app with role-switching (parent/teacher views)
- ✅ Teacher posting (class updates, reminders, student work, sign-ups)
- ✅ School-wide announcements
- ✅ Unified feed with multi-child support
- ✅ Class screen with student work showcase + full-size photo downloads
- ✅ Action items with response tracking + auto-reminders (replaces Google Forms)
- ✅ Push notifications with priority levels (parent-controlled preferences)
- ✅ School calendar with optional device sync + P-T meeting scheduling
- ✅ Structured direct messaging (parent ↔ teacher)
- ✅ **AI: Parent assistant chatbot** (with search — the cool differentiator!)
- ✅ **AI: Email & WhatsApp ingestion** (keep it simple — parse key info, admin reviews)
- ✅ **AI: Photo/Document OCR Ingestion** (Basic extraction of text from attachment images/PDFs to find event dates/deadlines. Does not apply to standard student work photos).
- ✅ **AI: Weekly digest** generation
- ✅ **AI: Contextual translation**

> ⚠️ **AI note:** Don't over-engineer the AI parts. Many features work fine without AI. Use AI where it genuinely adds value (chatbot, translation, digests, ingestion) but keep it simple and reliable.

### NOT in the MVP:
- ❌ Android app (post-MVP)
- ❌ Student portal
- ❌ Analytics dashboard (beyond basic read receipts)
- ❌ Behavior tracking
- ❌ Attendance tracking
- ❌ Homework / assignment system
- ❌ Fee management
- ❌ White-labeling
- ❌ Smart notification routing with AI learning

### Rough Timeline:

| Phase | Duration | Deliverable |
|---|---|---|
| **Design & Prototyping** | 3-4 weeks | Figma mockups, user flows, clickable prototype |
| **Backend & API + AI Engine** | 6-8 weeks | Core API, auth, data models, AI ingestion pipeline |
| **Frontend Foundation (React)** | 1-2 weeks | Scaffold Vite project, Tailwind config, Mock Data Schema, UI Components |
| **Mobile Web App (Parent + Teacher)** | 4-6 weeks | React app with core screens connected to Mock Data |
| **Admin Web Dashboard** | 3-4 weeks | Web dashboard with AI inbox |
| **AI Features** | 2-3 weeks | Chatbot, digest, translation tuning |
| **Testing & QA** | 2-3 weeks | Bug fixes, performance, UX polish |
| **Pilot Launch** | 1-2 weeks | Deploy to pilot school, onboarding |
| **Total** | **~24-32 weeks** | Full MVP launch |

---

## 13. Open Questions

> These need to be answered before development begins:

1. ~~**Pilot school:**~~ → ⚠️ **Unknown** — Need to check EtonHouse Broadrick's Bloomz contract terms and lock-in period.
2. ~~**One app or two?**~~ → ✅ **Decided: One app** with role-switching (parent/teacher). Keeps things simple.
3. ~~**WhatsApp ingestion method:**~~ → ✅ **Decided: Bot added to group** (read-only, only processes teacher/admin messages).
4. ~~**AI approval flow:**~~ → ✅ **Decided: Admin reviews AI-generated summaries before posting.**
5. ~~**Notification preferences:**~~ → ✅ **Decided: All channels** — push, in-app, WhatsApp, email, SMS. Parents choose their preference.
6. ~~**Content moderation:**~~ → ✅ **Decided: No pre-publish approval.** Teachers post directly without review.
7. ~~**Languages for pilot:**~~ → ✅ **Decided: English, Chinese, and Japanese** from day one.
8. ~~**Tech Stack & Design:**~~ → ✅ **Decided: React/Vite/Tailwind** PWA enforcing the strict Flat Design System. Mock JSON state for MVP.
9. ~~**Hosting:**~~ → ✅ **Decided: Supabase (Postgres/Auth/Storage) hosted in AWS Singapore (ap-southeast-1) + Vercel for frontend.** Ensures PDPA compliance, realtime sync, and fast iterations.
10. ~~**Budget:**~~ → ✅ **Estimate:** ~$100-200/month for MVP infrastructure and LLM API costs. Scale as adoption increases.
11. ~~**Legal entity:**~~ → ✅ **Decided:** A Singapore Pte. Ltd. will be required before processing B2B payments or signing formal DPAs, but the pilot can run under an informal agreement.
11. ~~**Data retention:**~~ → ✅ **Decided: Configurable by school** in Settings, with options including a 1-year retention period.
12. ~~**Bloomz migration:**~~ → ✅ **Decided: Clean start.** No data import from Bloomz.

---

## Appendix A: User Stories

### Parent Stories
- As a parent, I want to open one app and see all updates for all my children so I don't miss anything
- As a parent, I want school emails to automatically appear in the app without me having to check two places
- As a parent, I want WhatsApp reminders from my child's teacher to appear in the app feed
- As a parent, I want to see a weekly summary so I can catch up even if I've been busy all week
- As a parent, I want to quickly see what action items I need to respond to
- As a parent, I want to see my child's work shared by the teacher with photos and videos
- As a parent, I want to read everything in my preferred language (e.g. Mandarin)
- As a parent, I want to message my child's teacher without using my personal WhatsApp

### Teacher Stories
- As a teacher, I want to post a class update with photos in under 30 seconds
- As a teacher, I want AI to help me write better, more polished updates
- As a teacher, I want to keep using WhatsApp for quick reminders and have them automatically show up in SchoolOS too
- As a teacher, I want to see which parents have read my message
- As a teacher, I want to send a consent form and automatically track who hasn't responded
- As a teacher, I want to set quiet hours so parents don't message me at 10pm

### Admin Stories
- As an admin, I want school-wide emails to automatically become posts in SchoolOS
- As an admin, I want to review and approve AI-generated posts before they go live
- As an admin, I want to send a school-wide announcement and know the read rate
- As an admin, I want to collect re-enrollment confirmations digitally with tracking
- As an admin, I want to see which classes have the most/least parent engagement

---

## Appendix B: Competitor Reference

| Platform | What to Learn From |
|---|---|
| **Bloomz** | Feature breadth (portfolios, behavior, conferences, volunteers), 250-language translation, quiet hours |
| **ClassDojo** | Engagement UX, gamification, photo/video sharing simplicity, read receipts |
| **Seesaw** | Student-driven portfolios, rich multimedia tools, AI-powered assessment (recent) |
| **ParentSquare** | Action items + response tracking, multi-channel delivery (email/SMS/voice/app), SIS integration |
| **Remind** | Simplicity and speed, SMS fallback, doing one thing extremely well |
| **LittleLives** | Singapore market understanding, preschool workflow, local data compliance |
| **Parents Gateway (SG MOE)** | User expectation benchmark in Singapore, SingPass auth, consent form digitization |

---

*This document is a living spec. It should be updated as decisions are made and feedback is gathered.*
