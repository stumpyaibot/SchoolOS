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
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <h1 className="text-[18px] font-bold text-gray-900">SchoolOS</h1>
        <span className="text-[12px] text-gray-400 font-medium">TEACHER</span>
      </div>

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
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
      </nav>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/home')}
          className="text-[12px] text-gray-400 hover:text-blue-600 transition-colors"
        >
          Switch to Parent →
        </button>
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-[12px] font-bold">
          MT
        </div>
      </div>
    </header>
  );
}
