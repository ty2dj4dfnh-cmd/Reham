import React, { useState } from 'react';
import { X, Sparkles, Zap, Smile, Moon, BatteryLow, Target, HelpCircle, Clock, CheckCircle2 } from 'lucide-react';
import { AvailableTime, DayPriority, EnergyLevel, FocusLevel, Language } from '../types';
import { translations } from '../i18n/translations';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuildMyDay: (preferences: {
    energy: EnergyLevel;
    focus: FocusLevel;
    time: AvailableTime;
    priority: DayPriority;
  }) => void;
  language: Language;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  onBuildMyDay,
  language,
}) => {
  const t = translations[language];

  const [energy, setEnergy] = useState<EnergyLevel>('okay');
  const [focus, setFocus] = useState<FocusLevel>('average');
  const [time, setTime] = useState<AvailableTime>('2h');
  const [priority, setPriority] = useState<DayPriority>('exam_prep');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const energyOptions: { id: EnergyLevel; icon: string; title: string; desc: string }[] = [
    { id: 'high', icon: '⚡', title: t.checkin.energyHigh, desc: t.checkin.energyHighDesc },
    { id: 'okay', icon: '🙂', title: t.checkin.energyOkay, desc: t.checkin.energyOkayDesc },
    { id: 'tired', icon: '😴', title: t.checkin.energyTired, desc: t.checkin.energyTiredDesc },
    { id: 'exhausted', icon: '🪫', title: t.checkin.energyExhausted, desc: t.checkin.energyExhaustedDesc },
  ];

  const focusOptions: { id: FocusLevel; icon: string; label: string }[] = [
    { id: 'focused', icon: '🎯', label: t.checkin.focusFocused },
    { id: 'average', icon: '🙂', label: t.checkin.focusAverage },
    { id: 'distracted', icon: '🌫', label: t.checkin.focusDistracted },
    { id: 'cant_start', icon: '🧠', label: t.checkin.focusCantStart },
  ];

  const timeOptions: { id: AvailableTime; label: string }[] = [
    { id: '30m', label: t.checkin.time30m },
    { id: '1h', label: t.checkin.time1h },
    { id: '2h', label: t.checkin.time2h },
    { id: '3h+', label: t.checkin.time3h },
    { id: 'custom', label: t.checkin.timeCustom },
  ];

  const priorityOptions: { id: DayPriority; label: string }[] = [
    { id: 'exam_prep', label: t.checkin.pExamPrep },
    { id: 'finish_lectures', label: t.checkin.pFinishLectures },
    { id: 'review', label: t.checkin.pReview },
    { id: 'practice_mcqs', label: t.checkin.pPracticeMCQs },
    { id: 'catch_up', label: t.checkin.pCatchUp },
    { id: 'ai_decide', label: t.checkin.pAIDecide },
  ];

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onBuildMyDay({ energy, focus, time, priority });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.checkin.title}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t.checkin.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close check-in"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6">
          {/* Energy Section */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.checkin.energyLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {energyOptions.map((opt) => {
                const isSelected = energy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEnergy(opt.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/50 text-teal-900 dark:text-teal-100 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-2xl mb-1">{opt.icon}</span>
                    <span className="text-xs font-semibold">{opt.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focus Section */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.checkin.focusLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {focusOptions.map((opt) => {
                const isSelected = focus === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFocus(opt.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/50 text-teal-900 dark:text-teal-100 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-base">{opt.icon}</span>
                    <span className="text-xs font-medium truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Available */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.checkin.timeLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((opt) => {
                const isSelected = time === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTime(opt.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-600 text-white shadow-xs font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.checkin.priorityLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {priorityOptions.map((opt) => {
                const isSelected = priority === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPriority(opt.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-start transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/50 text-teal-900 dark:text-teal-100 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            {t.checkin.dismissBtn}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Calibrating...' : t.checkin.buildBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
