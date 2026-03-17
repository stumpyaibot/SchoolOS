import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherNav from '../../components/layout/TeacherNav';
import { teacherConversations, teacherMessages, class4BStudents, getParentName } from '../../data/teacherMockData';
import type { Message } from '../../types';

export default function TeacherMessages() {
  const navigate = useNavigate();
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>(teacherMessages);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, activeConv]);

  const activeConvData = teacherConversations.find(c => c.id === activeConv);
  const activeStudent = activeConvData ? class4BStudents.find(s => s.id === activeConvData.studentId) : null;
  const activeParentName = activeConvData ? getParentName(activeConvData.participantIds.find(id => id !== 'u_teacher_tan') || '') : '';

  const handleSend = () => {
    if (!input.trim() || !activeConv) return;
    const newMsg: Message = {
      id: `tmsg_new_${Date.now()}`,
      conversationId: activeConv,
      senderId: 'u_teacher_tan',
      content: input,
      timestamp: new Date().toISOString(),
      isRead: true,
    };
    setLocalMessages(prev => ({
      ...prev,
      [activeConv]: [...(prev[activeConv] || []), newMsg],
    }));
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNav />

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-200 flex overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          {/* Sidebar: Conversation List */}
          <div className="w-80 border-r border-gray-200 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-[14px] font-bold text-gray-900">Messages</h3>
              <p className="text-[11px] text-gray-400">Parent conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {teacherConversations.map((conv) => {
                const student = class4BStudents.find(s => s.id === conv.studentId);
                const parentId = conv.participantIds.find(id => id !== 'u_teacher_tan') || '';
                const parentName = getParentName(parentId);
                const isActive = activeConv === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv.id)}
                    className={`w-full p-4 text-left border-b border-gray-50 transition-colors ${
                      isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[13px] font-semibold text-gray-900">{parentName}</span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-blue-600 font-medium uppercase">Re: {student?.firstName}</p>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{conv.lastMessage.content}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main: Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900">{activeParentName}</h3>
                    <p className="text-[11px] text-gray-400">Re: {activeStudent?.firstName} {activeStudent?.lastName}</p>
                  </div>
                  <button
                    onClick={() => activeStudent && navigate(`/teacher/student/${activeStudent.id}`)}
                    className="text-[12px] text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View Student →
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                  {(localMessages[activeConv] || []).map((msg) => {
                    const isMe = msg.senderId === 'u_teacher_tan';
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
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
                  <div ref={endRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a reply..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 border-none outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    onClick={handleSend}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-[13px] font-medium hover:bg-blue-700 transition-colors active:scale-[0.97]"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-[14px]">
                Select a conversation to start
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
