import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import BackHeader from '../components/layout/BackHeader';
import { getUserById, getStudentById } from '../data/mockData';
import { getFeedItemById } from '../lib/dataAccess';
import type { FeedItem, Reaction } from '../types';

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const [item, setItem] = useState<FeedItem | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showFull, setShowFull] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (postId) {
      getFeedItemById(postId).then(found => {
        setItem(found);
        setReactions(found?.reactions || []);
        setLoading(false);
      });
    }
  }, [postId]);

  if (loading) {
    return (
      <div>
        <BackHeader title="Post" />
        <div className="p-6 text-center text-gray-400">Loading…</div>
      </div>
    );
  }

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
  const hasMultipleImages = item.mediaUrls && item.mediaUrls.length > 1;
  const hasSingleImage = item.mediaUrls && item.mediaUrls.length === 1;
  const hasImages = item.mediaUrls && item.mediaUrls.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <BackHeader title="Post" />

      <div className="px-2.5 pt-2 space-y-2">
        {/* ===== Photo Section ===== */}

        {/* Single image: hero display */}
        {hasSingleImage && (
          <button
            onClick={() => setLightboxIndex(0)}
            className="w-full rounded-lg overflow-hidden active:opacity-90 transition-opacity"
          >
            <img src={item.mediaUrls![0]} alt="" className="w-full h-48 object-cover" />
          </button>
        )}

        {/* Multiple images: scrollable strip */}
        {hasMultipleImages && (
          <div>
            <p className="text-[11px] text-gray-400 mb-1.5 px-0.5">📸 {item.mediaUrls!.length} photos</p>
            <div
              ref={scrollRef}
              className="flex gap-1.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {item.mediaUrls!.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="shrink-0 snap-start rounded-lg overflow-hidden active:scale-[0.97] transition-transform"
                  style={{ width: item.mediaUrls!.length === 2 ? 'calc(50% - 3px)' : '70%' }}
                >
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </button>
              ))}
            </div>
            {/* Dot indicators */}
            <div className="flex justify-center gap-1 mt-1.5">
              {item.mediaUrls!.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    lightboxIndex === i ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
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

          {/* Bullet Summary */}
          {item.bulletSummary ? (
            <>
              <ul className="space-y-1.5 mb-3">
                {item.bulletSummary.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700 leading-snug">
                    <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Expandable Full Content */}
              {item.fullContent && (
                <>
                  <button
                    onClick={() => setShowFull(!showFull)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[13px] font-semibold transition-all active:scale-[0.98]"
                  >
                    <span>{showFull ? '▲  Hide Full Text' : '▼  Read Full Text'}</span>
                  </button>
                  {showFull && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{item.fullContent}</p>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{item.content}</p>
          )}
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

      {/* ===== Lightbox — Full-Screen Photo Viewer ===== */}
      {lightboxIndex !== null && hasImages && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close + counter */}
          <div className="flex items-center justify-between p-4">
            <span className="text-white/70 text-[13px] font-medium">
              {lightboxIndex + 1} / {item.mediaUrls!.length}
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white text-xl hover:bg-white/25 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center px-4 relative">
            {/* Prev button */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                className="absolute left-2 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white text-lg hover:bg-white/25 transition-colors z-10"
              >
                ‹
              </button>
            )}

            <img
              src={item.mediaUrls![lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-[75vh] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next button */}
            {lightboxIndex < item.mediaUrls!.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                className="absolute right-2 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white text-lg hover:bg-white/25 transition-colors z-10"
              >
                ›
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {item.mediaUrls!.length > 1 && (
            <div className="flex justify-center gap-2 p-4">
              {item.mediaUrls!.map((url, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    i === lightboxIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Download */}
          <div className="flex justify-center pb-6">
            <a
              href={item.mediaUrls![lightboxIndex]}
              download
              onClick={(e) => e.stopPropagation()}
              className="bg-white/15 text-white rounded-full px-5 py-2.5 text-[13px] font-medium hover:bg-white/25 transition-colors backdrop-blur-sm"
            >
              ⬇ Download Full Size
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
