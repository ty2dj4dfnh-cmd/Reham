import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Target,
  Plus,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  BookOpen,
  ListOrdered,
} from 'lucide-react';
import { Exam, Language } from '../types';
import { translations } from '../i18n/translations';

interface ExamsViewProps {
  exams: Exam[];
  onOpenExamRescue: () => void;
  onOpenAddExam?: () => void;
  onManageUnits?: (exam: Exam) => void;
  language: Language;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  onOpenExamRescue,
  onOpenAddExam,
  onManageUnits,
  language,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  const [selectedExamForPrep, setSelectedExamForPrep] = useState<Exam | null>(null);
  const [prepProgressToast, setPrepProgressToast] = useState(false);

  const handleStartSprint = () => {
    setPrepProgressToast(true);
    setTimeout(() => {
      setPrepProgressToast(false);
      setSelectedExamForPrep(null);
    }, 2500);
  };

  const calculateDaysLeft = (examDateStr: string, fallbackDays: number) => {
    try {
      const examDate = new Date(examDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = examDate.getTime() - today.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return isNaN(days) ? fallbackDays : Math.max(0, days);
    } catch {
      return fallbackDays;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.exams.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.exams.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAddExam && (
            <button
              onClick={onOpenAddExam}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة امتحان' : 'Add Exam'}</span>
            </button>
          )}

          <button
            onClick={onOpenExamRescue}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.actions.examRescue}</span>
          </button>
        </div>
      </div>

      {prepProgressToast && (
        <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>
            {isAr
              ? 'تم تشغيل برنامج التحضير المكثف! تم تكييف خطة اليوم تلقائياً.'
              : 'Preparation Sprint activated! Your daily study tasks have been calibrated.'}
          </span>
        </div>
      )}

      {/* Exams Grid or Empty State */}
      {exams.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {isAr ? 'لا توجد امتحانات مضافة بعد' : 'No exam added yet.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isAr
              ? 'أضيفي أول امتحان قادم (نصفي، سريري OSCE أو نهائي) لتفعيل مؤشرات الجاهزية والعد التنازلي الذكي.'
              : 'Track your first upcoming midterm, OSCE, or quiz to activate countdown pacing and high-yield sprint roadmaps.'}
          </p>
          {onOpenAddExam && (
            <button
              onClick={onOpenAddExam}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold shadow-xs hover:bg-teal-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة أول امتحان' : 'Add First Exam'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {exams.map((exam) => {
            const daysLeft = calculateDaysLeft(exam.examDate, exam.daysRemaining);
            const isUrgent = daysLeft <= 7;
            const units = exam.units || [];
            const completedUnits = units.filter((u) => u.status === 'completed').length;

            return (
              <div
                key={exam.id}
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all ${
                  isUrgent
                    ? 'border-amber-300/80 dark:border-amber-700/80 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                        {exam.examType}
                      </span>
                      {exam.examTitle && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {exam.examTitle}
                          </span>
                        </>
                      )}
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400">{exam.examDate}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {isAr && exam.courseNameAr ? exam.courseNameAr : exam.courseName}
                    </h3>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-xl text-xs font-bold font-mono ${
                      isUrgent
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {daysLeft} {t.today.days}
                  </div>
                </div>

                {/* Progress & Targets */}
                <div className="mt-5 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{t.exams.preparation}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {exam.preparationPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          exam.preparationPercent > 70
                            ? 'bg-emerald-500'
                            : exam.preparationPercent > 50
                            ? 'bg-teal-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${exam.preparationPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400">{t.exams.target}</div>
                      <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                        {exam.targetGrade}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400">
                        {isAr ? 'الوحدات المكتملة' : 'Completed Units'}
                      </div>
                      <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                        {completedUnits} / {units.length}
                      </div>
                    </div>
                  </div>

                  {/* Study units breakdown preview */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                      <span>{isAr ? 'وحدات وفصول الامتحان:' : 'Syllabus Study Units:'}</span>
                      {onManageUnits && (
                        <button
                          type="button"
                          onClick={() => onManageUnits(exam)}
                          className="text-teal-600 hover:underline cursor-pointer"
                        >
                          {isAr ? 'إدارة الوحدات' : 'Manage Units'}
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {units.length > 0 ? (
                        units.slice(0, 3).map((u) => (
                          <div
                            key={u.id}
                            className="text-xs text-slate-600 dark:text-slate-300 truncate flex items-center justify-between"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  u.status === 'completed'
                                    ? 'bg-emerald-500'
                                    : u.priority === 'high'
                                    ? 'bg-rose-500'
                                    : 'bg-teal-500'
                                }`}
                              />
                              <span className={u.status === 'completed' ? 'line-through text-slate-400' : ''}>
                                {u.title}
                              </span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {u.estimatedMinutes}m
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 italic">
                          {isAr ? 'لا توجد وحدات بعد' : 'No units defined yet'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  {onManageUnits && (
                    <button
                      onClick={() => onManageUnits(exam)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <ListOrdered className="w-3.5 h-3.5 text-teal-600" />
                      <span>{isAr ? 'إدارة الوحدات' : 'Manage Units'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedExamForPrep(exam)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>{t.actions.prepareMe}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prepare Me Modal Simulator */}
      {selectedExamForPrep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.exams.prepareModalTitle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedExamForPrep.courseName} · {selectedExamForPrep.daysRemaining} days left
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExamForPrep(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 text-xs text-teal-900 dark:text-teal-200">
                DentalMind analyzed your course data: 3 weak concepts identified. Completing these 3 micro-sprints elevates estimated readiness from {selectedExamForPrep.preparationPercent}% to 89%.
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Sprint Roadmap:
                </div>
                {selectedExamForPrep.highYieldTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      Step {i + 1}: {topic}
                    </span>
                    <span className="text-[11px] font-mono text-teal-600 font-semibold">
                      30 min
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedExamForPrep(null)}
                className="px-4 py-2 text-xs font-medium text-slate-500"
              >
                {t.actions.cancel}
              </button>
              <button
                onClick={handleStartSprint}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Preparation Sprint</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
