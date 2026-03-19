import { useParams, useNavigate } from 'react-router-dom';
import TeacherNav from '../../components/layout/TeacherNav';
import { classY6Students, getParentName, teacherRecentPosts } from '../../data/teacherMockData';

export default function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const student = classY6Students.find(s => s.id === studentId);

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TeacherNav />
        <div className="p-12 text-center text-gray-500">Student not found.</div>
      </div>
    );
  }

  const parentName = getParentName(student.parentIds[0]);
  const studentPosts = teacherRecentPosts.filter(p => p.studentId === student.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNav />

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate('/teacher')}
          className="text-[13px] text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Dashboard
        </button>

        {/* Student Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[20px] font-bold">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-[18px] font-bold text-gray-900">{student.firstName} {student.lastName}</h2>
            <p className="text-[13px] text-gray-500">{student.gradeStr} · Y6 Jaguars</p>
            <p className="text-[12px] text-gray-400 mt-1">Parent: {parentName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/teacher/post/new?type=student_work`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[12px] font-medium hover:bg-blue-700 transition-colors"
            >
              Share Work
            </button>
            <button
              onClick={() => navigate('/teacher/messages')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-[12px] font-medium hover:bg-gray-200 transition-colors"
            >
              Message Parent
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Posts about this student */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">SHARED WITH PARENT</h3>
            {studentPosts.length === 0 ? (
              <p className="text-[12px] text-gray-400">No posts shared yet.</p>
            ) : (
              <div className="space-y-3">
                {studentPosts.map((post) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    {post.mediaUrl && (
                      <img src={post.mediaUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    )}
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">{post.title}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-2">{post.content}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(post.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">DETAILS</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-[12px] text-gray-500">Attendance</span>
                  <span className="text-[12px] font-medium text-green-600">96%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-gray-500">Permission slips</span>
                  <span className="text-[12px] font-medium text-gray-900">All signed ✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-gray-500">Last parent contact</span>
                  <span className="text-[12px] font-medium text-gray-900">2 days ago</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">NOTES</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Strong in creative writing and maths. Enjoys PE — always first to volunteer. Sometimes quiet during group work — encourage participation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
