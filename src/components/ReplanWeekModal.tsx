import React from 'react';
import {
  X,
  Calendar,
  AlertTriangle,
  Sparkles,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Course, Exam, Language } from '../types';
import { analyzeReplanWeek, ReplanWeekAnalysis } from '../services/plannerEngine';

interface ReplanWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  exams: Exam[];
  dailyCapacityMinutes: number;
  onOpenExamRescue: () => void;
  onIncreaseDailyTarget?: () => void;
  onPrioritizeEssential?: () => void;
  language: Language;
}

export const ReplanWeekModal: React.FC<ReplanWeekModalProps> = ({
  isOpen,
  onClose,
  courses,
  exams,
  dailyCapacityMinutes,
  onOpenExamRescue,
  onIncreaseDailyTarget,
  onPrioritizeEssential,
  language,
}) => {
  const isAr = language === 'ar';

  if (!isOpen) return null;

  const analysis: ReplanWeekAnalysis = analyzeReplanWeek(
    courses,
    exams,
    dailyCapacityMinutes
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all my-6 animate-in fade-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isAr ? 'إعادة تخطيط الأسبوع' : 'Replan My Week'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr
                  ? 'إعادة توزيع وحدات المذاكرة المتبقية عبر الأيام قبل مواعيد الامتحانات'
                  : 'Recalculating unfinished work across remaining days before exams'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Capacity vs Workload Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">
                {isAr ? 'حجم العمل المتبقي vs السعة المتاحة:' : 'Remaining Workload vs Available Capacity:'}
              </span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {Math.round(analysis.totalWorkloadMinutes / 60 * 10) / 10}h / {Math.round(analysis.availableCapacityMinutes / 60 * 10) / 10}h
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  analysis.isOverCapacity ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    analysis.availableCapacityMinutes > 0
                      ? Math.round((analysis.totalWorkloadMinutes / analysis.availableCapacityMinutes) * 100)
                      : 100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Warning banner if mathematically over capacity */}
          {analysis.isOverCapacity && (
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">
                    {isAr
                      ? 'ساعات المذاكرة المتاحة حالياً قد لا تكفي لإتمام كل المنهج قبل موعد الامتحان.'
                      : 'Your current available study time may not be enough to complete everything before the exam.'}
                  </h4>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1">
                    {isAr
                      ? 'اختر أحد الحلول الاستراتيجية التالية لضمان عدم ضياع النقاط الحاسمة:'
                      : 'Choose one of the following practical solutions to ensure high-yield mastery:'}
                  </p>
                </div>
              </div>

              {/* 3 Solutions */}
              <div className="grid sm:grid-cols-3 gap-2 pt-1">
                {/* 1. Prioritize essential topics */}
                <button
                  type="button"
                  onClick={() => {
                    if (onPrioritizeEssential) onPrioritizeEssential();
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-start hover:border-rose-400 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white block mb-0.5">
                    {isAr ? 'التركيز على الأساسيات' : 'Prioritize Essentials'}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    {isAr ? 'عزل الفصول منخفضة الأولوية' : 'Park low-priority topics'}
                  </p>
                </button>

                {/* 2. Increase available study time */}
                <button
                  type="button"
                  onClick={() => {
                    if (onIncreaseDailyTarget) onIncreaseDailyTarget();
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-start hover:border-rose-400 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white block mb-0.5">
                    {isAr ? 'زيادة وقت المذاكرة' : 'Increase Daily Time'}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    {isAr ? 'إضافة 45 دقيقة إضافية يومياً' : 'Add +45 min daily capacity'}
                  </p>
                </button>

                {/* 3. Create Exam Rescue Plan */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenExamRescue();
                  }}
                  className="p-3 rounded-xl bg-amber-500 text-white text-start hover:bg-amber-600 transition-colors shadow-xs cursor-pointer"
                >
                  <span className="text-xs font-bold block mb-0.5">
                    {isAr ? 'خطة الإنقاذ السريع' : 'Exam Rescue Plan'}
                  </span>
                  <p className="text-[10px] text-amber-100">
                    {isAr ? 'أعلى عائد ومراجعة الأسئلة' : 'Top high-yield spotters & MCQs'}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Projected Day-by-Day Roadmap */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {isAr ? 'توزيع المهام المتكيف عبر الأيام القادمة:' : 'Paced Work Distribution Across Remaining Days:'}
            </span>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {analysis.plannedDistribution.map((day, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-[11px]">
                      D{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        {day.dayName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {day.assignedUnits.length > 0
                          ? day.assignedUnits.map((u) => u.unitTitle).slice(0, 2).join(', ')
                          : isAr ? 'مراجعة خفيفة أو راحة' : 'Light review / rest'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-600">
                    {day.totalMinutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            {isAr ? 'إغلاق الخطة الأسبوعية' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
