import { useParams } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import BackHeader from '../components/layout/BackHeader';
import Toast from '../components/ui/Toast';
import { getFeedItemById } from '../lib/dataAccess';
import type { FeedItem } from '../types';

export default function ActionDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const [item, setItem] = useState<FeedItem | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState([false, false, false]);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (itemId) {
      getFeedItemById(itemId).then(found => {
        setItem(found);
        setLoading(false);
      });
    }
  }, [itemId]);

  const dismissToast = useCallback(() => setToast(''), []);

  if (!item || !item.actionItem) {
    return (
      <div>
        <BackHeader title="Action Item" />
        <div className="p-6 text-center text-gray-500">Item not found.</div>
      </div>
    );
  }

  const allChecked = checklist.every(Boolean);

  const handleSubmit = () => {
    if (!allChecked) {
      setToast('Please complete all items first');
      return;
    }
    setSubmitted(true);
    setToast('Consent form submitted ✓');
  };

  const toggleCheck = (index: number) => {
    setChecklist(prev => prev.map((v, i) => i === index ? !v : v));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <BackHeader title="Action Required" />

      <div className="px-2.5 pt-2 space-y-2">
        {/* Priority Badge */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2">
          <span className="text-red-600 text-lg">⚠️</span>
          <p className="text-[12px] font-bold text-red-700 uppercase tracking-wide">
            {item.actionItem.type.replace('_', ' ')} · Due {new Date(item.actionItem.dueDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">DETAILS</p>
          <h2 className="text-[16px] font-bold text-gray-900 mb-1.5">{item.title}</h2>
          <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">{item.content}</p>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2.5">REQUIREMENTS</p>
          <div className="space-y-2.5">
            {['Read the attached information sheet', 'Confirm your child may participate', 'Sign the consent form below'].map((step, i) => (
              <label key={i} className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist[i]}
                  onChange={() => toggleCheck(i)}
                  disabled={submitted}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
                <span className={`text-[13px] ${checklist[i] ? 'text-gray-400 line-through' : 'text-gray-700'} transition-colors`}>{step}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-lg border-t border-gray-200 p-3">
        {submitted ? (
          <div className="w-full bg-green-600 text-white rounded-full py-3 text-[15px] font-bold text-center flex items-center justify-center gap-2">
            <span>✓</span> Submitted
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className={`w-full rounded-full py-3 text-[15px] font-bold transition-all active:scale-[0.98] ${
              allChecked
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {item.actionItem.buttonLabel}
          </button>
        )}
      </div>

      <Toast message={toast} visible={!!toast} onDismiss={dismissToast} />
    </div>
  );
}
