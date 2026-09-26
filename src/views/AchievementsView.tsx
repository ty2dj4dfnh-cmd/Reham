import React, { useState } from 'react';
import {
  Award,
  Plus,
  Flame,
  Clock,
  CheckCircle2,
  Calendar,
  Share2,
  Download,
  Sparkles,
  Trophy,
  Stethoscope,
  Smile,
  BookOpen
} from 'lucide-react';
import { Achievement, Language } from '../types';
import { translations } from '../i18n/translations';

interface AchievementsViewProps {
  achievements: Achievement[];
  onOpenLogModal: () => void;
  streakDays: number;
  onShareWrapped: () => void;
  language: Language;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  achievements,
  onOpenLogModal,
  streakDays,
  onShareWrapped,
  language,
}) => {
  const t = translations[language];

  const [copiedShare, setCopiedShare] = useState(false);

  const handleShareClick = () => {
    setCopiedShare(true);
    onShareWrapped();
    setTimeout(() => setCopiedShare(false), 3000);
  };

  const getCategoryBadge = (category: Achievement['category']) => {
    switch (category) {
      case 'lecture':
        return 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'mcq':
        return 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'hours':
        return 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'streak':
        return 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.achievements.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.achievements.subtitle}
          </p>
        </div>

        <button
          onClick={onOpenLogModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.achievements.logBtn}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.achievements.streakBadge}</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {streakDays} {t.today.days}
          </div>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1">Best: 6 days</p>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.achievements.weeklyHours}</span>
            <Clock className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            14.5 hrs
          </div>
          <p className="text-[11px] text-slate-400 mt-1">On pace with clinical goal</p>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.achievements.questionsSolved}</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            1,170
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">84% accuracy rate</p>
        </div>

        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.achievements.lecturesDone}</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            54 lectures
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 5 courses</p>
        </div>
      </div>

      {/* Featured Monthly Section: September Wrapped */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/40 shadow-xl relative overflow-hidden">
        {/* Subtle decorative ring */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-teal-500/20 text-teal-300">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-xs uppercase font-bold tracking-widest text-teal-400">
                  DentalMind Milestone Recap
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
                {t.achievements.wrappedTitle}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {t.achievements.wrappedSubtitle} · Reham (3rd Year BDS)
              </p>
            </div>

            <button
              onClick={handleShareClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-teal-50 text-xs font-semibold shadow-md transition-all cursor-pointer self-start sm:self-auto"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedShare ? t.actions.copied : t.actions.shareCard}</span>
            </button>
          </div>

          {/* Wrapped Statistics Card Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] text-teal-300/80">{t.achievements.hoursSpent}</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">63 hours</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Focus time logged</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] text-teal-300/80">Lectures Completed</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">28 lectures</div>
              <div className="text-[10px] text-slate-400 mt-0.5">High-yield reviewed</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] text-teal-300/80">Questions Solved</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">1,420 MCQs</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Case-based clinical</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] text-teal-300/80">{t.achievements.bestStreak}</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">6 Days</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Active habit</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] text-teal-300/80">{t.achievements.strongestSubject}</div>
              <div className="text-base font-bold text-white mt-1 truncate">Dental Radiology</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">92% diagnostic recall</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] text-teal-300/80">{t.achievements.mostImproved}</div>
              <div className="text-base font-bold text-white mt-1 truncate">Oral Pathology</div>
              <div className="text-[10px] text-teal-400 mt-0.5">+24% confidence jump</div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual and Automated Achievements Stream */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {language === 'ar' ? 'سجل الإنجازات اليومية' : 'Milestone Activity Stream'}
        </h3>

        <div className="space-y-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {language === 'ar' && ach.titleAr ? ach.titleAr : ach.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{ach.timestamp}</div>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadge(
                  ach.category
                )}`}
              >
                {ach.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
