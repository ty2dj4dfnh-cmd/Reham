import { Language, UserProfile, StudyTask, Exam, DailyCheckInState, Achievement } from '../types';

export interface NotificationSettings {
  enabled: boolean;
  morningCheckIn: boolean;
  morningTime: string; // "08:00"
  studyReminders: boolean;
  examCountdowns: boolean;
  eveningReview: boolean;
  eveningTime: string; // "20:30"
  achievements: boolean;
  motivationalPacing: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
}

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  morningCheckIn: true,
  morningTime: '08:00',
  studyReminders: true,
  examCountdowns: true,
  eveningReview: true,
  eveningTime: '20:30',
  achievements: true,
  motivationalPacing: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

export interface InAppNotification {
  id: string;
  userId?: string;
  title: string;
  titleAr?: string;
  body: string;
  bodyAr?: string;
  type: 'morning' | 'task' | 'progress' | 'exam' | 'evening' | 'achievement' | 'test';
  timestamp: string;
  read: boolean;
  deliveredToDevice?: boolean;
}

const SENT_NOTIFICATIONS_KEY = 'dentalmind_sent_notifications_log';

/**
 * Checks if running on iOS / iPadOS
 */
export const isIosOrIpad = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isAppleTouch = /iPad|iPhone|iPod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  return isAppleTouch;
};

/**
 * Checks if the app is installed to Home Screen (Standalone PWA mode)
 */
export const isStandalonePwa = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

/**
 * Returns current permission status: 'granted' | 'denied' | 'default' | 'unsupported'
 */
export const getNotificationPermissionStatus = (): 'granted' | 'denied' | 'default' | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Registers the Service Worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return registration;
  } catch (err) {
    console.warn('[DentalMind] Service worker registration failed:', err);
    return null;
  }
};

/**
 * Requests device notification permission with user gesture
 */
export const requestDeviceNotificationPermission = async (): Promise<'granted' | 'denied' | 'default' | 'unsupported'> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
    }
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return getNotificationPermissionStatus();
  }
};

/**
 * Sends a real device notification if permitted, and always records an in-app notification
 */
export const dispatchNotification = async (payload: {
  title: string;
  titleAr?: string;
  body: string;
  bodyAr?: string;
  type: InAppNotification['type'];
  language?: Language;
}): Promise<{ deliveredToDevice: boolean; inAppSaved: boolean }> => {
  const perm = getNotificationPermissionStatus();
  let deliveredToDevice = false;

  const displayTitle = payload.language === 'ar' && payload.titleAr ? payload.titleAr : payload.title;
  const displayBody = payload.language === 'ar' && payload.bodyAr ? payload.bodyAr : payload.body;

  if (perm === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(displayTitle, {
            body: displayBody,
            icon: '/assets/icon-192.svg',
            badge: '/assets/icon-192.svg',
            data: { url: '/' },
          });
          deliveredToDevice = true;
        }
      }

      if (!deliveredToDevice && typeof Notification !== 'undefined') {
        new Notification(displayTitle, {
          body: displayBody,
          icon: '/assets/icon-192.svg',
        });
        deliveredToDevice = true;
      }
    } catch (err) {
      console.warn('[DentalMind] Device notification display error:', err);
    }
  }

  // Save to in-app notification history
  saveInAppNotification({
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title: payload.title,
    titleAr: payload.titleAr,
    body: payload.body,
    bodyAr: payload.bodyAr,
    type: payload.type,
    timestamp: new Date().toISOString(),
    read: false,
    deliveredToDevice,
  });

  return { deliveredToDevice, inAppSaved: true };
};

/**
 * In-App Notification Store
 */
export const getInAppNotifications = (): InAppNotification[] => {
  try {
    const raw = localStorage.getItem('dentalmind_in_app_notifications');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveInAppNotification = (item: InAppNotification): void => {
  try {
    const current = getInAppNotifications();
    const updated = [item, ...current].slice(0, 50);
    localStorage.setItem('dentalmind_in_app_notifications', JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to store in-app notification:', err);
  }
};

export const markNotificationsAsRead = (): void => {
  try {
    const current = getInAppNotifications();
    const updated = current.map((n) => ({ ...n, read: true }));
    localStorage.setItem('dentalmind_in_app_notifications', JSON.stringify(updated));
  } catch {}
};

/**
 * Sends a real test notification (Profile -> Notification Settings)
 */
export const sendTestNotification = async (
  language: Language
): Promise<{ success: boolean; status: 'sent' | 'blocked' | 'not_enabled' | 'unsupported'; message: string }> => {
  const perm = getNotificationPermissionStatus();

  if (perm === 'unsupported') {
    return {
      success: false,
      status: 'unsupported',
      message:
        language === 'ar'
          ? 'الإشعارات الخارجية غير مدعومة في هذا الإعداد.'
          : 'Push notifications are not supported in this setup.',
    };
  }

  if (perm === 'denied') {
    return {
      success: false,
      status: 'blocked',
      message:
        language === 'ar'
          ? 'الإشعارات محظورة في إعدادات متصفحك أو جهازك.'
          : 'Notifications are blocked in your device/browser settings.',
    };
  }

  if (perm === 'default') {
    return {
      success: false,
      status: 'not_enabled',
      message:
        language === 'ar'
          ? 'إذن الإشعارات غير مفعّل. يرجى الضغط على زر تفعيل الإشعارات أولاً.'
          : 'Notification permission is not enabled yet. Click Enable Notifications first.',
    };
  }

  // Permission is granted: deliver REAL test notification
  try {
    const title = 'DentalMind — Test Notification';
    const titleAr = 'DentalMind — إشعار تجريبي';
    const body = 'Study reminders, check-ins, and countdowns are active.';
    const bodyAr = 'تنبيهات المذاكرة والعد التنازلي للامتحانات مفعلة وجاهزة بنجاح!';

    await dispatchNotification({
      title,
      titleAr,
      body,
      bodyAr,
      type: 'test',
      language,
    });

    return {
      success: true,
      status: 'sent',
      message: language === 'ar' ? 'تم إرسال الإشعار التجريبي بنجاح.' : 'Test notification sent.',
    };
  } catch (err) {
    return {
      success: false,
      status: 'unsupported',
      message:
        language === 'ar'
          ? 'حدث خطأ أثناء محاولة إرسال الإشعار التجريبي.'
          : 'An error occurred while dispatching the test notification.',
    };
  }
};

/**
 * Checks quiet hours
 */
const isInQuietHours = (start = '22:00', end = '07:00'): boolean => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes > endMinutes) {
    // Overnights (e.g. 22:00 to 07:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

/**
 * Checks if a notification category was already sent today
 */
const wasSentToday = (category: string): boolean => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = localStorage.getItem(SENT_NOTIFICATIONS_KEY);
    const log: Record<string, string> = raw ? JSON.parse(raw) : {};
    return log[category] === today;
  } catch {
    return false;
  }
};

const markSentToday = (category: string): void => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = localStorage.getItem(SENT_NOTIFICATIONS_KEY);
    const log: Record<string, string> = raw ? JSON.parse(raw) : {};
    log[category] = today;
    localStorage.setItem(SENT_NOTIFICATIONS_KEY, JSON.stringify(log));
  } catch {}
};

/**
 * Periodic Checker using REAL student data
 */
export const evaluateMotivationalSchedule = async (params: {
  profile: UserProfile;
  settings: NotificationSettings;
  tasks: StudyTask[];
  exams: Exam[];
  checkInState: DailyCheckInState;
  streakDays: number;
  language: Language;
}): Promise<void> => {
  const { profile, settings, tasks, exams, checkInState, streakDays, language } = params;

  if (!settings.enabled) return;
  if (settings.quietHoursEnabled && isInQuietHours(settings.quietHoursStart, settings.quietHoursEnd)) {
    return;
  }

  const now = new Date();
  const hour = now.getHours();

  // 1. Morning Check-in prompt (08:00 - 12:00)
  if (settings.morningCheckIn && hour >= 8 && hour < 12 && !checkInState.completedToday) {
    if (!wasSentToday('morning_checkin')) {
      const name = profile.name ? profile.name.split(' ')[0] : (language === 'ar' ? 'دكتورة' : 'Doctor');
      await dispatchNotification({
        title: `Good morning ${name} 👋`,
        titleAr: `صباح الخير دكتورة ${name} 👋`,
        body: "Complete your check-in and I'll organize today's study plan.",
        bodyAr: 'أكملي فحص الصباح وسأقوم بتنظيم خطتكِ الدراسية الذكية لليوم.',
        type: 'morning',
        language,
      });
      markSentToday('morning_checkin');
      return;
    }
  }

  // 2. Next planned task reminder
  if (settings.studyReminders && tasks.length > 0) {
    const pendingTasks = tasks.filter((t) => t.status === 'pending');
    if (pendingTasks.length > 0 && !wasSentToday('next_task')) {
      const nextTask = pendingTasks[0];
      await dispatchNotification({
        title: `${nextTask.courseName} is next`,
        titleAr: `${nextTask.courseName} هي المهمة التالية`,
        body: `${nextTask.title} — ${nextTask.durationMinutes} min planned.`,
        bodyAr: `${nextTask.title} — ${nextTask.durationMinutes} دقيقة مجدولة.`,
        type: 'task',
        language,
      });
      markSentToday('next_task');
      return;
    }
  }

  // 3. Progress reminder
  if (settings.studyReminders && tasks.length >= 2) {
    const completedCount = tasks.filter((t) => t.status === 'completed').length;
    const remainingCount = tasks.length - completedCount;
    if (completedCount >= 1 && remainingCount > 0 && !wasSentToday('progress_update')) {
      await dispatchNotification({
        title: 'Daily Study Progress 📚',
        titleAr: 'تقدم دراستكِ اليوم 📚',
        body: `You completed ${completedCount} of ${tasks.length} tasks today. ${remainingCount} remains.`,
        bodyAr: `أنجزتِ ${completedCount} من أصل ${tasks.length} مهام اليوم. تبقت ${remainingCount} فقط.`,
        type: 'progress',
        language,
      });
      markSentToday('progress_update');
      return;
    }
  }

  // 4. Upcoming Exam countdown reminder
  if (settings.examCountdowns && exams.length > 0) {
    const sorted = [...exams].sort((a, b) => a.daysRemaining - b.daysRemaining);
    const nearest = sorted[0];
    if (nearest && nearest.daysRemaining <= 10 && !wasSentToday(`exam_${nearest.id}`)) {
      await dispatchNotification({
        title: `Upcoming Exam: ${nearest.courseName}`,
        titleAr: `امتحان قادم: ${nearest.courseName}`,
        body: `Your ${nearest.courseName} exam is in ${nearest.daysRemaining} days.`,
        bodyAr: `امتحان ${nearest.courseName} بعد ${nearest.daysRemaining} أيام.`,
        type: 'exam',
        language,
      });
      markSentToday(`exam_${nearest.id}`);
      return;
    }
  }

  // 5. Evening reflection prompt (20:00 - 23:00)
  if (settings.eveningReview && hour >= 20 && hour < 23) {
    if (!wasSentToday('evening_review')) {
      await dispatchNotification({
        title: 'Evening Study Reflection 🌙',
        titleAr: 'المراجعة المسائية الهادئة 🌙',
        body: 'How did studying go today? Take a moment to log your day.',
        bodyAr: 'كيف سارت دراستكِ اليوم؟ راجعي إنجازكِ وجهزي خطة الغد بهدوء.',
        type: 'evening',
        language,
      });
      markSentToday('evening_review');
      return;
    }
  }

  // 6. Streak Achievement
  if (settings.achievements && streakDays >= 3 && !wasSentToday(`streak_${streakDays}`)) {
    await dispatchNotification({
      title: 'Study Streak Milestone 🎉',
      titleAr: 'إنجاز التتابع الدراسي 🎉',
      body: `You completed ${streakDays} study days in a row!`,
      bodyAr: `أكملتِ ${streakDays} أيام متتالية من الالتزام الدراسي!`,
      type: 'achievement',
      language,
    });
    markSentToday(`streak_${streakDays}`);
  }
};
