import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { Language } from '../types';
import {
  InAppNotification,
  getInAppNotifications,
  markNotificationsAsRead,
  getNotificationPermissionStatus,
} from '../services/notificationService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  language: Language;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  language,
}) => {
  const isAr = language === 'ar';
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const permissionState = getNotificationPermissionStatus();

  useEffect(() => {
    if (isOpen) {
      setNotifications(getInAppNotifications());
      markNotificationsAsRead();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'morning':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'task':
        return <BookOpen className="w-4 h-4 text-teal-500" />;
      case 'progress':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'exam':
        return <Calendar className="w-4 h-4 text-rose-500" />;
      case 'evening':
        return <Clock className="w-4 h-4 text-indigo-500" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div
        className={`fixed inset-y-0 ${
          isAr ? 'left-0' : 'right-0'
        } max-w-sm w-full bg-white dark:bg-slate-900 shadow-2xl border-s border-slate-200 dark:border-slate-800 flex flex-col z-50`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isAr ? 'مركز الإشعارات والتذكيرات' : 'Notifications & Reminders'}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              title="Notification Settings"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Device Status Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {isAr ? 'إشعارات المتصفح:' : 'Device Push Status:'}
          </span>
          <span
            className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
              permissionState === 'granted'
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                : permissionState === 'denied'
                ? 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                : 'bg-amber-50 dark:bg-amber-950 text-amber-600'
            }`}
          >
            {permissionState === 'granted'
              ? isAr ? 'مفعلة ✓' : 'Enabled ✓'
              : permissionState === 'denied'
              ? isAr ? 'محظورة' : 'Blocked'
              : permissionState === 'unsupported'
              ? isAr ? 'غير مدعومة' : 'Unsupported'
              : isAr ? 'غير مفعّلة' : 'Not enabled'}
          </span>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isAr ? 'لا توجد إشعارات جديدة' : 'No notifications yet'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                {isAr
                  ? 'ستصلكِ هنا تنبيهات خطة المذاكرة وفحص الصباح ومواعيد الامتحانات.'
                  : 'Check-in prompts, study reminders, and exam countdowns will appear here.'}
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 space-y-1 hover:border-teal-400/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-white dark:bg-slate-700 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {isAr && item.titleAr ? item.titleAr : item.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed ps-7">
                  {isAr && item.bodyAr ? item.bodyAr : item.body}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 ps-7">
                  <span>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {item.deliveredToDevice && (
                    <span className="text-teal-600 dark:text-teal-400 font-medium">
                      ✓ {isAr ? 'أُرسل إلى الجهاز' : 'Delivered to device'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
