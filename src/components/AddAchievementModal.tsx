import React, { useState } from 'react';
import { X, Award, Sparkles, Check } from 'lucide-react';
import { Achievement, Language } from '../types';
import { translations } from '../i18n/translations';

interface AddAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAchievement: (ach: Achievement) => void;
  language: Language;
}

export const AddAchievementModal: React.FC<AddAchievementModalProps> = ({
  isOpen,
  onClose,
  onAddAchievement,
  language,
}) => {
  const t = translations[language];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'lecture' | 'mcq' | 'hours' | 'streak' | 'exam' | 'custom'>('custom');

  if (!isOpen) return null;

  const presets = [
    'Finished Oral Pathology Chapter 2',
    'Solved 45 MCQs with >85% accuracy',
    'Studied Radiology for 1 hour with full focus',
    'Completed Prosthodontics lab preparation',
    'Memorized Ameloblastoma histopathology criteria',
    'Passed practical spotter quiz without hesitation',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAch: Achievement = {
      id: `ach-${Date.now()}`,
      title: title.trim(),
      titleAr: title.trim(),
      category,
      timestamp: 'Today · Just now',
      isManual: true,
    };

    onAddAchievement(newAch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.achievements.logBtn}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Achievement Description *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mastered cavity preparation margins..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-hidden text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Quick Suggestions for Dental Students
            </label>
            <div className="space-y-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTitle(preset)}
                  className="w-full text-start px-2.5 py-1.5 rounded-lg text-[11px] bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              {t.actions.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.actions.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
