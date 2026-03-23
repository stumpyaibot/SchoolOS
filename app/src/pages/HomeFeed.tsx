import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { students, getUserById, getStudentById } from '../data/mockData';
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

/* ===== Child name for card header ===== */
function childName(item: FeedItem): string {
  if (item.targetAudiences.schoolWide) return 'Whole School';
  if (item.targetAudiences.studentIds) {
    const s = getStudentById(item.targetAudiences.studentIds[0]);
    if (s) return s.firstName;
  }
  if (item.targetAudiences.classIds) {
    const child = students.find(s => s.classId === item.targetAudiences.classIds![0]);
    if (child) return child.firstName;
  }
  return 'Update';
}

function typeDescriptor(item: FeedItem): string {
  switch (item.type) {
    case 'teacher_post': return 'class update';
    case 'admin_announcement': return 'announcement';
    case 'ingested_whatsapp': return 'via whatsapp';
    case 'ingested_email': return 'via email';
    case 'student_work': return 'student work';
  }
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
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

  useEffect(() => {
    getFeedItems().then(setFeedItems);
  }, []);

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

      <div className="px-3 pt-2 space-y-3">
        {/* Urgent Banner */}
        {urgentItems
          .filter(item => activeFilter === 'all' || isItemForChild(item, activeFilter))
          .map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(`/action/${item.id}`)}
            className="w-full bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-left transition-transform active:scale-[0.98]"
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
            className="w-full bg-white rounded-xl p-3 text-left transition-transform active:scale-[0.98] shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Today's Update • AI</span>
              <span className="text-[11px] text-gray-400">Today</span>
            </div>
            <div className="space-y-1.5">
              {filteredDigest.map((d, i) => {
                const child = d.childId ? getStudentById(d.childId) : null;
                const colors = childColor(d.childId ?? null);
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} mt-[7px] shrink-0`} />
                    <p className="text-[13px] text-gray-700 leading-snug">
                      <span className={`font-semibold text-[10px] uppercase ${colors.text}`}>{child?.firstName ?? 'ALL'}</span>
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
        <div className="flex gap-2 justify-center overflow-x-auto no-scrollbar py-0.5">
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
                {s.firstName}
              </button>
            );
          })}
        </div>

        {/* ===== Feed Cards — Minimal "Digital Concierge" Layout ===== */}
        {sortedFeed.map((item) => {
          const author = getUserById(item.authorId);
          const route = item.actionItem ? `/action/${item.id}` : `/post/${item.id}`;
          const itemChildId = getChildIdForItem(item);
          const colors = childColor(itemChildId);
          const isTeacherPost = item.type === 'teacher_post' || item.type === 'student_work';
          const hasReactions = item.reactions && item.reactions.length > 0;

          return (
            <button
              key={item.id}
              onClick={() => navigate(route)}
              className="w-full bg-white rounded-xl text-left block transition-transform active:scale-[0.98] shadow-sm"
            >
              <div className="p-3">
                {/* Header: dot + child name + reactions + time */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} shrink-0`} />
                    <span className={`text-[12px] font-semibold ${colors.text}`}>{childName(item)}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[11px] text-gray-400">{typeDescriptor(item)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasReactions && item.reactions!.map((r, i) => (
                      <span key={i} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${r.userReacted ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
                        {r.type} {r.count}
                      </span>
                    ))}
                    <span className="text-[11px] text-gray-400">{timeAgo(item.timestamp)}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">{item.title}</h3>

                {/* Content — format depends on what's appropriate */}
                {item.bulletSummary && item.bulletSummary.length === 1 ? (
                  <p className="text-[13px] text-gray-500 leading-snug mt-0.5">{item.bulletSummary[0]}</p>
                ) : item.bulletSummary && item.bulletSummary.length > 1 ? (
                  <ul className="mt-1 space-y-0.5">
                    {item.bulletSummary.map((b, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[12px] text-gray-500 leading-snug">
                        <span className="text-blue-400 mt-px shrink-0">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : item.summary ? (
                  <p className="text-[13px] text-gray-500 leading-snug mt-0.5">{item.summary}</p>
                ) : null}

                {/* Media Preview */}
                {item.mediaUrls && item.mediaUrls.length > 0 && (
                  <div className="mt-2 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <img src={item.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Action Button — only for signature_required */}
                {item.actionItem && !item.actionItem.isCompleted && item.actionItem.type !== 'acknowledgement' && (
                  <div className="mt-2">
                    <span className="block w-full text-center bg-blue-600 text-white rounded-lg py-2 text-[13px] font-bold">
                      {item.actionItem.buttonLabel}
                    </span>
                  </div>
                )}

                {/* Author — only on teacher/student work posts */}
                {isTeacherPost && author && (
                  <p className="mt-1.5 text-[10px] text-gray-400 text-right">{author.firstName} {author.lastName}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
