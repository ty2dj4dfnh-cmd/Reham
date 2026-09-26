import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Sparkles,
  Check,
  AlertCircle,
  Clock,
  Target,
  Zap,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { Exam, Course, Language, StudyTask } from '../types';
import { generateExamRescuePlan, ExamRescueItem } from '../services/plannerEngine';

interface ExamRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: Exam[];
  courses: Course[];
  onApplyRescuePlan: (exam: Exam, rescueTasks: StudyTask[]) => void;
  language: Language;
}

export const ExamRescueModal: React.FC<ExamRescueModalProps> = ({
  isOpen,
  onClose,
  exams,
  courses,
  onApplyRescuePlan,
  language,
}) => {
  const isAr = language === 'ar';

  // Find most urgent exam by default
  const sortedExams = [...exams].sort((a, b) => a.daysRemaining - b.daysRemaining);
  const [selectedExamId, setSelectedExamId] = useState<string>(
    sortedExams[0]?.id || ''
  );

  const selectedExam =
    exams.find((e) => e.id === selectedExamId) || sortedExams[0];

  if (!isOpen || !selectedExam) return null;

  const course = courses.find(
    (c) => c.name === selectedExam.courseName || c.id === selectedExam.courseId
  );

  const units = selectedExam.units || [];
  const unfinishedUnits = units.filter((u) => u.status !== 'completed');
  const totalWorkloadMinutes = unfinishedUnits.reduce(
    (acc, u) => acc + (u.estimatedMinutes || 35),
    0
  );
  const daysLeft = Math.max(1, selectedExam.daysRemaining);
  const availableStudyMinutes = daysLeft * 120; // 2h/day baseline

  const rescueItems: ExamRescueItem[] = generateExamRescuePlan(
    selectedExam,
    course,
    availableStudyMinutes
  );

  const handleActivateRescue = () => {
    // Convert rescue items to today's study tasks
    const rescueTasks: StudyTask[] = rescueItems.map((item, idx) => ({
      id: `task-rescue-${Date.now()}-${idx}`,
      courseId: course?.id || selectedExam.courseId || 'course-rescue',
      courseName: selectedExam.courseName,
      courseColor: 'amber',
      title: item.title,
      durationMinutes: item.estimatedMinutes,
      status: 'pending',
      type: item.category === 'practice_mcqs' ? 'mcq' : 'review',
      date: new Date().toISOString().split('T')[0],
      examId: selectedExam.id,
      reason: `Exam Rescue Sprint: ${item.badge}`,
      reasonAr: `خطة الإنقاذ الامتحاني: ${item.badge}`,
      priorityLevel: 'high',
    }));

    onApplyRescuePlan(selectedExam, rescueTasks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all my-6 animate-in fade-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'برنامج الإنقاذ الامتحاني (Exam Rescue)' : 'Exam Rescue Mode'}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {isAr ? 'عالي العائد' : 'High Yield'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr
                  ? 'دعنا نستثمر الوقت المتبقي بأعلى فاعلية ممكنة.'
                  : "Let's use the remaining time as effectively as possible."}
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
          {/* Exam Selector if multiple */}
          {exams.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'اختاري الامتحان المستهدف:' : 'Select Target Exam:'}
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.courseName} · in {ex.daysRemaining} days ({ex.examType})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Exam Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                {isAr ? 'الوقت المتبقي' : 'Time Left'}
              </span>
              <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-1 block">
                {daysLeft} {isAr ? 'أيام' : 'days'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                {isAr ? 'الوحدات المتبقية' : 'Units Left'}
              </span>
              <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-1 block">
                {unfinishedUnits.length} {isAr ? 'وحدات' : 'units'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                {isAr ? 'حجم العمل المقدر' : 'Workload'}
              </span>
              <span className="text-base font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-1 block">
                {Math.round(totalWorkloadMinutes / 60 * 10) / 10}h
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                {isAr ? 'ساعات المذاكرة المتاحة' : 'Available Time'}
              </span>
              <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                {Math.round(availableStudyMinutes / 60)}h
              </span>
            </div>
          </div>

          {/* Compressed Triage Roadmap */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isAr ? 'خطة الإنقاذ المكثفة (الأولويات الـ 4 الأساسية):' : 'Compressed Triage Protocol (4 Core Priorities):'}
              </span>
              <span className="text-[11px] font-mono text-teal-600">
                ~{rescueItems.reduce((a, b) => a + b.estimatedMinutes, 0)} min total
              </span>
            </div>

            <div className="space-y-2.5">
              {rescueItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {item.stepNumber}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-600 shrink-0">
                    {item.estimatedMinutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Realistic Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isAr
                ? 'لا نعد بدرجة محددة، بل نضمن لكِ التركيز على الموضوعات الأكثر تكراراً في الامتحانات لتعظيم كفاءتكِ في الأيام المتبقية.'
                : 'This rescue plan does not guarantee an exam grade. Its purpose is to eliminate secondary distractions and maximize recall of the highest-yield topics in the time remaining.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleActivateRescue}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'تطبيق خطة الإنقاذ على جدول اليوم' : 'Apply Exam Rescue Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
