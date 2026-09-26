/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, signOutUser } from './lib/firebase';
import {
  getUserProfile,
  saveUserProfile,
  getUserCourses,
  saveUserCourse,
  updateUserCourse,
  archiveUserCourse,
  restoreUserCourse,
  getUserExams,
  saveUserExam,
  updateUserExam,
  getTodayCheckIn,
  saveDailyCheckIn,
  getUserAchievements,
  saveUserAchievement,
  getUserTasks,
  saveUserTask,
  updateUserTask,
  getUserFocusReset,
  saveUserFocusResetDays,
  toggleUserFocusResetDay,
  getUserLectures,
  saveUserLecture,
  updateUserLecture,
  saveQuestionBankItem,
  savePracticeExamResult,
  updateExamUnit,
  logFocusSession,
  getUserFocusSessions,
  logCouldntFinish,
  saveDailyReview,
  getUserDailyReviews,
  getUserPaceProfile,
  saveUserPaceProfile,
  saveTodayPlan,
  getUserTodayPlan,
} from './services/userService';
import {
  Language,
  NavSection,
  ThemeMode,
  StudyTask,
  Course,
  Lecture,
  Exam,
  FocusResetDay,
  Achievement,
  UserProfile,
  DailyCheckInState,
  StudyUnit,
  FocusSessionLog,
  CouldntFinishReason,
  CouldntFinishAction,
  CouldntFinishLog,
  DailyReview,
  PaceProfile,
  QuestionBankItem,
  PracticeExamResult,
} from './types';
import {
  initialCourses,
  initialExams,
  initialFocusResetDays,
  initialLectures,
  initialTasks,
  initialUserProfile,
  initialAchievements,
} from './data/initialData';
import { translations } from './i18n/translations';
import {
  buildMyDayPlan,
  generateStarterUnitsForExam,
  calculatePaceMultiplier,
  calculateDailyCapacity,
  getDefaultCourseWorkload,
} from './services/plannerEngine';

// Components
import { AuthScreen } from './components/AuthScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CelebrationToast } from './components/CelebrationToast';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { FocusSessionModal } from './components/FocusSessionModal';
import { ReplanModal } from './components/ReplanModal';
import { ExamRescueModal } from './components/ExamRescueModal';
import { ReplanWeekModal } from './components/ReplanWeekModal';
import { EveningReviewModal } from './components/EveningReviewModal';
import { ManageUnitsModal } from './components/ManageUnitsModal';
import { AddCourseModal } from './components/AddCourseModal';
import { EditCourseModal } from './components/EditCourseModal';
import { AddLectureModal } from './components/AddLectureModal';
import { AddExamModal } from './components/AddExamModal';
import { AddAchievementModal } from './components/AddAchievementModal';

// Views
import { TodayView } from './views/TodayView';
import { CoursesView } from './views/CoursesView';
import { StudyPlanView } from './views/StudyPlanView';
import { LecturesView } from './views/LecturesView';
import { AITutorView } from './views/AITutorView';
import { ExamsView } from './views/ExamsView';
import { FocusRecoveryView } from './views/FocusRecoveryView';
import { AchievementsView } from './views/AchievementsView';
import { ProfileView } from './views/ProfileView';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Localization & Theme state
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [currentSection, setCurrentSection] = useState<NavSection>('today');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Core persistent data state
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>(initialLectures);
  const [exams, setExams] = useState<Exam[]>([]);
  const [focusResetDays, setFocusResetDays] = useState<FocusResetDay[]>(initialFocusResetDays);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [profile, setProfile] = useState<UserProfile>(initialUserProfile);

  // Daily Check-in & Calibration state
  const [checkInState, setCheckInState] = useState<DailyCheckInState>({
    completedToday: false,
    energy: 'okay',
    focus: 'average',
    timeAvailable: '2h',
    priority: 'exam_prep',
  });
  const [rescueModeActive, setRescueModeActive] = useState(false);
  const [streakDays, setStreakDays] = useState(6);
  const [studyMinutesToday, setStudyMinutesToday] = useState(0);

  // Modals state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [activeFocusTask, setActiveFocusTask] = useState<StudyTask | null>(null);
  const [replanTargetTask, setReplanTargetTask] = useState<StudyTask | null>(null);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isAddLectureOpen, setIsAddLectureOpen] = useState(false);
  const [activeWorkspaceLectureId, setActiveWorkspaceLectureId] = useState<string | null>(null);
  const [isAddAchievementOpen, setIsAddAchievementOpen] = useState(false);
  const [isExamRescueOpen, setIsExamRescueOpen] = useState(false);
  const [isEveningReviewOpen, setIsEveningReviewOpen] = useState(false);
  const [isReplanWeekOpen, setIsReplanWeekOpen] = useState(false);
  const [managingUnitsExam, setManagingUnitsExam] = useState<Exam | null>(null);
  const [isBuildingPlan, setIsBuildingPlan] = useState(false);
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);

  // Phase 3 planner data state
  const [dailyReviews, setDailyReviews] = useState<DailyReview[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSessionLog[]>([]);
  const [paceProfile, setPaceProfile] = useState<PaceProfile | null>(null);

  // Sync document direction and lang
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Sync dark mode class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Firebase Auth Lifecycle Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getUserProfile(user.uid);
          if (!userDoc || !userDoc.onboardingCompleted) {
            // New user or incomplete onboarding
            setShowOnboarding(true);
            setProfile({
              ...initialUserProfile,
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || 'Doctor',
              photoURL: user.photoURL || undefined,
            });
          } else {
            // Returning user: Load all isolated Firestore collections
            setShowOnboarding(false);
            setProfile(userDoc);
            if (userDoc.preferredLanguage) {
              setLanguage(userDoc.preferredLanguage);
            }

            // Load Courses
            const userCourses = await getUserCourses(user.uid);
            setCourses(userCourses);

            // Load Exams
            const userExams = await getUserExams(user.uid);
            setExams(userExams);

            // Load Tasks
            const userTasks = await getUserTasks(user.uid);
            setTasks(userTasks);

            // Calculate completed minutes today
            const doneMinutes = userTasks
              .filter((t) => t.status === 'completed')
              .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
            setStudyMinutesToday(doneMinutes);

            // Load Achievements
            const userAchievements = await getUserAchievements(user.uid);
            setAchievements(userAchievements);

            // Load Focus Reset
            const resetDaysData = await getUserFocusReset(user.uid);
            if (resetDaysData && resetDaysData.length > 0) {
              setFocusResetDays(resetDaysData);
            }

            // Load Today's Check-in
            const todayStr = new Date().toISOString().split('T')[0];
            const todayCheck = await getTodayCheckIn(user.uid, todayStr);
            if (todayCheck) {
              setCheckInState(todayCheck);
            }

            // Load Lectures
            const userLectures = await getUserLectures(user.uid);
            if (userLectures && userLectures.length > 0) {
              setLectures(userLectures);
            }

            // Load Daily Reviews
            const userReviews = await getUserDailyReviews(user.uid);
            if (userReviews && userReviews.length > 0) {
              setDailyReviews(userReviews);
            }

            // Load Focus Sessions
            const userSessions = await getUserFocusSessions(user.uid);
            if (userSessions && userSessions.length > 0) {
              setFocusSessions(userSessions);
            }

            // Load Pace Profile
            const pace = await getUserPaceProfile(user.uid);
            if (pace) {
              setPaceProfile(pace);
            }
          }
        } catch (err) {
          console.error('Error hydrating user data:', err);
        }
      } else {
        // Logged out
        setShowOnboarding(false);
        setTasks([]);
        setCourses([]);
        setExams([]);
        setAchievements([]);
        setLectures([]);
        setDailyReviews([]);
        setFocusSessions([]);
        setPaceProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    setLanguage(nextLang);
    if (currentUser) {
      saveUserProfile(currentUser.uid, { preferredLanguage: nextLang }).catch(console.error);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCelebrationToast(
        language === 'ar' ? 'تم تسجيل الخروج بنجاح.' : 'Signed out successfully.'
      );
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // First-Time Onboarding Completion
  const handleCompleteOnboarding = async (data: {
    profile: Partial<UserProfile>;
    courses: Course[];
    firstExam?: Exam;
  }) => {
    if (!currentUser) return;

    try {
      const fullProfile: UserProfile = {
        ...initialUserProfile,
        ...data.profile,
        uid: currentUser.uid,
        email: currentUser.email || '',
        photoURL: currentUser.photoURL || undefined,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
      };

      // 1. Save Profile
      await saveUserProfile(currentUser.uid, fullProfile);
      setProfile(fullProfile);

      // 2. Save Selected Courses
      for (const c of data.courses) {
        await saveUserCourse(currentUser.uid, c);
      }
      setCourses(data.courses);

      // 3. Save First Exam or suggested upcoming midterm
      if (data.firstExam) {
        await saveUserExam(currentUser.uid, data.firstExam);
        setExams([data.firstExam]);
      } else if (data.courses.length > 0) {
        const primaryCourse = data.courses[0];
        const suggestedExam: Exam = {
          id: `exam-${Date.now()}`,
          userId: currentUser.uid,
          courseName: primaryCourse.name,
          examType: 'Midterm',
          examTitle: `${primaryCourse.name} Midterm Exam`,
          examDate: '2026-10-25',
          daysRemaining: 31,
          preparationPercent: 40,
          initialPreparationPercent: 40,
          targetGrade: '90%+',
          topicsRemainingCount: 4,
          highYieldTopics: [
            'Key Histopathology Signs',
            'Differential Diagnostic Criteria',
            'University MCQs & Case Pearls',
          ],
          createdAt: new Date().toISOString(),
        };
        await saveUserExam(currentUser.uid, suggestedExam);
        setExams([suggestedExam]);
      }

      // 4. Initialize starter tasks tailored to their chosen courses
      const primaryCourse = data.courses[0] || { name: 'Oral Pathology', color: 'teal', id: 'course-1' };
      const secondaryCourse = data.courses[1] || primaryCourse;
      const starterTasks: StudyTask[] = [
        {
          id: `task-${Date.now()}-1`,
          userId: currentUser.uid,
          courseId: primaryCourse.id,
          courseName: primaryCourse.name,
          courseColor: primaryCourse.color,
          title: `${primaryCourse.name} — Core Concepts & Diagnostic Criteria`,
          durationMinutes: 45,
          status: 'pending',
          type: 'lecture',
          date: new Date().toISOString().split('T')[0],
        },
        {
          id: `task-${Date.now()}-2`,
          userId: currentUser.uid,
          courseId: primaryCourse.id,
          courseName: primaryCourse.name,
          courseColor: primaryCourse.color,
          title: `${primaryCourse.name} — High-Yield Review & MCQs`,
          durationMinutes: 30,
          status: 'pending',
          type: 'mcq',
          date: new Date().toISOString().split('T')[0],
        },
        {
          id: `task-${Date.now()}-3`,
          userId: currentUser.uid,
          courseId: secondaryCourse.id,
          courseName: secondaryCourse.name,
          courseColor: secondaryCourse.color,
          title: `${secondaryCourse.name} — Lecture 1 Review & Clinical Cases`,
          durationMinutes: 30,
          status: 'pending',
          type: 'review',
          date: new Date().toISOString().split('T')[0],
        },
      ];

      for (const t of starterTasks) {
        await saveUserTask(currentUser.uid, t);
      }
      setTasks(starterTasks);

      // 5. Seed starter lecture notes for primary course
      const starterLecture: Lecture = {
        id: `lec-${Date.now()}`,
        userId: currentUser.uid,
        courseId: primaryCourse.id,
        courseName: primaryCourse.name,
        title: `${primaryCourse.name}: Core Diagnostic Criteria & Histopathology`,
        titleAr: `${primaryCourse.nameAr || primaryCourse.name}: المعايير التشخيصية والعلامات النسيجية المرضية`,
        format: 'notes',
        dateAdded: 'Today',
        durationMin: 35,
        isHighYield: true,
        status: 'not_started',
        explanation: `Essential diagnostic pearls and clinical distinctions for ${primaryCourse.name}. Emphasizes key histology patterns and differential diagnosis.`,
        highYieldSummary: [
          'Classic radiographic presentation and border characteristics (corticated vs non-corticated)',
          'Cellular morphology, hallmark stromal patterns, and immunohistochemical profile',
          'Clinical staging and university exam differential diagnosis guidelines',
        ],
        notes: `Comprehensive high-yield student notes for ${primaryCourse.name}, generated and curated by your DentalMind companion.`,
        mcqs: [
          {
            id: `mcq-${Date.now()}-1`,
            question: `Which radiographic presentation is most pathognomonic for major odontogenic lesions in ${primaryCourse.name}?`,
            questionAr: `ما هو المظهر الشعاعي الأكثر دلالة على الآفات سنية المنشأ في مقرر ${primaryCourse.nameAr || primaryCourse.name}؟`,
            options: [
              'Well-demarcated multilocular "soap-bubble" radiolucency',
              'Diffuse poorly circumscribed radiopacity',
              'Mixed radiolucent-radiopaque ground glass appearance',
              'Punched-out osteolytic radiolucency without cortication',
            ],
            correctIndex: 0,
            explanation:
              'Classic multilocular radiolucency with soap-bubble or honeycomb pattern indicates prominent follicular odontogenic lesions.',
            clinicalPearl:
              'Always evaluate expansion of buccal and lingual cortical plates on occlusal or CBCT views.',
          },
        ],
        flashcards: [
          {
            id: `fc-${Date.now()}-1`,
            term: 'Ameloblastoma Hallmark',
            definition:
              'Palisading columnar peripheral ameloblast-like cells with reverse nuclear polarity and central stellate reticulum.',
            category: 'Histopathology',
          },
        ],
        fillInBlanks: [
          {
            sentence: 'The peripheral layer of cells shows reverse nuclear ______ in ameloblastoma.',
            missingWord: 'polarity',
            hint: 'Nuclei polarized away from the basement membrane',
          },
        ],
      };

      await saveUserLecture(currentUser.uid, starterLecture);
      setLectures([starterLecture]);

      // 6. Initialize focus reset days
      await saveUserFocusResetDays(currentUser.uid, initialFocusResetDays);
      setFocusResetDays(initialFocusResetDays);

      // 7. Record requested welcome achievement badge: "Dental Journey Begun 🦷"
      const welcomeAch: Achievement = {
        id: `ach-welcome-${Date.now()}`,
        userId: currentUser.uid,
        title: 'Dental Journey Begun 🦷',
        titleAr: 'بداية رحلة طب الأسنان 🦷',
        category: 'streak',
        timestamp: 'Just now',
        date: new Date().toISOString().split('T')[0],
        isManual: false,
      };
      await saveUserAchievement(currentUser.uid, welcomeAch);
      setAchievements([welcomeAch]);

      setShowOnboarding(false);
      setCelebrationToast(
        language === 'ar'
          ? 'أهلاً بكِ دكتورة! تم بناء يومكِ الدراسي الأول بنجاح. ✨'
          : 'Welcome Doctor! Your first study day has been built. ✨'
      );
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    }
  };

  // Smart Study Planner: Build My Day
  const handleGenerateDayPlan = async (customCheckIn?: DailyCheckInState) => {
    setIsBuildingPlan(true);
    const activeCheckIn = customCheckIn || checkInState;
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const generatedPlan = buildMyDayPlan({
        courses,
        exams,
        checkIn: activeCheckIn,
        existingTasks: tasks,
        profile,
        paceMultiplier: paceProfile?.paceMultiplier || 1.0,
      });

      setTasks(generatedPlan);

      if (currentUser) {
        for (const t of generatedPlan) {
          await saveUserTask(currentUser.uid, t);
        }
        await saveTodayPlan(currentUser.uid, todayStr, generatedPlan);
      }

      setCelebrationToast(
        language === 'ar'
          ? 'تم بناء خطتكِ الدراسية الذكية لليوم بدقة سريرية! ✨'
          : 'Smart study day successfully generated from your curriculum & exam pace! ✨'
      );
    } catch (err) {
      console.error('Error generating daily study plan:', err);
    } finally {
      setIsBuildingPlan(false);
    }
  };

  // Task Completion Handlers
  const handleDoneTask = async (
    task: StudyTask,
    actualMinutes?: number,
    confidenceAfter?: number
  ) => {
    const isCurrentlyDone = task.status === 'completed';
    const newStatus = isCurrentlyDone ? 'pending' : 'completed';
    const minutesSpent = actualMinutes !== undefined ? actualMinutes : task.durationMinutes;

    const updatedTask: StudyTask = {
      ...task,
      status: newStatus,
      completedAt: newStatus === 'completed' ? 'Just now' : undefined,
      actualMinutesSpent: newStatus === 'completed' ? minutesSpent : undefined,
    };

    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));

    if (currentUser) {
      updateUserTask(currentUser.uid, task.id, {
        status: newStatus,
        completedAt: updatedTask.completedAt,
        actualMinutesSpent: updatedTask.actualMinutesSpent,
      }).catch(console.error);

      // If associated with exam unit, update the unit in exam
      if (task.examId && task.unitId) {
        updateExamUnit(currentUser.uid, task.examId, task.unitId, {
          status: newStatus === 'completed' ? 'completed' : 'in_progress',
          confidence: confidenceAfter !== undefined ? confidenceAfter : undefined,
        }).catch(console.error);

        // Update locally in exams state
        setExams((prev) =>
          prev.map((ex) => {
            if (ex.id !== task.examId) return ex;
            const updatedUnits = (ex.units || []).map((u) =>
              u.id === task.unitId
                ? {
                    ...u,
                    status: (newStatus === 'completed' ? 'completed' : 'in_progress') as StudyUnit['status'],
                    confidence: confidenceAfter !== undefined ? confidenceAfter : u.confidence,
                  }
                : u
            );
            const compCount = updatedUnits.filter((u) => u.status === 'completed').length;
            const prepPercent =
              updatedUnits.length > 0 ? Math.round((compCount / updatedUnits.length) * 100) : ex.preparationPercent;
            return {
              ...ex,
              units: updatedUnits,
              preparationPercent: prepPercent,
              topicsRemainingCount: Math.max(0, updatedUnits.length - compCount),
            };
          })
        );
      }
    }

    if (!isCurrentlyDone) {
      setStudyMinutesToday((prev) => prev + minutesSpent);
      setCelebrationToast(translations[language].today.taskCompletedToast);

      // Save Achievement to Firestore
      const newAch: Achievement = {
        id: `ach-${Date.now()}`,
        userId: currentUser?.uid,
        title: `Completed ${task.title}`,
        titleAr: `تم إنجاز ${task.title}`,
        category: 'lecture',
        courseName: task.courseName,
        timestamp: 'Today · Just now',
        date: new Date().toISOString().split('T')[0],
        isManual: false,
      };
      setAchievements((prev) => [newAch, ...prev]);
      if (currentUser) {
        saveUserAchievement(currentUser.uid, newAch).catch(console.error);
      }
    } else {
      setStudyMinutesToday((prev) => Math.max(0, prev - minutesSpent));
    }
  };

  // Focus Session Finish Handler
  const handleFinishFocusSession = async (
    task: StudyTask,
    actualMinutes: number,
    feedback: 'Easy' | 'Good' | 'Difficult' | 'Very difficult',
    confidenceAfter: number,
    notes?: string
  ) => {
    if (!currentUser) return;

    // 1. Log focus session
    const sessionLog: FocusSessionLog = {
      id: `session-${Date.now()}`,
      userId: currentUser.uid,
      taskId: task.id,
      examId: task.examId,
      unitId: task.unitId,
      courseName: task.courseName,
      taskTitle: task.title,
      estimatedMinutes: task.durationMinutes,
      actualMinutes,
      feedback,
      confidenceAfter,
      notes,
      completedAt: new Date().toISOString(),
    };

    setFocusSessions((prev) => [sessionLog, ...prev]);
    logFocusSession(currentUser.uid, sessionLog).catch(console.error);

    // 2. Adaptive Pace update
    const paceResult = calculatePaceMultiplier(paceProfile, {
      estimatedMinutes: task.durationMinutes,
      actualMinutes,
    });
    const updatedPace: PaceProfile = {
      paceMultiplier: paceResult.multiplier,
      completedSessionsCount: paceResult.sessionCount,
      recentSessions: [
        ...(paceProfile?.recentSessions || []),
        {
          estimatedMinutes: task.durationMinutes,
          actualMinutes,
          timestamp: new Date().toISOString(),
        },
      ].slice(-10),
    };
    setPaceProfile(updatedPace);
    saveUserPaceProfile(currentUser.uid, updatedPace).catch(console.error);

    // 3. Mark task completed and update unit & study time
    await handleDoneTask(task, actualMinutes, confidenceAfter);

    setActiveFocusTask(null);
  };

  // Replan Handlers when "Couldn't finish" is pressed
  const handleResolveCouldntFinish = async (
    task: StudyTask,
    reason: CouldntFinishReason,
    action: CouldntFinishAction
  ) => {
    if (!currentUser) return;

    // 1. Log reason in Firestore
    const logEntry: CouldntFinishLog = {
      id: `cf-${Date.now()}`,
      userId: currentUser.uid,
      taskId: task.id,
      courseName: task.courseName,
      taskTitle: task.title,
      reason,
      actionTaken: action,
      timestamp: new Date().toISOString(),
    };
    logCouldntFinish(currentUser.uid, logEntry).catch(console.error);

    // 2. Perform selected action
    if (action === 'Move to later today') {
      setTasks((prev) => {
        const remaining = prev.filter((t) => t.id !== task.id);
        return [...remaining, { ...task, status: 'pending' }];
      });
      setCelebrationToast(
        language === 'ar' ? 'تم تأجيل المهمة إلى وقت لاحق من اليوم.' : 'Task shifted to later today.'
      );
    } else if (action === 'Move to tomorrow') {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: 'rescheduled' } : t))
      );
      updateUserTask(currentUser.uid, task.id, { status: 'rescheduled' }).catch(console.error);
      setCelebrationToast(
        language === 'ar'
          ? 'تم ترحيل المهمة إلى غد بكل هدوء. راحة مستحقة!'
          : 'Task moved to tomorrow with zero pressure. Rest well tonight!'
      );
    } else if (action === 'Split into smaller tasks') {
      const halfMins1 = Math.max(15, Math.floor(task.durationMinutes / 2));
      const halfMins2 = Math.max(15, task.durationMinutes - halfMins1);
      const sub1: StudyTask = {
        ...task,
        id: `task-${Date.now()}-part1`,
        title: `${task.title} (Part 1 — Core Overview)`,
        durationMinutes: halfMins1,
        status: 'pending',
      };
      const sub2: StudyTask = {
        ...task,
        id: `task-${Date.now()}-part2`,
        title: `${task.title} (Part 2 — Deep Recall)`,
        durationMinutes: halfMins2,
        status: 'pending',
      };

      setTasks((prev) => {
        const idx = prev.findIndex((t) => t.id === task.id);
        if (idx === -1) return [...prev, sub1, sub2];
        const copy = [...prev];
        copy.splice(idx, 1, sub1, sub2);
        return copy;
      });

      saveUserTask(currentUser.uid, sub1).catch(console.error);
      saveUserTask(currentUser.uid, sub2).catch(console.error);

      setCelebrationToast(
        language === 'ar'
          ? 'تم تقسيم المهمة إلى جلستين خفيفتين بتركيز أسهل!'
          : 'Task split into two bite-sized, manageable blocks!'
      );
    } else if (action === 'Replan my week') {
      setIsReplanWeekOpen(true);
    }

    setReplanTargetTask(null);
  };

  // Exam Rescue Plan application
  const handleApplyRescuePlan = async (exam: Exam, rescueTasks: StudyTask[]) => {
    setRescueModeActive(true);
    const completed = tasks.filter((t) => t.status === 'completed');
    const newTasks = [...completed, ...rescueTasks];
    setTasks(newTasks);

    if (currentUser) {
      for (const t of rescueTasks) {
        await saveUserTask(currentUser.uid, t);
      }
    }

    setIsExamRescueOpen(false);
    setCelebrationToast(
      language === 'ar'
        ? `تم تشغيل خطة الإنقاذ لمقرر ${exam.courseName}! تم التركيز 100% على النقاط السريرية عالية العائد.`
        : `Exam Rescue Plan applied for ${exam.courseName}! Tasks focused strictly on high-yield clinical essentials.`
    );
  };

  // Manage Units in Exam
  const handleSaveUnits = async (examId: string, units: StudyUnit[]) => {
    const completedCount = units.filter((u) => u.status === 'completed').length;
    const prepPercent =
      units.length > 0 ? Math.round((completedCount / units.length) * 100) : 0;

    setExams((prev) =>
      prev.map((ex) =>
        ex.id === examId
          ? {
              ...ex,
              units,
              preparationPercent: prepPercent,
              topicsRemainingCount: Math.max(0, units.length - completedCount),
            }
          : ex
      )
    );

    if (currentUser) {
      updateUserExam(currentUser.uid, examId, {
        units,
        preparationPercent: prepPercent,
        topicsRemainingCount: Math.max(0, units.length - completedCount),
      }).catch(console.error);
    }

    setManagingUnitsExam(null);
    setCelebrationToast(
      language === 'ar' ? 'تم حفظ وتحديث فصول ووحدات الامتحان بنجاح!' : 'Exam study units updated and saved!'
    );
  };

  // Daily Evening Review save
  const handleSaveDailyReview = async (review: DailyReview) => {
    setDailyReviews((prev) => [review, ...prev.filter((r) => r.dateKey !== review.dateKey)]);
    if (currentUser) {
      await saveDailyReview(currentUser.uid, review);
    }
    setIsEveningReviewOpen(false);
    setCelebrationToast(
      language === 'ar'
        ? 'تم حفظ تقييم اليوم وتجهيز خطة الغد بهدوء! نوم هنيء دكتورة. 🌙'
        : 'Daily evening review saved! Tomorrow’s roadmap is calibrated. Rest well tonight. 🌙'
    );
  };

  // Daily Check-In completion
  const handleBuildMyDay = async (prefs: {
    energy: DailyCheckInState['energy'];
    focus: DailyCheckInState['focus'];
    time: DailyCheckInState['timeAvailable'];
    priority: DailyCheckInState['priority'];
  }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newCheckIn: DailyCheckInState = {
      completedToday: true,
      energy: prefs.energy,
      focus: prefs.focus,
      timeAvailable: prefs.time,
      priority: prefs.priority,
      lastCompletedDate: todayStr,
      timestamp: new Date().toISOString(),
    };

    setCheckInState(newCheckIn);

    if (currentUser) {
      await saveDailyCheckIn(currentUser.uid, todayStr, newCheckIn);
    }

    await handleGenerateDayPlan(newCheckIn);
  };

  // Focus reset day toggle
  const handleToggleResetDay = async (dayNum: number) => {
    const targetDay = focusResetDays.find((d) => d.dayNumber === dayNum);
    const newCompleted = targetDay ? !targetDay.completed : true;

    setFocusResetDays((prev) =>
      prev.map((d) => (d.dayNumber === dayNum ? { ...d, completed: newCompleted } : d))
    );

    if (currentUser) {
      toggleUserFocusResetDay(currentUser.uid, dayNum, newCompleted).catch(console.error);
    }
  };

  // Add course
  const handleAddCourse = async (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    if (currentUser) {
      await saveUserCourse(currentUser.uid, newCourse);
    }
    setCelebrationToast(
      language === 'ar' ? 'تمت إضافة المقرر الجديد وحفظه في حسابكِ!' : 'New course enrolled and saved to your account!'
    );
  };

  // Edit course
  const handleUpdateCourse = async (courseId: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updates } : c))
    );
    if (currentUser) {
      await updateUserCourse(currentUser.uid, courseId, updates);
    }
    setCelebrationToast(
      language === 'ar' ? 'تم تحديث بيانات المقرر بنجاح!' : 'Course updated successfully!'
    );
  };

  // Archive course
  const handleArchiveCourse = async (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: 'archived' } : c))
    );
    if (currentUser) {
      await archiveUserCourse(currentUser.uid, courseId);
    }
    setCelebrationToast(
      language === 'ar' ? 'تمت أرشفة المقرر الدراسي مع الحفاظ على إنجازاتكِ.' : 'Course archived safely.'
    );
  };

  // Restore course
  const handleRestoreCourse = async (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: 'active' } : c))
    );
    if (currentUser) {
      await restoreUserCourse(currentUser.uid, courseId);
    }
    setCelebrationToast(
      language === 'ar' ? 'تمت استعادة المقرر إلى المقررات النشطة.' : 'Course restored to active list.'
    );
  };

  // Add exam
  const handleAddExam = async (newExam: Exam) => {
    setExams((prev) => [newExam, ...prev]);
    if (currentUser) {
      await saveUserExam(currentUser.uid, newExam);
    }
    setCelebrationToast(
      language === 'ar' ? 'تمت جدولة الامتحان وحساب العد التنازلي!' : 'Exam tracked! Countdown pacing active.'
    );
  };

  // Add lecture
  const handleAddLecture = (newLecture: Lecture) => {
    setLectures((prev) => [newLecture, ...prev]);
    setCurrentSection('lectures');
    setActiveWorkspaceLectureId(newLecture.id);
    if (currentUser) {
      saveUserLecture(currentUser.uid, {
        ...newLecture,
        userId: currentUser.uid,
      }).catch(console.error);
    }
    setCelebrationToast(
      language === 'ar'
        ? 'تم رفع وتحليل المحاضرة وفتح مساحة الدراسة فوراً! ✨'
        : 'Lecture created! Opening your dedicated study workspace... ✨'
    );
  };

  // Update lecture
  const handleUpdateLecture = (updated: Lecture) => {
    setLectures((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    if (currentUser) {
      updateUserLecture(currentUser.uid, updated.id, updated).catch(console.error);
    }
  };

  // Save question to permanent course question bank
  const handleSaveQuestionToBank = (item: QuestionBankItem) => {
    if (currentUser) {
      saveQuestionBankItem(currentUser.uid, item).catch(console.error);
    }
    setCelebrationToast(
      language === 'ar'
        ? 'تم حفظ السؤال في بنك أسئلة المقرر الدائم! 📚'
        : 'Saved to course question bank! 📚'
    );
  };

  // Save practice exam result
  const handleSavePracticeExamResult = (result: PracticeExamResult) => {
    if (currentUser) {
      savePracticeExamResult(currentUser.uid, result).catch(console.error);
    }
  };

  // Trigger achievement from lecture activity
  const handleTriggerAchievement = (title: string, titleAr: string) => {
    const newAch: Achievement = {
      id: `ach-${Date.now()}`,
      userId: currentUser?.uid,
      title,
      titleAr,
      category: 'lecture',
      timestamp: 'Today · Just now',
      date: new Date().toISOString().split('T')[0],
      isManual: false,
    };
    setAchievements((prev) => [newAch, ...prev]);
    if (currentUser) {
      saveUserAchievement(currentUser.uid, newAch).catch(console.error);
    }
    setCelebrationToast(language === 'ar' ? `إنجاز جديد: ${titleAr} 🏆` : `Achievement unlocked: ${title} 🏆`);
  };

  // Add manual achievement
  const handleAddAchievement = async (newAch: Achievement) => {
    setAchievements((prev) => [newAch, ...prev]);
    if (currentUser) {
      await saveUserAchievement(currentUser.uid, newAch);
    }
    setCelebrationToast(
      language === 'ar' ? 'تم حفظ إنجازكِ السريري الجديد! 🦷✨' : 'New achievement saved! 🦷✨'
    );
  };

  // Update profile
  const handleUpdateProfile = async (updated: UserProfile) => {
    setProfile(updated);
    if (currentUser) {
      await saveUserProfile(currentUser.uid, updated);
    }
  };

  // Find nearest upcoming exam
  const sortedExams = [...exams].sort((a, b) => a.daysRemaining - b.daysRemaining);
  const nearestExam = sortedExams.length > 0 ? sortedExams[0] : null;

  // Format study time
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const hours = Math.floor(studyMinutesToday / 60);
  const mins = studyMinutesToday % 60;
  const studyTimeFormatted = `${hours}h ${mins > 0 ? `${mins}m` : ''}`;

  // 1. Loading State while checking Firebase Auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg animate-bounce">
          <span className="text-xl font-bold">DM</span>
        </div>
        <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
          Loading DentalMind...
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State -> Render Welcome / Auth Screen
  if (!currentUser) {
    return (
      <AuthScreen
        onAuthSuccess={(user) => setCurrentUser(user)}
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // 3. First-Time User Onboarding Modal
  if (showOnboarding) {
    return (
      <OnboardingModal
        initialName={currentUser.displayName || ''}
        initialEmail={currentUser.email || ''}
        onComplete={handleCompleteOnboarding}
        language={language}
        onLanguageChange={(lang) => setLanguage(lang)}
      />
    );
  }

  // 4. Authenticated Main Application
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Sidebar for Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(section) => setCurrentSection(section)}
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCheckIn={() => setIsCheckInOpen(true)}
        streakDays={streakDays}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          language === 'ar' ? 'lg:mr-64' : 'lg:ml-64'
        }`}
      >
        {/* Top Header */}
        <TopHeader
          currentSection={currentSection}
          onSelectSection={(section) => setCurrentSection(section)}
          language={language}
          onToggleLanguage={toggleLanguage}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenCheckIn={() => setIsCheckInOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          completedTasksCount={completedTasksCount}
          totalTasksCount={tasks.length}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentSection === 'today' && (
            <TodayView
              tasks={tasks}
              userName={profile.name || currentUser.displayName || 'Doctor'}
              nearestExam={nearestExam}
              courses={courses}
              exams={exams}
              dailyReviews={dailyReviews}
              focusSessions={focusSessions}
              onStartTask={(task) => setActiveFocusTask(task)}
              onDoneTask={(task) => handleDoneTask(task)}
              onCantFinishTask={(task) => setReplanTargetTask(task)}
              onBuildMyDay={() => handleGenerateDayPlan()}
              onOpenCheckIn={() => setIsCheckInOpen(true)}
              onOpenExamRescue={() => setIsExamRescueOpen(true)}
              onOpenReplanWeek={() => setIsReplanWeekOpen(true)}
              onOpenEveningReview={() => setIsEveningReviewOpen(true)}
              onNavigateToTutor={() => setCurrentSection('tutor')}
              onNavigateToCourses={() => setCurrentSection('courses')}
              onNavigateToLectures={() => setCurrentSection('lectures')}
              checkInState={checkInState}
              streakDays={streakDays}
              studyTimeFormatted={studyTimeFormatted}
              weeklyProgressPercent={tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}
              language={language}
              rescueModeActive={rescueModeActive}
              isBuildingPlan={isBuildingPlan}
            />
          )}

          {currentSection === 'courses' && (
            <CoursesView
              courses={courses}
              onOpenAddCourse={() => setIsAddCourseOpen(true)}
              onOpenEditCourse={(course) => setEditingCourse(course)}
              language={language}
            />
          )}

          {currentSection === 'plan' && (
            <StudyPlanView
              tasks={tasks}
              onOpenExamRescue={() => setIsExamRescueOpen(true)}
              language={language}
              rescueModeActive={rescueModeActive}
            />
          )}

          {currentSection === 'lectures' && (
            <LecturesView
              lectures={lectures}
              courses={courses}
              onOpenAddLecture={() => setIsAddLectureOpen(true)}
              onUpdateLecture={handleUpdateLecture}
              onSaveQuestionToBank={handleSaveQuestionToBank}
              onSavePracticeExamResult={handleSavePracticeExamResult}
              onTriggerAchievement={handleTriggerAchievement}
              language={language}
              activeLectureId={activeWorkspaceLectureId}
              onSelectLectureId={setActiveWorkspaceLectureId}
            />
          )}

          {currentSection === 'tutor' && (
            <AITutorView
              courses={courses}
              exams={exams}
              tasks={tasks}
              checkInState={checkInState}
              profile={profile}
              achievements={achievements}
              streakDays={streakDays}
              studyMinutesToday={studyMinutesToday}
              language={language}
              currentUserId={currentUser?.uid}
              onStartTask={(task) => setActiveFocusTask(task)}
              onNavigateToSection={(section) => setCurrentSection(section)}
              onOpenExamRescue={() => setIsExamRescueOpen(true)}
              onBuildMyDay={() => handleGenerateDayPlan()}
            />
          )}

          {currentSection === 'exams' && (
            <ExamsView
              exams={exams}
              onOpenExamRescue={() => setIsExamRescueOpen(true)}
              onOpenAddExam={() => setIsAddExamOpen(true)}
              onManageUnits={(exam) => setManagingUnitsExam(exam)}
              language={language}
            />
          )}

          {currentSection === 'focus' && (
            <FocusRecoveryView
              resetDays={focusResetDays}
              onToggleDayCompleted={handleToggleResetDay}
              language={language}
            />
          )}

          {currentSection === 'achievements' && (
            <AchievementsView
              achievements={achievements}
              onOpenLogModal={() => setIsAddAchievementOpen(true)}
              streakDays={streakDays}
              onShareWrapped={() =>
                setCelebrationToast(
                  language === 'ar'
                    ? 'تم نسخ ملخص إنجازاتكِ وجاهز للمشاركة! ✨'
                    : 'September Wrapped snapshot copied & ready to share! ✨'
                )
              }
              language={language}
            />
          )}

          {currentSection === 'profile' && (
            <ProfileView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onSignOut={handleSignOut}
              language={language}
              onToggleLanguage={toggleLanguage}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )}
        </main>
      </div>

      {/* Floating Celebration Toast */}
      <CelebrationToast
        message={celebrationToast}
        onDismiss={() => setCelebrationToast(null)}
      />

      {/* Daily Check-in Modal */}
      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onBuildMyDay={handleBuildMyDay}
        language={language}
      />

      {/* Active Focus Session Timer Modal */}
      <FocusSessionModal
        task={activeFocusTask}
        isOpen={activeFocusTask !== null}
        onClose={() => setActiveFocusTask(null)}
        onFinishSession={handleFinishFocusSession}
        completedTasksCount={completedTasksCount}
        totalTasksCount={tasks.length}
        language={language}
      />

      {/* Replan Modal (Couldn't finish) */}
      <ReplanModal
        task={replanTargetTask}
        isOpen={replanTargetTask !== null}
        onClose={() => setReplanTargetTask(null)}
        onResolve={handleResolveCouldntFinish}
        onOpenReplanWeek={() => setIsReplanWeekOpen(true)}
        language={language}
      />

      {/* Exam Rescue Mode Modal */}
      <ExamRescueModal
        isOpen={isExamRescueOpen}
        onClose={() => setIsExamRescueOpen(false)}
        exams={exams}
        courses={courses}
        onApplyRescuePlan={handleApplyRescuePlan}
        language={language}
      />

      {/* Manage Syllabus Units Modal */}
      <ManageUnitsModal
        exam={managingUnitsExam}
        isOpen={managingUnitsExam !== null}
        onClose={() => setManagingUnitsExam(null)}
        onSaveUnits={handleSaveUnits}
        language={language}
      />

      {/* Evening Reflection & Review Modal */}
      <EveningReviewModal
        isOpen={isEveningReviewOpen}
        onClose={() => setIsEveningReviewOpen(false)}
        tasks={tasks}
        courses={courses}
        exams={exams}
        onSaveReview={handleSaveDailyReview}
        language={language}
      />

      {/* Replan Week Modal */}
      <ReplanWeekModal
        isOpen={isReplanWeekOpen}
        onClose={() => setIsReplanWeekOpen(false)}
        courses={courses}
        exams={exams}
        dailyCapacityMinutes={calculateDailyCapacity(checkInState, profile).totalMinutes}
        onOpenExamRescue={() => {
          setIsReplanWeekOpen(false);
          setIsExamRescueOpen(true);
        }}
        onIncreaseDailyTarget={() => {
          setCelebrationToast(
            language === 'ar'
              ? 'تمت زيادة الهدف اليومي لموازنة الخطة الدراسية!'
              : 'Daily study target adjusted to rebalance syllabus pace!'
          );
          setIsReplanWeekOpen(false);
        }}
        onPrioritizeEssential={() => {
          setCelebrationToast(
            language === 'ar'
              ? 'تم ترتيب أولويات الوحدات الأساسية ذات العائد السريري الأعلى!'
              : 'Essential high-yield topics prioritized!'
          );
          setIsReplanWeekOpen(false);
        }}
        language={language}
      />

      {/* Add Course Modal */}
      <AddCourseModal
        isOpen={isAddCourseOpen}
        onClose={() => setIsAddCourseOpen(false)}
        onAddCourse={handleAddCourse}
        language={language}
      />

      {/* Edit Course Modal */}
      <EditCourseModal
        course={editingCourse}
        isOpen={editingCourse !== null}
        onClose={() => setEditingCourse(null)}
        onUpdateCourse={handleUpdateCourse}
        onArchiveCourse={handleArchiveCourse}
        onRestoreCourse={handleRestoreCourse}
        language={language}
      />

      {/* Add Exam Modal */}
      <AddExamModal
        isOpen={isAddExamOpen}
        onClose={() => setIsAddExamOpen(false)}
        courses={courses}
        onAddExam={handleAddExam}
        language={language}
      />

      {/* Add Lecture Modal */}
      <AddLectureModal
        isOpen={isAddLectureOpen}
        onClose={() => setIsAddLectureOpen(false)}
        courses={courses}
        onAddLecture={handleAddLecture}
        language={language}
      />

      {/* Add Manual Achievement Modal */}
      <AddAchievementModal
        isOpen={isAddAchievementOpen}
        onClose={() => setIsAddAchievementOpen(false)}
        onAddAchievement={handleAddAchievement}
        language={language}
      />
    </div>
  );
}
