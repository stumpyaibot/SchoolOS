import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/teacher', icon: '📊' },
  { label: 'New Post', path: '/teacher/post/new', icon: '✏️' },
  { label: 'Messages', path: '/teacher/messages', icon: '💬' },
];

export default function TeacherNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top row: logo + avatar */}
      <div className="px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-bold text-gray-900">SchoolOS</h1>
          <span className="text-[12px] text-gray-400 font-medium">TEACHER</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="text-[12px] text-gray-400 hover:text-blue-600 transition-colors hidden sm:block"
          >
            Switch to Parent →
          </button>
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-[12px] font-bold">
            MT
          </div>
        </div>
      </div>

      {/* Nav row — scrollable on mobile */}
      <div className="px-4 sm:px-6 pb-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap text-gray-400 hover:text-blue-600 transition-colors sm:hidden"
        >
          <span className="text-sm">👤</span>
          Parent View
        </button>
      </div>
    </header>
  );
}

