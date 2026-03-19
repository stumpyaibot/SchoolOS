import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-gray-50/95 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between h-10 px-3">
        <div>
          <h1 className="text-[16px] font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/ai')}
            className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors active:scale-95"
            aria-label="AI Assistant"
          >
            <Sparkles size={14} strokeWidth={2} />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[12px] font-bold"
          >
            J
          </button>
        </div>
      </div>
    </header>
  );
}
