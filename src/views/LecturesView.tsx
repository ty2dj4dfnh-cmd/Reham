import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Presentation,
  FileCode,
  Mic,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Brain,
  Search,
  Clock,
  Award,
  Layers,
  Check,
  ChevronRight,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  Course,
  Language,
  Lecture,
  QuestionBankItem,
  PracticeExamResult,
} from '../types';
import { translations } from '../i18n/translations';
import { LectureWorkspaceView } from './LectureWorkspaceView';

interface LecturesViewProps {
  lectures: Lecture[];
  courses?: Course[];
  onOpenAddLecture: () => void;
  onUpdateLecture?: (updated: Lecture) => void;
  onSaveQuestionToBank?: (item: QuestionBankItem) => void;
  onSavePracticeExamResult?: (result: PracticeExamResult) => void;
  onTriggerAchievement?: (title: string, titleAr: string) => void;
  language: Language;
  activeLectureId?: string | null;
  onSelectLectureId?: (id: string | null) => void;
}

export const LecturesView: React.FC<LecturesViewProps> = ({
  lectures,
  courses = [],
  onOpenAddLecture,
  onUpdateLecture,
  onSaveQuestionToBank,
  onSavePracticeExamResult,
  onTriggerAchievement,
  language,
  activeLectureId,
  onSelectLectureId,
}) => {
  const isAr = language === 'ar';
  const t = translations[language];

  // If a lecture is open in the full workspace
  const [internalActiveId, setInternalActiveId] = useState<string | null>(null);
  const activeWorkspaceLectureId = activeLectureId !== undefined ? activeLectureId : internalActiveId;
  const setActiveWorkspaceLectureId = onSelectLectureId || setInternalActiveId;

  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatIcon = (format: Lecture['format']) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'ppt':
        return <Presentation className="w-4 h-4 text-amber-500" />;
      case 'notes':
        return <FileCode className="w-4 h-4 text-teal-500" />;
      case 'audio':
        return <Mic className="w-4 h-4 text-indigo-500" />;
    }
  };

  const filteredLectures = lectures.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === 'all' || l.courseId === filterCourse;
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Calculate lecture statistics
  const totalLectures = lectures.length;
  const completedCount = lectures.filter((l) => l.status === 'completed').length;
  const inProgressCount = lectures.filter((l) => l.status === 'in_progress').length;
  const totalSlides = lectures.reduce((acc, l) => acc + (l.pageCount || l.slidesCount || 30), 0);

  // If active workspace lecture is selected, render the dedicated Lecture Workspace
  const currentWorkspaceLecture = lectures.find((l) => l.id === activeWorkspaceLectureId);
  if (currentWorkspaceLecture) {
    const targetCourse = courses.find((c) => c.id === currentWorkspaceLecture.courseId);
    return (
      <LectureWorkspaceView
        lecture={currentWorkspaceLecture}
        course={targetCourse}
        language={language}
        onBack={() => setActiveWorkspaceLectureId(null)}
        onUpdateLecture={(updated) => {
          if (onUpdateLecture) onUpdateLecture(updated);
        }}
        onSaveQuestionToBank={onSaveQuestionToBank}
        onSavePracticeExamResult={onSavePracticeExamResult}
        onTriggerAchievement={onTriggerAchievement}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 transition-all">
      {/* Top Banner with Quick Actions and Stats */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t.lectures.title}
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {isAr ? 'مساحة دراسة الـ PDF' : 'PDF Study Workspace'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isAr
                ? 'ارفعي سلايدات المحاضرات لتحويلها إلى ملاحظات موثقة بالصفحات، بطاقات استذكار، وأسئلة امتحانية'
                : 'Upload PDF lecture slides to synthesize source-grounded notes, flashcards, MCQs, and practice exams'}
            </p>
          </div>

          <button
            onClick={onOpenAddLecture}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-xs md:text-sm font-bold shadow-lg shadow-teal-600/25 hover:shadow-teal-600/35 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isAr ? '+ رفع ملف دراسي (PDF)' : '+ Upload Study File'}</span>
          </button>
        </div>

        {/* Global Catalog Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'إجمالي المحاضرات' : 'Total Lectures'}</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
              {totalLectures}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'صفحات السلايدات الموثقة' : 'Total Slides Processed'}</span>
            <span className="text-base font-bold text-teal-600 dark:text-teal-400 font-mono">
              {totalSlides} {isAr ? 'سلايد' : 'Slides'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'محاضرات أُتقنت' : 'Lectures Mastered'}</span>
            <span className="text-base font-bold text-emerald-600 font-mono">
              {completedCount} {isAr ? 'مكتملة' : 'Completed'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'قيد المذاكرة' : 'In Progress'}</span>
            <span className="text-base font-bold text-amber-600 font-mono">
              {inProgressCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute start-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'ابحثي في عنوان المحاضرة أو المقرر...' : 'Search by lecture title or course...'}
            className="w-full ps-9 pe-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">{isAr ? 'جميع المقررات' : 'All Courses'}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="all">{isAr ? 'كل الحالات' : 'All Status'}</option>
            <option value="completed">{isAr ? 'مكتملة فقط' : 'Completed'}</option>
            <option value="in_progress">{isAr ? 'قيد المذاكرة' : 'In Progress'}</option>
            <option value="not_started">{isAr ? 'لم تبدأ' : 'Not Started'}</option>
          </select>
        </div>
      </div>

      {/* Lectures Content: Empty State vs Filter Zero vs Grid */}
      {lectures.length === 0 ? (
        <div className="p-8 md:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              {isAr ? 'حوّلي محاضراتكِ إلى مواد دراسية تفاعلية' : 'Turn your lectures into study material'}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr
                ? 'ارفعي ملف PDF وسيقوم DentalMind بتحويله إلى ملاحظات، ملخصات، بطاقات استذكار، وأسئلة تدريبية.'
                : 'Upload a PDF and DentalMind can turn it into notes, summaries, flashcards and practice questions.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenAddLecture}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-sm font-bold shadow-lg shadow-teal-600/25 hover:shadow-teal-600/35 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isAr ? '+ رفع ملف دراسي (PDF)' : '+ Upload Study File'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-medium">
            <span>{isAr ? 'أدوات مساحة الدراسة المتاحة فور الرفع:' : 'Every uploaded workspace includes:'}</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Complete Notes</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Quick Summary</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">High-Yield</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Flashcards</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">MCQ Quiz</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Fill in the Blanks</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Practice Exam</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Ask This File</span>
          </div>
        </div>
      ) : filteredLectures.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'لا توجد محاضرات مطابقة للبحث أو الفلتر' : 'No lectures found matching filters'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isAr
              ? 'جرّبي تغيير المقرر أو تصفير شريط البحث لعرض محاضراتكِ.'
              : 'Try changing your course or status filter, or clearing the search bar.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterCourse('all');
              setFilterStatus('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLectures.map((lec) => {
            const pageNum = lec.pageCount || lec.slidesCount || 32;
            const mcqCount = lec.mcqs?.length || 5;
            const flashcardCount = lec.flashcards?.length || 4;

            return (
              <div
                key={lec.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {formatIcon(lec.format)}
                      <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 truncate max-w-[160px]">
                        {lec.courseName}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        lec.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                          : lec.status === 'in_progress'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200'
                      }`}
                    >
                      {lec.status === 'completed'
                        ? isAr ? 'مكتملة ✓' : 'Studied ✓'
                        : lec.status === 'in_progress'
                        ? isAr ? 'قيد المذاكرة' : 'In Progress'
                        : isAr ? 'لم تبدأ' : 'Not Started'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-teal-600 transition-colors">
                    {isAr && lec.titleAr ? lec.titleAr : lec.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {lec.explanation}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-rose-500" />
                      <span>{pageNum} {isAr ? 'صفحة سلايدات' : 'slides'}</span>
                    </span>
                    <span>{mcqCount} MCQs · {flashcardCount} cards</span>
                  </div>

                  <button
                    onClick={() => setActiveWorkspaceLectureId(lec.id)}
                    className="w-full py-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-600 text-teal-800 dark:text-teal-200 hover:text-white border border-teal-200 dark:border-teal-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>{isAr ? 'مساحة دراسة المحاضرة' : 'Study This Lecture'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
