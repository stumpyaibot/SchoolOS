import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { conversations, getUserById, getStudentById } from '../data/mockData';

export default function Messages() {
  const navigate = useNavigate();

  return (
    <div className="pb-16">
      <Header title="Messages" />

      <div className="px-2.5 pt-2 space-y-1.5">
        {conversations.map((conv) => {
          const otherId = conv.participantIds.find(id => id !== 'u_parent_jack')!;
          const other = getUserById(otherId);
          const student = getStudentById(conv.studentId);

          return (
            <button
              key={conv.id}
              onClick={() => navigate(`/messages/${conv.id}`)}
              className="w-full bg-white rounded-lg border border-gray-200 p-2.5 flex items-center gap-2.5 text-left transition-transform active:scale-[0.98]"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-[14px] font-bold text-blue-700">
                  {other ? other.firstName[0] + other.lastName[0] : '?'}
                </div>
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className={`text-[14px] ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'} truncate`}>
                    {other ? `${other.firstName} ${other.lastName}` : 'Teacher'}
                  </p>
                  <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                    {new Date(conv.lastMessage.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  RE: {student?.firstName}
                </p>
                <p className={`text-[12px] truncate ${conv.unreadCount > 0 ? 'text-gray-800' : 'text-gray-500'}`}>
                  {conv.lastMessage.content}
                </p>
              </div>

              <span className="text-gray-300 text-lg shrink-0">›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
