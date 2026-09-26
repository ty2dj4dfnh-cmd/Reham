import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Stethoscope,
  BookOpen,
  Calendar,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  Square,
  MessageSquare,
  ChevronDown,
  Layers,
  ArrowRight,
  Flame,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  Course,
  Exam,
  StudyTask,
  DailyCheckInState,
  Achievement,
  UserProfile,
  Language,
  NavSection,
  ChatMessage,
  ChatSession,
  TutorActionButton,
} from '../types';
import { translations } from '../i18n/translations';
import {
  generateDentalTutorResponse,
  detectArabicQuery,
  DentalAiContext,
} from '../services/dentalAiEngine';
import {
  saveUserChatSession,
  getUserChatSessions,
  deleteUserChatSession,
} from '../services/userService';

interface AITutorViewProps {
  courses: Course[];
  exams: Exam[];
  tasks?: StudyTask[];
  checkInState?: DailyCheckInState;
  profile?: UserProfile;
  achievements?: Achievement[];
  streakDays?: number;
  studyMinutesToday?: number;
  language: Language;
  currentUserId?: string;
  onStartTask?: (task: StudyTask) => void;
  onNavigateToSection?: (section: NavSection) => void;
  onOpenExamRescue?: () => void;
  onBuildMyDay?: () => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  courses,
  exams,
  tasks = [],
  checkInState,
  profile,
  achievements = [],
  streakDays = 6,
  studyMinutesToday = 0,
  language,
  currentUserId,
  onStartTask,
  onNavigateToSection,
  onOpenExamRescue,
  onBuildMyDay,
}) => {
  const isAr = language === 'ar';
  const t = translations[language];

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('default-session');
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [editingSessionTitle, setEditingSessionTitle] = useState<{ id: string; title: string } | null>(null);

  // Active chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const abortControllerRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested Prompts
  const suggestedPrompts = isAr
    ? [
        'ما الذي يجب أن أدرسه الآن بناءً على خطتي؟',
        'اشرحي لي مرض الطلاوة (Leukoplakia) ببساطة',
        'ما الفرق بين التآكل الحمضي (Erosion) والسحج (Abrasion)؟',
        'لدي 30 دقيقة فقط اليوم، كيف أستثمرها؟',
        'أشعر أنني متأخرة على امتحاني القادم',
        'اختبريني بسؤال سريري سريع من امتحانات البورد',
      ]
    : [
        'What should I study now based on my plan?',
        'Explain leukoplakia simply',
        'What is the difference between erosion and abrasion?',
        'I only have 30 minutes today',
        "I'm behind on my upcoming exam",
        'Quiz me on a high-yield clinical spotter',
      ];

  // Build Context for the AI Tutor
  const buildContext = (): DentalAiContext => ({
    studentName: profile?.name || 'Doctor',
    language,
    courses,
    exams,
    tasks,
    checkIn: checkInState,
    profile,
    achievements,
    streakDays,
    studyMinutesToday,
  });

  // Calculate nearest exam for context pill
  const sortedExams = [...exams].sort((a, b) => a.daysRemaining - b.daysRemaining);
  const nearestExam = sortedExams[0];
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;

  // Initialize or Hydrate Chat Sessions from Firestore
  useEffect(() => {
    let isMounted = true;

    const loadSavedChats = async () => {
      if (currentUserId) {
        try {
          const userSessions = await getUserChatSessions(currentUserId);
          if (isMounted && userSessions && userSessions.length > 0) {
            setSessions(userSessions);
            setActiveSessionId(userSessions[0].id);
            setMessages(userSessions[0].messages || []);
            return;
          }
        } catch (err) {
          console.error('Failed to load user chat sessions from Firestore:', err);
        }
      }

      // Default Starter Session
      if (isMounted) {
        const welcomeMessage: ChatMessage = {
          id: 'welcome-1',
          sender: 'tutor',
          text: isAr
            ? `مرحباً دكتورة ${profile?.name || ''}! أنا DentalMind، رفيقكِ الدراسي السريري.\n\nأنا متزامن تماماً مع مقرراتكِ المسجلة (${courses.length} مقررات)، وامتحانكِ القادم (${
                nearestExam ? (nearestExam.courseNameAr || nearestExam.courseName) : 'أمراض الفم'
              } بعد ${nearestExam ? nearestExam.daysRemaining : 5} أيام)، وسعتكِ الدراسية اليوم (${
                checkInState?.timeAvailable || '2h'
              }).\n\nكيف يمكنني مساندتكِ الآن في دراستكِ؟ يمكنكِ السؤال عما يجب دراسته فوراً، أو طلب شرح أي مفهوم سريري مع الحفاظ على المصطلحات بالإنجليزية.`
            : `Hello Dr. ${profile?.name || ''}! I am DentalMind, your dedicated dental study companion.\n\nI am synchronized with your **${courses.length} courses**, your upcoming **${
                nearestExam ? nearestExam.courseName : 'Oral Pathology'
              } exam** in **${nearestExam ? nearestExam.daysRemaining : 5} days** (preparation currently at **${
                nearestExam ? nearestExam.preparationPercent : 64
              }%**), and your **${checkInState?.timeAvailable || '2h'}** available study block.\n\nWhat shall we tackle right now? Ask me what to study next, request a clinical explanation, or ask for a high-yield spotter quiz!`,
          timestamp: 'Just now',
          clinicalPearl: isAr
            ? 'القاعدة الذهبية: عند الشك في أي آفة شافة للأشعة عند قمة الجذر، اختبار حيوية اللب (Pulp Vitality) هو الخطوة الأولى دائماً.'
            : 'Clinical Golden Rule: Always verify pulp vitality before assigning periapical radiolucencies to endodontic origin.',
          actions: [
            {
              label: 'What should I study now?',
              labelAr: 'ماذا أدرس الآن؟',
              type: 'open_plan',
            },
            {
              label: 'Quiz me on high-yield topic',
              labelAr: 'اختبرني في سؤال سريري',
              type: 'start_focus',
            },
          ],
        };

        const defaultSession: ChatSession = {
          id: 'default-session',
          userId: currentUserId || 'guest',
          title: isAr ? 'المحادثة الأولى' : 'Study Session 1',
          titleAr: 'المحادثة الأولى',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [welcomeMessage],
        };

        setSessions([defaultSession]);
        setActiveSessionId(defaultSession.id);
        setMessages([welcomeMessage]);
      }
    };

    loadSavedChats();

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Sync current active session messages into sessions array & Firestore
  const persistMessages = (updatedMessages: ChatMessage[]) => {
    setMessages(updatedMessages);
    const updatedSessions = sessions.map((s) =>
      s.id === activeSessionId
        ? {
            ...s,
            messages: updatedMessages,
            updatedAt: new Date().toISOString(),
          }
        : s
    );
    setSessions(updatedSessions);

    if (currentUserId) {
      const activeSession = updatedSessions.find((s) => s.id === activeSessionId);
      if (activeSession) {
        saveUserChatSession(currentUserId, activeSession).catch(console.error);
      }
    }
  };

  // Start a New Chat
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newChatTitle = isAr
      ? `محادثة جديدة ${sessions.length + 1}`
      : `Chat ${sessions.length + 1}`;

    const initialTutorMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'tutor',
      text: isAr
        ? 'جلسة دراسية جديدة جاهزة! ما الموضوع السريري أو التساؤل الدراسي الذي نركز عليه الآن؟'
        : 'New study chat started! Which dental subject or question should we focus on now?',
      timestamp: 'Just now',
    };

    const newSession: ChatSession = {
      id: newSessionId,
      userId: currentUserId || 'guest',
      title: newChatTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [initialTutorMsg],
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setActiveSessionId(newSessionId);
    setMessages([initialTutorMsg]);
    setShowHistoryDropdown(false);

    if (currentUserId) {
      saveUserChatSession(currentUserId, newSession).catch(console.error);
    }
  };

  // Switch Active Chat
  const handleSelectSession = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      setActiveSessionId(target.id);
      setMessages(target.messages || []);
      setShowHistoryDropdown(false);
    }
  };

  // Delete Chat Session
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (sessions.length <= 1) return;

    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);

    if (activeSessionId === sessionId) {
      const nextSession = remaining[0];
      setActiveSessionId(nextSession.id);
      setMessages(nextSession.messages || []);
    }

    if (currentUserId) {
      await deleteUserChatSession(currentUserId, sessionId);
    }
  };

  // Rename Chat Session
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    const updated = sessions.map((s) =>
      s.id === sessionId ? { ...s, title: newTitle.trim() } : s
    );
    setSessions(updated);
    setEditingSessionTitle(null);

    if (currentUserId) {
      const target = updated.find((s) => s.id === sessionId);
      if (target) saveUserChatSession(currentUserId, target).catch(console.error);
    }
  };

  // Send Message with Simulated Smooth Streaming & Context Awareness
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isTyping) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    const updatedWithUser = [...messages, userMsg];
    persistMessages(updatedWithUser);
    setInputValue('');
    setIsTyping(true);
    abortControllerRef.current = false;

    // Generate intelligent, context-grounded response
    const context = buildContext();
    const generated = generateDentalTutorResponse(query, context);

    const tutorMsgId = `tutor-${Date.now() + 1}`;
    setStreamingMessageId(tutorMsgId);

    // Stream text smoothly character by character / chunks
    const fullText = generated.text;
    let currentLength = 0;
    const chunkSize = Math.max(3, Math.floor(fullText.length / 30));

    const placeholderTutorMsg: ChatMessage = {
      id: tutorMsgId,
      sender: 'tutor',
      text: '',
      timestamp: 'Just now',
      clinicalPearl: generated.clinicalPearl,
      actions: generated.actions,
      referencedData: generated.referencedData,
    };

    const intermediateMessages = [...updatedWithUser, placeholderTutorMsg];
    setMessages(intermediateMessages);

    const streamInterval = setInterval(() => {
      if (abortControllerRef.current) {
        clearInterval(streamInterval);
        setIsTyping(false);
        setStreamingMessageId(null);
        return;
      }

      currentLength += chunkSize;
      if (currentLength >= fullText.length) {
        clearInterval(streamInterval);
        placeholderTutorMsg.text = fullText;
        persistMessages([...updatedWithUser, placeholderTutorMsg]);
        setIsTyping(false);
        setStreamingMessageId(null);
      } else {
        placeholderTutorMsg.text = fullText.slice(0, currentLength);
        setMessages([...updatedWithUser, { ...placeholderTutorMsg }]);
      }
    }, 28);
  };

  // Stop Generation
  const handleStopGenerating = () => {
    abortControllerRef.current = true;
    setIsTyping(false);
    setStreamingMessageId(null);
  };

  // Regenerate Last Tutor Response
  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
    if (!lastUserMsg) return;
    handleSendMessage(lastUserMsg.text);
  };

  // Copy Message to Clipboard
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Handle Action Button Clicks
  const handleActionClick = (action: TutorActionButton) => {
    switch (action.type) {
      case 'start_task':
        if (action.taskId && onStartTask) {
          const target = tasks.find((t) => t.id === action.taskId);
          if (target) {
            onStartTask(target);
            return;
          }
        }
        // Fallback to starting first pending task or focus session
        if (tasks.length > 0 && onStartTask) {
          const pending = tasks.find((t) => t.status === 'pending') || tasks[0];
          onStartTask(pending);
        } else if (onNavigateToSection) {
          onNavigateToSection('today');
        }
        break;

      case 'open_plan':
        if (onNavigateToSection) onNavigateToSection('plan');
        break;

      case 'start_focus':
        if (tasks.length > 0 && onStartTask) {
          const pending = tasks.find((t) => t.status === 'pending') || tasks[0];
          onStartTask(pending);
        } else if (onNavigateToSection) {
          onNavigateToSection('today');
        }
        break;

      case 'replan_today':
        if (onBuildMyDay) {
          onBuildMyDay();
        } else if (onNavigateToSection) {
          onNavigateToSection('today');
        }
        break;

      case 'exam_rescue':
        if (onOpenExamRescue) {
          onOpenExamRescue();
        }
        break;

      case 'review_weak_topics':
        if (onNavigateToSection) {
          onNavigateToSection('courses');
        }
        break;

      case 'open_focus_recovery':
        if (onNavigateToSection) {
          onNavigateToSection('focus');
        }
        break;
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12 transition-all">
      {/* 1. Header with Mode Badge & Student Context Synchronization */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/10">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t.tutor.title}
                </h1>
                {/* Free Demo Mode Tag */}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                  {isAr ? 'ذكاء دراسي متزامن (بدون تكلفة)' : 'Context-Aware Dental Engine (Free Dev Mode)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr
                  ? 'مساعد دراسي مخصص لطلاب طب الأسنان · متزامن مع خطتكِ وامتحاناتكِ'
                  : 'Curriculum-grounded dental study companion · Synced with your real syllabus'}
              </p>
            </div>
          </div>

          {/* Current Real Stored Context Synchronization Pill */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs max-w-md">
            <div className="flex items-center justify-between gap-2 font-bold mb-1 text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{isAr ? 'البيانات المسجلة المتزامنة' : 'Real Stored Context'}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-100/70 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                {courses.length} {isAr ? 'مقررات' : 'Courses'}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
              <div className="flex items-center justify-between">
                <span>{isAr ? 'أقرب امتحان:' : 'Closest Exam:'}</span>
                <span className="font-semibold text-teal-700 dark:text-teal-400">
                  {nearestExam
                    ? `${isAr && nearestExam.courseNameAr ? nearestExam.courseNameAr : nearestExam.courseName} (${nearestExam.daysRemaining}d)`
                    : 'Oral Pathology (5d)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isAr ? 'سعة اليوم والمهام:' : "Today's Capacity & Tasks:"}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  {checkInState?.timeAvailable || '2h'} · {completedTasksCount}/{tasks.length || 4} done
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat History Selector & New Chat Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <button
              onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
              <span>{activeSession?.title || (isAr ? 'المحادثة الحالية' : 'Current Chat')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu of Sessions */}
            {showHistoryDropdown && (
              <div className="absolute start-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 p-2 space-y-1 animate-in fade-in">
                <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                  {isAr ? 'المحادثات السابقة' : 'Chat History'}
                </div>
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => handleSelectSession(sess.id)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      sess.id === activeSessionId
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate max-w-[140px]">{sess.title}</span>
                    <div className="flex items-center gap-1">
                      {sessions.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteSession(e, sess.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-md"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'محادثة جديدة' : 'New Chat'}</span>
          </button>
        </div>
      </div>

      {/* 2. Suggested Prompt Bubbles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>{isAr ? 'أسئلة وتوجيهات مقترحة:' : 'Suggested Study Prompts:'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-300 text-slate-700 dark:text-slate-300 shadow-2xs transition-all cursor-pointer text-start"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Chat Conversation Thread */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs min-h-[480px] flex flex-col justify-between space-y-4">
        <div className="space-y-5 overflow-y-auto max-h-[560px] pe-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isMsgArabic = detectArabicQuery(msg.text);

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                    DM
                  </div>
                )}

                <div
                  className={`max-w-2xl p-4 rounded-2xl text-xs md:text-sm leading-relaxed space-y-3 ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-br-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-100 dark:border-slate-700/60'
                  }`}
                  dir={isMsgArabic ? 'rtl' : 'ltr'}
                >
                  {/* Message Text with markdown line breaks */}
                  <div className="whitespace-pre-line space-y-2">
                    {msg.text || (
                      <span className="text-slate-400 italic">
                        {isAr ? 'جاري الصياغة...' : 'Formulating response...'}
                      </span>
                    )}
                  </div>

                  {/* Clinical Exam Pearl Box */}
                  {msg.clinicalPearl && (
                    <div
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-teal-800/80 text-teal-900 dark:text-teal-200 text-xs font-medium space-y-1"
                      dir={isMsgArabic ? 'rtl' : 'ltr'}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{isAr ? 'لؤلؤة سريرية للامتحان:' : 'Clinical Exam Pearl:'}</span>
                      </div>
                      <p>{msg.clinicalPearl}</p>
                    </div>
                  )}

                  {/* Action Buttons connected to DentalMind features */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                        {isAr ? 'الإجراءات المقترحة:' : 'Suggested Study Actions:'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleActionClick(act)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600/10 hover:bg-teal-600 text-teal-800 dark:text-teal-200 hover:text-white border border-teal-200 dark:border-teal-800 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Zap className="w-3 h-3 text-teal-600 dark:text-teal-400 hover:text-white" />
                            <span>{isAr && act.labelAr ? act.labelAr : act.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Footer: Timestamp & Copy Button */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="p-1 hover:text-teal-600 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy Response"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">{isAr ? 'تم النسخ' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{isAr ? 'نسخ' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 text-xs font-bold">
                    {(profile?.name || 'Dr')[0]}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator with Stop Generation */}
          {isTyping && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 text-xs text-teal-800 dark:text-teal-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
                <span>
                  {isAr
                    ? 'يقوم دنتال مايند بتحليل سؤالكِ مع مراجعة بياناتكِ السريرية...'
                    : 'DentalMind is formulating study guidance with your real context...'}
                </span>
              </div>
              <button
                onClick={handleStopGenerating}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <Square className="w-2.5 h-2.5 fill-current text-rose-500" />
                <span>{isAr ? 'إيقاف' : 'Stop'}</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. Chat Input Bar with Quick Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Quick Regenerate button if conversation exists */}
          {messages.length > 1 && !isTyping && (
            <div className="flex justify-end">
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-teal-600 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isAr ? 'إعادة الإجابة' : 'Regenerate response'}</span>
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isAr
                  ? 'اسألي دنتال مايند عن أي مقرر، تشخيص، خطة مذاكرة، أو اختبار...'
                  : 'Ask DentalMind about any dental topic, diagnosis, study plan, or spotter...'
              }
              className="flex-1 px-4 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              dir="auto"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>{t.tutor.send}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Academic revision disclaimer */}
          <p className="text-[10px] text-center text-slate-400">
            {isAr
              ? 'ملاحظة: هذا المساعد مخصص للدراسة والمراجعة الأكاديمية ولا يُغني عن الإشراف السريري المباشر في الكلية.'
              : 'Note: DentalMind is for academic study & exam revision. Clinical patient decisions require licensed faculty supervision.'}
          </p>
        </div>
      </div>
    </div>
  );
};
