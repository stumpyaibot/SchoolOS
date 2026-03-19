/**
 * Email AI Parser — uses Ollama qwen3:14b to extract structured data from emails.
 * Parses subject + body into a structured feed item.
 * 
 * Content Ingestion Principles:
 * 1. Strip forwarding headers, email footers, tracking URLs, boilerplate
 * 2. "Kindly note…" ≠ action required — only explicit action requests create actions
 * 3. Summarise long-form content into clean, parent-friendly text
 */

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'qwen3:14b';

/* ===== Content Cleanup Utilities ===== */

/**
 * Strip "Fwd:", "Re:", "Post:" prefixes and decode HTML entities from email subjects
 */
export function cleanTitle(subject) {
  let title = subject || '(No Subject)';
  
  // Strip common prefixes (can be nested: "Fwd: Re: Fwd:")
  title = title.replace(/^(?:Fwd|Fw|Re|Post):\s*/gi, '');
  title = title.replace(/^(?:Fwd|Fw|Re|Post):\s*/gi, ''); // second pass for nested
  title = title.replace(/^(?:Fwd|Fw|Re|Post):\s*/gi, ''); // third pass
  
  // Decode HTML entities
  title = title.replace(/&#x27;/g, "'");
  title = title.replace(/&amp;/g, '&');
  title = title.replace(/&lt;/g, '<');
  title = title.replace(/&gt;/g, '>');
  title = title.replace(/&quot;/g, '"');
  title = title.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));
  
  return title.trim();
}

/**
 * Clean email body — strip forwarding headers, boilerplate, tracking URLs, signatures
 */
export function cleanEmailBody(body) {
  if (!body || body.trim().length === 0) return '';
  
  let text = body;
  
  // Strip forwarding headers block
  text = text.replace(/---------- Forwarded message ---------\s*\n(?:From:.*\n|Date:.*\n|Subject:.*\n|To:.*\n|Cc:.*\n|\n)*/gi, '');
  
  // Strip Bloomz boilerplate
  text = text.replace(/This message was intended for.*$/gm, '');
  text = text.replace(/You can manage your e-mail subscriptions here[\s\S]*$/gm, '');
  text = text.replace(/© \d{4} Bloomz Inc\.[\s\S]*$/gm, '');
  text = text.replace(/Like this Post[\s\S]*?View\s*this Post/gi, '');
  
  // Strip Mailchimp / email marketing boilerplate
  text = text.replace(/View this email in your browser[\s\S]*$/i, '');
  text = text.replace(/Want to change how you receive these emails\?[\s\S]*$/i, '');
  text = text.replace(/This email was sent to[\s\S]*$/i, '');
  text = text.replace(/Copyright ©[\s\S]*$/i, '');
  text = text.replace(/\*Copyright ©[\s\S]*$/i, '');
  text = text.replace(/Email Marketing Powered by[\s\S]*$/i, '');
  text = text.replace(/update your preferences[\s\S]*$/i, '');
  text = text.replace(/unsubscribe from this list[\s\S]*$/i, '');
  
  // Strip tracking URLs and image references
  text = text.replace(/<https?:\/\/[^>]+>/g, '');
  text = text.replace(/\[image:[^\]]*\]/g, '');
  
  // Strip Bloomz app download links
  text = text.replace(/https?:\/\/(?:itunes\.apple\.com|play\.google\.com)[^\s]*/g, '');
  text = text.replace(/https?:\/\/app\.bloomz\.net[^\s]*/g, '');
  
  // Strip generic email signatures
  text = text.replace(/^Regards,?\s*$/gm, '');
  text = text.replace(/^Kind regards,?\s*$/gim, '');
  text = text.replace(/^Best,?\s*$/gm, '');
  text = text.replace(/^Sent from my (?:iPhone|iPad|Android).*$/gm, '');
  
  // Strip leaked CC/recipient email addresses
  text = text.replace(/^[A-Za-z\s]+<[^>]+@[^>]+>[\s,]*/gm, '');
  
  // Truncate email chains — stop at quoted replies
  // Look for "On ... wrote:" pattern (Gmail reply format)
  const chainMatch = text.match(/^On .+wrote:\s*$/m);
  if (chainMatch) {
    text = text.slice(0, chainMatch.index).trim();
  }
  // Also strip any remaining quoted lines (> prefix)
  text = text.replace(/^>.*$/gm, '');
  
  // Clean up excessive whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();
  
  return text;
}

/**
 * Try to extract readable text from HTML when plain text is empty
 * (Bloomz emails often only have HTML content)
 */
export function extractTextFromHtml(html) {
  if (!html) return '';
  
  let text = html;
  
  // Remove style and script blocks
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Convert common block elements to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/tr>/gi, '\n');
  
  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/gi, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&#x27;/g, "'");
  text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));
  
  // Clean whitespace
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();
  
  return text;
}

const SYSTEM_PROMPT = `You are an AI assistant for SchoolOS, a school-home communication platform.
Your job is to parse incoming school emails and extract structured information for parents.

Given an email subject and body, extract:
1. title: A clean, concise title (strip "Fwd:", "Re:" prefixes, make it informative)
2. content: The key message, cleaned up and summarised for parents. Remove forwarding headers, email boilerplate, tracking URLs. Write in a friendly, clear way.
3. priority: "urgent" (action needed ASAP), "important" (should read soon), or "normal" (FYI)
4. category: "announcement", "reminder", "action_required", or "info"
5. actionType: ONLY if a genuine action is explicitly required from the parent. Must be one of: "signature_required" (form/consent to sign), "rsvp" (event registration), or null. 
6. actionDueDate: If there's a deadline, extract it as ISO date string, or null
7. extractedDates: Array of any dates mentioned (as ISO strings)
8. targetAudience: "school_wide" or specific class/grade if mentioned

CRITICAL RULES for actionType:
- "Kindly note that...", "Please be informed...", "For your information" → NO action required (null)
- Informational reminders about upcoming events → NO action required (null)
- Only create actions for EXPLICIT requests: "please complete this form", "RSVP by...", "sign and return"
- When in doubt, set actionType to null

IMPORTANT: Respond with ONLY valid JSON. No markdown, no explanation. Just the JSON object.`;

/**
 * Parse an email using Ollama/Qwen3
 */
export async function parseEmailWithAI(subject, body, fromAddress) {
  // Pre-clean the body before sending to AI
  const cleanedBody = cleanEmailBody(body);
  const cleanedSubject = cleanTitle(subject);
  
  const prompt = `${SYSTEM_PROMPT}

Parse this email:

FROM: ${fromAddress}
SUBJECT: ${cleanedSubject}

BODY:
${cleanedBody || '(No text content — this email may contain only images)'}

/no_think
Respond with JSON only:`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 500,
        },
      }),
    });

    if (!response.ok) {
      console.error('Ollama error:', response.status);
      return fallbackParse(cleanedSubject, cleanedBody);
    }

    const data = await response.json();
    let text = data.response.trim();
    
    // Strip think tags if present
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('AI did not return valid JSON, using fallback parser');
      return fallbackParse(cleanedSubject, cleanedBody);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      title: cleanTitle(parsed.title || subject),
      content: parsed.content || cleanedBody,
      priority: ['urgent', 'important', 'normal'].includes(parsed.priority) ? parsed.priority : 'normal',
      category: parsed.category || 'info',
      actionType: isValidAction(parsed.actionType) ? parsed.actionType : null,
      actionDueDate: parsed.actionDueDate || null,
      extractedDates: parsed.extractedDates || [],
      targetAudience: parsed.targetAudience || 'school_wide',
    };
  } catch (err) {
    console.error('AI parsing failed:', err.message);
    return fallbackParse(cleanTitle(subject), cleanEmailBody(body));
  }
}

/**
 * Validate that an action type is genuine — not a false positive
 */
function isValidAction(actionType) {
  if (!actionType) return false;
  const validTypes = ['signature_required', 'rsvp'];
  return validTypes.includes(actionType);
}

/**
 * Fallback parser when AI is unavailable — conservative with actions
 */
function fallbackParse(subject, body) {
  const combined = `${subject} ${body}`.toLowerCase();

  let priority = 'normal';
  if (combined.includes('urgent') || combined.includes('immediately') || combined.includes('asap')) {
    priority = 'urgent';
  } else if (combined.includes('important') || combined.includes('reminder') || combined.includes('dress up') || combined.includes('dress-up')) {
    priority = 'important';
  }

  // Very conservative action detection — only explicit form/consent requests
  let actionType = null;
  if (combined.includes('consent form') || combined.includes('permission form') || combined.includes('withdrawal form') || combined.includes('complete the online')) {
    actionType = 'signature_required';
  } else if (combined.includes('rsvp required') || combined.includes('rsvp by') || combined.includes('register by')) {
    actionType = 'rsvp';
  }
  // NOTE: We intentionally do NOT trigger actions for:
  // - "kindly note" / "please note" (informational)
  // - "confirm" / "acknowledge" (conversational)
  // - generic "sign" / "attend" (too broad)

  return {
    title: cleanTitle(subject),
    content: body?.trim() || '',
    priority,
    category: actionType ? 'action_required' : 'info',
    actionType,
    actionDueDate: null,
    extractedDates: [],
    targetAudience: 'school_wide',
  };
}
