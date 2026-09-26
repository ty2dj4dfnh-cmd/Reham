import React from 'react';
import {
  Flame,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldAlert,
  Calendar,
  Layers,
  ChevronRight,
  HelpCircle,
  Stethoscope,
  Smile,
  Plus,
  BookOpen,
  Coffee,
  Moon,
  Zap,
} from 'lucide-react';
import {
  Language,
  StudyTask,
  DailyCheckInState,
  Exam,
  Course,
  DailyReview,
  FocusSessionLog,
} from '../types';
import { translations } from '../i18n/translations';
import { getRealDataMotivation } from '../services/plannerEngine';

interface TodayViewProps {
  userName: string;
  tasks: StudyTask[];
  nearestExam: Exam | null;
  courses: Course[];
  exams: Exam[];
  dailyReviews: DailyReview[];
  focusSessions: FocusSessionLog[];
  onStartTask: (task: StudyTask) => void;
  onDoneTask: (task: StudyTask) => void;
  onCantFinishTask: (task: StudyTask) => void;
  onBuildMyDay: () => void;
  onOpenCheckIn: () => void;
  onOpenExamRescue: () => void;
  onOpenReplanWeek: () => void;
  onOpenEveningReview: () => void;
  onNavigateToTutor?: () => void;
  onNavigateToCourses?: () => void;
  onNavigateToLectures?: () => void;
  checkInState: DailyCheckInState;
  streakDays: number;
  studyTimeFormatted: string;
  weeklyProgressPercent: number;
  language: Language;
  rescueModeActive: boolean;
  isBuildingPlan?: boolean;
}

export const TodayView: React.FC<TodayViewProps> = ({
  userName,
  tasks,
  nearestExam,
  courses,
  exams,
  dailyReviews,
  focusSessions,
  onStartTask,
  onDoneTask,
  onCantFinishTask,
  onBuildMyDay,
  onOpenCheckIn,
  onOpenExamRescue,
  onOpenReplanWeek,
  onOpenEveningReview,
  onNavigateToTutor,
  onNavigateToCourses,
  onNavigateToLectures,
  checkInState,
  streakDays,
  studyTimeFormatted,
  weeklyProgressPercent,
  language,
  rescueModeActive,
  isBuildingPlan,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  const nonBreakTasks = tasks.filter((t) => !t.isBreak);
  const completedTasks = nonBreakTasks.filter((t) => t.status === 'completed');
  const completedCount = completedTasks.length;
  const totalCount = nonBreakTasks.length;
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;
  const progressPercent = totalCount > 0 ? Math.round(progressRatio * 100) : 0;
  const isPlanCompleted = totalCount > 0 && completedCount === totalCount;

  // Real data-driven motivation statement
  const realMotivation = getRealDataMotivation(
    {
      tasks,
      dailyReviews,
      focusSessions,
      courses,
      exams,
    },
    language
  );

  // Personalized greeting with user's first name
  const firstName = userName.trim().split(' ')[0] || 'Doctor';
  const personalizedGreeting = isAr
    ? `مساء الخير، د. ${firstName} 👋`
    : `Good afternoon, ${firstName} 👋`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Rescue Mode Alert Banner if active */}
      {rescueModeActive && (
        <div className="flex items-center justify-between p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div className="text-xs">
              <span className="font-bold">{t.plan.rescueModeActive}:</span>{' '}
              <span className="text-amber-800 dark:text-amber-300">
                {nearestExam
                  ? `Prioritizing essential high-yield spotters and exam MCQs for ${nearestExam.courseName} in ${nearestExam.daysRemaining} days.`
                  : 'Prioritizing essential exam spotters and board-style MCQs.'}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenExamRescue}
            className="text-xs font-bold underline decoration-amber-400 hover:text-amber-950 dark:hover:text-white px-3 py-1 cursor-pointer"
          >
            Manage
          </button>
        </div>
      )}

      {/* Hero Welcome & Motivation Greeting */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/30 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
              {isAr ? 'عيادة التعليم الذكي' : 'Clinical Study Companion'}
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? 'الخميس، 24 أيلول' : 'Thursday, Sep 24'}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {personalizedGreeting}
          </h1>

          {/* Real data-backed motivation */}
          <p className="mt-2.5 text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {realMotivation ||
              (isAr
                ? 'خطة دراسية مرتبة بدقة بحسب اقتراب الامتحانات وطاقتكِ السريرية.'
                : 'Your study plan is deterministically calibrated using your upcoming exams and daily energy.')}
          </p>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {/* BUILD MY DAY BUTTON */}
            <button
              onClick={onBuildMyDay}
              disabled={isBuildingPlan}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isBuildingPlan
                  ? isAr ? 'جارٍ بناء الخطة...' : 'Building Today...'
                  : isAr ? 'بناء خطة اليوم (Build My Day)' : 'Build My Day'}
              </span>
            </button>

            <button
              onClick={onOpenCheckIn}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {checkInState.completedToday
                  ? isAr ? 'تحديث التسجيل اليومي' : "Update Daily Check-In"
                  : t.actions.checkInNow}
              </span>
            </button>

            <button
              onClick={onOpenEveningReview}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isAr ? 'ختام اليوم الدراسي' : 'End My Study Day'}</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle decorative background element */}
        <div className="hidden md:block absolute -right-6 -bottom-8 w-64 h-64 rounded-full bg-teal-500/5 dark:bg-teal-400/5 blur-2xl pointer-events-none" />
      </div>

      {/* Stats Quad Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Stat 1: Today's progress */}
        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.today.tasksProgress}
            </span>
            <span className="font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">
              {progressPercent}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {completedCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {totalCount} tasks</span>
          </div>
          <div className="w-full h-1.5 mt-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stat 2: Study time today */}
        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.today.studyTime}
            </span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {studyTimeFormatted}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 truncate">
            {isAr ? 'المسجل في الجلسات الفعلية' : 'Logged from active sessions'}
          </p>
        </div>

        {/* Stat 3: Current streak */}
        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.today.currentStreak}
            </span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {streakDays}
            </span>
            <span className="text-xs text-slate-400">{t.today.days}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 truncate">
            {isAr ? 'ثبات هادئ دون إجهاد' : 'Steady habit building'}
          </p>
        </div>

        {/* Stat 4: Nearest Exam */}
        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isAr ? 'الامتحان الأقرب' : 'Nearest Exam'}
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {nearestExam ? `${nearestExam.daysRemaining}d` : '—'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 truncate">
            {nearestExam ? nearestExam.courseName : isAr ? 'لا توجد امتحانات' : 'No upcoming exam'}
          </p>
        </div>
      </div>

      {/* Main Focus: Today's Study Plan Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {t.today.todaysPlanTitle}
              </h2>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {tasks.length} {isAr ? 'عناصر' : 'items'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr
                ? 'مرتبة وفق الأولوية الحتمية وقرب الامتحان دون عشوائية'
                : 'Deterministically prioritized by proximity, confidence, and course difficulty.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReplanWeek}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isAr ? 'تخطيط الأسبوع' : 'Replan Week'}</span>
            </button>

            <button
              onClick={onOpenExamRescue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-200 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t.actions.examRescue}</span>
            </button>
          </div>
        </div>

        {/* Task List or Empty State */}
        {tasks.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-xs">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? 'ما الذي يجب أن أدرسه اليوم؟' : 'What should I study today?'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {isAr
                  ? 'اضغطي على "بناء خطة اليوم" لتحليل امتحاناتكِ القادمة، وساعات المذاكرة المتاحة، ودرجة صعوبة المقررات لإنشاء جدول مخصص.'
                  : 'Click "Build My Day" to generate your personalized schedule using upcoming exams, remaining days, available time, and confidence.'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={onBuildMyDay}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? 'بناء خطة اليوم الآن' : 'Build My Day Now'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((task) => {
              // Rest Break Item
              if (task.isBreak) {
                return (
                  <div
                    key={task.id}
                    className="p-4 md:px-6 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <Coffee className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {task.title}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {isAr && task.reasonAr ? task.reasonAr : task.reason}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-slate-500 font-semibold">
                      {task.durationMinutes} min
                    </span>
                  </div>
                );
              }

              const isDone = task.status === 'completed';
              const isRescheduled = task.status === 'rescheduled';

              return (
                <div
                  key={task.id}
                  className={`p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isDone
                      ? 'bg-slate-50/60 dark:bg-slate-800/20'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Task Details */}
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => onDoneTask(task)}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-slate-300 dark:border-slate-600 hover:border-teal-500'
                      }`}
                      title={isDone ? 'Mark as incomplete' : 'Mark as done'}
                      aria-label="Toggle task completion"
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                          {task.courseName}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.durationMinutes >= 60
                            ? `${Math.floor(task.durationMinutes / 60)}h ${
                                task.durationMinutes % 60 > 0 ? `${task.durationMinutes % 60}m` : ''
                              }`
                            : `${task.durationMinutes} min`}
                        </span>

                        {task.priorityLevel === 'high' && (
                          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded-full">
                            {isAr ? 'أولوية قصوى' : 'High Priority'}
                          </span>
                        )}

                        {isRescheduled && (
                          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                            {isAr ? 'تم تكييف الموعد' : 'Adapted'}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm font-semibold mt-1 transition-all ${
                          isDone
                            ? 'text-slate-400 dark:text-slate-500 line-through'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Section 4 Explainable Reason */}
                      {task.reason && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {isAr ? 'السبب:' : 'Reason:'}
                          </span>{' '}
                          {isAr && task.reasonAr ? task.reasonAr : task.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Task Action Buttons: Start, Done, Couldn't Finish */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    {!isDone ? (
                      <>
                        <button
                          onClick={() => onStartTask(task)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{t.actions.start}</span>
                        </button>

                        <button
                          onClick={() => onDoneTask(task)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                        >
                          {t.actions.done}
                        </button>

                        <button
                          onClick={() => onCantFinishTask(task)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {isAr ? 'لم أتمكن من الإكمال' : "Couldn't Finish"}
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isAr ? 'مكتمل' : 'Completed'}
                        </span>
                        <button
                          onClick={() => onDoneTask(task)}
                          className="text-[11px] text-slate-400 hover:underline ms-2 cursor-pointer"
                        >
                          {isAr ? 'تراجع' : 'Undo'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Section 14: Daily Completion Celebration Banner */}
        {isPlanCompleted && (
          <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-transparent dark:from-emerald-950/30 dark:via-teal-950/20 border-t border-emerald-100 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  {isAr ? 'خطة اليوم مكتملة بالكامل! 🦷' : "Today's plan is complete."}
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                  {isAr
                    ? 'أتممتِ جميع المهام المقررة. يمكنكِ المراجعة الخفيفة أو نيل قسط من الراحة.'
                    : 'You finished every target without backlog. Ready for what comes next?'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateToCourses && (
                <button
                  onClick={onNavigateToCourses}
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100/50 cursor-pointer"
                >
                  {isAr ? 'مراجعة المفاهيم الضعيفة' : 'Review Weak Topics'}
                </button>
              )}
              {onNavigateToLectures && (
                <button
                  onClick={onNavigateToLectures}
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100/50 cursor-pointer"
                >
                  {isAr ? 'حل أسئلة سريرية' : 'Practice Questions'}
                </button>
              )}
              <button
                onClick={onOpenEveningReview}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isAr ? 'إنهاء المذاكرة لليوم' : 'Finish for Today'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
