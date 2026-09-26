import React from 'react';
import {
  CalendarDays,
  GraduationCap,
  Sparkles,
  Flame,
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Brain,
  Award,
  User,
  HeartPulse,
  Sun,
  Moon,
  Globe,
  Sliders,
  X,
  Stethoscope
} from 'lucide-react';
import { Language, NavSection, ThemeMode } from '../types';
import { translations } from '../i18n/translations';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenCheckIn: () => void;
  streakDays: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  onOpenCheckIn,
  streakDays,
  mobileOpen,
  onCloseMobile,
}) => {
  const t = translations[language];

  const navItems: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: t.nav.today, icon: LayoutDashboard },
    { id: 'courses', label: t.nav.courses, icon: BookOpen },
    { id: 'plan', label: t.nav.plan, icon: Calendar },
    { id: 'lectures', label: t.nav.lectures, icon: FileText },
    { id: 'tutor', label: t.nav.tutor, icon: Brain },
    { id: 'exams', label: t.nav.exams, icon: CalendarDays },
    { id: 'focus', label: t.nav.focus, icon: HeartPulse },
    { id: 'achievements', label: t.nav.achievements, icon: Award },
    { id: 'profile', label: t.nav.profile, icon: User },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          language === 'ar' ? 'right-0' : 'left-0'
        } ${
          mobileOpen
            ? 'translate-x-0'
            : language === 'ar'
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-slate-800/80">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => {
              onSelectSection('today');
              onCloseMobile();
            }}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-600 dark:bg-teal-500 text-white shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {t.appTitle}
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold text-teal-700 dark:text-teal-300">
                  <Sparkles className="w-3 h-3 me-0.5" /> BDS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                {language === 'ar' ? 'رفيق دراسة طب الأسنان' : 'Dental Study Companion'}
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daily Streak & Fast Check-in banner */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 border border-teal-100/80 dark:border-teal-900/50">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-600/10 dark:bg-teal-400/10 text-teal-600 dark:text-teal-400">
                <Flame className="w-4 h-4 fill-current text-amber-500" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  {streakDays} {t.today.days} {language === 'ar' ? 'سلسلة' : 'Streak'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {language === 'ar' ? 'التزام سريري متواصل' : 'Consistent momentum'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                onOpenCheckIn();
                onCloseMobile();
              }}
              className="text-[11px] font-medium text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 underline decoration-teal-300 underline-offset-2 transition-colors"
            >
              {language === 'ar' ? 'تسجيل' : 'Check in'}
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-start ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.id === 'tutor' && (
                  <span className="ms-auto text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                    AI
                  </span>
                )}
                {item.id === 'exams' && (
                  <span className="ms-auto text-[10px] font-mono tabular-nums text-amber-600 dark:text-amber-400">
                    5d
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer controls: Language and Dark mode switchers */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            {/* Language Switch */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all"
              title="Toggle English / Arabic"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all"
              title="Toggle Light / Dark mode"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400 dark:text-slate-500">
            <span>DentalMind v1.0</span>
            <span>3rd Year BDS</span>
          </div>
        </div>
      </aside>
    </>
  );
};
