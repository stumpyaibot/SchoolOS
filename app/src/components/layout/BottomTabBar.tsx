import { NavLink } from 'react-router-dom';
import { getTotalUnreadCount } from '../../data/mockData';

const tabs = [
  { to: '/home', label: 'Home', icon: '🏠' },
  { to: '/class/stu_leo_1', label: 'Class', icon: '📚' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/messages', label: 'Messages', icon: '💬' },
  { to: '/ai', label: 'AI', icon: '✨' },
];

export default function BottomTabBar() {
  const unread = getTotalUnreadCount();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-gray-50/95 backdrop-blur-lg border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-14 pb-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/home'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors relative ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.to === '/messages' && unread > 0 && (
              <span className="absolute -top-1 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

