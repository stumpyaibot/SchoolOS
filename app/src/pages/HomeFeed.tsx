import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { feedItems, todayDigest, students, getUserById, getStudentById } from '../data/mockData';
import type { FeedItem } from '../types';

function typeLabel(item: FeedItem): string {
  switch (item.type) {
    case 'teacher_post': return 'CLASS UPDATE';
    case 'admin_announcement': return 'ADMIN';
    case 'ingested_whatsapp': return 'VIA WHATSAPP';
    case 'ingested_email': return 'VIA EMAIL';
    case 'student_work': return 'STUDENT WORK';
  }
}

function typeIcon(item: FeedItem): string {
  switch (item.type) {
    case 'teacher_post': return '📝';
    case 'admin_announcement': return '📢';
    case 'ingested_whatsapp': return '💬';
    case 'ingested_email': return '📧';
    case 'student_work': return '🎨';
  }
}

function iconBg(item: FeedItem): string {
  switch (item.type) {
    case 'ingested_whatsapp': return 'bg-green-100';
    case 'ingested_email': return 'bg-gray-100';
    case 'student_work': return 'bg-purple-100';
    case 'admin_announcement': return 'bg-orange-100';
    default: return 'bg-blue-100';
  }
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function childTag(item: FeedItem): string {
  if (item.targetAudiences.schoolWide) return 'WHOLE SCHOOL';
  if (item.targetAudiences.studentIds) {
    const s = getStudentById(item.targetAudiences.studentIds[0]);
    return s ? `${s.firstName.toUpperCase()} • ${s.gradeStr.toUpperCase()}` : '';
  }
  if (item.targetAudiences.classIds) {
    const classId = item.targetAudiences.classIds[0];
    return classId === 'cls_4b' ? 'LEO • GRADE 4' : 'MAYA • GRADE 1';
  }
  return '';
}

function isItemForChild(item: FeedItem, childId: string): boolean {
  const student = students.find(s => s.id === childId);
  if (!student) return false;
  // Item directly targets this student
  if (item.targetAudiences.studentIds?.includes(childId)) return true;
  // Item targets this student's class
  if (item.targetAudiences.classIds?.includes(student.classId)) return true;
  // School-wide items are always shown
  if (item.targetAudiences.schoolWide) return true;
  return false;
}

export default function HomeFeed() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const urgentItems = feedItems.filter(i => i.priority === 'urgent');
  const sortedFeed = [...feedItems]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter(item => activeFilter === 'all' || isItemForChild(item, activeFilter));

  const filteredDigest = activeFilter === 'all'
    ? todayDigest.items
    : todayDigest.items.filter(d => d.childId === activeFilter);

  return (
    <div className="pb-16">
      <Header title="SchoolOS" />

      <div className="px-2.5 pt-2 space-y-2">
        {/* Urgent Banner */}
        {urgentItems
          .filter(item => activeFilter === 'all' || isItemForChild(item, activeFilter))
          .map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(`/action/${item.id}`)}
            className="w-full bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-start gap-2.5 text-left transition-transform active:scale-[0.98]"
          >
            <span className="text-red-600 text-lg mt-0.5">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-0.5">ACTION REQUIRED</p>
              <p className="text-[13px] font-semibold text-red-800 truncate">{item.title}</p>
              <p className="text-[11px] text-red-600 mt-0.5">Due {new Date(item.actionItem!.dueDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
            </div>
            <span className="bg-red-500 text-white rounded-lg px-3 py-1.5 text-[12px] font-bold shrink-0">
              {item.actionItem!.buttonLabel}
            </span>
          </button>
        ))}

        {/* AI Digest Card */}
        {filteredDigest.length > 0 && (
          <button
            onClick={() => navigate('/ai')}
            className="w-full bg-white rounded-lg border border-gray-200 p-2.5 text-left transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">MORNING DIGEST • AI</span>
              <span className="text-[11px] text-gray-400">Today</span>
            </div>
            <div className="space-y-1">
              {filteredDigest.map((d, i) => {
                const child = getStudentById(d.childId);
                return (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-xs">{d.icon === 'warning' ? '🔴' : d.icon === 'logistics' ? '📋' : 'ℹ️'}</span>
                    <p className="text-[12px] text-gray-700 leading-snug">
                      <span className="font-bold text-gray-400 uppercase text-[10px]">{child?.firstName}</span>
                      <span className="text-gray-300 mx-1">·</span>
                      {d.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </button>
        )}

        {/* Child Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            All Children
          </button>
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveFilter(s.id)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                activeFilter === s.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              {s.firstName} — {s.gradeStr}
            </button>
          ))}
        </div>

        {/* Feed Cards */}
        {sortedFeed.map((item) => {
          const author = getUserById(item.authorId);
          const route = item.actionItem ? `/action/${item.id}` : `/post/${item.id}`;

          return (
            <button
              key={item.id}
              onClick={() => navigate(route)}
              className="w-full bg-white rounded-lg border border-gray-200 text-left block transition-transform active:scale-[0.98]"
            >
              {/* Card Header */}
              <div className="px-2.5 pt-2.5 pb-0.5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-lg ${iconBg(item)} flex items-center justify-center text-xs`}>{typeIcon(item)}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {typeLabel(item)} • {childTag(item)}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400">{timeAgo(item.timestamp)}</span>
              </div>

              {/* Card Body */}
              <div className="px-2.5 pb-2.5">
                <h3 className="text-[14px] font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-[12px] text-gray-500 leading-snug line-clamp-2">{item.content}</p>

                {/* Media Preview */}
                {item.mediaUrls && item.mediaUrls.length > 0 && (
                  <div className="mt-2 rounded-lg overflow-hidden">
                    <img src={item.mediaUrls[0]} alt="" className="w-full h-28 object-cover" />
                  </div>
                )}

                {/* Action Button */}
                {item.actionItem && !item.actionItem.isCompleted && (
                  <div className="mt-2 flex justify-end">
                    <span className="bg-blue-600 text-white rounded-lg px-4 py-1.5 text-[12px] font-bold">
                      {item.actionItem.buttonLabel}
                    </span>
                  </div>
                )}

                {/* Reactions */}
                {item.reactions && item.reactions.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {item.reactions.map((r, i) => (
                      <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${r.userReacted ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                        {r.type} {r.count}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author line */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                    {author ? author.firstName[0] + author.lastName[0] : '?'}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {author ? `${author.firstName} ${author.lastName}` : 'SchoolOS'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
