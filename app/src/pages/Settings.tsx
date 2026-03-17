import { useState } from 'react';
import BackHeader from '../components/layout/BackHeader';
import { userSettings } from '../data/mockData';

export default function Settings() {
  const [settings, setSettings] = useState(userSettings);

  const toggleNotification = (key: 'pushEnabled' | 'emailSummary' | 'whatsappDelivery') => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  };

  const toggleQuietHours = () => {
    setSettings((prev) => ({
      ...prev,
      quietHours: { ...prev.quietHours, enabled: !prev.quietHours.enabled },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BackHeader title="Settings" />

      <div className="px-2.5 pt-2 space-y-2">
        {/* Notifications */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-3 pt-2.5 pb-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">NOTIFICATIONS</p>
          </div>
          {[
            { key: 'pushEnabled' as const, label: 'Push Alerts', desc: 'Receive push notifications' },
            { key: 'emailSummary' as const, label: 'Email Summary', desc: 'Weekly digest via email' },
            { key: 'whatsappDelivery' as const, label: 'WhatsApp Delivery', desc: 'Get alerts on WhatsApp' },
          ].map((item, i) => (
            <div key={item.key}>
              <div className="flex items-center justify-between px-3 py-2.5">
                <div>
                  <p className="text-[14px] text-gray-900">{item.label}</p>
                  <p className="text-[11px] text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleNotification(item.key)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    settings.notifications[item.key] ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      settings.notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              {i < 2 && <div className="mx-4 border-b border-gray-100" />}
            </div>
          ))}
        </div>

        {/* Quiet Hours */}
        <div className="bg-white rounded-lg border border-gray-200 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">QUIET HOURS</p>
              <p className="text-[14px] text-gray-900">Do Not Disturb</p>
              <p className="text-[11px] text-gray-500">{settings.quietHours.startTime} — {settings.quietHours.endTime}</p>
            </div>
            <button
              onClick={toggleQuietHours}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                settings.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings.quietHours.enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white rounded-lg border border-gray-200 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">LANGUAGE</p>
          <div className="flex items-center justify-between">
            <p className="text-[14px] text-gray-900">English</p>
            <span className="text-gray-300 text-lg">›</span>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-3 pt-2.5 pb-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">ACCOUNT</p>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-[14px] text-gray-900">Profile</p>
            <span className="text-gray-300 text-lg">›</span>
          </div>
          <div className="mx-4 border-b border-gray-100" />
          <div className="px-4 py-3">
            <p className="text-[14px] text-red-500">Sign Out</p>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-[11px] text-gray-400">SchoolOS v1.0 (Demo)</p>
        </div>
      </div>
    </div>
  );
}
