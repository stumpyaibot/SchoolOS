/**
 * Ingestion Routes — Email & WhatsApp
 * 
 * Email:
 *   POST /api/ingest/email — Webhook for receiving forwarded emails
 *   POST /api/ingest/test — Test endpoint with sample school emails
 * 
 * WhatsApp:
 *   POST /api/ingest/whatsapp — Upload WhatsApp export text
 *   POST /api/ingest/whatsapp/test — Test with sample chat
 * 
 * Shared:
 *   GET  /api/ingest/pending — List items pending review
 *   POST /api/ingest/:id/approve — Approve → creates feed item
 *   POST /api/ingest/:id/reject — Reject
 */

import { Router } from 'express';
import db from './db.js';
import { parseEmailWithAI } from './emailParser.js';
import { parseWhatsAppExport, parseWhatsAppWithAI } from './whatsappParser.js';

const router = Router();

// ===== Schema for ingested emails =====
db.exec(`
  CREATE TABLE IF NOT EXISTS ingested_emails (
    id TEXT PRIMARY KEY,
    from_address TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    received_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'pending_review',
    ai_parsed TEXT,
    feed_item_id TEXT,
    reviewed_at TEXT,
    reviewed_by TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_ingested_status ON ingested_emails(status);
`);

// ===== 1. Receive forwarded email =====
router.post('/email', async (req, res) => {
  try {
    const { from, subject, body, text, html } = req.body;

    // Support multiple email forwarding formats
    const emailFrom = from || req.body.sender || req.body.from_email || 'unknown@school.edu.sg';
    const emailSubject = subject || req.body.subject || '(No Subject)';
    const emailBody = text || body || stripHtml(html) || '';

    if (!emailBody && !emailSubject) {
      return res.status(400).json({ error: 'Email must have a subject or body' });
    }

    const id = `email_${Date.now()}`;

    // Parse with AI
    console.log(`📧 Processing email: "${emailSubject}" from ${emailFrom}`);
    const parsed = await parseEmailWithAI(emailSubject, emailBody, emailFrom);
    console.log(`🤖 AI parsed: priority=${parsed.priority}, action=${parsed.actionType || 'none'}`);

    // Store the ingested email
    db.prepare(`
      INSERT INTO ingested_emails (id, from_address, subject, body, ai_parsed, status)
      VALUES (?, ?, ?, ?, ?, 'pending_review')
    `).run(id, emailFrom, emailSubject, emailBody, JSON.stringify(parsed));

    res.status(201).json({
      id,
      status: 'pending_review',
      parsed,
      message: 'Email received and parsed. Pending admin review.',
    });
  } catch (err) {
    console.error('Email ingestion error:', err);
    res.status(500).json({ error: 'Failed to process email' });
  }
});

// ===== 2. List pending emails =====
router.get('/pending', (_req, res) => {
  const emails = db.prepare(`
    SELECT * FROM ingested_emails 
    WHERE status = 'pending_review' 
    ORDER BY received_at DESC
  `).all();

  res.json(emails.map(e => ({
    ...e,
    aiParsed: safeJsonParse(e.ai_parsed),
  })));
});

// ===== 3. Approve email → create feed item =====
router.post('/:id/approve', (req, res) => {
  const email = db.prepare('SELECT * FROM ingested_emails WHERE id = ?').get(req.params.id);
  if (!email) return res.status(404).json({ error: 'Email not found' });
  if (email.status !== 'pending_review') return res.status(400).json({ error: 'Email already reviewed' });

  const parsed = safeJsonParse(email.ai_parsed);
  const overrides = req.body; // Allow admin to override AI-parsed fields

  const title = overrides.title || parsed.title || email.subject;
  const content = overrides.content || parsed.content || email.body;
  const priority = overrides.priority || parsed.priority || 'normal';
  const actionType = overrides.actionType || parsed.actionType;
  const actionDueDate = overrides.actionDueDate || parsed.actionDueDate;

  // Create feed item
  const feedId = `post_${Date.now()}`;
  db.prepare(`
    INSERT INTO feed_items (id, type, author_id, title, content, priority, school_wide, target_class_ids, target_student_ids, 
      action_type, action_due_date, action_button_label, original_source, ingestion_status, created_at)
    VALUES (?, 'ingested_email', 'u_admin', ?, ?, ?, 1, '[]', '[]', ?, ?, ?, ?, 'approved', datetime('now'))
  `).run(feedId, title, content, priority, actionType, actionDueDate,
    actionType ? getButtonLabel(actionType) : null,
    `Email from ${email.from_address}`);

  // Update the ingested email
  db.prepare(`
    UPDATE ingested_emails SET status = 'approved', feed_item_id = ?, reviewed_at = datetime('now')
    WHERE id = ?
  `).run(feedId, req.params.id);

  res.json({ 
    status: 'approved', 
    feedItemId: feedId,
    message: 'Email approved and published to feed.',
  });
});

// ===== 4. Reject email =====
router.post('/:id/reject', (req, res) => {
  const email = db.prepare('SELECT * FROM ingested_emails WHERE id = ?').get(req.params.id);
  if (!email) return res.status(404).json({ error: 'Email not found' });

  db.prepare(`
    UPDATE ingested_emails SET status = 'rejected', reviewed_at = datetime('now')
    WHERE id = ?
  `).run(req.params.id);

  res.json({ status: 'rejected', message: 'Email rejected.' });
});

// ===== 5. Test endpoint — simulate a school email =====
router.post('/test', async (req, res) => {
  const testEmails = [
    {
      from: 'admin@etonhouse.edu.sg',
      subject: 'School Assembly — Friday 21 March',
      body: 'Dear Parents,\n\nPlease note that this Friday (21 March) there will be a whole-school assembly at 9:00am in the MPH. Parents are welcome to attend.\n\nChildren should wear their formal uniform.\n\nBest regards,\nSchool Admin',
    },
    {
      from: 'admin@etonhouse.edu.sg',
      subject: 'URGENT: Water Supply Disruption Tomorrow',
      body: 'Dear Parents,\n\nPlease be advised that due to essential maintenance, there will be a temporary water supply disruption tomorrow (Tuesday) between 10am-12pm.\n\nPlease ensure your child brings an extra water bottle.\n\nWe apologise for the inconvenience.\n\nSchool Facilities Team',
    },
    {
      from: 'admin@etonhouse.edu.sg',
      subject: 'Re-Enrollment for 2027 — Action Required',
      body: "Dear Parents,\n\nIt is time to confirm your child's re-enrollment for the 2027 academic year.\n\nPlease complete the re-enrollment form by Friday 28 March. If we do not receive your confirmation by this date, your child's place may be offered to waitlisted families.\n\nThank you for your continued support.\n\nAdmissions Office",
    },
  ];

  // Pick a random test email or use the provided one
  const email = (req.body && req.body.from) ? req.body : testEmails[Math.floor(Math.random() * testEmails.length)];

  try {
    const id = `email_${Date.now()}`;
    console.log(`📧 [TEST] Processing email: "${email.subject}" from ${email.from}`);
    const parsed = await parseEmailWithAI(email.subject, email.body, email.from);
    console.log(`🤖 [TEST] AI parsed: priority=${parsed.priority}, action=${parsed.actionType || 'none'}`);

    db.prepare(`
      INSERT INTO ingested_emails (id, from_address, subject, body, ai_parsed, status)
      VALUES (?, ?, ?, ?, ?, 'pending_review')
    `).run(id, email.from, email.subject, email.body, JSON.stringify(parsed));

    res.status(201).json({
      id,
      status: 'pending_review',
      parsed,
      message: 'Test email received and parsed. Pending admin review.',
      testEmail: email,
    });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ error: 'Failed to process test email' });
  }
});

// ===== 6. WhatsApp export upload =====
router.post('/whatsapp', async (req, res) => {
  try {
    const { text, teacherNames } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing "text" field with WhatsApp export content' });

    console.log(`💬 Processing WhatsApp export (${text.length} chars)...`);
    const result = await parseWhatsAppWithAI(text, teacherNames || []);

    // Store each parsed item as an ingested email (reuse the same table)
    for (const item of result.items) {
      const id = `wa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO ingested_emails (id, from_address, subject, body, ai_parsed, status)
        VALUES (?, ?, ?, ?, ?, 'pending_review')
      `).run(id, `WhatsApp: ${item.sender}`, item.title, item.originalMessages.join('\n'), JSON.stringify(item));
    }

    console.log(`💬 Parsed ${result.totalMessages} messages into ${result.items.length} items`);
    res.json(result);
  } catch (err) {
    console.error('WhatsApp ingestion error:', err);
    res.status(500).json({ error: 'Failed to process WhatsApp export' });
  }
});

// ===== 7. WhatsApp test endpoint =====
router.post('/whatsapp/test', async (req, res) => {
  const sampleChat = `[14/03/2026, 08:15:32] Mr. Tan: Good morning parents! Just a reminder that tomorrow is PE day. Please make sure your child wears their PE kit and brings a water bottle.
[14/03/2026, 08:16:01] Mr. Tan: Also, swimming is on Thursday this week. Goggles and swim cap needed.
[14/03/2026, 09:30:15] Sarah Lim: Thanks Mr. Tan! 👍
[14/03/2026, 09:32:00] Michelle Wong: Noted, thanks!
[14/03/2026, 14:22:10] Mr. Tan: Hi everyone, just to let you know that the Science Museum trip permission slips are due by Wednesday. Please sign and return if you haven't already.
[14/03/2026, 14:23:05] Mr. Tan: If you need another copy of the form, please let me know.
[15/03/2026, 07:55:00] Mr. Tan: Good morning! Today we have library. Please remind your child to bring their library book for exchange.
[15/03/2026, 12:00:30] Mr. Tan: The children had a wonderful time at the book corner today. I'll share some photos on SchoolOS later! 📚`.trim();

  try {
    const result = await parseWhatsAppWithAI(
      req.body.text || sampleChat,
      req.body.teacherNames || ['Mr. Tan']
    );

    // Store items
    for (const item of result.items) {
      const id = `wa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO ingested_emails (id, from_address, subject, body, ai_parsed, status)
        VALUES (?, ?, ?, ?, ?, 'pending_review')
      `).run(id, `WhatsApp: ${item.sender}`, item.title, item.originalMessages.join('\n'), JSON.stringify(item));
    }

    res.json({ ...result, source: 'test_sample' });
  } catch (err) {
    console.error('WhatsApp test error:', err);
    res.status(500).json({ error: 'Failed to process test WhatsApp' });
  }
});

// ===== Helpers =====
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function getButtonLabel(actionType) {
  const labels = {
    signature_required: 'Review & Sign',
    rsvp: 'RSVP Now',
    acknowledgement: 'Noted',
    checklist: 'View Items',
  };
  return labels[actionType] || 'View';
}

function safeJsonParse(str) {
  try { return JSON.parse(str); }
  catch { return {}; }
}

export default router;
