import React, { useState } from 'react';
import {
  X,
  Moon,
  Star,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { StudyTask, DailyReview, Language, Course, Exam } from '../types';

interface EveningReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: StudyTask[];
  onSaveReview: (review: DailyReview) => void;
  courses: Course[];
  exams: Exam[];
  language: Language;
}

const OBSTACLE_OPTIONS: { id: string; labelEn: string; labelAr: string }[] = [
  { id: 'Clinical & Lab Fatigue', labelEn: 'Clinical & Lab Fatigue', labelAr: 'إجهاد العيادات والمعامل' },
  { id: 'Distractions & Phone', labelEn: 'Distractions & Phone', labelAr: 'مشتتات والهاتف المحمول' },
  { id: 'Ran Out of Time', labelEn: 'Ran Out of Time', labelAr: 'ضيق الوقت' },
  { id: 'Difficult Material', labelEn: 'Difficult Complex Material', labelAr: 'صعوبة المادة العلمية' },
  { id: 'None - Great Flow', labelEn: 'None — Great Focus & Flow', labelAr: 'لا يوجد — تركيز ممتاز وإنجاز عالٍ' },
];

export const EveningReviewModal: React.FC<EveningReviewModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onSaveReview,
  courses,
  exams,
  language,
}) => {
  const isAr = language === 'ar';

  const [rating, setRating] = useState<number>(4);
  const [obstacle, setObstacle] = useState<string>('None - Great Flow');
  const [note, setNote] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const completedTasks = tasks.filter((t) => t.status === 'completed' && !t.isBreak);
  const totalTasks = tasks.filter((t) => !t.isBreak);
  const plannedMinutes = totalTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  const completedMinutes = completedTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);

  const formatHoursMinutes = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h === 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const handleSave = () => {
    const reviewData: DailyReview = {
      id: `review-${Date.now()}`,
      userId: '',
      dateKey: new Date().toISOString().split('T')[0],
      satisfactionRating: rating,
      biggestObstacle: obstacle,
      noteForTomorrow: note.trim(),
      plannedMinutes,
      completedMinutes,
      completedTasksCount: completedTasks.length,
      totalTasksCount: totalTasks.length,
      timestamp: new Date().toISOString(),
    };

    onSaveReview(reviewData);
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all my-6 animate-in fade-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? 'ختام يوم المذاكرة' : 'End My Study Day'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr
                  ? 'مراجعة ختامية لحفظ الإنجاز وإعداد خطة الغد بهدوء'
                  : 'Evening reflection to store progress and prepare tomorrow with clarity'}
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

        {!isSaved ? (
          <div className="p-6 md:p-8 space-y-6">
            {/* Question 1: How satisfied are you with today's study? 1–5 */}
            <div className="text-center space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {isAr ? 'ما مدى رضاكِ عن مذاكرة اليوم؟ (1–5 نجوم)' : "How satisfied are you with today's study?"}
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-2 transition-transform hover:scale-110 cursor-pointer"
                    aria-label={`${star} star`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: What was the biggest obstacle? */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {isAr ? 'ما هو العائق الأكبر الذي واجهكِ؟' : 'What was the biggest obstacle?'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {OBSTACLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setObstacle(opt.id)}
                    className={`p-2.5 rounded-xl border text-start text-xs font-medium transition-all cursor-pointer ${
                      obstacle === opt.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {isAr ? opt.labelAr : opt.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional note: What do you want DentalMind to remember for tomorrow? */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                {isAr
                  ? 'ما الذي ترغبين بأن يتذكره دنتال مايند لغدكِ؟ (اختياري)'
                  : 'What do you want DentalMind to remember for tomorrow?'}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  isAr
                    ? 'مثال: تركيز إضافي على صور الأشعة، أو البدء بجلسة قصيرة...'
                    : 'e.g. Start with Radiology spotters, keep blocks under 30 min...'
                }
                rows={2}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'حفظ اليوم وختام الجلسة' : 'Save Day & Review Summary'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Day Saved Summary Screen */
          <div className="p-6 md:p-8 space-y-6 animate-in fade-in">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isAr ? 'تم حفظ يومكِ بنجاح.' : 'Day saved.'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr
                  ? 'إليكِ ملخص إنجازكِ الحقيقي لليوم:'
                  : "Here is your factual study summary for today:"}
              </p>
            </div>

            {/* Factual Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">{isAr ? 'المخطط:' : 'Planned:'}</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                  {formatHoursMinutes(plannedMinutes)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{isAr ? 'المنجز:' : 'Completed:'}</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatHoursMinutes(completedMinutes)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{isAr ? 'المهام:' : 'Tasks:'}</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                  {completedTasks.length}/{totalTasks.length}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{isAr ? 'العائق الأساسي:' : 'Main obstacle:'}</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs truncate block">
                  {obstacle}
                </span>
              </div>
            </div>

            {/* Section 16: Draft for Tomorrow */}
            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                  {isAr ? 'مسودة خطة الغد جاهزة' : "Draft for Tomorrow Ready"}
                </span>
              </div>
              <p className="text-[11px] text-teal-800 dark:text-teal-300">
                {isAr
                  ? 'تم تجهيز مسودة مرنة للغد تتضمن المهام غير المنجزة ومراجعة الامتحانات القادمة. يمكنكِ تعديلها في أي وقت.'
                  : 'Draft prepared from unfinished work and upcoming exam priorities. You can edit it freely tomorrow morning.'}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-xs cursor-pointer hover:opacity-90"
              >
                {isAr ? 'تصبحين على خير' : 'Rest well'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
