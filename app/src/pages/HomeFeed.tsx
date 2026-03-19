import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { students, getUserById, getStudentById, getClassById } from '../data/mockData';
import { getFeedItems, getTodayDigest } from '../lib/dataAccess';
import type { FeedItem } from '../types';

/* ===== Helper: which child does this item belong to? ===== */
function getChildIdForItem(item: FeedItem): string | null {
  if (item.targetAudiences.studentIds) {
    return item.targetAudiences.studentIds[0];
  }
  if (item.targetAudiences.classIds) {
    const child = students.find(s => s.classId === item.targetAudiences.classIds![0]);
    return child?.id ?? null;
  }
  return null; // school-wide
}

/* ===== Child color system ===== */
function childColor(childId: string | null): { text: string; bg: string; border: string; dot: string } {
  if (childId === 'stu_emma') return { text: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-300', dot: 'bg-teal-500' };
  if (childId === 'stu_george') return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', dot: 'bg-amber-500' };
  return { text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-300', dot: 'bg-gray-400' };
}

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

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function childTagLabel(item: FeedItem): string {
  if (item.targetAudiences.schoolWide) return 'WHOLE SCHOOL';
  if (item.targetAudiences.studentIds) {
    const s = getStudentById(item.targetAudiences.studentIds[0]);
    return s ? `${s.firstName.toUpperCase()} • ${s.gradeStr.toUpperCase()}` : '';
  }
  if (item.targetAudiences.classIds) {
    const classId = item.targetAudiences.classIds[0];
    const child = students.find(s => s.classId === classId);
    if (child) return `${child.firstName.toUpperCase()} • ${child.gradeStr.toUpperCase()}`;
    const cls = getClassById(classId);
    return cls ? cls.name.toUpperCase() : '';
  }
  return '';
}

function isItemForChild(item: FeedItem, childId: string): boolean {
  const student = students.find(s => s.id === childId);
  if (!student) return false;
  if (item.targetAudiences.studentIds?.includes(childId)) return true;
  if (item.targetAudiences.classIds?.includes(student.classId)) return true;
  return false;
}

export default function HomeFeed() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch feed items from API (with mock fallback)
  useEffect(() => {
    getFeedItems().then(items => {
      setFeedItems(items);
      setLoading(false);
    });
  }, []);

  // Digest still from mock (will be AI-generated later)
  const todayDigest = getTodayDigest();

  const urgentItems = feedItems.filter(i => i.priority === 'urgent' && i.actionItem);
  const sortedFeed = [...feedItems]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter(item => activeFilter === 'all' || isItemForChild(item, activeFilter));

  const filteredDigest = activeFilter === 'all'
    ? todayDigest.items
    : todayDigest.items.filter(d => d.childId === activeFilter);

  return (
    <div className="pb-16">
      <Header title="SchoolOS" />

      <div className="px-2.5 pt-2 space-y-3">
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

        {/* ===== Morning Digest ===== */}
        {filteredDigest.length > 0 && (
          <button
            onClick={() => navigate('/ai')}
            className="w-full bg-white rounded-lg border border-gray-200 p-3 text-left transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Morning Digest • AI</span>
              <span className="text-[11px] text-gray-400">Today</span>
            </div>
            <div className="space-y-1.5">
              {filteredDigest.map((d, i) => {
                const child = d.childId ? getStudentById(d.childId) : null;
                const colors = childColor(d.childId ?? null);
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full ${colors.dot} mt-1.5 shrink-0`} />
                    <p className="text-[13px] text-gray-700 leading-snug">
                      <span className={`font-semibold uppercase text-[10px] ${colors.text}`}>{child?.firstName ?? 'ALL'}</span>
                      <span className="text-gray-300 mx-1">·</span>
                      {d.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </button>
        )}

        {/* ===== Child Filter Chips ===== */}
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
          {students.map((s) => {
            const colors = childColor(s.id);
            const isActive = activeFilter === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveFilter(s.id)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors border ${
                  isActive
                    ? `${colors.bg} ${colors.border} ${colors.text}`
                    : `bg-white ${colors.border} ${colors.text}`
                }`}
                style={{ opacity: isActive ? 1 : 0.7 }}
              >
                {s.firstName} — {s.gradeStr}
              </button>
            );
          })}
        </div>

        {/* ===== Feed Cards ===== */}
        {sortedFeed.map((item) => {
          const author = getUserById(item.authorId);
          const route = item.actionItem ? `/action/${item.id}` : `/post/${item.id}`;
          const itemChildId = getChildIdForItem(item);
          const colors = childColor(itemChildId);

          return (
            <button
              key={item.id}
              onClick={() => navigate(route)}
              className="w-full bg-white rounded-lg border border-gray-200 text-left block transition-transform active:scale-[0.98]"
            >
              {/* Card Header — Pill Badges */}
              <div className="px-2.5 pt-2.5 pb-0.5 flex justify-between items-center">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Source type pill */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                    {typeIcon(item)} {typeLabel(item)}
                  </span>
                  {/* Child/audience pill */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${colors.bg} border ${colors.border} text-[9px] font-bold ${colors.text} uppercase tracking-wide`}>
                    {childTagLabel(item)}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0 ml-2">{timeAgo(item.timestamp)}</span>
              </div>

              {/* Card Body */}
              <div className="px-2.5 pb-2.5">
                <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">{item.title}</h3>
                {item.bulletSummary ? (
                  <ul className="space-y-0.5">
                    {item.bulletSummary.slice(0, 3).map((b, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[12px] text-gray-600 leading-snug">
                        <span className="text-blue-400 mt-px shrink-0">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                    {item.bulletSummary.length > 3 && (
                      <li className="text-[11px] text-blue-600 font-medium pl-4">+{item.bulletSummary.length - 3} more…</li>
                    )}
                  </ul>
                ) : item.summary ? (
                  <p className="text-[12px] text-gray-500 leading-snug">{item.summary}</p>
                ) : null}

                {/* Media Preview — 16:9 aspect ratio */}
                {item.mediaUrls && item.mediaUrls.length > 0 && (
                  <div className="mt-2 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <img src={item.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Action Button — only for real actions (not acknowledgements) */}
                {item.actionItem && !item.actionItem.isCompleted && item.actionItem.type !== 'acknowledgement' && (
                  <div className="mt-2">
                    <span className="block w-full text-center bg-blue-600 text-white rounded-lg py-2 text-[13px] font-bold">
                      {item.actionItem.buttonLabel}
                    </span>
                  </div>
                )}

                {/* Reactions + Author — single row */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-2">
                    {item.reactions && item.reactions.map((r, i) => (
                      <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${r.userReacted ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                        {r.type} {r.count}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">
                      {author ? author.firstName[0] + author.lastName[0] : '?'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {author ? `${author.firstName} ${author.lastName}` : 'SchoolOS'}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
