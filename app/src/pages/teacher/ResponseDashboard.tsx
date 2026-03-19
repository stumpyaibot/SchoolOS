import { useParams, useNavigate } from 'react-router-dom';
import TeacherNav from '../../components/layout/TeacherNav';
import { classY6Students, getParentName } from '../../data/teacherMockData';

type ResponseStatus = 'signed' | 'pending';

interface ParentResponse {
  parentId: string;
  studentId: string;
  status: ResponseStatus;
  respondedAt?: string;
}

// Mock response data
const mockResponses: ParentResponse[] = classY6Students.map((student, i) => ({
  parentId: student.parentIds[0],
  studentId: student.id,
  status: i < 4 ? 'signed' : 'pending',
  respondedAt: i < 4 ? new Date(Date.now() - (i + 1) * 3600000).toISOString() : undefined,
}));

export default function ResponseDashboard() {
  const { itemId: _itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  const signed = mockResponses.filter(r => r.status === 'signed');
  const pending = mockResponses.filter(r => r.status === 'pending');
  const total = mockResponses.length;
  const pct = Math.round((signed.length / total) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNav />

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-gray-900">Response Tracking</h2>
            <p className="text-[13px] text-gray-500">Science Museum Trip — Permission Slip</p>
          </div>
          <button
            onClick={() => navigate('/teacher')}
            className="text-[13px] text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-6">
            {/* Circular progress */}
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="35" fill="none"
                  stroke={pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#3b82f6'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${pct * 2.2} 220`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[18px] font-bold text-gray-900">
                {pct}%
              </span>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[24px] font-bold text-green-600">{signed.length}</p>
                  <p className="text-[11px] text-gray-500">Signed</p>
                </div>
                <div>
                  <p className="text-[24px] font-bold text-amber-500">{pending.length}</p>
                  <p className="text-[11px] text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending (show first — they need attention) */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
            ⏳ PENDING ({pending.length})
          </p>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {pending.map(r => {
              const student = classY6Students.find(s => s.id === r.studentId);
              return (
                <div key={r.studentId} className="flex items-center gap-3 p-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-[12px] font-bold">
                    {student?.firstName[0]}{student?.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-gray-900">{getParentName(r.parentId)}</p>
                    <p className="text-[11px] text-gray-400">{student?.firstName}'s parent</p>
                  </div>
                  <button className="text-[11px] text-blue-600 font-medium hover:text-blue-800 transition-colors">
                    Send Reminder
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Signed */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
            ✅ SIGNED ({signed.length})
          </p>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {signed.map(r => {
              const student = classY6Students.find(s => s.id === r.studentId);
              const timeAgo = r.respondedAt
                ? `${Math.round((Date.now() - new Date(r.respondedAt).getTime()) / 3600000)}h ago`
                : '';
              return (
                <div key={r.studentId} className="flex items-center gap-3 p-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-[12px] font-bold">
                    {student?.firstName[0]}{student?.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-gray-900">{getParentName(r.parentId)}</p>
                    <p className="text-[11px] text-gray-400">{student?.firstName}'s parent</p>
                  </div>
                  <span className="text-[11px] text-gray-400">{timeAgo}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Send Reminder to All */}
        <button className="w-full py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[14px] font-semibold hover:bg-amber-100 transition-colors active:scale-[0.98]">
          📨 Send Reminder to {pending.length} Pending Parents
        </button>
      </div>
    </div>
  );
}
