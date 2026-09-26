import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Clock,
  ThumbsUp,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Language, StudyTask } from '../types';
import { translations } from '../i18n/translations';

interface FocusSessionModalProps {
  task: StudyTask | null;
  isOpen: boolean;
  onClose: () => void;
  onFinishSession: (
    task: StudyTask,
    actualMinutes: number,
    feedback: 'Easy' | 'Good' | 'Difficult' | 'Very difficult',
    confidenceAfter: number,
    notes?: string
  ) => void;
  completedTasksCount: number;
  totalTasksCount: number;
  language: Language;
}

export const FocusSessionModal: React.FC<FocusSessionModalProps> = ({
  task,
  isOpen,
  onClose,
  onFinishSession,
  completedTasksCount,
  totalTasksCount,
  language,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [ambientAudio, setAmbientAudio] = useState<'library' | 'rain' | 'lofi' | 'off'>('library');
  const [notes, setNotes] = useState<string>('');

  // Post-session reflection modal state
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'Easy' | 'Good' | 'Difficult' | 'Very difficult'>('Good');
  const [confidence, setConfidence] = useState<number>(70);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (task && isOpen) {
      setSecondsElapsed(0);
      setIsRunning(true);
      setShowReflection(false);
      setConfidence(70);
    }
  }, [task, isOpen]);

  useEffect(() => {
    if (isRunning && isOpen && !showReflection) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isOpen, showReflection]);

  if (!isOpen || !task) return null;

  const targetMinutes = task.durationMinutes || 30;
  const targetSeconds = targetMinutes * 60;
  const progressPercent = Math.min(100, Math.round((secondsElapsed / targetSeconds) * 100));

  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleFinishClicked = () => {
    setIsRunning(false);
    setShowReflection(true);
  };

  const handleSaveReflection = () => {
    const actualMins = Math.max(1, Math.round(secondsElapsed / 60));
    onFinishSession(task, actualMins, feedback, confidence, notes);
    setShowReflection(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                {isAr ? 'جلسة تركيز سريرية نشطة' : 'Active Clinical Focus Session'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isAr
                  ? `إنجاز اليوم: ${completedTasksCount} من ${totalTasksCount} مهام`
                  : `Today's Progress: ${completedTasksCount} of ${totalTasksCount} tasks`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Exit session"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showReflection ? (
          /* Active Focus Screen */
          <div className="p-6 md:p-8 text-center space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{task.courseName}</span>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white max-w-md mx-auto leading-snug">
                {task.title}
              </h3>
              {task.reason && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  {isAr && task.reasonAr ? task.reasonAr : task.reason}
                </p>
              )}
            </div>

            {/* Tabular Timer Display */}
            <div className="py-2">
              <div className="font-mono text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {formattedTime}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                {isAr
                  ? `الهدف المجدول: ${targetMinutes} دقيقة`
                  : `Target: ${targetMinutes} minutes`}
              </div>

              {/* Progress bar */}
              <div className="w-56 h-2 mx-auto mt-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5 font-mono tabular-nums">
                {progressPercent}% {isAr ? 'مكتمل' : 'elapsed'}
              </div>
            </div>

            {/* Controls: Pause / Resume, Finish, Exit */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 text-amber-500" />
                    <span>{isAr ? 'إيقاف مؤقت' : 'Pause'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-teal-600 text-teal-600" />
                    <span>{isAr ? 'استئناف' : 'Resume'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFinishClicked}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'إنهاء الجلسة' : 'Finish'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                {isAr ? 'خروج' : 'Exit'}
              </button>
            </div>

            {/* Ambient Background Audio Selector */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                {isAr ? 'أجواء الدراسة الهادئة' : 'Ambient Focus Sound'}
              </span>
              <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {(['library', 'rain', 'lofi', 'off'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAmbientAudio(mode)}
                    className={`px-3 py-1 text-xs rounded-lg capitalize transition-all cursor-pointer ${
                      ambientAudio === mode
                        ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {mode === 'off' ? (isAr ? 'صامت' : 'Mute') : mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Active Recall Scratchpad */}
            <div className="text-start pt-1">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {isAr ? 'ملاحظات الاسترجاع النشط / لآلئ سريرية:' : 'Active Recall Notes / Key Pearls:'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isAr
                    ? 'دوّني الفروق التشخيصية، الجمل التذكيرية أو الأسئلة...'
                    : 'Jot down clinical pearls, pathognomonic signs, or memory hooks...'
                }
                rows={2}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        ) : (
          /* Post-Session Reflection Step */
          <div className="p-6 md:p-8 space-y-6 animate-in fade-in">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isAr ? 'أحسنتِ! كيف سارت هذه الجلسة؟' : 'Session Complete! How did it go?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isAr
                  ? `أتممتِ ${Math.max(1, Math.round(secondsElapsed / 60))} دقيقة من المذاكرة المركزة.`
                  : `You studied for ${Math.max(1, Math.round(secondsElapsed / 60))} minutes.`}
              </p>
            </div>

            {/* Question 1: How did this session go? */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {isAr ? 'كيف كانت تجربة المذاكرة؟' : 'How did this session feel?'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Easy', 'Good', 'Difficult', 'Very difficult'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFeedback(opt)}
                    className={`p-3 rounded-2xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      feedback === opt
                        ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {opt === 'Easy'
                      ? isAr ? 'سهلة وسلسة' : 'Easy'
                      : opt === 'Good'
                      ? isAr ? 'جيدة ومثمرة' : 'Good'
                      : opt === 'Difficult'
                      ? isAr ? 'صعبة' : 'Difficult'
                      : isAr ? 'شاقة جداً' : 'Very difficult'}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: How confident do you feel about this topic now? */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>
                  {isAr
                    ? 'ما هو مستوى ثقتكِ وتمكنكِ من هذا الموضوع الآن؟'
                    : 'How confident do you feel about this topic now?'}
                </span>
                <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                  {confidence}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0% ({isAr ? 'غير متمكنة' : 'Low'})</span>
                <span>50% ({isAr ? 'متوسط' : 'Moderate'})</span>
                <span>100% ({isAr ? 'إتقان تام' : 'Mastered'})</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowReflection(false)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                {isAr ? 'رجوع للمؤقت' : 'Back to timer'}
              </button>
              <button
                type="button"
                onClick={handleSaveReflection}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'حفظ الجلسة وإتمام المهمة' : 'Save Session & Mark Complete'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
