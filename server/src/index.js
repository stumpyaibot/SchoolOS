/**
 * SchoolOS API Server
 * Express.js + SQLite — local-first backend
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import db from './db.js';
import ingestRoutes from './ingestRoutes.js';
import aiRoutes from './aiRoutes.js';
import { startEmailPoller, checkForNewEmails } from './emailPoller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ===== FILE UPLOAD =====
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ===== HEALTH =====
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== USERS =====
app.get('/api/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Attach childrenIds for parents
  if (user.role === 'parent') {
    const children = db.prepare('SELECT student_id FROM student_parents WHERE parent_id = ?').all(user.id);
    user.childrenIds = children.map(c => c.student_id);
  }
  // Attach classIds for teachers
  if (user.role === 'teacher') {
    const tc = db.prepare('SELECT class_id FROM teacher_classes WHERE teacher_id = ?').all(user.id);
    user.classIds = tc.map(c => c.class_id);
  }

  res.json(mapUser(user));
});

// ===== STUDENTS =====
app.get('/api/students', (_req, res) => {
  const rows = db.prepare(`
    SELECT s.*, sp.parent_id FROM students s
    LEFT JOIN student_parents sp ON sp.student_id = s.id
  `).all();

  // Group by student
  const studentMap = {};
  for (const row of rows) {
    if (!studentMap[row.id]) {
      studentMap[row.id] = { ...row, parentIds: [] };
    }
    if (row.parent_id) studentMap[row.id].parentIds.push(row.parent_id);
  }

  res.json(Object.values(studentMap).map(mapStudent));
});

app.get('/api/students/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const parents = db.prepare('SELECT parent_id FROM student_parents WHERE student_id = ?').all(student.id);
  student.parentIds = parents.map(p => p.parent_id);

  res.json(mapStudent(student));
});

// ===== CLASSES =====
app.get('/api/classes', (_req, res) => {
  const rows = db.prepare(`
    SELECT c.*, cs.student_id FROM classes c
    LEFT JOIN class_students cs ON cs.class_id = c.id
  `).all();

  const classMap = {};
  for (const row of rows) {
    if (!classMap[row.id]) {
      classMap[row.id] = { ...row, studentIds: [] };
    }
    if (row.student_id) classMap[row.id].studentIds.push(row.student_id);
  }

  res.json(Object.values(classMap).map(mapClass));
});

// ===== FEED ITEMS =====
app.get('/api/feed', (_req, res) => {
  const items = db.prepare('SELECT * FROM feed_items ORDER BY created_at DESC').all();

  // Batch-load reactions for all items
  const allReactions = db.prepare('SELECT * FROM reactions').all();
  const reactionsByItem = {};
  for (const r of allReactions) {
    if (!reactionsByItem[r.feed_item_id]) reactionsByItem[r.feed_item_id] = [];
    reactionsByItem[r.feed_item_id].push(r);
  }

  const result = items.map(item => mapFeedItem(item, reactionsByItem[item.id] || [], 'u_parent_jack'));
  res.json(result);
});

app.get('/api/feed/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM feed_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Feed item not found' });

  const reactions = db.prepare('SELECT * FROM reactions WHERE feed_item_id = ?').all(item.id);
  res.json(mapFeedItem(item, reactions, 'u_parent_jack'));
});

// Create a feed item (for teacher posts, ingested items, etc.)
app.post('/api/feed', (req, res) => {
  const { id, type, authorId, title, content, mediaUrls, priority, schoolWide, targetClassIds, targetStudentIds, actionType, actionDueDate, actionButtonLabel } = req.body;
  const itemId = id || `post_${Date.now()}`;

  db.prepare(`
    INSERT INTO feed_items (id, type, author_id, title, content, media_urls, priority, school_wide, target_class_ids, target_student_ids, action_type, action_due_date, action_button_label, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(itemId, type, authorId, title, content,
    JSON.stringify(mediaUrls || []), priority || 'normal',
    schoolWide ? 1 : 0, JSON.stringify(targetClassIds || []), JSON.stringify(targetStudentIds || []),
    actionType || null, actionDueDate || null, actionButtonLabel || null);

  const created = db.prepare('SELECT * FROM feed_items WHERE id = ?').get(itemId);
  res.status(201).json(mapFeedItem(created, [], 'u_parent_jack'));
});

// ===== REACTIONS =====
app.post('/api/feed/:id/reactions', (req, res) => {
  const { userId, type } = req.body;
  const feedItemId = req.params.id;

  const existing = db.prepare('SELECT id FROM reactions WHERE feed_item_id = ? AND user_id = ? AND type = ?')
    .get(feedItemId, userId, type);

  if (existing) {
    db.prepare('DELETE FROM reactions WHERE id = ?').run(existing.id);
    res.json({ toggled: false });
  } else {
    const id = `r_${Date.now()}`;
    db.prepare('INSERT INTO reactions (id, feed_item_id, user_id, type) VALUES (?, ?, ?, ?)')
      .run(id, feedItemId, userId, type);
    res.json({ toggled: true });
  }
});

// ===== CALENDAR EVENTS =====
app.get('/api/events', (_req, res) => {
  const events = db.prepare('SELECT * FROM calendar_events ORDER BY start_time ASC').all();
  res.json(events.map(mapCalendarEvent));
});

app.get('/api/events/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(mapCalendarEvent(event));
});

// ===== CONVERSATIONS =====
app.get('/api/conversations', (req, res) => {
  const userId = req.query.userId || 'u_parent_jack';
  
  // Get conversations the user participates in
  const convIds = db.prepare('SELECT conversation_id, unread_count FROM conversation_participants WHERE user_id = ?')
    .all(userId);

  const result = convIds.map(({ conversation_id, unread_count }) => {
    const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversation_id);
    const participants = db.prepare('SELECT user_id FROM conversation_participants WHERE conversation_id = ?').all(conversation_id);
    const lastMsg = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1').get(conversation_id);

    return {
      id: conv.id,
      participantIds: participants.map(p => p.user_id),
      studentId: conv.student_id,
      lastMessage: lastMsg ? mapMessage(lastMsg) : null,
      unreadCount: unread_count,
    };
  });

  res.json(result);
});

// ===== MESSAGES =====
app.get('/api/conversations/:convId/messages', (req, res) => {
  const messages = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
    .all(req.params.convId);
  res.json(messages.map(mapMessage));
});

app.post('/api/conversations/:convId/messages', (req, res) => {
  const { senderId, content } = req.body;
  const id = `msg_${Date.now()}`;

  db.prepare('INSERT INTO messages (id, conversation_id, sender_id, content, is_read, created_at) VALUES (?, ?, ?, ?, 0, datetime("now"))')
    .run(id, req.params.convId, senderId, content);

  // Update conversation timestamp
  db.prepare('UPDATE conversations SET updated_at = datetime("now") WHERE id = ?').run(req.params.convId);

  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  res.status(201).json(mapMessage(msg));
});

// ===== USER SETTINGS =====
app.get('/api/settings/:userId', (req, res) => {
  const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.params.userId);
  const user = db.prepare('SELECT language_preference FROM users WHERE id = ?').get(req.params.userId);

  if (!settings) return res.status(404).json({ error: 'Settings not found' });

  res.json({
    userId: settings.user_id,
    notifications: {
      pushEnabled: !!settings.push_enabled,
      emailSummary: !!settings.email_summary,
      whatsappDelivery: !!settings.whatsapp_delivery,
    },
    quietHours: {
      enabled: !!settings.quiet_hours_enabled,
      startTime: settings.quiet_hours_start,
      endTime: settings.quiet_hours_end,
    },
    languagePreference: user?.language_preference || 'en',
  });
});

// ===== READ RECEIPTS =====
app.post('/api/feed/:id/read', (req, res) => {
  const { userId } = req.body;
  db.prepare('INSERT OR IGNORE INTO read_receipts (feed_item_id, user_id) VALUES (?, ?)').run(req.params.id, userId);
  res.json({ success: true });
});

// ===== MAPPERS =====

function mapUser(row) {
  return {
    id: row.id,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url,
    languagePreference: row.language_preference,
    childrenIds: row.childrenIds || [],
    classIds: row.classIds || [],
  };
}

function mapStudent(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    gradeStr: row.grade_str,
    classId: row.class_id,
    parentIds: row.parentIds || [],
  };
}

function mapClass(row) {
  return {
    id: row.id,
    name: row.name,
    teacherId: row.teacher_id,
    studentIds: row.studentIds || [],
  };
}

function mapFeedItem(row, reactions, currentUserId) {
  // Aggregate reactions by type
  const reactionMap = {};
  for (const r of reactions) {
    if (!reactionMap[r.type]) reactionMap[r.type] = { type: r.type, count: 0, userReacted: false };
    reactionMap[r.type].count++;
    if (r.user_id === currentUserId) reactionMap[r.type].userReacted = true;
  }

  return {
    id: row.id,
    type: row.type,
    authorId: row.author_id,
    targetAudiences: {
      classIds: safeJsonParse(row.target_class_ids, []),
      studentIds: safeJsonParse(row.target_student_ids, []),
      schoolWide: !!row.school_wide,
    },
    timestamp: row.created_at,
    title: row.title,
    content: row.content,
    mediaUrls: safeJsonParse(row.media_urls, []),
    priority: row.priority,
    reactions: Object.values(reactionMap),
    readCount: row.read_count,
    totalAudience: row.total_audience,
    actionItem: row.action_type ? {
      type: row.action_type,
      dueDate: row.action_due_date,
      isCompleted: !!row.action_is_completed,
      buttonLabel: row.action_button_label || 'View',
    } : undefined,
  };
}

function mapCalendarEvent(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    startTime: row.start_time,
    endTime: row.end_time,
    isAllDay: !!row.is_all_day,
    targetAudiences: {
      classIds: safeJsonParse(row.target_class_ids, []),
      schoolWide: !!row.school_wide,
    },
    bookingDetails: row.is_bookable ? {
      isBookable: true,
      teacherId: row.booking_teacher_id,
    } : undefined,
  };
}

function mapMessage(row) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    timestamp: row.created_at,
    isRead: !!row.is_read,
  };
}

function safeJsonParse(str, fallback) {
  try { return JSON.parse(str); }
  catch { return fallback; }
}

// ===== INGESTION (Email / WhatsApp) =====
app.use('/api/ingest', ingestRoutes);

// ===== AI ASSISTANT =====
app.use('/api/ai', aiRoutes);

// ===== MANUAL EMAIL CHECK =====
app.post('/api/ingest/check-now', async (req, res) => {
  const rescan = req.query.rescan === 'true' || req.body?.rescan === true;
  const result = await checkForNewEmails({ rescan });
  res.json(result);
});

// ===== START =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SchoolOS API running at http://localhost:${PORT}`);
  console.log(`   Health:     GET  http://localhost:${PORT}/api/health`);
  console.log(`   📧 Check:    POST http://localhost:${PORT}/api/ingest/check-now`);
  console.log(`   💬 WhatsApp: POST http://localhost:${PORT}/api/ingest/whatsapp`);
  console.log(`   🤖 AI Chat:  POST http://localhost:${PORT}/api/ai/chat`);

  // Start email polling
  startEmailPoller();
});
