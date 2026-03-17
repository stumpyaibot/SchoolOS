import { useNavigate } from 'react-router-dom';

interface BackHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
}

export default function BackHeader({ title, rightAction }: BackHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-gray-50/95 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between h-10 px-3">
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/home')}
          className="text-blue-600 text-[14px] font-medium flex items-center gap-1"
        >
          <span className="text-lg">‹</span> Back
        </button>
        <h1 className="text-[15px] font-semibold text-gray-900 absolute left-1/2 -translate-x-1/2">
          {title}
        </h1>
        <div className="min-w-[60px] flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
}
