import { useParams } from 'react-router-dom';
import { useState } from 'react';
import BackHeader from '../components/layout/BackHeader';
import { feedItems, getUserById, getStudentById } from '../data/mockData';
import type { Reaction } from '../types';

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const item = feedItems.find(i => i.id === postId);
  const [reactions, setReactions] = useState<Reaction[]>(item?.reactions || []);

  if (!item) {
    return (
      <div>
        <BackHeader title="Post" />
        <div className="p-6 text-center text-gray-500">Post not found.</div>
      </div>
    );
  }

  const author = getUserById(item.authorId);
  const childName = item.targetAudiences.studentIds
    ? getStudentById(item.targetAudiences.studentIds[0])?.firstName
    : item.targetAudiences.schoolWide
    ? 'Whole School'
    : null;

  const toggleReaction = (type: string) => {
    setReactions(prev => {
      const existing = prev.find(r => r.type === type);
      if (existing) {
        return prev.map(r =>
          r.type === type
            ? { ...r, userReacted: !r.userReacted, count: r.userReacted ? r.count - 1 : r.count + 1 }
            : r
        );
      }
      return [...prev, { type, count: 1, userReacted: true }];
    });
  };

  const AVAILABLE_REACTIONS = ['❤️', '👏', '🌟'];

  return (
    <div className="min-h-screen bg-gray-50">
      <BackHeader title="Post" />

      <div className="px-2.5 pt-2 space-y-2">
        {/* Hero Image */}
        {item.mediaUrls && item.mediaUrls.length > 0 && (
          <div className="rounded-lg overflow-hidden">
            <img src={item.mediaUrls[0]} alt="" className="w-full h-48 object-cover" />
          </div>
        )}

        {/* Content Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold">
              {author ? author.firstName[0] + author.lastName[0] : '?'}
            </span>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">
                {author ? `${author.firstName} ${author.lastName}` : 'SchoolOS'}
              </p>
              <p className="text-[11px] text-gray-400">
                {new Date(item.timestamp).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                {childName && ` · ${childName}`}
              </p>
            </div>
          </div>

          <h2 className="text-[16px] font-bold text-gray-900 mb-1.5">{item.title}</h2>
          <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{item.content}</p>
        </div>

        {/* Reactions */}
        <div className="bg-white rounded-lg border border-gray-200 p-2.5">
          <div className="flex gap-2">
            {AVAILABLE_REACTIONS.map(type => {
              const reaction = reactions.find(r => r.type === type);
              const count = reaction?.count || 0;
              const active = reaction?.userReacted || false;
              return (
                <button
                  key={type}
                  onClick={() => toggleReaction(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] transition-all active:scale-110 ${
                    active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <span>{type}</span>
                  {count > 0 && <span className="font-medium">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
