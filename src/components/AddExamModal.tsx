import React, { useState } from 'react';
import { X, CalendarDays, Sparkles } from 'lucide-react';
import { Course, Exam, Language } from '../types';
import { translations } from '../i18n/translations';
import { generateStarterUnitsForExam } from '../services/plannerEngine';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onAddExam: (exam: Exam) => void;
  language: Language;
}

export const AddExamModal: React.FC<AddExamModalProps> = ({
  isOpen,
  onClose,
  courses,
  onAddExam,
  language,
}) => {
  const t = translations[language];

  const [courseName, setCourseName] = useState(courses[0]?.name || 'Oral Pathology');
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<Exam['examType']>('Midterm');
  const [examDate, setExamDate] = useState('2026-10-15');
  const [targetGrade, setTargetGrade] = useState('90%+');
  const [preparationPercent, setPreparationPercent] = useState(50);
  const [highYieldInput, setHighYieldInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !courseName) return;

    const examDateObj = new Date(examDate);
    const today = new Date();
    const diffTime = examDateObj.getTime() - today.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const examId = `exam-${Date.now()}`;
    const newExam: Exam = {
      id: examId,
      courseName,
      courseNameAr: courseName,
      examType,
      examTitle: examTitle.trim(),
      examDate,
      daysRemaining: diffDays,
      preparationPercent,
      initialPreparationPercent: preparationPercent,
      targetGrade,
      topicsRemainingCount: 4,
      highYieldTopics: highYieldInput.trim()
        ? highYieldInput.split(',').map((s) => s.trim())
        : ['Diagnostic Spotters', 'Clinical Board MCQs', 'Differential Pearls'],
      units: generateStarterUnitsForExam(examId, courseName),
      createdAt: new Date().toISOString(),
    };

    onAddExam(newExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'إضافة امتحان جديد' : 'Add Dental Exam'}
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
              Course *
            </label>
            {courses.length > 0 ? (
              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Oral Pathology"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Exam Title *
              </label>
              <input
                type="text"
                required
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g. Midterm 1"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Exam Type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as Exam['examType'])}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              >
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
                <option value="OSCE">OSCE</option>
                <option value="Practical Quiz">Practical Quiz</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Target Grade
              </label>
              <input
                type="text"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                placeholder="e.g. 90%+, A"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Current Preparation Level: {preparationPercent}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={preparationPercent}
              onChange={(e) => setPreparationPercent(parseInt(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              High-Yield Topics (comma-separated)
            </label>
            <input
              type="text"
              value={highYieldInput}
              onChange={(e) => setHighYieldInput(e.target.value)}
              placeholder="e.g. Ameloblastoma, Gorlin syndrome, OKCs"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
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
