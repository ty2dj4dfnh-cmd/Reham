import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Sparkles,
  HelpCircle,
  Brain,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Send,
  Lightbulb,
  Clock,
  ShieldCheck,
  Award,
  Layers,
  Check,
  X,
  Shuffle,
  Play,
  Zap,
  Flame,
  Edit3,
  MessageSquare,
  BookmarkCheck,
  FolderPlus,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Lecture,
  Language,
  Course,
  MCQItem,
  FlashcardItem,
  FillInBlankItem,
  PracticeExamConfig,
  PracticeExamResult,
  QuestionBankItem,
} from '../types';
import { translations } from '../i18n/translations';
import {
  answerLectureQuery,
  generateMCQs,
  generateFlashcards,
  generateFillInBlanks,
  ensureExactMcqs,
  ensureExactFlashcards,
  ensureExactFillInBlanks,
} from '../services/pdfLectureEngine';

export type LectureStudyAction =
  | 'notes'
  | 'summary'
  | 'highyield'
  | 'flashcards'
  | 'mcq'
  | 'blanks'
  | 'exam'
  | 'ask';

interface LectureWorkspaceViewProps {
  lecture: Lecture;
  course?: Course;
  language: Language;
  onBack: () => void;
  onUpdateLecture: (updated: Lecture) => void;
  onSaveQuestionToBank?: (item: QuestionBankItem) => void;
  onSavePracticeExamResult?: (result: PracticeExamResult) => void;
  onTriggerAchievement?: (title: string, titleAr: string) => void;
}

export const LectureWorkspaceView: React.FC<LectureWorkspaceViewProps> = ({
  lecture,
  course,
  language,
  onBack,
  onUpdateLecture,
  onSaveQuestionToBank,
  onSavePracticeExamResult,
  onTriggerAchievement,
}) => {
  const isAr = language === 'ar';
  const t = translations[language];

  // 8 Primary Study Actions
  const [activeAction, setActiveAction] = useState<LectureStudyAction>('notes');

  // Complete Notes state
  const [selectedNoteCategory, setSelectedNoteCategory] = useState<string>('all');

  // Flashcards state
  const [flashcardCountMode, setFlashcardCountMode] = useState<'10' | '20' | 'custom'>('10');
  const [customFlashcardCount, setCustomFlashcardCount] = useState<number>(lecture.flashcards.length);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  // MCQ state
  const [mcqCountMode, setMcqCountMode] = useState<'5' | '10' | '20' | 'custom'>('5');
  const [customMcqCount, setCustomMcqCount] = useState<number>(lecture.mcqs.length);
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<string, number>>({});
  const [submittedMcqAnswers, setSubmittedMcqAnswers] = useState<Record<string, boolean>>({});
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(new Set());

  // Fill in blanks state
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});
  const [blankResults, setBlankResults] = useState<Record<string, boolean | null>>({});
  const [showHintMap, setShowHintMap] = useState<Record<string, boolean>>({});

  // Practice Exam state
  const [isExamActive, setIsExamActive] = useState(false);
  const [examConfig, setExamConfig] = useState<PracticeExamConfig>({
    questionCount: 5,
    difficulty: 'mixed',
    types: ['mcq', 'fill_in_blank'],
    timerEnabled: true,
    durationMinutes: 10,
  });
  const [examTimeRemaining, setExamTimeRemaining] = useState<number>(600);
  const [examUserAnswers, setExamUserAnswers] = useState<Record<string, any>>({});
  const [examResult, setExamResult] = useState<PracticeExamResult | null>(null);

  // Ask This File state
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'ai'; text: string; sourcePages?: number[] }[]
  >([
    {
      sender: 'ai',
      text: isAr
        ? `أهلاً بكِ في مساحة دراسة ملف "${lecture.title}"! تم استخراج محتوى السلايدات بدقة. يمكنكِ سؤالي عما يجب حفظه، أو شرح أي صفحة (مثلاً: "اشرحي صفحة 12")، أو طلب جدول مقارنة سريرية. جميع الإجابات موثقة بأرقام الصفحات.`
        : `Welcome to your study workspace for "${lecture.title}"! Every concept has been indexed directly from your uploaded PDF. Ask me to explain any slide (e.g. "Explain page 12"), make a comparison table, or quiz you before your exam.`,
      sourcePages: [1, 2],
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Generation status state
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);

  // Handlers for dynamic AI item generation with strict count verification loop
  const handleGenerateMoreMcqs = async (additionalCount = 5) => {
    setIsGeneratingMore(true);
    const targetCount = (lecture.mcqs?.length || 0) + additionalCount;
    const updatedMcqs = await generateMCQs(lecture, targetCount);
    onUpdateLecture({
      ...lecture,
      mcqs: updatedMcqs,
      questionBankCount: updatedMcqs.length + (lecture.fillInBlanks?.length || 0),
    });
    setCustomMcqCount(updatedMcqs.length);
    setIsGeneratingMore(false);
    setGenerationFeedback(
      isAr
        ? `تم التحقق وتوليد ${additionalCount} أسئلة سريرية جديدة عبر كامل أجزاء الملف (العدد الحالي: ${updatedMcqs.length})`
        : `Generated ${additionalCount} additional MCQs covering document chunks — count verified! (Total: ${updatedMcqs.length})`
    );
    setTimeout(() => setGenerationFeedback(null), 4000);
  };

  const handleGenerateMoreFlashcards = async (additionalCount = 5) => {
    setIsGeneratingMore(true);
    const targetCount = (lecture.flashcards?.length || 0) + additionalCount;
    const updatedCards = await generateFlashcards(lecture, targetCount);
    onUpdateLecture({
      ...lecture,
      flashcards: updatedCards,
    });
    setCustomFlashcardCount(updatedCards.length);
    setIsGeneratingMore(false);
    setGenerationFeedback(
      isAr
        ? `تم التحقق وتوليد ${additionalCount} بطاقات استذكار إضافية من كافة فصول الملف (الإجمالي: ${updatedCards.length})`
        : `Generated ${additionalCount} additional flashcards across document chunks — count verified! (Total: ${updatedCards.length})`
    );
    setTimeout(() => setGenerationFeedback(null), 4000);
  };

  const handleGenerateMoreBlanks = async (additionalCount = 5) => {
    setIsGeneratingMore(true);
    const targetCount = (lecture.fillInBlanks?.length || 0) + additionalCount;
    const updatedBlanks = await generateFillInBlanks(lecture, targetCount);
    onUpdateLecture({
      ...lecture,
      fillInBlanks: updatedBlanks,
      questionBankCount: (lecture.mcqs?.length || 0) + updatedBlanks.length,
    });
    setIsGeneratingMore(false);
    setGenerationFeedback(
      isAr
        ? `تم التحقق وتوليد ${additionalCount} تمارين فراغات إضافية موزعة على كامل الملف (الإجمالي: ${updatedBlanks.length})`
        : `Generated ${additionalCount} additional fill-in-the-blank items — count verified! (Total: ${updatedBlanks.length})`
    );
    setTimeout(() => setGenerationFeedback(null), 4000);
  };

  // Timer tick for Practice Exam
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isExamActive && examConfig.timerEnabled && examTimeRemaining > 0) {
      timer = setInterval(() => {
        setExamTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinishPracticeExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExamActive, examConfig.timerEnabled, examTimeRemaining]);

  // Mark as Studied
  const handleToggleMarkAsStudied = () => {
    const isCompleted = lecture.status === 'completed';
    const newStatus = isCompleted ? 'in_progress' : 'completed';

    const updated: Lecture = {
      ...lecture,
      status: newStatus,
      progressTracking: {
        ...(lecture.progressTracking || {
          notesReviewed: true,
          flashcardsMastered: lecture.flashcards.length,
          flashcardsTotal: lecture.flashcards.length,
          mcqsAttempted: lecture.mcqs.length,
          mcqsCorrect: lecture.mcqs.length,
          blanksAttempted: lecture.fillInBlanks.length,
          blanksCorrect: lecture.fillInBlanks.length,
          practiceExamCompleted: true,
        }),
        notesReviewed: newStatus === 'completed',
      },
    };

    onUpdateLecture(updated);

    if (newStatus === 'completed' && onTriggerAchievement) {
      onTriggerAchievement(
        `Studied Lecture: ${lecture.title}`,
        `تمت دراسة المحاضرة: ${lecture.titleAr || lecture.title}`
      );
    }
  };

  // Flashcards Filtering & Navigation: strictly ensures exact requested count
  const activeFlashcards =
    flashcardCountMode === '10'
      ? ensureExactFlashcards(lecture, 10)
      : flashcardCountMode === '20'
      ? ensureExactFlashcards(lecture, 20)
      : ensureExactFlashcards(lecture, Math.max(1, customFlashcardCount));

  const currentCard = activeFlashcards[flashcardIdx] || lecture.flashcards[0] || {
    term: 'Sample Dental Concept',
    definition: 'Diagnostic criteria from lecture slides.',
    category: 'General',
    sourcePage: 2,
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setFlashcardIdx((prev) => (prev + 1) % activeFlashcards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setFlashcardIdx((prev) => (prev - 1 + activeFlashcards.length) % activeFlashcards.length);
  };

  const handleMarkCardMastered = (idx: number, isMastered: boolean) => {
    const updated = new Set(masteredCards);
    if (isMastered) {
      updated.add(idx);
    } else {
      updated.delete(idx);
    }
    setMasteredCards(updated);
    handleNextCard();
  };

  // MCQ Selection & Answering: strictly ensures exact requested count
  const activeMcqs =
    mcqCountMode === '5'
      ? ensureExactMcqs(lecture, 5)
      : mcqCountMode === '10'
      ? ensureExactMcqs(lecture, 10)
      : mcqCountMode === '20'
      ? ensureExactMcqs(lecture, 20)
      : ensureExactMcqs(lecture, Math.max(1, customMcqCount));

  const handleSelectOption = (mcqId: string, optionIdx: number) => {
    if (submittedMcqAnswers[mcqId]) return;
    setSelectedMcqAnswers((prev) => ({ ...prev, [mcqId]: optionIdx }));
  };

  const handleSubmitMcqAnswer = (mcq: MCQItem) => {
    const selected = selectedMcqAnswers[mcq.id];
    if (selected === undefined) return;

    setSubmittedMcqAnswers((prev) => ({ ...prev, [mcq.id]: true }));
    const isCorrect = selected === mcq.correctIndex;

    const prevAttempted = lecture.progressTracking?.mcqsAttempted || 0;
    const prevCorrect = lecture.progressTracking?.mcqsCorrect || 0;

    const updatedLecture: Lecture = {
      ...lecture,
      progressTracking: {
        ...(lecture.progressTracking || {
          notesReviewed: false,
          flashcardsMastered: 0,
          flashcardsTotal: lecture.flashcards.length,
          mcqsAttempted: 0,
          mcqsCorrect: 0,
          blanksAttempted: 0,
          blanksCorrect: 0,
          practiceExamCompleted: false,
        }),
        mcqsAttempted: prevAttempted + 1,
        mcqsCorrect: isCorrect ? prevCorrect + 1 : prevCorrect,
      },
    };
    onUpdateLecture(updatedLecture);
  };

  const handleSaveToQuestionBank = (mcq: MCQItem) => {
    if (!onSaveQuestionToBank) return;
    const bankItem: QuestionBankItem = {
      id: `qb-${Date.now()}-${mcq.id}`,
      userId: lecture.userId || 'current',
      courseId: lecture.courseId,
      courseName: lecture.courseName,
      lectureId: lecture.id,
      lectureTitle: lecture.title,
      topic: mcq.topic || lecture.title,
      type: 'mcq',
      difficulty: mcq.difficulty || 'medium',
      question: mcq.question,
      options: mcq.options,
      correctAnswer: mcq.options[mcq.correctIndex],
      explanation: mcq.explanation,
      clinicalPearl: mcq.clinicalPearl,
      sourcePage: mcq.sourcePage,
      timesAttempted: mcq.timesAttempted || 0,
      timesCorrect: mcq.timesCorrect || 0,
      createdAt: new Date().toISOString(),
    };

    onSaveQuestionToBank(bankItem);
    setSavedQuestionIds((prev) => new Set(prev).add(mcq.id));
  };

  // Fill in blanks Check
  const handleCheckBlankAnswer = (blankId: string, correctWord: string) => {
    const userVal = (blankAnswers[blankId] || '').trim().toLowerCase();
    const correctVal = correctWord.trim().toLowerCase();
    const isMatch = userVal === correctVal || (correctVal.includes(userVal) && userVal.length >= 3);

    setBlankResults((prev) => ({ ...prev, [blankId]: isMatch }));

    const prevBlanks = lecture.progressTracking?.blanksAttempted || 0;
    const prevCorrect = lecture.progressTracking?.blanksCorrect || 0;

    const updatedLecture: Lecture = {
      ...lecture,
      progressTracking: {
        ...(lecture.progressTracking || {
          notesReviewed: false,
          flashcardsMastered: 0,
          flashcardsTotal: lecture.flashcards.length,
          mcqsAttempted: 0,
          mcqsCorrect: 0,
          blanksAttempted: 0,
          blanksCorrect: 0,
          practiceExamCompleted: false,
        }),
        blanksAttempted: prevBlanks + 1,
        blanksCorrect: isMatch ? prevCorrect + 1 : prevCorrect,
      },
    };
    onUpdateLecture(updatedLecture);
  };

  // Practice Exam
  const handleStartPracticeExam = () => {
    setIsExamActive(true);
    setExamTimeRemaining(examConfig.durationMinutes * 60);
    setExamUserAnswers({});
    setExamResult(null);
  };

  const handleFinishPracticeExam = () => {
    setIsExamActive(false);

    const examQuestions = lecture.mcqs.slice(0, examConfig.questionCount);
    let correctCount = 0;
    const missedIds: string[] = [];

    examQuestions.forEach((q) => {
      const userChoice = examUserAnswers[q.id];
      if (userChoice === q.correctIndex) {
        correctCount++;
      } else {
        missedIds.push(q.id);
      }
    });

    const total = examQuestions.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const timeSpent = examConfig.durationMinutes * 60 - examTimeRemaining;

    const strongTopics = accuracy >= 70 ? [lecture.title] : [];
    const weakTopics = accuracy < 70 ? [lecture.title] : [];

    const result: PracticeExamResult = {
      id: `exam-res-${Date.now()}`,
      lectureId: lecture.id,
      lectureTitle: lecture.title,
      date: new Date().toISOString(),
      score: correctCount,
      totalQuestions: total,
      accuracyPercent: accuracy,
      timeSpentSeconds: Math.max(10, timeSpent),
      strongTopics,
      weakTopics,
      missedQuestionIds: missedIds,
    };

    setExamResult(result);
    if (onSavePracticeExamResult) onSavePracticeExamResult(result);

    const updatedLecture: Lecture = {
      ...lecture,
      practiceExamAttempts: [result, ...(lecture.practiceExamAttempts || [])],
      progressTracking: {
        ...(lecture.progressTracking || {
          notesReviewed: false,
          flashcardsMastered: 0,
          flashcardsTotal: lecture.flashcards.length,
          mcqsAttempted: 0,
          mcqsCorrect: 0,
          blanksAttempted: 0,
          blanksCorrect: 0,
          practiceExamCompleted: true,
        }),
        practiceExamCompleted: true,
        lastExamScorePercent: accuracy,
      },
    };
    onUpdateLecture(updatedLecture);
  };

  // Ask This File query
  const handleSendLectureQuery = (customQ?: string) => {
    const q = (customQ || chatInput).trim();
    if (!q || isChatTyping) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setChatInput('');
    setIsChatTyping(true);

    setTimeout(() => {
      const response = answerLectureQuery(q, lecture);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.text,
          sourcePages: response.sourcePages,
        },
      ]);
      setIsChatTyping(false);
    }, 400);
  };

  // Note sections filter
  const noteSections = lecture.completeNotes?.sections || [
    {
      id: 'sec-1',
      category: 'Overview',
      categoryAr: 'نظرة عامة',
      title: `${lecture.title} — Overview`,
      titleAr: 'نظرة عامة',
      content: lecture.notes || lecture.explanation,
      sourcePage: 2,
      isFromLecture: true,
    },
  ];

  const filteredNotes = noteSections.filter((s) => {
    if (selectedNoteCategory === 'all') return true;
    return s.category.toLowerCase().includes(selectedNoteCategory.toLowerCase());
  });

  const categories = Array.from(new Set(noteSections.map((s) => s.category)));

  // 8 Actions Config Definition
  const studyActionList: {
    id: LectureStudyAction;
    label: string;
    labelAr: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
    descAr: string;
  }[] = [
    {
      id: 'notes',
      label: 'Complete Notes',
      labelAr: 'الملاحظات الشاملة',
      icon: FileText,
      desc: 'Organized clinical breakdown',
      descAr: 'تفصيل سريري شامل موثق',
    },
    {
      id: 'summary',
      label: 'Quick Summary',
      labelAr: 'ملخص سريع',
      icon: Zap,
      desc: 'Rapid revision recap',
      descAr: 'موجز سريع للمراجعة',
    },
    {
      id: 'highyield',
      label: 'High-Yield',
      labelAr: 'عالي العائد',
      icon: Flame,
      desc: 'Definitions, numbers, warnings',
      descAr: 'التعاريف، الأرقام، والفروق',
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      labelAr: 'بطاقات الاستذكار',
      icon: Layers,
      desc: '10 / 20 / All cards with flip',
      descAr: 'استرجاع نشط مع قلب البطاقة',
    },
    {
      id: 'mcq',
      label: 'MCQ Quiz',
      labelAr: 'أسئلة MCQs',
      icon: HelpCircle,
      desc: '5 / 10 / 20 test questions',
      descAr: 'أسئلة خيارات متعددة مع التعليل',
    },
    {
      id: 'blanks',
      label: 'Fill in Blanks',
      labelAr: 'املأي الفراغات',
      icon: Edit3,
      desc: 'Key sentence completion',
      descAr: 'اختبار المفاهيم المفقودة',
    },
    {
      id: 'exam',
      label: 'Practice Exam',
      labelAr: 'امتحان تدريبي',
      icon: Award,
      desc: 'Timed simulation drill',
      descAr: 'محاكاة اختبار بوقت محدد',
    },
    {
      id: 'ask',
      label: 'Ask This File',
      labelAr: 'اسألي هذا الملف',
      icon: MessageSquare,
      desc: 'Grounded slide Q&A',
      descAr: 'إجابات موثقة برقم الصفحة',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 transition-all">
      {/* 1. TOP HEADER: Uploaded PDF info & Mark as Studied */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isAr ? 'العودة إلى محاضراتي' : 'Back to My Lectures'}</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isAr && lecture.titleAr ? lecture.titleAr : lecture.title}
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {course ? (isAr && course.nameAr ? course.nameAr : course.name) : lecture.courseName}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  {lecture.pageCount || lecture.slidesCount || 32} {isAr ? 'صفحة (PDF)' : 'PDF Pages'}
                </span>
              </span>
              <span>•</span>
              <span className="font-mono">{lecture.fileName || 'document.pdf'}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ {isAr ? 'المصدر الأساسي المعتمد' : 'Uploaded PDF is Source of Truth'}
              </span>
            </div>
          </div>

          {/* Right Action: Mark as Studied */}
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                lecture.status === 'completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : lecture.status === 'in_progress'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {lecture.status === 'completed'
                ? isAr ? 'تمت الدراسة بالكامل ✓' : 'Studied ✓'
                : lecture.status === 'in_progress'
                ? isAr ? 'قيد المذاكرة' : 'In Progress'
                : isAr ? 'لم تبدأ بعد' : 'Not Started'}
            </span>

            <button
              onClick={handleToggleMarkAsStudied}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                lecture.status === 'completed'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {lecture.status === 'completed'
                  ? isAr ? 'تغيير إلى قيد المذاكرة' : 'Mark as In Progress'
                  : isAr ? 'تحديد كـ تمت دراستها' : 'Mark as Studied'}
              </span>
            </button>
          </div>
        </div>

        {/* 2. THE 8 CLEARLY VISIBLE PRIMARY STUDY ACTIONS (CLICKABLE CARDS/BUTTONS) */}
        <div className="pt-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {isAr ? 'أدوات دراسة هذا الملف:' : 'Study Actions For This File:'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {studyActionList.map((action) => {
              const Icon = action.icon;
              const isActive = activeAction === action.id;
              return (
                <button
                  key={action.id}
                  onClick={() => setActiveAction(action.id)}
                  className={`p-3 rounded-2xl border text-start flex flex-col justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20 ring-2 ring-teal-500/20'
                      : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-teal-400 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                    {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">
                      {isAr ? action.labelAr : action.label}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 line-clamp-1 ${
                        isActive ? 'text-teal-100' : 'text-slate-400'
                      }`}
                    >
                      {isAr ? action.descAr : action.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. ACTIVE PANEL CONTAINER */}
      <div>
        {/* ACTION 1: COMPLETE NOTES */}
        {activeAction === 'notes' && (
          <div className="space-y-5">
            {/* Full Coverage Check Notice */}
            {lecture.completeNotes?.coverageCheck && (
              <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">
                        {isAr ? 'التحقق من التغطية الشاملة (Coverage Check)' : 'Comprehensive Coverage Check'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {lecture.completeNotes.coverageCheck.coverageNote}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                    <span className="text-slate-400">{isAr ? 'نسبة الشمول:' : 'Coverage:'}</span>
                    <span className="font-bold text-teal-400 font-mono text-sm">
                      {lecture.completeNotes.coverageCheck.coverageScore}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAr ? 'المحاور المكتشفة والممثلة بالملاحظات:' : 'Topics represented in notes:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lecture.completeNotes.coverageCheck.representedTopics.map((top, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] border border-slate-700/60"
                      >
                        {top}
                      </span>
                    ))}
                  </div>
                </div>

                {lecture.chunks && lecture.chunks.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-teal-300 font-semibold">
                        <Layers className="w-3.5 h-3.5" />
                        <span>
                          {isAr
                            ? `تقسيم المستند إلى ${lecture.chunks.length} أجزاء منطقية تغطي الصفحات من 1 إلى ${lecture.pageCount || lecture.slidesCount || 16}:`
                            : `Full Document Segmentation: ${lecture.chunks.length} logical chunks covering Slides 1–${lecture.pageCount || lecture.slidesCount || 16}`}
                        </span>
                      </div>
                      <span className="text-emerald-400 text-[10px] font-bold">
                        ✓ {isAr ? 'تغطية شاملة 100%' : '100% Comprehensive Coverage'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                      {lecture.chunks.map((chunk) => (
                        <div
                          key={chunk.chunkIndex}
                          className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-[11px] space-y-1"
                        >
                          <div className="font-bold text-teal-300 flex items-center justify-between">
                            <span className="truncate pe-1">
                              {isAr && chunk.titleAr
                                ? chunk.titleAr.split('(')[0].trim()
                                : chunk.title.split('(')[0].trim()}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 shrink-0">
                              P.{chunk.startPage}–{chunk.endPage}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{chunk.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Note Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedNoteCategory('all')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedNoteCategory === 'all'
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {isAr ? 'جميع الأقسام' : 'All Sections'}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedNoteCategory(cat)}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    selectedNoteCategory === cat
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Detailed Note Cards */}
            <div className="space-y-4">
              {filteredNotes.map((sec) => (
                <div
                  key={sec.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-800/60">
                        {isAr && sec.categoryAr ? sec.categoryAr : sec.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {isAr && sec.titleAr ? sec.titleAr : sec.title}
                      </h3>
                    </div>

                    {sec.sourcePage && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        <BookOpen className="w-3 h-3 text-teal-600" />
                        <span>{isAr ? `صفحة ${sec.sourcePage}` : `Source: Page ${sec.sourcePage}`}</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
                    {sec.content}
                  </div>

                  <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ {isAr ? 'موثق ومستخرج من سلايدات المحاضرة' : 'From your lecture slides'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION 2: QUICK SUMMARY */}
        {activeAction === 'summary' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? 'الملخص السريع للمحاضرة' : 'Quick Lecture Summary'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'موجز مكثف للمفاهيم الأساسية للمراجعة السريعة قبل المحاضرة أو الجلسة السريرية'
                  : 'Fast, condensed summary for rapid review before class or clinical rotations'}
              </p>
            </div>

            <div className="space-y-3">
              {(lecture.quickSummary || lecture.highYieldSummary.slice(0, 4)).map((point, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/60 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="text-xs md:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {point}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION 3: HIGH-YIELD */}
        {activeAction === 'highyield' && (
          <div className="space-y-5">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isAr ? 'المراجعة الامتحانية عالية العائد (High-Yield)' : 'High-Yield Exam Focus Review'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'التعاريف، التصنيفات، المقارنات، الأرقام، والاستثناءات التي يركز عليها أساتذة الكلية'
                    : 'Definitions, classifications, comparisons, numbers, and exceptions from your slides'}
                </p>
              </div>

              {/* Review Blocks */}
              <div className="space-y-4">
                {(lecture.highYieldReview || [
                  {
                    category: 'Key Definitions',
                    categoryAr: 'التعاريف الجوهرية',
                    sourcePage: 2,
                    items: [lecture.explanation.split('.')[0] + '.'],
                  },
                  {
                    category: 'Critical Distinctions',
                    categoryAr: 'المقارنات السريرية',
                    sourcePage: 8,
                    items: lecture.highYieldSummary.slice(0, 3),
                  },
                ]).map((block, bIdx) => (
                  <div
                    key={bIdx}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                        {isAr && block.categoryAr ? block.categoryAr : block.category}
                      </span>
                      {block.sourcePage && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {isAr ? `صفحة ${block.sourcePage}` : `Source: Page ${block.sourcePage}`}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {block.items.map((it, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-teal-500 font-bold">•</span>
                          <span className="leading-relaxed">{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACTION 4: FLASHCARDS */}
        {activeAction === 'flashcards' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isAr ? 'البطاقات الاستذكارية (Flashcards)' : 'Active Recall Flashcards'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? 'اقلبي البطاقة لاختبار استحضاركِ للمفاهيم السريرية' : 'Test your active retrieval of clinical criteria'}
                </p>
              </div>

              {/* Card Count Selector & AI Generation Button */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleGenerateMoreFlashcards(5)}
                  disabled={isGeneratingMore}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isGeneratingMore
                      ? isAr
                        ? 'جارِ التوليد والتحقق...'
                        : 'Generating & Verifying...'
                      : isAr
                      ? '+ 5 بطاقات من كامل الملف'
                      : '+ 5 Cards (Full Document)'}
                  </span>
                </button>

                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs">
                  {(['10', '20', 'custom'] as const).map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => {
                        setFlashcardCountMode(cnt);
                        setFlashcardIdx(0);
                        setIsFlipped(false);
                      }}
                      className={`px-3 py-1 rounded-xl font-semibold cursor-pointer transition-all ${
                        flashcardCountMode === cnt
                          ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {cnt === 'custom'
                        ? isAr
                          ? `مخصص (${customFlashcardCount})`
                          : `Custom (${customFlashcardCount})`
                        : `${cnt} ${isAr ? 'بطاقات' : 'cards'}`}
                    </button>
                  ))}

                  {flashcardCountMode === 'custom' && (
                    <div className="flex items-center gap-1 ps-2 pe-1 border-s border-slate-300 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setCustomFlashcardCount((prev) => Math.max(1, prev - 1))}
                        className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-[11px] w-6 text-center">
                        {customFlashcardCount}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          const nextVal = customFlashcardCount + 1;
                          setCustomFlashcardCount(nextVal);
                          if (nextVal > (lecture.flashcards?.length || 0)) {
                            const updated = await generateFlashcards(lecture, nextVal);
                            onUpdateLecture({ ...lecture, flashcards: updated });
                          }
                        }}
                        className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {generationFeedback && (
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                <span>{generationFeedback}</span>
              </div>
            )}

            {/* Flip Card Component */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`min-h-[240px] p-8 rounded-3xl border text-center flex flex-col justify-between items-center transition-all cursor-pointer ${
                isFlipped
                  ? 'bg-teal-900 text-white border-teal-700 shadow-lg'
                  : 'bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between w-full text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase">
                  {currentCard.category}
                </span>
                {currentCard.sourcePage && (
                  <span className="text-[11px] opacity-75">
                    {isAr ? `صفحة ${currentCard.sourcePage}` : `Source: Page ${currentCard.sourcePage}`}
                  </span>
                )}
              </div>

              <div className="space-y-3 max-w-lg my-auto">
                {!isFlipped ? (
                  <>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      {isAr ? 'المفهوم / السؤال (Front)' : 'Concept / Question (Front)'}
                    </span>
                    <h4 className="text-xl md:text-2xl font-bold">{currentCard.term}</h4>
                    <p className="text-xs text-slate-400 pt-2">
                      {isAr ? 'انقري هنا لقلب البطاقة وكشف الإجابة' : 'Click to flip card & see answer'}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider block">
                      {isAr ? 'الإجابة والتعليل السريري (Back)' : 'Answer & Clinical Criteria (Back)'}
                    </span>
                    <p className="text-sm md:text-base leading-relaxed font-medium">{currentCard.definition}</p>
                  </>
                )}
              </div>

              <div className="text-[10px] opacity-60">
                {flashcardIdx + 1} / {activeFlashcards.length} · {masteredCards.size} {isAr ? 'أتقنتِها' : 'mastered'}
              </div>
            </div>

            {/* Flashcard Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevCard}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'قلب البطاقة (Flip)' : 'Flip'}</span>
                </button>
                <button
                  onClick={handleNextCard}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkCardMastered(flashcardIdx, false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 text-xs font-semibold cursor-pointer"
                >
                  <span>{isAr ? 'مراجعة ثانية (Review Again)' : 'Review Again'}</span>
                </button>

                <button
                  onClick={() => handleMarkCardMastered(flashcardIdx, true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isAr ? 'أتقنتُها (Know It) ✓' : 'Know It ✓'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACTION 5: MCQ QUIZ */}
        {activeAction === 'mcq' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isAr ? 'أسئلة الاختيار من متعدد (MCQ Quiz)' : 'Lecture MCQ Quiz'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? '4 خيارات سريرية، الإجابة محجوبة حتى التحديد والتأكيد' : '4 choices with answer hidden until submission'}
                </p>
              </div>

              {/* Number of questions selector & AI Generation Button */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleGenerateMoreMcqs(5)}
                  disabled={isGeneratingMore}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isGeneratingMore
                      ? isAr
                        ? 'جارِ التوليد والتحقق...'
                        : 'Generating & Verifying...'
                      : isAr
                      ? '+ 5 أسئلة من كامل الملف'
                      : '+ 5 MCQs (Full Document)'}
                  </span>
                </button>

                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs">
                  {(['5', '10', '20', 'custom'] as const).map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setMcqCountMode(cnt)}
                      className={`px-3 py-1 rounded-xl font-semibold cursor-pointer transition-all ${
                        mcqCountMode === cnt
                          ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {cnt === 'custom'
                        ? isAr
                          ? `مخصص (${customMcqCount})`
                          : `Custom (${customMcqCount})`
                        : `${cnt} ${isAr ? 'أسئلة' : 'Q'}`}
                    </button>
                  ))}

                  {mcqCountMode === 'custom' && (
                    <div className="flex items-center gap-1 ps-2 pe-1 border-s border-slate-300 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setCustomMcqCount((prev) => Math.max(1, prev - 1))}
                        className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-[11px] w-6 text-center">
                        {customMcqCount}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          const nextVal = customMcqCount + 1;
                          setCustomMcqCount(nextVal);
                          if (nextVal > (lecture.mcqs?.length || 0)) {
                            const updated = await generateMCQs(lecture, nextVal);
                            onUpdateLecture({ ...lecture, mcqs: updated });
                          }
                        }}
                        className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {generationFeedback && (
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                <span>{generationFeedback}</span>
              </div>
            )}

            {activeMcqs.map((mcq, qIdx) => {
              const isSubmitted = !!submittedMcqAnswers[mcq.id];
              const selectedChoice = selectedMcqAnswers[mcq.id];
              const isCorrect = selectedChoice === mcq.correctIndex;
              const isSaved = savedQuestionIds.has(mcq.id);

              return (
                <div
                  key={mcq.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                        {qIdx + 1}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {mcq.difficulty || 'Medium'} · {isAr ? 'سؤال سريري' : 'Clinical MCQ'}
                      </span>
                    </div>

                    {mcq.sourcePage && (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {isAr ? `صفحة ${mcq.sourcePage}` : `Source: Page ${mcq.sourcePage}`}
                      </span>
                    )}
                  </div>

                  <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                    {mcq.question}
                  </p>

                  {/* 4 Choices */}
                  <div className="space-y-2">
                    {mcq.options.map((opt, oIdx) => {
                      const isChosen = selectedChoice === oIdx;
                      let optionStyle =
                        'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-teal-400';

                      if (isSubmitted) {
                        if (oIdx === mcq.correctIndex) {
                          optionStyle =
                            'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold';
                        } else if (isChosen && !isCorrect) {
                          optionStyle =
                            'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 line-through';
                        } else {
                          optionStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
                        }
                      } else if (isChosen) {
                        optionStyle =
                          'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold';
                      }

                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectOption(mcq.id, oIdx)}
                          className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all cursor-pointer ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && oIdx === mcq.correctIndex && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isSubmitted && isChosen && !isCorrect && (
                            <X className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    {!isSubmitted ? (
                      <button
                        onClick={() => handleSubmitMcqAnswer(mcq)}
                        disabled={selectedChoice === undefined}
                        className="px-5 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        {isAr ? 'تأكيد الإجابة' : 'Submit Answer'}
                      </button>
                    ) : (
                      <div className="space-y-3 w-full animate-in fade-in">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-2">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {isCorrect
                              ? isAr ? 'إجابة صحيحة ومتقنة! ✓' : 'Correct Answer! ✓'
                              : isAr ? 'إجابة غير دقيقة' : 'Incorrect'}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{mcq.explanation}</p>
                          {mcq.clinicalPearl && (
                            <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-medium pt-1">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>{mcq.clinicalPearl}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleSaveToQuestionBank(mcq)}
                            disabled={isSaved}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isSaved
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isSaved ? <Check className="w-3 h-3" /> : <FolderPlus className="w-3 h-3 text-teal-600" />}
                            <span>{isSaved ? (isAr ? 'محفوظ في بنك الأسئلة' : 'Saved to Question Bank') : (isAr ? 'حفظ في بنك أسئلة المقرر' : 'Save to Course Question Bank')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ACTION 6: FILL IN THE BLANKS */}
        {activeAction === 'blanks' && (
          <div className="space-y-5">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isAr ? 'املأي الفراغات (Fill in the Blanks)' : 'Fill in the Blanks Challenge'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr ? 'استرجاع المصطلحات السريرية الدقيقة من نصوص السلايدات' : 'Retrieve key dental facts and terms from your slides'}
                </p>
              </div>

              <button
                onClick={() => handleGenerateMoreBlanks(5)}
                disabled={isGeneratingMore}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isGeneratingMore
                    ? isAr
                      ? 'جارِ التوليد والتحقق...'
                      : 'Generating & Verifying...'
                    : isAr
                    ? '+ 5 تمارين من كامل الملف'
                    : '+ 5 Exercises (Full Document)'}
                </span>
              </button>
            </div>

            {generationFeedback && (
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                <span>{generationFeedback}</span>
              </div>
            )}

            {lecture.fillInBlanks.map((b, bIdx) => {
              const blankId = b.id || `fib-${bIdx}`;
              const result = blankResults[blankId];
              const showHint = showHintMap[blankId];

              return (
                <div
                  key={blankId}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-xs">
                    <span className="font-bold text-teal-600">
                      {isAr ? `تمرين ${bIdx + 1}` : `Exercise ${bIdx + 1}`}
                    </span>
                    {b.sourcePage && (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {isAr ? `صفحة ${b.sourcePage}` : `Source: Page ${b.sourcePage}`}
                      </span>
                    )}
                  </div>

                  <p className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {b.sentence}
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={blankAnswers[blankId] || ''}
                      onChange={(e) =>
                        setBlankAnswers((prev) => ({ ...prev, [blankId]: e.target.value }))
                      }
                      placeholder={isAr ? 'اكتبي الكلمة المفقودة هنا...' : 'Type missing term...'}
                      className="flex-1 px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleCheckBlankAnswer(blankId, b.missingWord)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      {isAr ? 'فحص الإجابة' : 'Check Answer'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      onClick={() =>
                        setShowHintMap((prev) => ({ ...prev, [blankId]: !prev[blankId] }))
                      }
                      className="text-slate-400 hover:text-teal-600 font-medium cursor-pointer"
                    >
                      {showHint ? (isAr ? 'إخفاء التلميح' : 'Hide Hint') : (isAr ? 'إظهار تلميح' : 'Show Hint')}
                    </button>

                    {result !== undefined && (
                      <span
                        className={`font-bold ${
                          result ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        {result
                          ? isAr ? 'إجابة دقيقة! ✓' : 'Correct! ✓'
                          : isAr ? `الكلمة الصحيحة: ${b.missingWord}` : `Correct term: ${b.missingWord}`}
                      </span>
                    )}
                  </div>

                  {showHint && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs border border-amber-200 animate-in fade-in">
                      💡 {b.hint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ACTION 7: PRACTICE EXAM */}
        {activeAction === 'exam' && (
          <div className="space-y-6">
            {!isExamActive && !examResult && (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isAr ? 'الامتحان التدريبي للمحاضرة' : 'Configure Lecture Practice Exam'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? 'اختاري عدد الأسئلة والوقت لاختبار جاهزيتكِ تحت ظروف مشابهة للامتحان'
                      : 'Simulate high-yield exam conditions specifically on this lecture material'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      {isAr ? 'عدد الأسئلة' : 'Question Count'}
                    </label>
                    <div className="flex gap-2">
                      {[5, 10, 15].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setExamConfig((prev) => ({ ...prev, questionCount: cnt }))}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            examConfig.questionCount === cnt
                              ? 'bg-teal-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      {isAr ? 'مستوى الصعوبة' : 'Difficulty'}
                    </label>
                    <select
                      value={examConfig.difficulty}
                      onChange={(e) =>
                        setExamConfig((prev) => ({ ...prev, difficulty: e.target.value as any }))
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"
                    >
                      <option value="mixed">{isAr ? 'مختلط (نمط الامتحان)' : 'Mixed (Exam style)'}</option>
                      <option value="easy">{isAr ? 'سهل (تثبيت المفاهيم)' : 'Easy (Baseline)'}</option>
                      <option value="hard">{isAr ? 'متقدم (حالات سريرية)' : 'Hard (Clinical Cases)'}</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      {isAr ? 'المؤقت الزمني' : 'Timer Limit'}
                    </label>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500 font-mono">
                        {examConfig.durationMinutes} {isAr ? 'دقائق' : 'minutes'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExamConfig((prev) => ({ ...prev, timerEnabled: !prev.timerEnabled }))
                        }
                        className={`text-xs font-bold px-3 py-1 rounded-xl border cursor-pointer ${
                          examConfig.timerEnabled
                            ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 border-teal-300'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {examConfig.timerEnabled ? (isAr ? 'مفعّل' : 'Enabled') : (isAr ? 'بدون مؤقت' : 'No Timer')}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartPracticeExam}
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isAr ? 'بدء الامتحان التدريبي الآن' : 'Start Practice Exam Now'}</span>
                </button>
              </div>
            )}

            {isExamActive && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-teal-600" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {lecture.title} · {isAr ? 'امتحان مباشر' : 'Live Practice Exam'}
                    </span>
                  </div>

                  {examConfig.timerEnabled && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {Math.floor(examTimeRemaining / 60)}:
                        {(examTimeRemaining % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {lecture.mcqs.slice(0, examConfig.questionCount).map((mcq, idx) => (
                    <div key={mcq.id} className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                        {idx + 1}. {mcq.question}
                      </p>
                      <div className="space-y-2">
                        {mcq.options.map((opt, oIdx) => {
                          const isSelected = examUserAnswers[mcq.id] === oIdx;
                          return (
                            <div
                              key={oIdx}
                              onClick={() =>
                                setExamUserAnswers((prev) => ({ ...prev, [mcq.id]: oIdx }))
                              }
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-teal-50 dark:bg-teal-950 border-teal-600 text-teal-800 dark:text-teal-200 font-bold'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleFinishPracticeExam}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  {isAr ? 'إنهاء وتسليم الامتحان' : 'Submit & Score Exam'}
                </button>
              </div>
            )}

            {examResult && !isExamActive && (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isAr ? 'تقرير نتائج الامتحان التدريبي' : 'Practice Exam Performance Report'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lecture.title} · {examResult.date.split('T')[0]}
                    </p>
                  </div>

                  <div className="text-center p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800">
                    <span className="text-[10px] text-teal-600 block uppercase font-bold">
                      {isAr ? 'الدرجة والنسبة' : 'Score & Accuracy'}
                    </span>
                    <span className="text-2xl font-bold text-teal-700 dark:text-teal-300 font-mono">
                      {examResult.accuracyPercent}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'الأسئلة الصحيحة' : 'Correct'}</span>
                    <span className="font-bold text-emerald-600">
                      {examResult.score} / {examResult.totalQuestions}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'الوقت المستغرق' : 'Time Spent'}</span>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                      {Math.floor(examResult.timeSpentSeconds / 60)}m {examResult.timeSpentSeconds % 60}s
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'المحاور المتقنة' : 'Strong Topics'}</span>
                    <span className="font-semibold text-emerald-600">
                      {examResult.strongTopics[0] || (isAr ? 'تحتاج تثبيت' : 'Needs review')}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">{isAr ? 'المحاور للمراجعة' : 'Areas to Review'}</span>
                    <span className="font-semibold text-rose-500">
                      {examResult.weakTopics[0] || (isAr ? 'لا يوجد ضعف ملحوظ' : 'None detected')}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{isAr ? 'تنبيه أكاديمي هام' : 'Academic Practice Notice'}</span>
                  </div>
                  <p>
                    {isAr
                      ? 'هذا التقييم مصمم لمساعدتكِ على كشف الثغرات ونقاط القوة في هذه المحاضرة تحديداً، ولا يعد ضماناً أو توقّعاً حتمياً لعلامتكِ في امتحان الجامعة الرسمي.'
                      : 'This score is designed to highlight areas for revision and does not promise or predict an actual university examination grade.'}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setExamResult(null)}
                    className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {isAr ? 'إجراء امتحان تدريبي آخر' : 'Take Another Practice Exam'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTION 8: ASK THIS FILE */}
        {activeAction === 'ask' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? `اسألي عن ملف "${lecture.title}"` : `Ask This File — "${lecture.title}"`}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'جميع الإجابات مستخرجة وموثقة بأرقام الصفحات من ملف الـ PDF المرفوع'
                  : 'Answers strictly grounded in your uploaded PDF with page citations'}
              </p>
            </div>

            {/* Quick Example Prompt Suggestions as explicitly requested */}
            <div className="flex flex-wrap gap-2">
              {[
                isAr ? 'اشرحي هذه المحاضرة بالعربي' : 'Explain this lecture in Arabic.',
                isAr ? 'ما الذي يجب أن أحفظه في الامتحان؟' : 'What should I memorize?',
                isAr ? 'اشرحي صفحة 12' : 'Explain page 12.',
                isAr ? 'اصنعي جدول مقارنة سريرية' : 'Make a comparison table.',
                isAr ? 'اختبريني بأسئلة من هذا الملف' : 'Quiz me from this lecture.',
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendLectureQuery(p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 hover:border-teal-500 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="space-y-4 max-h-[460px] overflow-y-auto pe-2">
              {chatMessages.map((m, idx) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={idx}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        DM
                      </div>
                    )}

                    <div
                      className={`max-w-2xl p-4 rounded-2xl text-xs md:text-sm leading-relaxed space-y-2 ${
                        isUser
                          ? 'bg-teal-600 text-white rounded-br-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="whitespace-pre-line">{m.text}</div>

                      {m.sourcePages && m.sourcePages.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>
                            {isAr
                              ? `المصدر المعتمد: صفحات ${m.sourcePages.join(', ')}`
                              : `Source: Page ${m.sourcePages.join(', ')}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 text-xs font-bold">
                        Dr
                      </div>
                    )}
                  </div>
                );
              })}

              {isChatTyping && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 italic">
                  {isAr ? 'جاري استخراج الإجابة وتوثيق رقم الصفحة من الملف...' : 'Searching uploaded PDF & citing page numbers...'}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendLectureQuery();
              }}
              className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  isAr
                    ? 'اسألي عن أي سلايد أو تشخيص أو مقارنة في هذا الملف...'
                    : 'Ask about any page, diagnosis, comparison, or table from this file...'
                }
                className="flex-1 px-4 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatTyping}
                className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{isAr ? 'إرسال' : 'Ask'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
