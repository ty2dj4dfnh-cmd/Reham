import React from 'react';
import { Menu, Globe, Moon, Sun, Flame, Sparkles, User, BatteryCharging, HeartHandshake, Bell } from 'lucide-react';
import { Language, NavSection, ThemeMode } from '../types';
import { translations } from '../i18n/translations';

interface TopHeaderProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenCheckIn: () => void;
  onOpenMobileNav: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentSection,
  onSelectSection,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  onOpenCheckIn,
  onOpenMobileNav,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  completedTasksCount,
  totalTasksCount,
}) => {
  const t = translations[language];

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'today':
        return t.nav.today;
      case 'courses':
        return t.nav.courses;
      case 'plan':
        return t.nav.plan;
      case 'lectures':
        return t.nav.lectures;
      case 'tutor':
        return t.nav.tutor;
      case 'exams':
        return t.nav.exams;
      case 'focus':
        return t.nav.focus;
      case 'achievements':
        return t.nav.achievements;
      case 'profile':
        return t.nav.profile;
      default:
        return t.appTitle;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="p-2 -ms-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
            {getSectionTitle()}
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500">
            / 3rd Year Clinical
          </span>
        </div>
      </div>

      {/* Zone 2: Contextual Progress ticker / Study state */}
      <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {language === 'ar' ? 'امتحان أمراض الفم بعد 5 أيام' : 'Oral Pathology exam in 5 days'}
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono tabular-nums">
          <span className="text-teal-600 dark:text-teal-400 font-semibold">{completedTasksCount}/{totalTasksCount}</span>
          <span>{language === 'ar' ? 'مهام اليوم' : 'tasks today'}</span>
        </div>
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCheckIn}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800/60 rounded-lg transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span className="hidden xs:inline">{t.actions.checkInNow}</span>
          <span className="xs:hidden">{language === 'ar' ? 'حالة' : 'Check'}</span>
        </button>

        {onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={language === 'ar' ? 'الإشعارات' : 'Notifications'}
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
        )}

        <button
          onClick={onToggleLanguage}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Switch language"
          aria-label="Switch language"
        >
          <Globe className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        <button
          onClick={() => onSelectSection('profile')}
          className="flex items-center gap-2 p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ms-1"
          title="View Profile"
          aria-label="View Profile"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            R
          </div>
          <span className="hidden xl:inline text-xs font-medium">Reham</span>
        </button>
      </div>
    </header>
  );
};
