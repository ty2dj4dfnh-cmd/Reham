import React, { useState, useEffect } from 'react';
import { X, Edit3, Archive, RotateCcw, Sparkles, AlertCircle } from 'lucide-react';
import { Course, Language, CourseDifficulty, CourseStudyStyle } from '../types';
import { translations } from '../i18n/translations';
import { getDefaultCourseWorkload } from '../services/plannerEngine';

interface EditCourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCourse: (courseId: string, updates: Partial<Course>) => void;
  onArchiveCourse: (courseId: string) => void;
  onRestoreCourse: (courseId: string) => void;
  language: Language;
}

export const EditCourseModal: React.FC<EditCourseModalProps> = ({
  course,
  isOpen,
  onClose,
  onUpdateCourse,
  onArchiveCourse,
  onRestoreCourse,
  language,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [confidence, setConfidence] = useState<Course['confidence']>('Moderate');
  const [weakTopicsStr, setWeakTopicsStr] = useState('');
  const [overview, setOverview] = useState('');

  // Workload profile fields
  const [difficulty, setDifficulty] = useState<CourseDifficulty>('Moderate');
  const [studyStyle, setStudyStyle] = useState<CourseStudyStyle>('Mixed');
  const [currentConfidence, setCurrentConfidence] = useState<number>(60);
  const [isBehind, setIsBehind] = useState<boolean>(false);

  useEffect(() => {
    if (course) {
      setName(course.name);
      setCode(course.code);
      setInstructor(course.instructor || '');
      setConfidence(course.confidence);
      setWeakTopicsStr((course.weakTopics || []).join(', '));
      setOverview(course.overview || '');

      const defaults = getDefaultCourseWorkload(course.name);
      setDifficulty(course.difficulty || defaults.difficulty);
      setStudyStyle(course.studyStyle || defaults.studyStyle);
      setCurrentConfidence(
        typeof course.currentConfidence === 'number'
          ? course.currentConfidence
          : defaults.currentConfidence
      );
      setIsBehind(course.isBehind ?? defaults.isBehind);
    }
  }, [course]);

  if (!isOpen || !course) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdateCourse(course.id, {
      name: name.trim(),
      nameAr: name.trim(),
      code: code.trim() || course.code,
      instructor: instructor.trim(),
      confidence,
      weakTopics: weakTopicsStr.trim()
        ? weakTopicsStr.split(',').map((s) => s.trim())
        : course.weakTopics,
      overview: overview.trim(),
      difficulty,
      studyStyle,
      currentConfidence,
      isBehind,
    });

    onClose();
  };

  const isArchived = course.status === 'archived';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all my-6 animate-in fade-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? 'تعديل المقرر وعبء الدراسة' : 'Edit Course & Workload Profile'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? 'ضبط الصعوبة ونمط المذاكرة المفضل' : 'Customize difficulty and study style'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* General Fields */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'اسم المقرر الدراسي *' : 'Course Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'رمز المقرر' : 'Course Code'}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'القسم / الأستاذ' : 'Instructor / Department'}
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* SECTION 2: Workload Profile Info */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {isAr ? 'بيانات عبء المقرر الدراسي (Workload Profile)' : 'Course Workload Profile'}
              </span>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'مستوى الصعوبة:' : 'Difficulty:'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Easy', 'Moderate', 'Hard', 'Very Hard'] as CourseDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-1.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      difficulty === d
                        ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Study Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'أسلوب المذاكرة الأنسب:' : 'Study Style:'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {(['Memorization', 'Conceptual', 'Visual', 'Practical', 'Mixed'] as CourseStudyStyle[]).map(
                  (style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setStudyStyle(style)}
                      className={`py-2 px-1 rounded-xl border text-center text-[11px] font-semibold transition-all cursor-pointer truncate ${
                        studyStyle === style
                          ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                      title={style}
                    >
                      {style}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Current Confidence: 0–100% */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>{isAr ? 'التمكن والثقة الحالية:' : 'Current Confidence:'}</span>
                <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                  {currentConfidence}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={currentConfidence}
                onChange={(e) => setCurrentConfidence(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            {/* Behind on lectures: Yes / No */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {isAr ? 'متأخرة في حضور أو تلخيص المحاضرات؟' : 'Behind on lectures?'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isAr ? 'يمنح المقرر أولوية إضافية في الجدول الذكي' : 'Boosts study priority in planner'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsBehind(false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    !isBehind
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setIsBehind(true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    isBehind
                      ? 'bg-rose-500 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>

            {/* Mandatory Disclaimers */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <p>
                {isAr
                  ? 'القيم الافتراضية مستندة إلى متوسطات مناهج كليات طب الأسنان. تجربتكِ الشخصية تسبق أي تقدير افتراضي، إذ تختلف احتياجات وسرعة الاستيعاب بين طالب وآخر.'
                  : 'Starting workload values are reference estimates based on dental curriculum averages. Your personal clinical experience overrides them. Study time requirements naturally vary between dental students.'}
              </p>
            </div>
          </div>

          {/* Weak Topics */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? 'الموضوعات الصعبة (مفصولة بفواصل):' : 'Weak Topics (comma-separated):'}
            </label>
            <input
              type="text"
              value={weakTopicsStr}
              onChange={(e) => setWeakTopicsStr(e.target.value)}
              placeholder="e.g. Keratocysts, Differential Criteria"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Archive / Restore button */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {isArchived ? (
              <button
                type="button"
                onClick={() => {
                  onRestoreCourse(course.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs text-teal-600 font-semibold hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'استعادة المقرر' : 'Restore Course'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onArchiveCourse(course.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold hover:underline"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{isAr ? 'أرشفة المقرر' : 'Archive Course'}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                {t.actions.cancel}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.actions.save}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
