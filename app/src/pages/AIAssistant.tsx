import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { feedItems, calendarEvents, getUserById, getStudentById } from '../data/mockData';

/* ===== Search-based AI Response Engine ===== */
function generateAIResponse(query: string): { text: string; deepLink?: string } {
  const q = query.toLowerCase();

  // Search feed items
  const matchingPosts = feedItems.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.content.toLowerCase().includes(q)
  );

  // Search calendar events
  const matchingEvents = calendarEvents.filter(event =>
    event.title.toLowerCase().includes(q) ||
    (event.description && event.description.toLowerCase().includes(q)) ||
    (event.location && event.location.toLowerCase().includes(q))
  );

  // --- Pattern: action items / to-do / need to do ---
  if (q.includes('action') || q.includes('to do') || q.includes('need to') || q.includes('pending') || q.includes('sign') || q.includes('due')) {
    const actionPosts = feedItems.filter(item => item.actionItem && !item.actionItem.isCompleted);
    if (actionPosts.length > 0) {
      const lines = actionPosts.map(p => {
        const student = p.targetAudiences.studentIds?.[0];
        const childName = student ? getStudentById(student)?.firstName : 'Whole School';
        const dueDate = new Date(p.actionItem!.dueDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
        const icon = p.priority === 'urgent' ? '🔴' : '🟡';
        return `${icon} **${p.title}** — Due ${dueDate} (${childName}). Action: ${p.actionItem!.buttonLabel}.`;
      });
      return {
        text: `Here are your pending action items:\n\n${lines.join('\n\n')}`,
        deepLink: actionPosts[0] ? `/post/${actionPosts[0].id}` : undefined,
      };
    }
    return { text: "You're all caught up! No pending action items right now. 🎉" };
  }

  // --- Pattern: specific child questions ---
  const askingAboutGeorge = q.includes('george');
  const askingAboutEmma = q.includes('emma');

  if (askingAboutGeorge || askingAboutEmma) {
    const childName = askingAboutGeorge ? 'George' : 'Emma';
    const childId = askingAboutGeorge ? 'stu_george' : 'stu_emma';
    const childPosts = feedItems.filter(item =>
      item.targetAudiences.studentIds?.includes(childId) ||
      (item.targetAudiences.classIds?.includes(askingAboutGeorge ? 'cls_y4_penguins' : 'cls_y6_jaguars'))
    );

    if (childPosts.length > 0) {
      const latest = childPosts[0];
      const author = getUserById(latest.authorId);
      const authorName = author ? `${author.firstName} ${author.lastName}` : 'A teacher';
      return {
        text: `Here's the latest about ${childName}:\n\n📝 **${latest.title}**\n${latest.content}\n\n— ${authorName}` +
          (childPosts.length > 1 ? `\n\nThere are ${childPosts.length - 1} more updates about ${childName}. Check the Home feed filtered by ${childName} for details!` : ''),
        deepLink: `/post/${latest.id}`,
      };
    }
    return { text: `I don't have any recent updates specifically about ${childName}. Try checking the class feed!` };
  }

  // --- Pattern: swimming / PE ---
  if (q.includes('swim') || q.includes('pe ') || q.includes('physical')) {
    const swimPost = feedItems.find(item => item.title.toLowerCase().includes('swim'));
    const swimEvent = calendarEvents.find(event => event.title.toLowerCase().includes('swim'));
    let response = '';
    if (swimPost) {
      response += `📋 **${swimPost.title}**\n${swimPost.content}`;
    }
    if (swimEvent) {
      const eventDate = new Date(swimEvent.startTime).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      response += `${response ? '\n\n' : ''}📅 **${swimEvent.title}** is on ${eventDate}`;
      if (swimEvent.location) response += ` at ${swimEvent.location}`;
    }
    if (response) return { text: response, deepLink: swimPost ? `/post/${swimPost.id}` : undefined };
  }

  // --- Pattern: book week / dress up ---
  if (q.includes('book') || q.includes('dress')) {
    const bookPost = feedItems.find(item => item.title.toLowerCase().includes('book'));
    const bookEvent = calendarEvents.find(event => event.title.toLowerCase().includes('book'));
    let response = '';
    if (bookPost) response += `📚 **${bookPost.title}**\n${bookPost.content}`;
    if (bookEvent) {
      const eventDate = new Date(bookEvent.startTime).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      response += `${response ? '\n\n' : ''}📅 Book Week starts ${eventDate}`;
    }
    if (response) return { text: response, deepLink: bookPost ? `/post/${bookPost.id}` : undefined };
  }

  // --- Pattern: conference / parent-teacher ---
  if (q.includes('conference') || q.includes('parent-teacher') || q.includes('meeting')) {
    const confEvent = calendarEvents.find(event =>
      event.title.toLowerCase().includes('conference') || event.title.toLowerCase().includes('parent-teacher')
    );
    if (confEvent) {
      const eventDate = new Date(confEvent.startTime).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      return {
        text: `The **${confEvent.title}** is scheduled for **${eventDate}**.${confEvent.location ? `\n\n📍 ${confEvent.location}` : ''}${confEvent.bookingDetails?.isBookable ? '\n\nYou can book a 15-minute slot. Would you like me to take you to the booking page?' : ''}`,
        deepLink: `/event/${confEvent.id}`,
      };
    }
  }

  // --- Pattern: calendar / events / this week / schedule ---
  if (q.includes('calendar') || q.includes('event') || q.includes('this week') || q.includes('schedule') || q.includes('what\'s happening') || q.includes('coming up')) {
    const upcoming = calendarEvents
      .filter(e => new Date(e.startTime) >= new Date())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 4);
    if (upcoming.length > 0) {
      const lines = upcoming.map(e => {
        const d = new Date(e.startTime).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
        return `📅 **${e.title}** — ${d}${e.location ? ` · ${e.location}` : ''}`;
      });
      return { text: `Here are the upcoming events:\n\n${lines.join('\n\n')}`, deepLink: '/calendar' };
    }
    return { text: "No upcoming events found. Check the calendar for the full schedule!" };
  }

  // --- Pattern: museum / trip / excursion / science ---
  if (q.includes('museum') || q.includes('trip') || q.includes('excursion') || q.includes('science')) {
    const tripPost = feedItems.find(item => item.title.toLowerCase().includes('museum') || item.title.toLowerCase().includes('trip'));
    if (tripPost) {
      return {
        text: `📋 **${tripPost.title}**\n${tripPost.content}${tripPost.actionItem ? `\n\n⚠️ This requires action: **${tripPost.actionItem.buttonLabel}**` : ''}`,
        deepLink: `/post/${tripPost.id}`,
      };
    }
  }

  // --- Generic search: check if any feed/calendar match ---
  if (matchingPosts.length > 0) {
    const post = matchingPosts[0];
    const author = getUserById(post.authorId);
    return {
      text: `I found a relevant post:\n\n📝 **${post.title}**\n${post.content}\n\n— ${author ? `${author.firstName} ${author.lastName}` : 'SchoolOS'}`,
      deepLink: `/post/${post.id}`,
    };
  }

  if (matchingEvents.length > 0) {
    const event = matchingEvents[0];
    const d = new Date(event.startTime).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    return {
      text: `I found a relevant event:\n\n📅 **${event.title}** — ${d}${event.location ? `\n📍 ${event.location}` : ''}`,
      deepLink: `/event/${event.id}`,
    };
  }

  // --- Fallback ---
  return {
    text: "I'm not sure about that. I can help with questions about your children's school updates, upcoming events, pending action items, or specific topics like swimming, Hari Raya, or the Y6 camp. Try asking something like:\n\n• \"What do I need to action this week?\"\n• \"Tell me about swimming\"\n• \"When is the parent-teacher conference?\"\n• \"What's happening with Emma?\"",
  };
}

/** Lightweight markdown: **bold** → <strong>, \n → <br> */
function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
    ));
  });
}

export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; deepLink?: string }[]>([
    { role: 'ai', text: 'Good morning, Jack! 👋 I\'m your SchoolOS assistant. I know everything about Emma and George\'s school life at EtonHouse Broadrick — updates, events, action items, and more. Ask me anything!' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const suggestions = [
    'What do I need to action this week?',
    'Tell me about swimming',
    "What's happening with Emma?",
    'When is the parent-teacher conference?',
    "What's coming up this month?",
  ];

  function handleSend(text: string) {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking delay (300-1200ms)
    const delay = 400 + Math.random() * 800;
    setTimeout(() => {
      setIsTyping(false);
      const response = generateAIResponse(text);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: response.text, deepLink: response.deepLink },
      ]);
    }, delay);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="AI Assistant" subtitle="Powered by SchoolOS" />

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-40 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[11px] font-bold mr-2 mt-1 shrink-0">
                AI
              </span>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
              }`}
            >
              <p className="text-[13px] leading-relaxed">{renderMarkdown(msg.text)}</p>
            </div>
          </div>
        ))}

        {/* Deep link chips */}
        {messages.length > 1 && messages[messages.length - 1].deepLink && (
          <div className="flex justify-start pl-9">
            <button
              onClick={() => navigate(messages[messages.length - 1].deepLink!)}
              className="bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-4 py-2 text-[12px] font-medium hover:bg-blue-100 transition-colors active:scale-[0.97]"
            >
              📍 View details →
            </button>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[11px] font-bold mr-2 mt-1 shrink-0">
              AI
            </span>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Fixed Bottom: Suggestion Chips + Input Bar */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-lg border-t border-gray-200 z-40">
        {/* Suggestion Chips */}
        {messages.length <= 1 && (
          <div className="px-3 pt-2 pb-1 flex gap-2 overflow-x-auto no-scrollbar">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-[11px] text-blue-600 font-medium whitespace-nowrap shrink-0 hover:bg-blue-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-2.5 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask about your children's school..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 border-none outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={() => handleSend(input)}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg shrink-0 transition-transform active:scale-90"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
