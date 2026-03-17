import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { calendarEvents } from '../data/mockData';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

function getEventsForDay(year: number, month: number, day: number) {
  return calendarEvents.filter(evt => {
    const start = new Date(evt.startTime);
    const end = new Date(evt.endTime);
    const check = new Date(year, month, day);
    return check >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
           check <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
  });
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const days = getDaysInMonth(year, month);

  const todayDay = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : null;

  const prevMonth = () => {
    if (month === 0) { setYear((y: number) => y - 1); setMonth(11); }
    else setMonth((m: number) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear((y: number) => y + 1); setMonth(0); }
    else setMonth((m: number) => m + 1);
  };

  const upcomingEvents = [...calendarEvents].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="pb-20">
      <Header title="Calendar" />

      <div className="px-2.5 pt-2 space-y-2">
        {/* Month Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-2.5">
          <div className="flex items-center justify-between mb-2">
            <button onClick={prevMonth} className="text-gray-400 text-lg px-2 hover:text-gray-700 active:scale-90 transition-all rounded">‹</button>
            <p className="text-[15px] font-bold text-gray-900">{MONTH_NAMES[month]} {year}</p>
            <button onClick={nextMonth} className="text-gray-400 text-lg px-2 hover:text-gray-700 active:scale-90 transition-all rounded">›</button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase">{d}</div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) return <div key={i} />;
              const dayEvents = getEventsForDay(year, month, day);
              const hasEvents = dayEvents.length > 0;
              const isToday = day === todayDay;

              return (
                <div
                  key={i}
                  className={`text-center py-1.5 rounded-lg text-[12px] relative transition-colors ${
                    isToday
                      ? 'bg-blue-600 text-white font-bold'
                      : hasEvents
                      ? 'font-bold text-gray-900 bg-blue-50'
                      : 'text-gray-600'
                  }`}
                >
                  {day}
                  {hasEvents && !isToday && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((_, j) => (
                        <span key={j} className="w-1 h-1 rounded-full bg-blue-600" />
                      ))}
                    </div>
                  )}
                  {hasEvents && isToday && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((_, j) => (
                        <span key={j} className="w-1 h-1 rounded-full bg-white" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event List */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">UPCOMING</p>
        {upcomingEvents.map((evt) => (
          <button
            key={evt.id}
            onClick={() => navigate(`/event/${evt.id}`)}
            className="w-full bg-white rounded-lg border border-gray-200 p-2.5 flex items-start gap-2.5 text-left transition-transform active:scale-[0.98]"
          >
            {/* Date block */}
            <div className="bg-orange-100 rounded-lg w-11 h-11 flex flex-col items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-orange-700 uppercase">
                {new Date(evt.startTime).toLocaleDateString('en-GB', { month: 'short' })}
              </span>
              <span className="text-[15px] font-bold text-orange-900 leading-none">
                {new Date(evt.startTime).getDate()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-semibold text-gray-900 truncate">{evt.title}</h3>
              {evt.location && <p className="text-[11px] text-gray-500 mt-0.5">📍 {evt.location}</p>}
              {evt.isAllDay && <p className="text-[11px] text-blue-600 mt-0.5">All Day</p>}
              {evt.bookingDetails?.isBookable && (
                <span className="inline-block mt-1 bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-[10px] font-bold">
                  Book a Slot
                </span>
              )}
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
