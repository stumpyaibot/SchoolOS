import { useEffect } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export default function Toast({ message, visible, onDismiss }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, 2500);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
      <div className="bg-gray-900 text-white rounded-full px-5 py-2.5 shadow-xl flex items-center gap-2 text-[13px] font-medium">
        <span className="text-green-400">✓</span>
        {message}
      </div>
    </div>
  );
}
