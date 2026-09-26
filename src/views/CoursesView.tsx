import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Calendar,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  Search,
  Sparkles,
  FileText,
  Clock,
  BarChart2,
  Edit3,
  Archive,
  RotateCcw
} from 'lucide-react';
import { Course, Language, MCQItem } from '../types';
import { translations } from '../i18n/translations';

interface CoursesViewProps {
  courses: Course[];
  onOpenAddCourse: () => void;
  onOpenEditCourse?: (course: Course) => void;
  language: Language;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  onOpenAddCourse,
  onOpenEditCourse,
  language,
}) => {
  const t = translations[language];

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'lectures' | 'questions' | 'weak' | 'progress'>('overview');
  const [courseFilterMode, setCourseFilterMode] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  
  // MCQ interactive state for Question Bank tab
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  const activeCourses = courses.filter((c) => c.status !== 'archived');
  const archivedCourses = courses.filter((c) => c.status === 'archived');
  const currentList = courseFilterMode === 'active' ? activeCourses : archivedCourses;

  const filteredCourses = currentList.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getConfidenceBadge = (confidence: Course['confidence']) => {
    switch (confidence) {
      case 'High':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
      case 'Moderate':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
      case 'Needs Review':
        return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const handleSelectOption = (mcqId: string, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [mcqId]: optionIdx }));
    setShowExplanation((prev) => ({ ...prev, [mcqId]: true }));
  };

  // Sample course questions for Question Bank tab
  const sampleCourseQuestions: Record<string, MCQItem[]> = {
    'course-path': [
      {
        id: 'q-path-1',
        question: 'Which of the following is associated with Gorlin-Goltz syndrome and PTCH1 gene mutation?',
        options: [
          'Multiple Odontogenic Keratocysts (OKC)',
          'Ameloblastoma',
          'Compound Odontoma',
          'Calcifying Odontogenic Cyst'
        ],
        correctIndex: 0,
        explanation: 'Gorlin-Goltz (Nevoid Basal Cell Carcinoma Syndrome) classically features multiple odontogenic keratocysts, bifid ribs, palmar/plantar pitting, and calcified falx cerebri.',
        clinicalPearl: 'Board key: OKCs in Gorlin syndrome have a significantly higher recurrence rate requiring lifelong surveillance.',
      },
      {
        id: 'q-path-2',
        question: 'Civatte bodies (apoptotic basal keratinocytes) and "sawtooth" rete ridges on biopsy indicate which condition?',
        options: [
          'Oral Lichen Planus',
          'Pemphigus Vulgaris',
          'Mucous Membrane Pemphigoid',
          'Erythema Multiforme'
        ],
        correctIndex: 0,
        explanation: 'Lichen planus shows a band-like lymphocytic infiltrate at the dermo-epidermal junction, basal hydropic degeneration forming Civatte bodies, and pointed sawtooth rete pegs.',
        clinicalPearl: 'Civatte bodies are colloid apoptotic squames. Pemphigus shows Acantholysis and Tzanck cells instead.',
      }
    ],
    'course-rad': [
      {
        id: 'q-rad-1',
        question: 'According to the inverse square law, doubling the source-to-receptor distance alters the X-ray beam intensity by what factor?',
        options: ['Reduced to 1/4th', 'Halved (1/2)', 'Doubled (2x)', 'Quadrupled (4x)'],
        correctIndex: 0,
        explanation: 'Intensity is inversely proportional to the square of distance (I1/I2 = D2^2 / D1^2). Doubling distance (2x) decreases beam intensity to (1/2)^2 = 1/4th.',
        clinicalPearl: 'When switching from an 8-inch to a 16-inch cone, exposure time must be quadrupled to maintain optical density.',
      }
    ]
  };

  // If a course is opened, render the 5-tab detail view
  if (selectedCourse) {
    const courseQuestions = sampleCourseQuestions[selectedCourse.id] || sampleCourseQuestions['course-path'];

    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Back navigation & Course banner */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedCourse(null)}
            className="flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'ar' ? 'العودة للمقررات' : 'Back to Courses'}</span>
          </button>
        </div>

        {/* Course Header Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">
                  {selectedCourse.code}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">{selectedCourse.semester}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {language === 'ar' ? selectedCourse.nameAr : selectedCourse.name}
              </h1>
              <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {language === 'ar' ? selectedCourse.overviewAr : selectedCourse.overview}
              </p>
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span>{language === 'ar' ? 'المشرف الأكاديمي: ' : 'Instructor: '}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedCourse.instructor}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center min-w-[120px]">
                <div className="text-[11px] text-slate-400">{t.courses.progress}</div>
                <div className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums">
                  {selectedCourse.progressPercent}%
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center min-w-[120px]">
                <div className="text-[11px] text-slate-400">{t.courses.nextExam}</div>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {selectedCourse.nextExamDays} {t.today.days}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="mt-6 flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
            {(
              [
                { id: 'overview', label: t.courses.tabs.overview },
                { id: 'lectures', label: t.courses.tabs.lectures },
                { id: 'questions', label: t.courses.tabs.questionBank },
                { id: 'weak', label: t.courses.tabs.weakTopics },
                { id: 'progress', label: t.courses.tabs.progress },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  {language === 'ar' ? 'خارطة المنهج السريري' : 'Syllabus & Clinical Pearls'}
                </h3>
                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>
                    • {language === 'ar' ? 'التشخيص التفريقي بين الآفات الحبيبية والورمية.' : 'Differential diagnosis between granulomatous and neoplastic lesions.'}
                  </p>
                  <p>
                    • {language === 'ar' ? 'المعايير المجهرية للأورام سنية المنشأ (الورم المينائي وكيس التقرن السني).' : 'Microscopic criteria for odontogenic neoplasms (Ameloblastoma, OKC).'}
                  </p>
                  <p>
                    • {language === 'ar' ? 'الحماية الإشعاعية وتفسير صور الأشعة المقطعية ثلاثية الأبعاد.' : 'Radiation safety and 3D CBCT volume analysis.'}
                  </p>
                </div>
              </div>

              {/* Weak Topics to Reinforce */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.courses.weakTopics}
                  </h3>
                </div>
                <div className="space-y-2">
                  {(language === 'ar' ? selectedCourse.weakTopicsAr : selectedCourse.weakTopics).map(
                    (topic, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60"
                      >
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {topic}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          {language === 'ar' ? 'مراجعة موصى بها' : 'Reinforce'}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Side stats card */}
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {language === 'ar' ? 'إحصائيات المقرر' : 'Course Performance'}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{t.courses.lecturesCompleted}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {selectedCourse.lecturesCompleted} / {selectedCourse.totalLectures}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{t.courses.questionsSolved}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {selectedCourse.questionsSolved} / {selectedCourse.totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{t.courses.confidence}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getConfidenceBadge(selectedCourse.confidence)}`}>
                      {selectedCourse.confidence}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Lectures */}
        {activeTab === 'lectures' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {language === 'ar' ? 'قائمة محاضرات المقرر' : 'Course Lectures'}
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Odontogenic Cysts: Developmental & Inflammatory', slides: 44, status: 'Completed' },
                { title: 'Ameloblastoma & Benign Odontogenic Tumors', slides: 52, status: 'In Progress' },
                { title: 'Oral Squamous Cell Carcinoma (OSCC) Staging', slides: 38, status: 'Upcoming' },
                { title: 'Salivary Gland Neoplasms & Pleomorphic Adenoma', slides: 40, status: 'Upcoming' },
              ].map((lec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {lec.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {lec.slides} slides · PDF & Notes available
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-300">
                    {lec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Question Bank */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'بنك أسئلة التدريب السريري' : 'Active MCQ Clinical Drill'}
                </h3>
                <span className="text-xs text-teal-600 font-medium">
                  {courseQuestions.length} Questions Available
                </span>
              </div>

              <div className="space-y-6">
                {courseQuestions.map((q, qIdx) => {
                  const userAnswer = selectedAnswers[q.id];
                  const hasAnswered = userAnswer !== undefined;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
                    >
                      <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase">
                        Question {qIdx + 1}
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {q.question}
                      </p>

                      <div className="space-y-2 pt-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          const isCorrect = q.correctIndex === optIdx;

                          let optionStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300';
                          if (hasAnswered) {
                            if (isCorrect) {
                              optionStyle = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              optionStyle = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`w-full p-3 text-start rounded-xl border text-xs transition-all cursor-pointer ${optionStyle}`}
                            >
                              <span className="font-semibold me-2">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div className="p-3.5 mt-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 text-xs space-y-1.5 animate-in fade-in">
                          <div className="font-bold text-teal-900 dark:text-teal-200">
                            Clinical Rationale:
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{q.explanation}</p>
                          <div className="text-teal-800 dark:text-teal-300 font-medium pt-1">
                            ✨ {q.clinicalPearl}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: Weak Topics */}
        {activeTab === 'weak' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'المفاهيم التي تحتاج تثبيتاً' : 'Identified Weak Topics'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar'
                ? 'استناداً إلى إجاباتكِ السابقة في بنك الأسئلة والامتحانات التجريبية.'
                : 'Generated from previous quiz performance and active recall accuracy.'}
            </p>
            <div className="space-y-3">
              {(language === 'ar' ? selectedCourse.weakTopicsAr : selectedCourse.weakTopics).map(
                (topic, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {topic}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        High-yield exam target · 3 flashcards available
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors cursor-pointer">
                      {language === 'ar' ? 'مراجعة مكثفة' : 'Drill Topic'}
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Tab Content 5: Progress & Mastery */}
        {activeTab === 'progress' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'مؤشرات الإتقان التراكمي' : 'Mastery & Retention Velocity'}
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">
                  88%
                </div>
                <div className="text-xs text-slate-500 mt-1">Quiz Accuracy</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">
                  18.5h
                </div>
                <div className="text-xs text-slate-500 mt-1">Total Time Invested</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">
                  92%
                </div>
                <div className="text-xs text-slate-500 mt-1">Retention Stability</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Course Grid View
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.courses.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.courses.subtitle}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
          <button
            onClick={() => setCourseFilterMode('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              courseFilterMode === 'active'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {language === 'ar' ? 'المقررات النشطة' : 'Active Courses'} ({activeCourses.length})
          </button>
          <button
            onClick={() => setCourseFilterMode('archived')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              courseFilterMode === 'archived'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {language === 'ar' ? 'المؤرشفة' : 'Archived'} ({archivedCourses.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="ps-9 pe-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            onClick={onOpenAddCourse}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.actions.addCourse}</span>
          </button>
        </div>
      </div>

      {/* Courses Cards Grid or Empty State */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {courseFilterMode === 'active'
              ? language === 'ar'
                ? 'لا توجد مقررات مضافة بعد'
                : 'No courses added yet.'
              : language === 'ar'
              ? 'لا توجد مقررات مؤرشفة'
              : 'No archived courses.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {courseFilterMode === 'active'
              ? language === 'ar'
                ? 'أضيفي مقرراتكِ السريرية لتوليد خطط دراسية وبنوك أسئلة مخصصة.'
                : 'Add your dental courses to generate customized study plans and active recall banks.'
              : language === 'ar'
              ? 'المقررات التي تؤرشفينها ستظهر هنا مع الاحتفاظ بسجل إنجازاتكِ.'
              : 'Archived courses are preserved here without affecting your historical achievements.'}
          </p>
          {courseFilterMode === 'active' && (
            <button
              onClick={onOpenAddCourse}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold shadow-xs hover:bg-teal-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.actions.addCourse}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-teal-500/50 transition-all group"
            >
              <div>
                {/* Header: Code & Confidence & Edit */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">
                    {course.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getConfidenceBadge(
                        course.confidence
                      )}`}
                    >
                      {course.confidence}
                    </span>
                    {onOpenEditCourse && (
                      <button
                        onClick={() => onOpenEditCourse(course)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Course"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Course Title */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {language === 'ar' ? course.nameAr : course.name}
                </h3>

                {/* Workload Profile Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {course.difficulty && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {course.difficulty}
                    </span>
                  )}
                  {course.studyStyle && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {course.studyStyle}
                    </span>
                  )}
                  {typeof course.currentConfidence === 'number' && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                      {course.currentConfidence}% conf.
                    </span>
                  )}
                  {course.isBehind && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {language === 'ar' ? 'متأخر في المحاضرات' : 'Behind'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {language === 'ar' ? course.overviewAr : course.overview}
                </p>

                {/* Progress & Next Exam */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{t.courses.progress}</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {course.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>{t.courses.nextExam}</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">
                      {course.nextExamDays} {t.today.days}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{t.courses.lecturesCompleted}</span>
                    <span className="font-mono">
                      {course.lecturesCompleted}/{course.totalLectures}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{t.courses.questionsSolved}</span>
                    <span className="font-mono">{course.questionsSolved} MCQs</span>
                  </div>
                </div>

                {/* Weak topic preview */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1">{t.courses.weakTopics}:</div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 truncate font-medium">
                    {course.weakTopics && course.weakTopics.length > 0
                      ? language === 'ar' && course.weakTopicsAr && course.weakTopicsAr.length > 0
                        ? course.weakTopicsAr[0]
                        : course.weakTopics[0]
                      : 'None identified yet'}
                  </div>
                </div>
              </div>

              {/* Open Course Button */}
              <div className="mt-5 pt-3">
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <span>{t.actions.openCourse}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
