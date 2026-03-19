/**
 * AI Assistant Routes — Parent chatbot powered by Ollama qwen3:14b
 * 
 * POST /api/ai/chat — Ask a question, get an AI answer with context from feed/calendar/messages
 */

import { Router } from 'express';
import db from './db.js';

const router = Router();

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'qwen3:14b';

/**
 * Build context about a parent's children, events, and recent feed items
 */
function buildContext(userId) {
  // Get parent's children
  const childIds = db.prepare('SELECT student_id FROM student_parents WHERE parent_id = ?')
    .all(userId).map(r => r.student_id);

  const children = childIds.map(id => {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    const cls = student ? db.prepare('SELECT * FROM classes WHERE id = ?').get(student.class_id) : null;
    const teacher = cls ? db.prepare('SELECT * FROM users WHERE id = ?').get(cls.teacher_id) : null;
    return { student, class: cls, teacher };
  });

  // Get relevant class IDs
  const classIds = children.map(c => c.class_id).filter(Boolean);

  // Recent feed items (last 20)
  const feedItems = db.prepare(`
    SELECT * FROM feed_items 
    ORDER BY created_at DESC 
    LIMIT 20
  `).all();

  // Upcoming calendar events
  const events = db.prepare(`
    SELECT * FROM calendar_events 
    WHERE start_time >= datetime('now', '-1 day')
    ORDER BY start_time ASC 
    LIMIT 10
  `).all();

  // Recent messages
  const convIds = db.prepare('SELECT conversation_id FROM conversation_participants WHERE user_id = ?')
    .all(userId).map(r => r.conversation_id);
  
  const recentMessages = [];
  for (const convId of convIds) {
    const msgs = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 5')
      .all(convId);
    recentMessages.push(...msgs);
  }

  return { children, feedItems, events, recentMessages };
}

/**
 * Format context into a readable string for the LLM
 */
function formatContext(context) {
  const today = new Date().toLocaleDateString('en-SG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  let text = `Today is ${today}.\n\n`;

  // Children info
  text += `PARENT'S CHILDREN:\n`;
  for (const { student, class: cls, teacher } of context.children) {
    if (student && cls && teacher) {
      text += `- ${student.first_name} ${student.last_name} (${student.grade_str}, Class ${cls.name}, Teacher: ${teacher.first_name} ${teacher.last_name})\n`;
    }
  }

  // Recent feed items
  text += `\nRECENT SCHOOL UPDATES:\n`;
  for (const item of context.feedItems) {
    const date = new Date(item.created_at).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' });
    text += `- [${date}] ${item.title}: ${item.content.slice(0, 150)}\n`;
    if (item.action_type) {
      text += `  ⚡ Action required: ${item.action_type} (due: ${item.action_due_date || 'unset'})\n`;
    }
  }

  // Upcoming events
  text += `\nUPCOMING EVENTS:\n`;
  for (const event of context.events) {
    const date = new Date(event.start_time).toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' });
    text += `- [${date}] ${event.title}${event.location ? ` at ${event.location}` : ''}: ${event.description || ''}\n`;
  }

  return text;
}

// ===== Chat endpoint =====
router.post('/chat', async (req, res) => {
  const { message, userId = 'u_parent_jack', conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing "message" field' });
  }

  try {
    // Build context from the database
    const context = buildContext(userId);
    const contextText = formatContext(context);

    // Build the prompt
    const systemPrompt = `You are the SchoolOS AI Assistant — a helpful, friendly chatbot for parents at an international school in Singapore.

You have access to the following information about this parent's children and school activities:

${contextText}

RULES:
- Answer questions based ONLY on the information provided above.
- If you're not sure about something, say "I'm not sure about that — please check with the teacher or school office."
- Be warm, concise, and helpful. Use emoji sparingly.
- If asked about dates or events, be specific and accurate.
- Never make up information that isn't in the context above.
- Keep answers under 3 sentences when possible.
- If asked "what do I need to do?", list any pending action items.`;

    // Build conversation history for multi-turn
    let fullPrompt = systemPrompt + '\n\n';
    for (const msg of conversationHistory.slice(-6)) { // Keep last 6 messages for context
      fullPrompt += `${msg.role === 'user' ? 'Parent' : 'Assistant'}: ${msg.content}\n`;
    }
    fullPrompt += `Parent: ${message}\nAssistant: /no_think`;

    console.log(`🤖 AI question: "${message}"`);

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 300,
        },
      }),
    });

    if (!response.ok) {
      console.error('Ollama error:', response.status);
      return res.json({
        response: "I'm having trouble connecting to my brain right now. Please try again in a moment! 🤔",
        error: true,
      });
    }

    const data = await response.json();
    let answer = data.response.trim();

    // Clean up: strip think tags, unwanted prefixes
    answer = answer.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    answer = answer.replace(/^(Assistant:|AI:)\s*/i, '');

    console.log(`🤖 AI answer: "${answer.slice(0, 100)}..."`);

    res.json({
      response: answer,
      model: MODEL,
      contextItemsUsed: {
        feedItems: context.feedItems.length,
        events: context.events.length,
        children: context.children.length,
      },
    });
  } catch (err) {
    console.error('AI chat error:', err);
    res.json({
      response: "Sorry, I couldn't process that right now. Please try again! 🤔",
      error: true,
    });
  }
});

// ===== Search endpoint =====
router.post('/search', (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing "query" field' });

  const terms = query.toLowerCase().split(/\s+/);

  // Search feed items
  const feedItems = db.prepare('SELECT * FROM feed_items ORDER BY created_at DESC').all()
    .filter(item => {
      const text = `${item.title} ${item.content}`.toLowerCase();
      return terms.some(term => text.includes(term));
    })
    .slice(0, 10);

  // Search calendar events
  const events = db.prepare('SELECT * FROM calendar_events ORDER BY start_time ASC').all()
    .filter(event => {
      const text = `${event.title} ${event.description || ''}`.toLowerCase();
      return terms.some(term => text.includes(term));
    })
    .slice(0, 5);

  res.json({ feedItems, events, totalResults: feedItems.length + events.length });
});

export default router;
