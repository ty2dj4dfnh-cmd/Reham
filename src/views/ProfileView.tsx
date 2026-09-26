import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Globe,
  Moon,
  Sun,
  Bell,
  Volume2,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  BookOpen,
  LogOut,
  Mail,
  ShieldCheck,
  Flame,
  Smartphone,
  AlertCircle,
  Calendar,
  Send,
} from 'lucide-react';
import { Language, ThemeMode, UserProfile, MotivationStyle } from '../types';
import { translations } from '../i18n/translations';
import {
  getNotificationPermissionStatus,
  requestDeviceNotificationPermission,
  sendTestNotification,
  isIosOrIpad,
  isStandalonePwa,
  NotificationSettings,
  defaultNotificationSettings,
} from '../services/notificationService';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onSignOut?: () => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onSignOut,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
}) => {
  const t = translations[language];

  const [formData, setFormData] = useState<UserProfile>(profile);
  const [saveToast, setSaveToast] = useState(false);

  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'sending' | 'sent' | 'blocked' | 'unsupported' | 'not_enabled';
    message?: string;
  }>({ status: 'idle' });

  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(() => {
    try {
      const raw = localStorage.getItem('dentalmind_notification_settings');
      return raw ? JSON.parse(raw) : defaultNotificationSettings;
    } catch {
      return defaultNotificationSettings;
    }
  });

  React.useEffect(() => {
    setPermissionState(getNotificationPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestDeviceNotificationPermission();
    setPermissionState(res);
  };

  const handleSendTestNotification = async () => {
    setTestResult({ status: 'sending' });
    const res = await sendTestNotification(language);
    setTestResult({
      status: res.status,
      message: res.message,
    });
  };

  const handleToggleSetting = (key: keyof NotificationSettings) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    try {
      localStorage.setItem('dentalmind_notification_settings', JSON.stringify(updated));
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    try {
      localStorage.setItem('dentalmind_notification_settings', JSON.stringify(notifSettings));
    } catch {}
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'D';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.profile.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dental student preferences, pacing targets, and study settings.
          </p>
        </div>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        )}
      </div>

      {saveToast && (
        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>{language === 'ar' ? 'تم حفظ التغييرات بنجاح!' : 'Settings updated successfully!'}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academic Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-4">
            {formData.photoURL ? (
              <img
                src={formData.photoURL}
                alt={formData.name}
                className="w-16 h-16 rounded-2xl object-cover shadow-md border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center text-xl font-bold shadow-md">
                {getInitials(formData.name)}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {formData.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formData.program} · {formData.year}
              </p>
              {formData.email && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                  <Mail className="w-3 h-3" />
                  <span>{formData.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t.profile.name}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. Palestine, UK, Jordan..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t.profile.program}
              </label>
              <input
                type="text"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t.profile.year}
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t.profile.university}
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Study Target and Preference Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Daily Study Target & Habit Preferences
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t.profile.dailyTarget}
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="8"
                value={formData.dailyStudyTargetHours}
                onChange={(e) =>
                  setFormData({ ...formData, dailyStudyTargetHours: parseFloat(e.target.value) || 2.5 })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t.profile.studyStyle}
              </label>
              <select
                value={formData.studyPreference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    studyPreference: e.target.value as UserProfile['studyPreference'],
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              >
                <option value="early_bird">Early Bird (Morning Clinic Prep)</option>
                <option value="night_owl">Night Owl (Late Histology / Lecture Focus)</option>
                <option value="balanced">Balanced Pacing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Motivation Tone
              </label>
              <select
                value={formData.motivationStyle || 'balanced'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    motivationStyle: e.target.value as MotivationStyle,
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              >
                <option value="gentle">Gentle (Supportive & low pressure)</option>
                <option value="balanced">Balanced (Encouraging & accountable)</option>
                <option value="challenge">Challenge me (Milestone focused)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interface & Accessibility Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Interface & Notification Controls
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Language toggle */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t.profile.language}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Currently: {language === 'en' ? 'English (LTR)' : 'العربية (RTL)'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleLanguage}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Switch to {language === 'en' ? 'العربية' : 'English'}
              </button>
            </div>

            {/* Theme toggle */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t.profile.theme}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Currently: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Toggle {theme === 'light' ? 'Dark' : 'Light'}
              </button>
            </div>

            {/* Notification reminder toggle */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t.profile.notifications}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Gentle prompts without shame or aggressive guilt
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.enabled}
                onChange={() => handleToggleSetting('enabled')}
                className="w-4 h-4 accent-teal-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Detailed Notification Settings Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'إعدادات الإشعارات والتذكيرات الحقيقية' : 'Notification Settings & Real Device Reminders'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    permissionState === 'granted'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                      : permissionState === 'denied'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200'
                      : permissionState === 'unsupported'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200'
                  }`}
                >
                  {permissionState === 'granted'
                    ? language === 'ar' ? 'مفعّل (Enabled)' : 'Enabled'
                    : permissionState === 'denied'
                    ? language === 'ar' ? 'محظور (Blocked)' : 'Blocked'
                    : permissionState === 'unsupported'
                    ? language === 'ar' ? 'غير مدعوم (Unsupported)' : 'Unsupported'
                    : language === 'ar' ? 'غير مفعّل (Not enabled)' : 'Not enabled'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ar'
                  ? 'إشعارات موجهة مبنية 100% على بياناتكِ الحقيقية (المهام، الامتحانات، وفحص الصباح).'
                  : 'Grounded motivational reminders using your real study tasks, exams, and daily check-ins.'}
              </p>
            </div>

            {/* Test Notification and Permission Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {permissionState === 'default' && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {language === 'ar' ? 'تفعيل إذن الإشعارات' : 'Enable Notifications'}
                </button>
              )}

              <button
                type="button"
                onClick={handleSendTestNotification}
                disabled={testResult.status === 'sending'}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>
                  {testResult.status === 'sending'
                    ? language === 'ar' ? 'جاري الإرسال...' : 'Sending...'
                    : language === 'ar' ? 'إرسال إشعار تجريبي' : 'Send Test Notification'}
                </span>
              </button>
            </div>
          </div>

          {/* Test Result Feedback Banner */}
          {testResult.message && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border animate-in fade-in ${
                testResult.status === 'sent'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 text-emerald-800 dark:text-emerald-200'
                  : testResult.status === 'blocked'
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 text-rose-800 dark:text-rose-200'
                  : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 text-amber-800 dark:text-amber-200'
              }`}
            >
              {testResult.status === 'sent' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="font-medium">{testResult.message}</span>
            </div>
          )}

          {/* iPad / iPhone PWA Home Screen Guidance */}
          {isIosOrIpad() && !isStandalonePwa() && (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold">
                <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{language === 'ar' ? 'ملاحظة لمستخدمي iPhone و iPad' : 'iPhone & iPad PWA Requirement'}</span>
              </div>
              <p className="leading-relaxed text-[11px] text-indigo-800 dark:text-indigo-300">
                {language === 'ar'
                  ? 'لتلقي إشعارات النظام على أجهزة iOS، يلزم تثبيت DentalMind على الشاشة الرئيسية أولاً: اضغطي زر المشاركة (Share) في متصفح Safari واختاري "إضافة إلى الصفحة الرئيسية" (Add to Home Screen).'
                  : 'On iOS & iPadOS, web notifications require installing DentalMind to the Home Screen: Tap Share in Safari and select "Add to Home Screen".'}
              </p>
            </div>
          )}

          {/* Specific Notification Triggers Checklist */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {language === 'ar' ? 'تخصيص التنبيهات التحفيزية' : 'Motivational Schedule Preferences'}
            </h4>

            {/* 1. Morning check-in */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'تذكير فحص الصباح' : 'Morning Check-in Reminder'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === 'ar'
                    ? '"صباح الخير دكتورة 👋 أكملي فحص الصباح وسأقوم بتنظيم خطتكِ الدراسية."'
                    : '"Good morning 👋 Complete your check-in and I\'ll organize today\'s study plan."'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.morningCheckIn}
                onChange={() => handleToggleSetting('morningCheckIn')}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* 2. Planned task */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'تذكير المهمة القادمة' : 'Next Planned Task Reminder'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === 'ar'
                    ? '"أنسجة الأسنان هي المهمة التالية — 30 دقيقة مجدولة."'
                    : '"Oral Pathology is next — 30 min planned."'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.studyReminders}
                onChange={() => handleToggleSetting('studyReminders')}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* 3. Progress update */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'تحديث الإنجاز اليومي' : 'Daily Progress Milestones'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === 'ar'
                    ? '"أنجزتِ 3 من أصل 4 مهام اليوم. تبقت مهمة واحدة فقط."'
                    : '"You completed 3 of 4 tasks today. One remains."'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.motivationalPacing}
                onChange={() => handleToggleSetting('motivationalPacing')}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* 4. Exam countdown */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'العد التنازلي للامتحانات' : 'Exam Countdown Alerts'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === 'ar'
                    ? '"امتحان أمراض الفم بعد 5 أيام."'
                    : '"Your Oral Pathology exam is in 5 days."'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.examCountdowns}
                onChange={() => handleToggleSetting('examCountdowns')}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* 5. Evening review */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'المراجعة المسائية الهادئة' : 'Evening Study Reflection'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === 'ar'
                    ? '"كيف سارت دراستكِ اليوم؟ راجعي إنجازكِ وجهزي خطة الغد."'
                    : '"How did studying go today? Log your reflection."'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.eveningReview}
                onChange={() => handleToggleSetting('eveningReview')}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* 6. Streak achievements */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'إنجازات التتابع والاستمرارية' : 'Study Streak Milestones'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === 'ar'
                    ? '"أكملتِ 7 أيام متتالية من المذاكرة 🎉"'
                    : '"You completed 7 study days 🎉"'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.achievements}
                onChange={() => handleToggleSetting('achievements')}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>

            {/* Quiet Hours */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'ساعات الهدوء (Quiet Hours)' : 'Quiet Hours (Do Not Disturb)'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === 'ar'
                    ? 'إيقاف التنبيهات من 10:00 مساءً حتى 7:00 صباحاً لمنع الإزعاج.'
                    : 'Mute reminders from 22:00 to 07:00 for undisturbed sleep.'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.quietHoursEnabled}
                onChange={() => handleToggleSetting('quietHoursEnabled')}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t.actions.save}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
