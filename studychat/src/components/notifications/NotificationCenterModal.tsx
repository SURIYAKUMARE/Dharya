/**
 * NotificationCenterModal.tsx
 * 
 * Separate, dedicated Notification Center UI for Dhanya Navigation.
 * - Displays AI-generated smart notifications (never exposes raw private chat text)
 * - Read/unread indicators and count badges
 * - Category-specific visual icons (Academic, Urgent, Location, Attendance, Wishes, etc.)
 * - Direct tap-to-navigate to conversation
 * - Settings panel: Smart AI toggle, Ultra-Privacy Mode, Push Permissions, Clear All
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  X,
  CheckCheck,
  Trash2,
  Settings,
  ShieldCheck,
  GraduationCap,
  AlertTriangle,
  MapPin,
  Building2,
  Calendar,
  Gift,
  Heart,
  Smile,
  MessageSquare,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  smartNotificationService,
  SmartNotification,
  NotificationCategory,
  NotificationSettings,
} from '../../services/smartNotificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNotification?: (notification: SmartNotification) => void;
  isDark?: boolean;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectNotification,
  isDark = false,
}) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>(() =>
    smartNotificationService.getNotifications()
  );
  const [settings, setSettings] = useState<NotificationSettings>(() =>
    smartNotificationService.getSettings()
  );
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');

  // Subscribe to real-time notification changes
  useEffect(() => {
    const unsub = smartNotificationService.subscribe(() => {
      setNotifications(smartNotificationService.getNotifications());
      setSettings(smartNotificationService.getSettings());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'academic':
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-sky-500" />;
      case 'college':
        return <Building2 className="w-4 h-4 text-amber-500" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      case 'wishes':
        return <Gift className="w-4 h-4 text-pink-500" />;
      case 'wellbeing':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'greeting':
        return <Smile className="w-4 h-4 text-amber-400" />;
      case 'media':
        return <ImageIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
    }
  };

  const formatTime = (ts: number) => {
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleRequestPush = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      smartNotificationService.updateSettings({ browserPushEnabled: perm === 'granted' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border transition-all ${
          isDark
            ? 'bg-[#1f2c34] text-[#e9edef] border-[#2a3942]'
            : 'bg-white text-slate-800 border-slate-100 shadow-xl'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 flex items-center justify-between border-b ${
            isDark ? 'border-[#2a3942] bg-[#182229]' : 'border-slate-100 bg-[#FAF8F5]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#16852D]/10 flex items-center justify-center text-[#16852D]">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#16852D] text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className={`text-[11px] ${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                AI Privacy Protected ♡
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {activeTab === 'notifications' ? (
              <>
                {unreadCount > 0 && (
                  <button
                    onClick={() => smartNotificationService.markAllAsRead()}
                    className={`p-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                      isDark ? 'text-emerald-400' : 'text-[#16852D]'
                    }`}
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  title="Notification Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('notifications')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#16852D] text-white hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'notifications' ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="py-16 text-center space-y-3 px-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">No new notifications</h4>
                  <p className={`text-xs max-w-xs mx-auto leading-relaxed ${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                    When messages arrive, our AI summarizes them into private alerts so raw conversation text is never exposed on your screen.
                  </p>
                </div>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    smartNotificationService.markAsRead(notif.id);
                    onSelectNotification?.(notif);
                    onClose();
                  }}
                  className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                    notif.isRead
                      ? isDark
                        ? 'bg-[#182229]/50 border-[#2a3942]/60 hover:border-[#2a3942]'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                      : isDark
                      ? 'bg-[#182229] border-[#16852D]/40 shadow-xs'
                      : 'bg-[#F4FAF6] border-[#16852D]/30 shadow-xs'
                  }`}
                >
                  {/* Category / Icon Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isDark ? 'bg-[#233138]' : 'bg-white shadow-2xs border border-slate-100'
                    }`}
                  >
                    {getCategoryIcon(notif.category)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-[12px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {notif.senderName}
                      </span>
                      <span className={`text-[10px] shrink-0 ${isDark ? 'text-[#8696a0]' : 'text-slate-400'}`}>
                        {formatTime(notif.timestamp)}
                      </span>
                    </div>

                    {/* Sanitized Smart Text (Never original text!) */}
                    <p className={`text-xs font-medium leading-snug ${isDark ? 'text-[#e9edef]' : 'text-slate-700'}`}>
                      {notif.smartTitle}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        <Sparkles className="w-2.5 h-2.5" />
                        Smart Alert
                      </span>
                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16852D] animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      smartNotificationService.deleteNotification(notif.id);
                    }}
                    className="absolute right-3 top-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity"
                    title="Dismiss"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Settings Panel */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
            {/* 1. Smart AI Summaries Toggle */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="space-y-0.5 pr-3">
                <div className="font-bold text-[13px] text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#16852D]" />
                  <span>AI Smart Summaries</span>
                </div>
                <p className={`${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                  Convert incoming text into privacy-safe intent summaries (e.g. &quot;You have an exam tomorrow&quot;) instead of showing original text.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.smartNotificationsEnabled}
                onChange={(e) =>
                  smartNotificationService.updateSettings({
                    smartNotificationsEnabled: e.target.checked,
                  })
                }
                className="w-5 h-5 accent-[#16852D] rounded cursor-pointer"
              />
            </div>

            {/* 2. Ultra-Privacy Mode */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="space-y-0.5 pr-3">
                <div className="font-bold text-[13px] text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Ultra-Privacy Mode</span>
                </div>
                <p className={`${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                  Mask every alert strictly as &quot;You have a new notification.&quot; with no sender or topic preview.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.ultraPrivacyMode}
                onChange={(e) =>
                  smartNotificationService.updateSettings({
                    ultraPrivacyMode: e.target.checked,
                  })
                }
                className="w-5 h-5 accent-[#16852D] rounded cursor-pointer"
              />
            </div>

            {/* 3. Hide Sender Name */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="space-y-0.5 pr-3">
                <div className="font-bold text-[13px] text-slate-900 dark:text-white">
                  Hide Sender Identity
                </div>
                <p className={`${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                  Display notifications simply as &quot;Dhanya&quot; without showing who sent the message.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.hideSenderName}
                onChange={(e) =>
                  smartNotificationService.updateSettings({
                    hideSenderName: e.target.checked,
                  })
                }
                className="w-5 h-5 accent-[#16852D] rounded cursor-pointer"
              />
            </div>

            {/* 4. Browser Push Notifications */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="space-y-0.5 pr-3">
                <div className="font-bold text-[13px] text-slate-900 dark:text-white">
                  System Push Notifications
                </div>
                <p className={`${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                  Receive safe smart notifications on your lock screen and desktop even when the app is in the background.
                </p>
              </div>
              <button
                onClick={handleRequestPush}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
                  settings.browserPushEnabled
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-[#16852D] text-white hover:opacity-90'
                }`}
              >
                {settings.browserPushEnabled ? 'Enabled ✓' : 'Enable'}
              </button>
            </div>

            {/* 5. Clear All Notifications */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (window.confirm('Clear all notification history?')) {
                    smartNotificationService.clearAllNotifications();
                  }
                }}
                className="w-full py-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Notifications</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer with Clear All when notifications exist */}
        {activeTab === 'notifications' && notifications.length > 0 && (
          <div
            className={`p-3 border-t flex items-center justify-between text-xs ${
              isDark ? 'border-[#2a3942] bg-[#182229]' : 'border-slate-100 bg-[#FAF8F5]'
            }`}
          >
            <span className={`${isDark ? 'text-[#8696a0]' : 'text-slate-400'}`}>
              {notifications.length} notification{notifications.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => smartNotificationService.clearAllNotifications()}
              className="text-slate-400 hover:text-rose-500 font-semibold transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
