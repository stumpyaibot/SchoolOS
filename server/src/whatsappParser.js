/**
 * WhatsApp Chat Export Parser
 * 
 * Parses the standard WhatsApp "Export Chat" .txt format:
 *   [DD/MM/YYYY, HH:MM:SS] Sender Name: Message content
 *   or
 *   DD/MM/YYYY, HH:MM - Sender Name: Message content
 * 
 * Filters for teacher/admin messages and uses AI to extract structured data.
 */

import { parseEmailWithAI } from './emailParser.js';

// Common WhatsApp message patterns (handles multiple export formats)
const MESSAGE_PATTERNS = [
  // iOS format: [DD/MM/YYYY, HH:MM:SS] Name: Message
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?)\]\s+(.+?):\s+(.+)$/,
  // Android format: DD/MM/YYYY, HH:MM - Name: Message
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)\s*-\s*(.+?):\s+(.+)$/,
  // US format: M/D/YY, H:MM AM/PM - Name: Message
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}\s*[APap][Mm])\s*-\s*(.+?):\s+(.+)$/,
];

// System messages to skip
const SYSTEM_PATTERNS = [
  /messages and calls are end-to-end encrypted/i,
  /created this group/i,
  /added you/i,
  /changed the subject/i,
  /changed the group/i,
  /left$/i,
  /joined using this group/i,
  /changed their phone number/i,
  /\<media omitted\>/i,
  /this message was deleted/i,
  /you deleted this message/i,
];

/**
 * Parse a WhatsApp chat export text file
 * @param {string} text - Raw text content from WhatsApp export
 * @param {string[]} teacherNames - Names to filter for (teacher/admin messages only)
 * @returns {Array} Parsed messages
 */
export function parseWhatsAppExport(text, teacherNames = []) {
  const lines = text.split('\n');
  const messages = [];
  let currentMessage = null;

  for (const line of lines) {
    let matched = false;

    for (const pattern of MESSAGE_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        // Save previous multi-line message
        if (currentMessage) messages.push(currentMessage);

        const [, dateStr, timeStr, sender, content] = match;
        currentMessage = {
          date: normalizeDate(dateStr),
          time: timeStr.trim(),
          sender: sender.trim(),
          content: content.trim(),
        };
        matched = true;
        break;
      }
    }

    // Handle multi-line messages (continuation of previous message)
    if (!matched && currentMessage && line.trim()) {
      currentMessage.content += '\n' + line.trim();
    }
  }

  // Don't forget the last message
  if (currentMessage) messages.push(currentMessage);

  // Filter out system messages
  const filtered = messages.filter(msg => {
    return !SYSTEM_PATTERNS.some(pattern => pattern.test(msg.content));
  });

  // If teacher names provided, filter for those senders only
  if (teacherNames.length > 0) {
    const lowerNames = teacherNames.map(n => n.toLowerCase());
    return filtered.filter(msg => {
      const lowerSender = msg.sender.toLowerCase();
      return lowerNames.some(name => lowerSender.includes(name));
    });
  }

  return filtered;
}

/**
 * Parse WhatsApp export and use AI to extract structured items
 * @param {string} text - Raw WhatsApp export text
 * @param {string[]} teacherNames - Names of teachers/admins
 * @returns {Promise<Array>} AI-parsed items ready for feed
 */
export async function parseWhatsAppWithAI(text, teacherNames = []) {
  const messages = parseWhatsAppExport(text, teacherNames);

  if (messages.length === 0) {
    return { messages: [], items: [], summary: 'No teacher/admin messages found.' };
  }

  // Group consecutive messages from same sender within 5 minutes as one item
  const grouped = groupMessages(messages);

  // Parse each group with AI
  const items = [];
  for (const group of grouped) {
    const combinedContent = group.messages.map(m => m.content).join('\n');
    const parsed = await parseEmailWithAI(
      `WhatsApp from ${group.sender}`,
      combinedContent,
      group.sender
    );
    items.push({
      ...parsed,
      sender: group.sender,
      date: group.date,
      time: group.time,
      originalMessages: group.messages.map(m => m.content),
    });
  }

  return {
    totalMessages: messages.length,
    items,
    summary: `Found ${messages.length} messages, grouped into ${items.length} items.`,
  };
}

/**
 * Group consecutive messages from same sender
 */
function groupMessages(messages) {
  const groups = [];
  let current = null;

  for (const msg of messages) {
    if (current && current.sender === msg.sender && current.date === msg.date) {
      current.messages.push(msg);
    } else {
      if (current) groups.push(current);
      current = {
        sender: msg.sender,
        date: msg.date,
        time: msg.time,
        messages: [msg],
      };
    }
  }
  if (current) groups.push(current);
  return groups;
}

/**
 * Normalize date strings to YYYY-MM-DD
 */
function normalizeDate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;

  let [day, month, year] = parts;
  if (year.length === 2) year = '20' + year;

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
