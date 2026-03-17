import { useParams } from 'react-router-dom';
import { useState, useCallback } from 'react';
import BackHeader from '../components/layout/BackHeader';
import Toast from '../components/ui/Toast';
import { calendarEvents } from '../data/mockData';

const SLOTS = ['9:00 AM', '9:15 AM', '9:30 AM', '10:00 AM', '10:15 AM'];

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const evt = calendarEvents.find(e => e.id === eventId);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [toast, setToast] = useState('');

  const dismissToast = useCallback(() => setToast(''), []);

  if (!evt) {
    return (
      <div>
        <BackHeader title="Event" />
        <div className="p-6 text-center text-gray-500">Event not found.</div>
      </div>
    );
  }

  const isBookable = evt.bookingDetails?.isBookable;

  const handleCTA = () => {
    if (isBookable) {
      if (!selectedSlot) {
        setToast('Select a time slot first');
        return;
      }
      setBooked(true);
      setToast(`Booking confirmed for ${selectedSlot} ✓`);
    } else {
      setCalendarAdded(true);
      setToast('Added to your calendar ✓');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <BackHeader title="Event Details" />

      <div className="px-2.5 pt-2 space-y-2">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg h-36 flex items-center justify-center">
          <span className="text-5xl">🏫</span>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">EVENT</p>
          <h2 className="text-[16px] font-bold text-gray-900 mb-2.5">{evt.title}</h2>

          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📅</span>
              <div>
                <p className="text-[13px] text-gray-900 font-medium">
                  {new Date(evt.startTime).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {!evt.isAllDay && (
                  <p className="text-[11px] text-gray-500">
                    {new Date(evt.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} — {new Date(evt.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                {evt.isAllDay && <p className="text-[11px] text-blue-600">All Day</p>}
              </div>
            </div>

            {evt.location && (
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center text-sm">📍</span>
                <p className="text-[13px] text-gray-900">{evt.location}</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {evt.description && (
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">ABOUT</p>
            <p className="text-[13px] text-gray-700 leading-relaxed">{evt.description}</p>
          </div>
        )}

        {/* Booking Slots */}
        {isBookable && (
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">AVAILABLE SLOTS</p>
            <div className="space-y-1.5">
              {SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot;
                const isBooked = booked && isSelected;
                return (
                  <button
                    key={slot}
                    onClick={() => !booked && setSelectedSlot(slot)}
                    disabled={booked}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 border transition-all ${
                      isBooked
                        ? 'bg-green-50 border-green-300'
                        : isSelected
                        ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className={`text-[13px] ${isBooked ? 'text-green-700 font-medium' : 'text-gray-900'}`}>{slot}</span>
                    {isBooked ? (
                      <span className="text-[11px] text-green-600 font-bold">✓ Booked</span>
                    ) : isSelected ? (
                      <span className="text-[11px] text-blue-600 font-bold">Selected</span>
                    ) : (
                      <span className="text-[11px] text-blue-600 font-medium">Book</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-lg border-t border-gray-200 p-3">
        {(booked || calendarAdded) ? (
          <div className="w-full bg-green-600 text-white rounded-full py-3 text-[15px] font-bold text-center flex items-center justify-center gap-2">
            <span>✓</span> {booked ? `Booked — ${selectedSlot}` : 'Added to Calendar'}
          </div>
        ) : (
          <button
            onClick={handleCTA}
            className={`w-full rounded-full py-3 text-[15px] font-bold transition-all active:scale-[0.98] ${
              isBookable && !selectedSlot
                ? 'bg-gray-200 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isBookable
              ? selectedSlot ? `Confirm ${selectedSlot}` : 'Select a Slot'
              : 'Add to Calendar'
            }
          </button>
        )}
      </div>

      <Toast message={toast} visible={!!toast} onDismiss={dismissToast} />
    </div>
  );
}
