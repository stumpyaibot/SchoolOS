-- SchoolOS Database Schema
-- Compatible with Supabase (PostgreSQL 15+)

-- ===== ENUMS =====
CREATE TYPE user_role AS ENUM ('parent', 'teacher', 'admin');
CREATE TYPE language_pref AS ENUM ('en', 'zh', 'ja');
CREATE TYPE feed_item_type AS ENUM ('teacher_post', 'admin_announcement', 'ingested_whatsapp', 'ingested_email', 'student_work');
CREATE TYPE priority_level AS ENUM ('normal', 'important', 'urgent');
CREATE TYPE action_item_type AS ENUM ('signature_required', 'rsvp', 'checklist', 'acknowledgement');
CREATE TYPE ingestion_status AS ENUM ('pending_review', 'approved', 'rejected');

-- ===== USERS =====
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  language_preference language_pref DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== STUDENTS =====
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade_str TEXT NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== CLASSES =====
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  school_year TEXT DEFAULT '2025-2026',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== STUDENT-PARENT RELATIONSHIP =====
CREATE TABLE student_parents (
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, parent_id)
);

-- ===== CLASS-STUDENT RELATIONSHIP =====
CREATE TABLE class_students (
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, student_id)
);

-- ===== TEACHER-CLASS RELATIONSHIP =====
CREATE TABLE teacher_classes (
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, class_id)
);

-- ===== FEED ITEMS =====
CREATE TABLE feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type feed_item_type NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  priority priority_level DEFAULT 'normal',
  ingestion_status ingestion_status,
  original_source TEXT,
  -- Audience targeting
  school_wide BOOLEAN DEFAULT FALSE,
  target_class_ids UUID[] DEFAULT '{}',
  target_student_ids UUID[] DEFAULT '{}',
  -- Read tracking
  read_count INT DEFAULT 0,
  total_audience INT DEFAULT 0,
  -- Action item (nullable)
  action_type action_item_type,
  action_due_date TIMESTAMPTZ,
  action_button_label TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== REACTIONS =====
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- '❤️', '👏', '🌟'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feed_item_id, user_id, type)
);

-- ===== ACTION RESPONSES =====
CREATE TABLE action_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feed_item_id, user_id)
);

-- ===== READ RECEIPTS =====
CREATE TABLE read_receipts (
  feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (feed_item_id, user_id)
);

-- ===== CALENDAR EVENTS =====
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT FALSE,
  school_wide BOOLEAN DEFAULT FALSE,
  target_class_ids UUID[] DEFAULT '{}',
  -- Booking
  is_bookable BOOLEAN DEFAULT FALSE,
  booking_teacher_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== BOOKING SLOTS =====
CREATE TABLE booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  booked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  booked_at TIMESTAMPTZ,
  UNIQUE(event_id, start_time)
);

-- ===== CONVERSATIONS =====
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== CONVERSATION PARTICIPANTS =====
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  unread_count INT DEFAULT 0,
  PRIMARY KEY (conversation_id, user_id)
);

-- ===== MESSAGES =====
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== AI DIGESTS =====
CREATE TABLE ai_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE digest_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_id UUID REFERENCES ai_digests(id) ON DELETE CASCADE,
  child_id UUID REFERENCES students(id),
  icon TEXT NOT NULL, -- 'info', 'warning', 'logistics'
  summary TEXT NOT NULL,
  source_post_id UUID REFERENCES feed_items(id) ON DELETE SET NULL
);

-- ===== USER SETTINGS =====
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_summary BOOLEAN DEFAULT FALSE,
  whatsapp_delivery BOOLEAN DEFAULT FALSE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '21:00',
  quiet_hours_end TIME DEFAULT '07:00'
);

-- ===== INDEXES =====
CREATE INDEX idx_feed_items_created ON feed_items(created_at DESC);
CREATE INDEX idx_feed_items_author ON feed_items(author_id);
CREATE INDEX idx_feed_items_type ON feed_items(type);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_reactions_feed_item ON reactions(feed_item_id);
CREATE INDEX idx_read_receipts_feed_item ON read_receipts(feed_item_id);
CREATE INDEX idx_calendar_events_start ON calendar_events(start_time);
CREATE INDEX idx_booking_slots_event ON booking_slots(event_id);
CREATE INDEX idx_action_responses_feed ON action_responses(feed_item_id);

-- ===== ROW LEVEL SECURITY =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth_id = auth.uid());

-- Parents can read feed items targeted to their children's classes
CREATE POLICY "Parents read feed items" ON feed_items
  FOR SELECT USING (
    school_wide = TRUE
    OR EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN class_students cs ON cs.student_id = sp.student_id
      WHERE sp.parent_id = (SELECT id FROM users WHERE auth_id = auth.uid())
      AND (
        cs.class_id = ANY(target_class_ids)
        OR sp.student_id = ANY(target_student_ids)
      )
    )
  );

-- Teachers can read/write feed items they authored
CREATE POLICY "Teachers manage own feed items" ON feed_items
  FOR ALL USING (
    author_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Users can read/write their own reactions
CREATE POLICY "Users manage own reactions" ON reactions
  FOR ALL USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Users can read messages in their conversations
CREATE POLICY "Users read own messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Users can manage their own settings
CREATE POLICY "Users manage own settings" ON user_settings
  FOR ALL USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ===== REALTIME =====
-- Enable realtime for messages and feed items
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE feed_items;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
