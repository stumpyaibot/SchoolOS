import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { feedItems, students, classes } from '../data/mockData';

export default function ClassView() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const student = students.find(s => s.id === childId) || students[0];
  const cls = classes.find(c => c.id === student.classId);
  const classItems = feedItems.filter(
    (i) =>
      i.targetAudiences.classIds?.includes(student.classId) ||
      i.targetAudiences.studentIds?.includes(student.id)
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const updates = classItems.filter(i => i.type !== 'student_work');
  const studentWork = classItems.filter(i => i.type === 'student_work');

  return (
    <div className="pb-16">
      <Header title={cls?.name || 'Class'} />

      <div className="px-2.5 pt-2 space-y-2">
        {/* Child switcher */}
        <div className="flex gap-2">
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/class/${s.id}`)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                s.id === student.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              {s.firstName}
            </button>
          ))}
        </div>

        {/* Updates Section */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">UPDATES</p>
        {updates.length === 0 && <p className="text-[12px] text-gray-400">No updates yet.</p>}
        {updates.map((item) => {
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.actionItem ? `/action/${item.id}` : `/post/${item.id}`)}
              className="w-full bg-white rounded-lg border border-gray-200 p-2.5 text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {item.type === 'ingested_whatsapp' ? '💬 VIA WHATSAPP' : item.type === 'ingested_email' ? '📧 VIA EMAIL' : '📝 UPDATE'}
                </span>
                <span className="text-[11px] text-gray-400">{new Date(item.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-900">{item.title}</h3>
              <p className="text-[12px] text-gray-500 line-clamp-2 mt-0.5">{item.content}</p>
              {item.actionItem && (
                <span className="inline-block mt-2 bg-blue-600 text-white rounded-lg px-3 py-1 text-[11px] font-bold">
                  {item.actionItem.buttonLabel}
                </span>
              )}
            </button>
          );
        })}

        {/* Student Work Section */}
        {studentWork.length > 0 && (
          <>
            <div className="flex items-center justify-between mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">STUDENT WORK</p>
              <button
                onClick={() => navigate(`/gallery/${student.id}`)}
                className="text-[11px] text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                View Gallery →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {studentWork.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/post/${item.id}`)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden text-left"
                >
                  {item.mediaUrls?.[0] && (
                    <img src={item.mediaUrls[0]} alt="" className="w-full h-28 object-cover" />
                  )}
                  <div className="p-2">
                    <p className="text-[12px] font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-[10px] text-gray-400">{new Date(item.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
