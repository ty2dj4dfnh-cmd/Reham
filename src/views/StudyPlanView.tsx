import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Layers,
  CalendarDays
} from 'lucide-react';
import { Language, StudyTask } from '../types';
import { translations } from '../i18n/translations';

interface StudyPlanViewProps {
  tasks: StudyTask[];
  onOpenExamRescue: () => void;
  language: Language;
  rescueModeActive: boolean;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  tasks,
  onOpenExamRescue,
  language,
  rescueModeActive,
}) => {
  const t = translations[language];

  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'calendar'>('weekly');
  const [replanSuccessToast, setReplanSuccessToast] = useState(false);

  const handleReplanWeek = () => {
    setReplanSuccessToast(true);
    setTimeout(() => setReplanSuccessToast(false), 3500);
  };

  const weekDays = [
    {
      day: language === 'ar' ? 'الإثنين' : 'Monday',
      date: 'Sep 21',
      status: 'past',
      estHours: '2.5h',
      actualHours: '2.5h',
      tasks: ['Oral Pathology — Chapter 1', 'Radiology Principles 1'],
      urgency: 'Normal',
    },
    {
      day: language === 'ar' ? 'الثلاثاء' : 'Tuesday',
      date: 'Sep 22',
      status: 'past',
      estHours: '3.0h',
      actualHours: '2.8h',
      tasks: ['Operative Cavity Prep', 'Radiology Projection Geometry'],
      urgency: 'Normal',
    },
    {
      day: language === 'ar' ? 'الأربعاء' : 'Wednesday',
      date: 'Sep 23',
      status: 'past',
      estHours: '2.5h',
      actualHours: '2.5h',
      tasks: ['Prosthodontics Border Molding', 'Review Mistakes'],
      urgency: 'Medium',
    },
    {
      day: language === 'ar' ? 'الخميس (اليوم)' : 'Thursday (Today)',
      date: 'Sep 24',
      status: 'today',
      estHours: '3.0h',
      actualHours: '1.8h',
      tasks: [
        'Oral Pathology — Chapter 2: Odontogenic Tumors',
        'Dental Radiology — Lecture 3: Projection Geometry',
        'Review yesterday’s mistakes',
      ],
      urgency: 'High (Exam in 5 days)',
    },
    {
      day: language === 'ar' ? 'الجمعة' : 'Friday',
      date: 'Sep 25',
      status: 'upcoming',
      estHours: '2.0h',
      actualHours: '—',
      tasks: ['Ameloblastoma vs OKC Microscopic Spotters', '50 Pathology MCQs'],
      urgency: 'High',
    },
    {
      day: language === 'ar' ? 'السبت' : 'Saturday',
      date: 'Sep 26',
      status: 'upcoming',
      estHours: '3.5h',
      actualHours: '—',
      tasks: ['Pathology Full Diagnostic Simulation Exam', 'Radiology Spotters'],
      urgency: 'Critical',
    },
    {
      day: language === 'ar' ? 'الأحد' : 'Sunday',
      date: 'Sep 27',
      status: 'upcoming',
      estHours: '2.5h',
      actualHours: '—',
      tasks: ['Restorative Materials Setting Chemistry', 'Calm Review'],
      urgency: 'Medium',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.plan.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.plan.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReplanWeek}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{t.actions.replanWeek}</span>
          </button>

          <button
            onClick={onOpenExamRescue}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
              rescueModeActive
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.actions.examRescue}</span>
          </button>
        </div>
      </div>

      {replanSuccessToast && (
        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>
              {language === 'ar'
                ? 'تمت إعادة موازنة الأسبوع بنجاح! خففنا ساعات الجمعة لتفادي الإجهاد.'
                : 'Week rebalanced seamlessly! Friday workload smoothed to protect focus.'}
            </span>
          </div>
          <button
            onClick={() => setReplanSuccessToast(false)}
            className="text-teal-600 font-semibold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* View Segmented Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.plan.dailyView}
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.plan.weeklyView}
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.plan.calendarView}
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Week 4 · Fall 2026
        </div>
      </div>

      {/* Weekly View Container */}
      {viewMode === 'weekly' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-7 gap-3">
            {weekDays.map((dayItem, idx) => {
              const isToday = dayItem.status === 'today';
              const isPast = dayItem.status === 'past';

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-3xl flex flex-col justify-between border transition-all ${
                    isToday
                      ? 'bg-white dark:bg-slate-900 border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-bold ${
                          isToday ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dayItem.day}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{dayItem.date}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span>{dayItem.estHours} est</span>
                      <span className="font-mono">{dayItem.actualHours} done</span>
                    </div>

                    <div className="space-y-2">
                      {dayItem.tasks.map((taskName, tIdx) => (
                        <div
                          key={tIdx}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-800 dark:text-slate-200 leading-snug"
                        >
                          {taskName}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span
                      className={`text-[10px] font-semibold block truncate ${
                        dayItem.urgency.includes('High') || dayItem.urgency.includes('Critical')
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayItem.urgency}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily View Container */}
      {viewMode === 'daily' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'جدول دراسة اليوم بالتفصيل' : 'Thursday In-Depth Plan'}
            </h3>
            <span className="text-xs text-teal-600 font-semibold font-mono">
              3.0h Total Planned
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                    {task.courseName}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {task.title}
                  </div>
                </div>
                <div className="text-xs font-mono text-slate-500 font-semibold">
                  {task.durationMinutes} min
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar View Container */}
      {viewMode === 'calendar' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              September 2026
            </h3>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
              <button className="p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => (
              <div key={idx} className="font-semibold text-slate-400 py-1">
                {dayName}
              </div>
            ))}

            {Array.from({ length: 30 }).map((_, i) => {
              const dayNum = i + 1;
              const isToday = dayNum === 24;
              const hasExam = dayNum === 29;

              return (
                <div
                  key={i}
                  className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between text-start transition-colors ${
                    isToday
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold'
                      : hasExam
                      ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/40'
                      : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-800/20 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-mono">{dayNum}</span>
                  {hasExam && (
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 truncate">
                      Path Exam
                    </span>
                  )}
                  {isToday && (
                    <span className="text-[9px] font-semibold text-teal-600 dark:text-teal-400">
                      Today
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
