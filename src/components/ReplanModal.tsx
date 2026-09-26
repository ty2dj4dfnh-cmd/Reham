import React, { useState } from 'react';
import {
  X,
  HeartHandshake,
  ArrowRight,
  Calendar,
  Clock,
  RefreshCw,
  Scissors,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  Language,
  StudyTask,
  CouldntFinishReason,
  CouldntFinishAction,
} from '../types';
import { translations } from '../i18n/translations';

interface ReplanModalProps {
  task: StudyTask | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (
    task: StudyTask,
    reason: CouldntFinishReason,
    action: CouldntFinishAction
  ) => void;
  onOpenReplanWeek?: () => void;
  language: Language;
}

const REASON_OPTIONS: { id: CouldntFinishReason; labelEn: string; labelAr: string }[] = [
  { id: 'Ran out of time', labelEn: 'Ran out of time', labelAr: 'نفد الوقت' },
  { id: 'Task took longer than expected', labelEn: 'Task took longer than expected', labelAr: 'استغرقت المهمة وقتاً أطول من المتوقع' },
  { id: "Couldn't focus", labelEn: "Couldn't focus", labelAr: 'لم أتمكن من التركيز' },
  { id: 'Too tired', labelEn: 'Too tired', labelAr: 'تعب أو إرهاق جسدي' },
  { id: "Didn't understand the topic", labelEn: "Didn't understand the topic", labelAr: 'واجهت صعوبة في فهم الموضوع' },
  { id: 'Something came up', labelEn: 'Something came up', labelAr: 'حدث أمر طارئ غير مخطط' },
];

export const ReplanModal: React.FC<ReplanModalProps> = ({
  task,
  isOpen,
  onClose,
  onResolve,
  onOpenReplanWeek,
  language,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  const [selectedReason, setSelectedReason] = useState<CouldntFinishReason>('Ran out of time');

  if (!isOpen || !task) return null;

  const handleActionSelected = (action: CouldntFinishAction) => {
    onResolve(task, selectedReason, action);
    if (action === 'Replan my week' && onOpenReplanWeek) {
      onOpenReplanWeek();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all my-6 animate-in fade-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? 'لا بأس أبداً، الخطط وُجدت لتتكيف' : "No worries, plans are meant to adapt"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr
                  ? 'دعنا نعيد جدولة هذه المهمة بالطريقة الأنسب لطاقتك اليوم'
                  : "Let's calibrate your schedule without any guilt or stress"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Target Task Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 block">
              {task.courseName}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
              {task.title}
            </span>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{task.durationMinutes} min</span>
            </div>
          </div>

          {/* Question: What happened? */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'ما الذي حدث؟' : 'What happened?'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REASON_OPTIONS.map((opt) => {
                const isSelected = selectedReason === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedReason(opt.id)}
                    className={`p-2.5 rounded-xl border text-start text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-100 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate pe-2">
                      {isAr ? opt.labelAr : opt.labelEn}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Offer 4 action choices */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'كيف ترغبين في المتابعة؟' : 'How would you like to handle this?'}
            </span>

            <div className="grid sm:grid-cols-2 gap-2.5">
              {/* Option 1: Move to later today */}
              <button
                type="button"
                onClick={() => handleActionSelected('Move to later today')}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/40 text-start transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {isAr ? 'تأجيل لوقت لاحق اليوم' : 'Move to later today'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isAr ? 'وضعها في نهاية جدول مهام اليوم' : 'Move to the end of today\'s queue'}
                </p>
              </button>

              {/* Option 2: Move to tomorrow */}
              <button
                type="button"
                onClick={() => handleActionSelected('Move to tomorrow')}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/40 text-start transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {isAr ? 'نقلها إلى الغد' : 'Move to tomorrow'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isAr ? 'إدراجها ضمن بداية خطة الغد' : 'Schedule for your next morning or session'}
                </p>
              </button>

              {/* Option 3: Split into smaller tasks */}
              <button
                type="button"
                onClick={() => handleActionSelected('Split into smaller tasks')}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/40 text-start transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
                  <Scissors className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {isAr ? 'تقسيم إلى مهام مصغرة' : 'Split into smaller tasks'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isAr
                    ? 'تجزئة المهمة إلى فترتين (20 دقيقة لكل فترة)'
                    : 'Break into two manageable 20-min micro-blocks'}
                </p>
              </button>

              {/* Option 4: Replan my week */}
              <button
                type="button"
                onClick={() => handleActionSelected('Replan my week')}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/40 text-start transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {isAr ? 'إعادة تخطيط الأسبوع' : 'Replan my week'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isAr
                    ? 'إعادة توزيع العمل عبر الأيام المتبقية قبل الامتحانات'
                    : 'Redistribute across days remaining before exams'}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
