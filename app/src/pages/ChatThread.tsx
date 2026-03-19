import { useParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import BackHeader from '../components/layout/BackHeader';
import { allMessages, conversations, getUserById, getStudentById } from '../data/mockData';
import type { Message } from '../types';

export default function ChatThread() {
  const { convId } = useParams<{ convId: string }>();
  const conv = conversations.find(c => c.id === convId);
  const otherId = conv?.participantIds.find(id => id !== 'u_parent_jack')!;
  const other = getUserById(otherId);
  const student = getStudentById(conv?.studentId || '');

  const initialMessages = allMessages[convId || ''] || [];
  const [localMessages, setLocalMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `msg_new_${Date.now()}`,
      conversationId: convId || '',
      senderId: 'u_parent_jack',
      content: input,
      timestamp: new Date().toISOString(),
      isRead: true,
    };
    setLocalMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate teacher auto-reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: `msg_reply_${Date.now()}`,
        conversationId: convId || '',
        senderId: otherId,
        content: getAutoReply(input),
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setLocalMessages(prev => [...prev, reply]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <BackHeader
        title={other ? `${other.firstName} ${other.lastName}` : 'Chat'}
        rightAction={
          <span className="text-[11px] text-gray-400">Re: {student?.firstName}</span>
        }
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-20 space-y-2">
        {localMessages.map((msg) => {
          const isMe = msg.senderId === 'u_parent_jack';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                }`}
              >
                <p className="text-[13px] leading-snug">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-lg border-t border-gray-200 p-2.5 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 border-none outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg shrink-0 transition-transform active:scale-90"
        >
          ↑
        </button>
      </div>
    </div>
  );
}

function getAutoReply(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  if (msg.includes('thank')) return 'You\'re welcome, Jack! 😊';
  if (msg.includes('permission') || msg.includes('consent')) return 'Great, I\'ll make sure to note that down. Thanks for confirming! 👍';
  if (msg.includes('swim') || msg.includes('pe')) return 'No worries — I\'ll remind George about his PE kit on Thursday morning. 🏊';
  if (msg.includes('camp')) return 'Noted, Jack. I\'ll make sure Emma is all sorted for the camp arrangements. 👍';
  return `Thanks Jack, noted! I'll get back to you shortly. 👍`;
}
