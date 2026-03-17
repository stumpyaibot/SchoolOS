import { useNavigate } from 'react-router-dom';
import TeacherNav from '../../components/layout/TeacherNav';
import { class4BStudents, teacherRecentPosts, teacherPendingActions, getStudentById } from '../../data/teacherMockData';

export default function TeacherDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNav />

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

        {/* Quick Actions */}
        <div className="flex gap-3">
          {[
            { label: 'Share Student Work', icon: '🎨', color: 'bg-purple-50 border-purple-200 text-purple-700', action: () => navigate('/teacher/post/new?type=student_work') },
            { label: 'Class Update', icon: '📝', color: 'bg-blue-50 border-blue-200 text-blue-700', action: () => navigate('/teacher/post/new?type=class_update') },
            { label: 'Send Reminder', icon: '⏰', color: 'bg-amber-50 border-amber-200 text-amber-700', action: () => navigate('/teacher/post/new?type=reminder') },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className={`flex-1 ${btn.color} border rounded-xl p-4 text-center transition-transform active:scale-[0.98] hover:shadow-sm`}
            >
              <span className="text-2xl block mb-2">{btn.icon}</span>
              <span className="text-[13px] font-semibold">{btn.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Class Roster */}
          <div className="col-span-2 space-y-6">
            {/* Roster Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[16px] font-bold text-gray-900">4B — Jaguars</h2>
                  <p className="text-[12px] text-gray-400">{class4BStudents.length} students</p>
                </div>
              </div>

              {/* Student Grid */}
              <div className="grid grid-cols-4 gap-3">
                {class4BStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => navigate(`/teacher/student/${student.id}`)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 transition-colors active:scale-[0.97]"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[14px] font-bold">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <span className="text-[12px] text-gray-700 font-medium text-center">{student.firstName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">RECENT POSTS</h3>
              <div className="space-y-3">
                {teacherRecentPosts.map((post) => {
                  const student = post.studentId ? getStudentById(post.studentId) : null;
                  return (
                    <div
                      key={post.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                    >
                      {post.mediaUrl && (
                        <img src={post.mediaUrl} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            {post.type === 'student_work' ? '🎨 STUDENT WORK' : '📝 UPDATE'}
                          </span>
                          {student && (
                            <span className="text-[10px] font-bold text-blue-600 uppercase">· {student.firstName}</span>
                          )}
                        </div>
                        <p className="text-[13px] font-semibold text-gray-900 truncate">{post.title}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{post.content}</p>

                        {/* Read Receipt Bar */}
                        {post.readCount !== undefined && post.totalAudience !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-gray-500">
                                {post.readCount}/{post.totalAudience} parents read
                              </span>
                              {post.reactions !== undefined && (
                                <span className="text-[10px] text-gray-400">{post.reactions} reactions</span>
                              )}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`rounded-full h-1.5 transition-all ${
                                  post.readCount / post.totalAudience > 0.8 ? 'bg-green-500'
                                  : post.readCount / post.totalAudience > 0.5 ? 'bg-amber-500'
                                  : 'bg-blue-500'
                                }`}
                                style={{ width: `${(post.readCount / post.totalAudience) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <p className="text-[10px] text-gray-400 mt-1">{new Date(post.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Stats Sidebar */}
          <div className="space-y-4">
            {/* Unread Messages */}
            <button
              onClick={() => navigate('/teacher/messages')}
              className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-sm transition-shadow active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">MESSAGES</span>
                {teacherPendingActions.unreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                    {teacherPendingActions.unreadMessages}
                  </span>
                )}
              </div>
              <p className="text-[24px] font-bold text-gray-900">{teacherPendingActions.unreadMessages}</p>
              <p className="text-[11px] text-gray-400">unread from parents</p>
            </button>

            {/* Permission Slips */}
            <button
              onClick={() => navigate('/teacher/responses/post_884')}
              className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-sm transition-shadow active:scale-[0.98]"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">PERMISSION SLIPS</span>
              <div className="mt-2">
                <p className="text-[24px] font-bold text-gray-900">
                  {teacherPendingActions.signedPermissionSlips}/{teacherPendingActions.totalStudents}
                </p>
                <p className="text-[11px] text-gray-400">signed — Science Museum Trip</p>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 rounded-full h-2 transition-all"
                    style={{ width: `${(teacherPendingActions.signedPermissionSlips / teacherPendingActions.totalStudents) * 100}%` }}
                  />
                </div>
              </div>
            </button>

            {/* Class Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">THIS WEEK</span>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-600">Posts shared</span>
                  <span className="text-[13px] font-bold text-gray-900">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-600">Parent views</span>
                  <span className="text-[13px] font-bold text-gray-900">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-600">Responses</span>
                  <span className="text-[13px] font-bold text-gray-900">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
