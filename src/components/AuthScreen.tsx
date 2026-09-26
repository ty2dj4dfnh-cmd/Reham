import React, { useState } from 'react';
import {
  Stethoscope,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Calendar,
  Brain,
  Globe,
  Sun,
  Moon,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { Language, ThemeMode } from '../types';
import { translations } from '../i18n/translations';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthSuccess,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = translations[language];

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onAuthSuccess(user);
      }
    } catch (error: any) {
      console.error('Sign-in failed:', error);
      if (error?.code === 'auth/popup-blocked') {
        setErrorMessage(
          language === 'ar'
            ? 'تم حظر النافذة المنبثقة من قِبل المتصفح. يرجى السماح بالنوافذ المنبثقة لتسجيل الدخول.'
            : 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.'
        );
      } else if (error?.code === 'auth/popup-closed-by-user') {
        setErrorMessage(
          language === 'ar'
            ? 'تم إغلاق نافذة تسجيل الدخول قبل الاكتمال. يرجى المحاولة مجدداً.'
            : 'Sign-in was cancelled before completion. Please try again.'
        );
      } else {
        setErrorMessage(
          error?.message ||
            (language === 'ar'
              ? 'حدث خطأ أثناء الاتصال بحساب Google. يرجى إعادة المحاولة.'
              : 'Unable to connect to Google account. Please try again.')
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white transition-colors duration-200">
      {/* Top Bar with Language and Theme Switches */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2.5 select-none">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-600 dark:bg-teal-500 text-white shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {t.appTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl p-8 space-y-6 text-center">
          {/* Brand Icon & Heading */}
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <Stethoscope className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.appTitle}
              </h1>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                {language === 'ar'
                  ? 'رفيق دراستكِ الذكي والشخصي لكلية طب وجراحة الأسنان.'
                  : 'Your personal AI study companion for dental school.'}
              </p>
            </div>
          </div>

          {/* Value Highlights Pill Grid */}
          <div className="grid grid-cols-2 gap-2 text-start text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-800 dark:text-slate-200">
                  {language === 'ar' ? 'مقررات الأسنان' : 'Dental Courses'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {language === 'ar' ? 'علم الأمراض، الأشعة والمداواة' : 'Pathology, Radiology & More'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-start gap-2">
              <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-800 dark:text-slate-200">
                  {language === 'ar' ? 'خطة متكيفة' : 'Adaptive Pacing'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {language === 'ar' ? 'تعديل الجدول وفق طاقتك' : 'Workload adjusted to energy'}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2 text-start animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Sign-In Action */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <span>
                    {language === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Connecting to Google...'}
                  </span>
                </div>
              ) : (
                <>
                  {/* Google SVG Logo */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>
                    {language === 'ar' ? 'المتابعة باستخدام Google' : 'Continue with Google'}
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>
                {language === 'ar'
                  ? 'بياناتكِ الدراسية مشفرة ومعزولة بحسابكِ فقط'
                  : 'Your dental study data is private and UID-isolated'}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
        DentalMind · University Dental Student Edition
      </footer>
    </div>
  );
};
