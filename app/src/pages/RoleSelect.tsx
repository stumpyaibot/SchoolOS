import { useNavigate } from 'react-router-dom';

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md px-6 py-12 text-center space-y-8">
        {/* Logo */}
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">SchoolOS</h1>
          <p className="text-[14px] text-gray-500 mt-1">Connect parents and teachers</p>
        </div>

        {/* Role Cards */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 text-left hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-[18px] font-bold shrink-0">
              J
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-gray-900">Jack Smith</p>
              <p className="text-[12px] text-gray-500">Parent — Leo (4B) & Maya (1A)</p>
            </div>
            <span className="text-gray-300 text-xl">›</span>
          </button>

          <button
            onClick={() => navigate('/teacher')}
            className="w-full bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 text-left hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white text-[18px] font-bold shrink-0">
              MT
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-gray-900">Mr. Tan</p>
              <p className="text-[12px] text-gray-500">Teacher — Class 4B Jaguars</p>
            </div>
            <span className="text-gray-300 text-xl">›</span>
          </button>
        </div>

        <p className="text-[11px] text-gray-400">SchoolOS v1.0 · Demo</p>
      </div>
    </div>
  );
}
