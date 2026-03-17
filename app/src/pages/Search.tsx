import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import BackHeader from '../components/layout/BackHeader';
import { feedItems, calendarEvents, getUserById, getStudentById } from '../data/mockData';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.toLowerCase().trim();

  const matchingPosts = q.length >= 2
    ? feedItems.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q)
      )
    : [];

  const matchingEvents = q.length >= 2
    ? calendarEvents.filter(event =>
        event.title.toLowerCase().includes(q) ||
        (event.description && event.description.toLowerCase().includes(q)) ||
        (event.location && event.location.toLowerCase().includes(q))
      )
    : [];

  const hasResults = matchingPosts.length > 0 || matchingEvents.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <BackHeader title="Search" />

      <div className="px-2.5 pt-2 pb-20">
        {/* Search Input */}
        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, events, and more..."
            autoFocus
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-shadow"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results */}
        {q.length >= 2 && !hasResults && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-3xl mb-2">🔍</span>
            <p className="text-[13px] text-gray-500">No results for "{query}"</p>
            <p className="text-[11px] text-gray-400 mt-1">Try searching for swimming, book week, or museum</p>
          </div>
        )}

        {q.length < 2 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-3xl mb-2">✨</span>
            <p className="text-[13px] text-gray-500">Search across all school communications</p>
            <p className="text-[11px] text-gray-400 mt-1">Posts, calendar events, and more</p>
          </div>
        )}

        {/* Posts */}
        {matchingPosts.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              POSTS ({matchingPosts.length})
            </p>
            <div className="space-y-1.5">
              {matchingPosts.map(item => {
                const author = getUserById(item.authorId);
                const childName = item.targetAudiences.studentIds?.[0]
                  ? getStudentById(item.targetAudiences.studentIds[0])?.firstName
                  : null;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/post/${item.id}`)}
                    className="w-full bg-white rounded-lg border border-gray-200 p-3 text-left hover:shadow-sm transition-shadow active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[9px]">
                        {item.type === 'student_work' ? '🎨' : item.type === 'ingested_whatsapp' ? '💬' : item.type === 'ingested_email' ? '📧' : '📝'}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {author ? `${author.firstName} ${author.lastName}` : 'SchoolOS'}
                        {childName && ` · ${childName}`}
                      </span>
                    </div>
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{item.content}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Events */}
        {matchingEvents.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              EVENTS ({matchingEvents.length})
            </p>
            <div className="space-y-1.5">
              {matchingEvents.map(event => {
                const d = new Date(event.startTime);
                return (
                  <button
                    key={event.id}
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="w-full bg-white rounded-lg border border-gray-200 p-3 text-left hover:shadow-sm transition-shadow active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white rounded-lg px-2.5 py-1.5 text-center shrink-0">
                        <span className="text-[9px] font-bold uppercase block">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
                        <span className="text-[16px] font-bold block leading-tight">{d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-900 truncate">{event.title}</p>
                        {event.location && <p className="text-[11px] text-gray-400">📍 {event.location}</p>}
                      </div>
                      <span className="text-gray-300 text-lg">›</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
