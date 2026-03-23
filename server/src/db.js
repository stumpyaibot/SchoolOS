/**
 * Database setup — SQLite via better-sqlite3
 * Creates the schema on first run, stores data in server/schoolos.db
 */
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'schoolos.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ===== Schema creation =====
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK(role IN ('parent', 'teacher', 'admin')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    language_preference TEXT DEFAULT 'en',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    grade_str TEXT NOT NULL,
    class_id TEXT REFERENCES classes(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_id TEXT REFERENCES users(id),
    school_year TEXT DEFAULT '2025-2026',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS student_parents (
    student_id TEXT REFERENCES students(id),
    parent_id TEXT REFERENCES users(id),
    PRIMARY KEY (student_id, parent_id)
  );

  CREATE TABLE IF NOT EXISTS class_students (
    class_id TEXT REFERENCES classes(id),
    student_id TEXT REFERENCES students(id),
    PRIMARY KEY (class_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS teacher_classes (
    teacher_id TEXT REFERENCES users(id),
    class_id TEXT REFERENCES classes(id),
    PRIMARY KEY (teacher_id, class_id)
  );

  CREATE TABLE IF NOT EXISTS feed_items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    author_id TEXT REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_urls TEXT DEFAULT '[]',
    priority TEXT DEFAULT 'normal',
    ingestion_status TEXT,
    original_source TEXT,
    school_wide INTEGER DEFAULT 0,
    target_class_ids TEXT DEFAULT '[]',
    target_student_ids TEXT DEFAULT '[]',
    read_count INTEGER DEFAULT 0,
    total_audience INTEGER DEFAULT 0,
    action_type TEXT,
    action_due_date TEXT,
    action_button_label TEXT,
    action_is_completed INTEGER DEFAULT 0,
    bullet_summary TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reactions (
    id TEXT PRIMARY KEY,
    feed_item_id TEXT REFERENCES feed_items(id) ON DELETE CASCADE,
    user_id TEXT,
    type TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(feed_item_id, user_id, type)
  );

  CREATE TABLE IF NOT EXISTS action_responses (
    id TEXT PRIMARY KEY,
    feed_item_id TEXT REFERENCES feed_items(id) ON DELETE CASCADE,
    user_id TEXT,
    responded_at TEXT DEFAULT (datetime('now')),
    UNIQUE(feed_item_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS read_receipts (
    feed_item_id TEXT REFERENCES feed_items(id) ON DELETE CASCADE,
    user_id TEXT,
    read_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (feed_item_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_all_day INTEGER DEFAULT 0,
    school_wide INTEGER DEFAULT 0,
    target_class_ids TEXT DEFAULT '[]',
    is_bookable INTEGER DEFAULT 0,
    booking_teacher_id TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS booking_slots (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES calendar_events(id) ON DELETE CASCADE,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    booked_by TEXT REFERENCES users(id),
    booked_at TEXT,
    UNIQUE(event_id, start_time)
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
    user_id TEXT,
    unread_count INTEGER DEFAULT 0,
    PRIMARY KEY (conversation_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id TEXT,
    content TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY REFERENCES users(id),
    push_enabled INTEGER DEFAULT 1,
    email_summary INTEGER DEFAULT 0,
    whatsapp_delivery INTEGER DEFAULT 0,
    quiet_hours_enabled INTEGER DEFAULT 0,
    quiet_hours_start TEXT DEFAULT '21:00',
    quiet_hours_end TEXT DEFAULT '07:00'
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_feed_items_created ON feed_items(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_feed_items_author ON feed_items(author_id);
  CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_reactions_feed_item ON reactions(feed_item_id);
  CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON calendar_events(start_time);
`);

// Migration: add full_content column if it doesn't exist
try {
  db.exec(`ALTER TABLE feed_items ADD COLUMN full_content TEXT`);
  console.log('📦 Migration: added full_content column to feed_items');
} catch {
  // Column already exists — ignore
}

export default db;
