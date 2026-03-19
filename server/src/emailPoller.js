/**
 * Gmail IMAP Poller — checks stumpyaibot@gmail.com for new emails
 * and processes them through the AI parser.
 * 
 * Polls every N minutes for UNSEEN emails, parses them, and stores
 * them as pending items for admin review.
 */

import imapSimple from 'imap-simple';
import { simpleParser } from 'mailparser';
import { parseEmailWithAI, cleanTitle, cleanEmailBody, extractTextFromHtml } from './emailParser.js';
import db from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const POLL_INTERVAL = (parseInt(process.env.POLL_INTERVAL_MINUTES) || 2) * 60 * 1000;
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'qwen3:14b';

/**
 * Relevance check — this is a dedicated inbox where the user forwards school emails.
 * We trust everything EXCEPT obvious non-school automated messages.
 */
function checkRelevance(subject, body, from) {
  const fromLower = from.toLowerCase();
  const subjectLower = subject.toLowerCase();

  // Block known non-school automated senders
  const blockedSenders = [
    'no-reply@accounts.google.com',
    'no-reply@google.com',
    'noreply@',
    'mailer-daemon',
  ];
  if (blockedSenders.some(s => fromLower.includes(s))) return false;

  // Block obvious spam/marketing signals
  const spamSignals = ['unsubscribe', 'marketing', 'promo code', 'limited offer', 'crypto', 'bitcoin'];
  const combined = `${subjectLower} ${body.slice(0, 200).toLowerCase()}`;
  if (spamSignals.some(s => combined.includes(s))) return false;

  // Skip truly empty emails
  if (subject === '(No Subject)' && (!body || body.trim().length === 0)) return false;

  // Everything else from this dedicated inbox is trusted
  return true;
}

const IMAP_CONFIG = {
  imap: {
    user: process.env.GMAIL_USER || 'stumpyaibot@gmail.com',
    password: process.env.GMAIL_APP_PASSWORD || '',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    authTimeout: 10000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

let isPolling = false;
let pollTimer = null;

/**
 * Check for new emails and process them
 */
async function checkForNewEmails({ rescan = false } = {}) {
  if (!IMAP_CONFIG.imap.password) {
    console.log('⚠️  Gmail App Password not set — skipping email poll. Set GMAIL_APP_PASSWORD in .env');
    return { checked: false, reason: 'no_password' };
  }

  if (isPolling) {
    console.log('⏳ Already polling, skipping...');
    return { checked: false, reason: 'already_polling' };
  }

  isPolling = true;
  let connection;

  try {
    console.log(rescan ? '📬 Rescanning all recent emails...' : '📬 Checking for new emails...');
    connection = await imapSimple.connect(IMAP_CONFIG);
    await connection.openBox('INBOX');

    // Rescan mode: search ALL emails from today; normal mode: UNSEEN only
    const searchCriteria = rescan
      ? [['SINCE', new Date().toISOString().split('T')[0]]]
      : ['UNSEEN'];
    const fetchOptions = {
      bodies: [''],
      markSeen: !rescan, // Only mark as read if not rescanning
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    if (messages.length === 0) {
      console.log('📬 No new emails.');
      return { checked: true, newEmails: 0 };
    }

    console.log(`📧 Found ${messages.length} new email(s)!`);
    const results = [];

    for (const msg of messages) {
      try {
        const rawBody = msg.parts.find(p => p.which === '')?.body || '';
        const parsed = await simpleParser(rawBody);

        const from = parsed.from?.text || 'unknown';
        const rawSubject = parsed.subject || '(No Subject)';
        const subject = cleanTitle(rawSubject);
        
        // Try text body first, then extract from HTML (Bloomz emails are HTML-only)
        let textBody = parsed.text?.trim() || '';
        if (!textBody || textBody.length < 5) {
          textBody = extractTextFromHtml(parsed.html) || '';
        }
        textBody = cleanEmailBody(textBody);

        // Quick relevance check — is this a school-related email?
        const isRelevant = await checkRelevance(rawSubject, textBody, from);
        if (!isRelevant) {
          console.log(`⏭️  Skipped (not school-related): "${subject}" from ${from}`);
          continue;
        }

        // De-duplicate — skip if we already ingested an email with this subject (check both raw and cleaned)
        const existing = db.prepare('SELECT id FROM ingested_emails WHERE subject = ? OR subject = ?').get(rawSubject, subject);
        if (existing) {
          console.log(`⏭️  Skipped (already ingested): "${subject}"`);
          continue;
        }

        console.log(`📧 Processing: "${subject}" from ${from}`);

        // Save image attachments
        const mediaUrls = [];
        const allAttachments = [...(parsed.attachments || [])];
        
        // Also check for inline images (CID-referenced)
        for (const att of allAttachments) {
          const isImage = att.contentType?.startsWith('image/');
          if (isImage && att.content) {
            const ext = att.contentType.split('/')[1]?.split(';')[0] || 'jpg';
            const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
            const filepath = path.join(UPLOADS_DIR, filename);
            fs.writeFileSync(filepath, att.content);
            mediaUrls.push(`/uploads/${filename}`);
            console.log(`🖼️  Saved attachment: ${filename} (${(att.size / 1024).toFixed(1)}KB)`);
          }
        }

        // Parse with AI (body is already cleaned, but pass original subject for context)
        const aiParsed = await parseEmailWithAI(rawSubject, textBody, from);

        // Handle image-only posts (empty body but has attached images)
        if ((!aiParsed.content || aiParsed.content.trim().length < 5) && mediaUrls.length > 0) {
          aiParsed.content = `📸 ${mediaUrls.length} image${mediaUrls.length > 1 ? 's' : ''} shared — tap to view.`;
        }
        aiParsed.mediaUrls = mediaUrls;

        // Store ingested record
        const id = `email_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const feedId = `post_${Date.now()}`;

        db.prepare(`
          INSERT INTO ingested_emails (id, from_address, subject, body, ai_parsed, status, feed_item_id)
          VALUES (?, ?, ?, ?, ?, 'approved', ?)
        `).run(id, from, rawSubject, textBody.slice(0, 5000), JSON.stringify(aiParsed), feedId);

        // Auto-publish to feed
        const actionLabel = aiParsed.actionType === 'signature_required' ? 'Review & Sign'
          : aiParsed.actionType === 'rsvp' ? 'RSVP Now'
          : aiParsed.actionType === 'acknowledgement' ? 'Noted'
          : aiParsed.actionType ? 'View' : null;

        db.prepare(`
          INSERT INTO feed_items (id, type, author_id, title, content, media_urls, priority, school_wide,
            target_class_ids, target_student_ids, action_type, action_due_date, action_button_label, 
            original_source, ingestion_status, created_at)
          VALUES (?, 'ingested_email', 'u_admin', ?, ?, ?, ?, 1, '[]', '[]', ?, ?, ?, ?, 'approved', datetime('now'))
        `).run(feedId, aiParsed.title || subject, aiParsed.content || textBody.slice(0, 2000),
          JSON.stringify(mediaUrls), aiParsed.priority || 'normal',
          aiParsed.actionType || null, aiParsed.actionDueDate || null, actionLabel,
          `Email from ${from}`);

        console.log(`✅ Published to feed: ${feedId} — "${aiParsed.title || subject}" [${aiParsed.priority}] ${mediaUrls.length ? `🖼️ ${mediaUrls.length}` : ''}`);
        results.push({ id, feedId, from, subject, priority: aiParsed.priority, images: mediaUrls.length });
      } catch (err) {
        console.error('Failed to process email:', err.message);
      }
    }

    return { checked: true, newEmails: results.length, emails: results };
  } catch (err) {
    console.error('📧 IMAP error:', err.message);
    return { checked: false, error: err.message };
  } finally {
    isPolling = false;
    if (connection) {
      try { connection.end(); } catch {}
    }
  }
}

/**
 * Start the polling loop
 */
export function startEmailPoller() {
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.log('📧 Email poller: GMAIL_APP_PASSWORD not set — poller disabled.');
    console.log('   To enable: add your App Password to server/.env');
    return;
  }

  console.log(`📧 Email poller started — checking every ${POLL_INTERVAL / 60000} minutes`);
  
  // Check immediately on startup
  checkForNewEmails();
  
  // Then check on interval
  pollTimer = setInterval(checkForNewEmails, POLL_INTERVAL);
}

/**
 * Stop the polling loop
 */
export function stopEmailPoller() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
    console.log('📧 Email poller stopped.');
  }
}

/**
 * Manually trigger a check (for the API endpoint)
 */
export { checkForNewEmails };
