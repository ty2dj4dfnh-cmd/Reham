import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Share,
} from 'lucide-react';
import { Language } from '../types';
import {
  getNotificationPermissionStatus,
  requestDeviceNotificationPermission,
  isIosOrIpad,
  isStandalonePwa,
  sendTestNotification,
} from '../services/notificationService';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isAr = language === 'ar';
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [isInstalledPwa, setIsInstalledPwa] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPermissionState(getNotificationPermissionStatus());
      setIsIosDevice(isIosOrIpad());
      setIsInstalledPwa(isStandalonePwa());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    try {
      const result = await requestDeviceNotificationPermission();
      setPermissionState(result);
      if (result === 'granted') {
        const test = await sendTestNotification(language);
        setTestResult(test.message);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTestNotification = async () => {
    const res = await sendTestNotification(language);
    setTestResult(res.message);
  };

  const getStatusBadge = () => {
    switch (permissionState) {
      case 'granted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? 'مفعّل (Enabled)' : 'Enabled'}</span>
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>{isAr ? 'محظور (Blocked)' : 'Blocked'}</span>
          </span>
        );
      case 'unsupported':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200">
            <span>{isAr ? 'غير مدعوم (Unsupported)' : 'Unsupported'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200">
            <span>{isAr ? 'غير مفعّل (Not enabled)' : 'Not enabled'}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-400">DentalMind Notification Center</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center">
          <div className="w-14 h-14 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-inner">
            <Bell className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isAr ? 'حافظي على وتيرة دراستكِ مع DentalMind' : 'Stay on track with DentalMind'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              {isAr
                ? 'احصلي على تنبيهات لخطتكِ الدراسية، مواعيد الامتحانات، فحص الصباح، وتقدمكِ الدراسي.'
                : 'Get reminders for your study plan, exams, check-ins and progress.'}
            </p>
          </div>

          {/* Current Status Pill */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium">
              {isAr ? 'حالة الإذن الحالية:' : 'Device Status:'}
            </span>
            {getStatusBadge()}
          </div>

          {/* iPad / iPhone PWA Home Screen Guidance */}
          {isIosDevice && !isInstalledPwa && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs text-start space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{isAr ? 'تنبيه لمستخدمي iPhone و iPad' : 'iPhone & iPad Web Push Requirement'}</span>
              </div>
              <p className="leading-relaxed text-[11px] text-indigo-800 dark:text-indigo-300">
                {isAr
                  ? 'لتلقي الإشعارات على أجهزة Apple، يلزم إضافة DentalMind إلى الشاشة الرئيسية أولاً: انقري زر المشاركة (Share) في Safari ثم اختاري "إضافة إلى الصفحة الرئيسية" (Add to Home Screen).'
                  : 'To receive push notifications on Apple devices, install DentalMind to your Home Screen first: Tap the Share button in Safari, then select "Add to Home Screen".'}
              </p>
            </div>
          )}

          {/* Test feedback */}
          {testResult && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in">
              {testResult}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {permissionState === 'default' && (
              <button
                type="button"
                onClick={handleEnableNotifications}
                disabled={isRequesting}
                className="w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all cursor-pointer"
              >
                {isRequesting
                  ? isAr ? 'جاري طلب الإذن...' : 'Requesting...'
                  : isAr ? 'تفعيل الإشعارات (Enable Notifications)' : 'Enable Notifications'}
              </button>
            )}

            {permissionState === 'granted' && (
              <button
                type="button"
                onClick={handleTestNotification}
                className="w-full py-2.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'إرسال إشعار تجريبي الآن' : 'Send Test Notification'}</span>
              </button>
            )}

            {permissionState === 'denied' && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                {isAr
                  ? 'تم حظر الإشعارات من إعدادات المتصفح. لتفعيلها: انقري على رمز القفل أو إعدادات الموقع بجانب شريط العنوان واختاري "سماح".'
                  : 'Notifications are blocked in your browser settings. To enable them, click the padlock or site settings icon next to the address bar and set Notifications to "Allow".'}
              </p>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-4 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              {isAr ? 'ليس الآن (Not Now)' : 'Not Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
