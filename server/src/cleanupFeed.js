/**
 * One-time cleanup script — fix existing feed items in the database.
 * Run with: node src/cleanupFeed.js
 */
import 'dotenv/config';
import db from './db.js';
import { cleanTitle, cleanEmailBody } from './emailParser.js';

console.log('🧹 Starting feed cleanup...\n');

// 1. Clean up all ingested email feed items
const ingestedItems = db.prepare(`
  SELECT fi.id, fi.title, fi.content, fi.action_type, fi.action_button_label, fi.media_urls
  FROM feed_items fi
  WHERE fi.type = 'ingested_email' AND fi.id LIKE 'post_%' AND fi.id NOT IN ('post_pickup', 'post_swim', 'post_raya', 'post_camp', 'post_newsletter', 'post_withdrawal')
`).all();

console.log(`Found ${ingestedItems.length} ingested feed items to clean.\n`);

for (const item of ingestedItems) {
  const cleanedTitle = cleanTitle(item.title);
  const cleanedContent = cleanEmailBody(item.content);
  const mediaUrls = JSON.parse(item.media_urls || '[]');
  
  // Handle image-only posts
  let finalContent = cleanedContent;
  if ((!finalContent || finalContent.trim().length < 5) && mediaUrls.length > 0) {
    finalContent = `📸 ${mediaUrls.length} image${mediaUrls.length > 1 ? 's' : ''} shared — tap to view.`;
  }
  
  // Remove false action items — only keep signature_required and rsvp
  const validActions = ['signature_required', 'rsvp'];
  const hasValidAction = validActions.includes(item.action_type);
  
  // Special check: newsletter shouldn't have signature_required
  const isNewsletter = cleanedTitle.toLowerCase().includes('newsletter') || cleanedTitle.toLowerCase().includes('e.newsletter');
  const isFalseAction = isNewsletter && item.action_type === 'signature_required';
  
  const shouldClearAction = !hasValidAction || isFalseAction;
  
  if (shouldClearAction && item.action_type) {
    console.log(`  ❌ Removing false action "${item.action_type}" from: ${cleanedTitle}`);
    db.prepare(`
      UPDATE feed_items SET title = ?, content = ?, action_type = NULL, action_button_label = NULL, action_due_date = NULL
      WHERE id = ?
    `).run(cleanedTitle, finalContent, item.id);
  } else {
    db.prepare(`
      UPDATE feed_items SET title = ?, content = ?
      WHERE id = ?
    `).run(cleanedTitle, finalContent, item.id);
  }
  
  console.log(`  ✅ Cleaned: "${item.title}" → "${cleanedTitle}" (${finalContent.length} chars)`);
}

// 2. Fix seeded items
// Remove acknowledgement from post_raya
const raya = db.prepare(`SELECT action_type FROM feed_items WHERE id = 'post_raya'`).get();
if (raya?.action_type === 'acknowledgement') {
  db.prepare(`UPDATE feed_items SET action_type = NULL, action_button_label = NULL, action_due_date = NULL WHERE id = 'post_raya'`).run();
  console.log('\n  ✅ Removed false acknowledgement from post_raya');
}

// 3. Find and remove obvious duplicates
// Check if the "No Subject" Hari Raya poster duplicates seeded post_raya
const noSubjectItems = db.prepare(`SELECT id, media_urls FROM feed_items WHERE title = 'No Subject' OR title = '(No Subject)'`).all();
for (const ns of noSubjectItems) {
  const nsMedia = JSON.parse(ns.media_urls || '[]');
  // If it's a single-image post, likely a duplicate poster
  if (nsMedia.length === 1) {
    console.log(`\n  🗑️  Removing likely duplicate: ${ns.id} (single image, no subject)`);
    db.prepare('DELETE FROM feed_items WHERE id = ?').run(ns.id);
    db.prepare('DELETE FROM ingested_emails WHERE feed_item_id = ?').run(ns.id);
  }
}

// Check for duplicate withdrawal notice
const withdrawalDupes = db.prepare(`
  SELECT id, title FROM feed_items 
  WHERE title LIKE '%Withdrawal%' AND id != 'post_withdrawal'
`).all();
for (const wd of withdrawalDupes) {
  console.log(`  🗑️  Removing duplicate: ${wd.id} — "${wd.title}"`);
  db.prepare('DELETE FROM feed_items WHERE id = ?').run(wd.id);
  db.prepare('DELETE FROM ingested_emails WHERE feed_item_id = ?').run(wd.id);
}

console.log('\n🧹 Cleanup complete!\n');

// Show final state
const allItems = db.prepare('SELECT id, title, action_type, LENGTH(content) as len FROM feed_items ORDER BY created_at DESC').all();
console.log('Final feed items:');
for (const item of allItems) {
  const action = item.action_type ? ` [${item.action_type}]` : '';
  console.log(`  ${item.id}: "${item.title}" (${item.len} chars)${action}`);
}
