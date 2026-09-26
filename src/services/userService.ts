import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  UserProfile,
  Course,
  Exam,
  DailyCheckInState,
  Achievement,
  StudyTask,
  FocusResetDay,
  Lecture,
  StudyUnit,
  FocusSessionLog,
  CouldntFinishLog,
  DailyReview,
  PaceProfile,
  ChatSession,
  QuestionBankItem,
  PracticeExamResult,
  TopicWeaknessStat,
} from '../types';

/**
 * User Profile Firestore Management
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const saveUserProfile = async (uid: string, profile: Partial<UserProfile>): Promise<void> => {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(
      userDocRef,
      {
        ...profile,
        uid,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * User Courses Firestore Management
 */
export const getUserCourses = async (uid: string): Promise<Course[]> => {
  const path = `users/${uid}/courses`;
  try {
    const coursesRef = collection(db, 'users', uid, 'courses');
    const snap = await getDocs(coursesRef);
    const courses: Course[] = [];
    snap.forEach((docSnap) => {
      courses.push({ id: docSnap.id, ...docSnap.data() } as Course);
    });
    return courses;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const saveUserCourse = async (uid: string, course: Course): Promise<void> => {
  const path = `users/${uid}/courses/${course.id}`;
  try {
    const courseRef = doc(db, 'users', uid, 'courses', course.id);
    await setDoc(courseRef, {
      ...course,
      userId: uid,
      status: course.status || 'active',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateUserCourse = async (
  uid: string,
  courseId: string,
  updates: Partial<Course>
): Promise<void> => {
  const path = `users/${uid}/courses/${courseId}`;
  try {
    const courseRef = doc(db, 'users', uid, 'courses', courseId);
    await updateDoc(courseRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const archiveUserCourse = async (uid: string, courseId: string): Promise<void> => {
  await updateUserCourse(uid, courseId, { status: 'archived' });
};

export const restoreUserCourse = async (uid: string, courseId: string): Promise<void> => {
  await updateUserCourse(uid, courseId, { status: 'active' });
};

/**
 * User Exams Firestore Management
 */
export const getUserExams = async (uid: string): Promise<Exam[]> => {
  const path = `users/${uid}/exams`;
  try {
    const examsRef = collection(db, 'users', uid, 'exams');
    const snap = await getDocs(examsRef);
    const exams: Exam[] = [];
    snap.forEach((docSnap) => {
      exams.push({ id: docSnap.id, ...docSnap.data() } as Exam);
    });
    return exams;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const saveUserExam = async (uid: string, exam: Exam): Promise<void> => {
  const path = `users/${uid}/exams/${exam.id}`;
  try {
    const examRef = doc(db, 'users', uid, 'exams', exam.id);
    await setDoc(examRef, {
      ...exam,
      userId: uid,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateUserExam = async (
  uid: string,
  examId: string,
  updates: Partial<Exam>
): Promise<void> => {
  const path = `users/${uid}/exams/${examId}`;
  try {
    const examRef = doc(db, 'users', uid, 'exams', examId);
    await updateDoc(examRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteUserExam = async (uid: string, examId: string): Promise<void> => {
  const path = `users/${uid}/exams/${examId}`;
  try {
    const examRef = doc(db, 'users', uid, 'exams', examId);
    await deleteDoc(examRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

/**
 * User Daily Check-In Firestore Management
 * Stored under `users/{uid}/checkIns/{YYYY-MM-DD}`
 */
export const getTodayCheckIn = async (uid: string, dateKey: string): Promise<DailyCheckInState | null> => {
  const path = `users/${uid}/checkIns/${dateKey}`;
  try {
    const checkInRef = doc(db, 'users', uid, 'checkIns', dateKey);
    const snap = await getDoc(checkInRef);
    if (snap.exists()) {
      return snap.data() as DailyCheckInState;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const saveDailyCheckIn = async (
  uid: string,
  dateKey: string,
  checkInData: DailyCheckInState
): Promise<void> => {
  const path = `users/${uid}/checkIns/${dateKey}`;
  try {
    const checkInRef = doc(db, 'users', uid, 'checkIns', dateKey);
    await setDoc(checkInRef, {
      ...checkInData,
      completedToday: true,
      lastCompletedDate: dateKey,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * User Achievements Firestore Management
 */
export const getUserAchievements = async (uid: string): Promise<Achievement[]> => {
  const path = `users/${uid}/achievements`;
  try {
    const achRef = collection(db, 'users', uid, 'achievements');
    const snap = await getDocs(achRef);
    const achievements: Achievement[] = [];
    snap.forEach((docSnap) => {
      achievements.push({ id: docSnap.id, ...docSnap.data() } as Achievement);
    });
    achievements.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
    return achievements;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const saveUserAchievement = async (uid: string, ach: Achievement): Promise<void> => {
  const path = `users/${uid}/achievements/${ach.id}`;
  try {
    const achRef = doc(db, 'users', uid, 'achievements', ach.id);
    await setDoc(achRef, {
      ...ach,
      userId: uid,
      date: ach.date || new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * User Study Tasks Firestore Management
 */
export const getUserTasks = async (uid: string): Promise<StudyTask[]> => {
  const path = `users/${uid}/tasks`;
  try {
    const tasksRef = collection(db, 'users', uid, 'tasks');
    const snap = await getDocs(tasksRef);
    const tasks: StudyTask[] = [];
    snap.forEach((docSnap) => {
      tasks.push({ id: docSnap.id, ...docSnap.data() } as StudyTask);
    });
    return tasks;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const saveUserTask = async (uid: string, task: StudyTask): Promise<void> => {
  const path = `users/${uid}/tasks/${task.id}`;
  try {
    const taskRef = doc(db, 'users', uid, 'tasks', task.id);
    await setDoc(taskRef, {
      ...task,
      userId: uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateUserTask = async (
  uid: string,
  taskId: string,
  updates: Partial<StudyTask>
): Promise<void> => {
  const path = `users/${uid}/tasks/${taskId}`;
  try {
    const taskRef = doc(db, 'users', uid, 'tasks', taskId);
    await updateDoc(taskRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

/**
 * User Lectures Firestore Management
 */
export const getUserLectures = async (uid: string): Promise<Lecture[]> => {
  const path = `users/${uid}/lectures`;
  try {
    const lecturesRef = collection(db, 'users', uid, 'lectures');
    const snap = await getDocs(lecturesRef);
    const lectures: Lecture[] = [];
    snap.forEach((docSnap) => {
      lectures.push({ id: docSnap.id, ...docSnap.data() } as Lecture);
    });
    return lectures;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const saveUserLecture = async (uid: string, lecture: Lecture): Promise<void> => {
  const path = `users/${uid}/lectures/${lecture.id}`;
  try {
    const lectureRef = doc(db, 'users', uid, 'lectures', lecture.id);
    await setDoc(lectureRef, {
      ...lecture,
      userId: uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateUserLecture = async (
  uid: string,
  lectureId: string,
  updates: Partial<Lecture>
): Promise<void> => {
  const path = `users/${uid}/lectures/${lectureId}`;
  try {
    const lectureRef = doc(db, 'users', uid, 'lectures', lectureId);
    await updateDoc(lectureRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteUserLecture = async (uid: string, lectureId: string): Promise<void> => {
  const path = `users/${uid}/lectures/${lectureId}`;
  try {
    const lectureRef = doc(db, 'users', uid, 'lectures', lectureId);
    await deleteDoc(lectureRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

/**
 * Course Question Bank Persistence
 */
export const saveQuestionBankItem = async (
  uid: string,
  item: QuestionBankItem
): Promise<void> => {
  const path = `users/${uid}/questionBank/${item.id}`;
  try {
    const itemRef = doc(db, 'users', uid, 'questionBank', item.id);
    await setDoc(itemRef, {
      ...item,
      userId: uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserQuestionBank = async (
  uid: string,
  courseId?: string
): Promise<QuestionBankItem[]> => {
  const path = `users/${uid}/questionBank`;
  try {
    const colRef = collection(db, 'users', uid, 'questionBank');
    const snap = await getDocs(colRef);
    const items: QuestionBankItem[] = [];
    snap.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() } as QuestionBankItem;
      if (!courseId || data.courseId === courseId) {
        items.push(data);
      }
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const updateQuestionBankStats = async (
  uid: string,
  questionId: string,
  isCorrect: boolean
): Promise<void> => {
  const path = `users/${uid}/questionBank/${questionId}`;
  try {
    const itemRef = doc(db, 'users', uid, 'questionBank', questionId);
    const snap = await getDoc(itemRef);
    if (!snap.exists()) return;
    const data = snap.data() as QuestionBankItem;
    await updateDoc(itemRef, {
      timesAttempted: (data.timesAttempted || 0) + 1,
      timesCorrect: isCorrect ? (data.timesCorrect || 0) + 1 : (data.timesCorrect || 0),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

/**
 * Practice Exam Results Persistence
 */
export const savePracticeExamResult = async (
  uid: string,
  result: PracticeExamResult
): Promise<void> => {
  const path = `users/${uid}/practiceExams/${result.id}`;
  try {
    const resultRef = doc(db, 'users', uid, 'practiceExams', result.id);
    await setDoc(resultRef, {
      ...result,
      userId: uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserPracticeExamResults = async (
  uid: string,
  lectureId?: string
): Promise<PracticeExamResult[]> => {
  const path = `users/${uid}/practiceExams`;
  try {
    const colRef = collection(db, 'users', uid, 'practiceExams');
    const snap = await getDocs(colRef);
    const results: PracticeExamResult[] = [];
    snap.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() } as PracticeExamResult;
      if (!lectureId || data.lectureId === lectureId) {
        results.push(data);
      }
    });
    results.sort((a, b) => (b.date > a.date ? 1 : -1));
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

/**
 * Focus Reset Days Firestore Management
 */
export const getUserFocusReset = async (uid: string): Promise<FocusResetDay[]> => {
  const path = `users/${uid}/focusReset`;
  try {
    const resetRef = collection(db, 'users', uid, 'focusReset');
    const snap = await getDocs(resetRef);
    if (snap.empty) return [];
    const days: FocusResetDay[] = [];
    snap.forEach((docSnap) => {
      days.push(docSnap.data() as FocusResetDay);
    });
    days.sort((a, b) => a.dayNumber - b.dayNumber);
    return days;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const saveUserFocusResetDays = async (uid: string, days: FocusResetDay[]): Promise<void> => {
  const path = `users/${uid}/focusReset`;
  try {
    for (const d of days) {
      const docRef = doc(db, 'users', uid, 'focusReset', `day-${d.dayNumber}`);
      await setDoc(docRef, d, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const toggleUserFocusResetDay = async (
  uid: string,
  dayNumber: number,
  completed: boolean
): Promise<void> => {
  const path = `users/${uid}/focusReset/day-${dayNumber}`;
  try {
    const docRef = doc(db, 'users', uid, 'focusReset', `day-${dayNumber}`);
    await setDoc(docRef, { dayNumber, completed }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Study Units in Exam update helper
 */
export const updateExamUnit = async (
  uid: string,
  examId: string,
  unitId: string,
  updates: Partial<StudyUnit>
): Promise<void> => {
  const path = `users/${uid}/exams/${examId}`;
  try {
    const examRef = doc(db, 'users', uid, 'exams', examId);
    const snap = await getDoc(examRef);
    if (!snap.exists()) return;

    const examData = snap.data() as Exam;
    const units = examData.units || [];
    const updatedUnits = units.map((u) => (u.id === unitId ? { ...u, ...updates } : u));

    // Recalculate exam preparation percentage
    const completedUnits = updatedUnits.filter((u) => u.status === 'completed').length;
    const prepPercent =
      updatedUnits.length > 0 ? Math.round((completedUnits / updatedUnits.length) * 100) : examData.preparationPercent;

    await updateDoc(examRef, {
      units: updatedUnits,
      preparationPercent: prepPercent,
      topicsRemainingCount: Math.max(0, updatedUnits.length - completedUnits),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

/**
 * Focus Sessions Persistence
 */
export const logFocusSession = async (
  uid: string,
  session: FocusSessionLog
): Promise<void> => {
  const path = `users/${uid}/focusSessions/${session.id}`;
  try {
    const sessionRef = doc(db, 'users', uid, 'focusSessions', session.id);
    await setDoc(sessionRef, {
      ...session,
      userId: uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserFocusSessions = async (uid: string): Promise<FocusSessionLog[]> => {
  const path = `users/${uid}/focusSessions`;
  try {
    const colRef = collection(db, 'users', uid, 'focusSessions');
    const snap = await getDocs(colRef);
    const sessions: FocusSessionLog[] = [];
    snap.forEach((docSnap) => {
      sessions.push({ id: docSnap.id, ...docSnap.data() } as FocusSessionLog);
    });
    sessions.sort((a, b) => (b.completedAt > a.completedAt ? 1 : -1));
    return sessions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

/**
 * Couldn't Finish Reasons Persistence
 */
export const logCouldntFinish = async (
  uid: string,
  logEntry: CouldntFinishLog
): Promise<void> => {
  const path = `users/${uid}/couldntFinish/${logEntry.id}`;
  try {
    const logRef = doc(db, 'users', uid, 'couldntFinish', logEntry.id);
    await setDoc(logRef, {
      ...logEntry,
      userId: uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserCouldntFinishLogs = async (uid: string): Promise<CouldntFinishLog[]> => {
  const path = `users/${uid}/couldntFinish`;
  try {
    const colRef = collection(db, 'users', uid, 'couldntFinish');
    const snap = await getDocs(colRef);
    const logs: CouldntFinishLog[] = [];
    snap.forEach((docSnap) => {
      logs.push({ id: docSnap.id, ...docSnap.data() } as CouldntFinishLog);
    });
    logs.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
    return logs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

/**
 * Daily Evening Reviews Persistence
 */
export const saveDailyReview = async (
  uid: string,
  review: DailyReview
): Promise<void> => {
  const path = `users/${uid}/dailyReviews/${review.dateKey}`;
  try {
    const reviewRef = doc(db, 'users', uid, 'dailyReviews', review.dateKey);
    await setDoc(reviewRef, {
      ...review,
      userId: uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserDailyReviews = async (uid: string): Promise<DailyReview[]> => {
  const path = `users/${uid}/dailyReviews`;
  try {
    const colRef = collection(db, 'users', uid, 'dailyReviews');
    const snap = await getDocs(colRef);
    const reviews: DailyReview[] = [];
    snap.forEach((docSnap) => {
      reviews.push({ id: docSnap.id, ...docSnap.data() } as DailyReview);
    });
    reviews.sort((a, b) => (b.dateKey > a.dateKey ? 1 : -1));
    return reviews;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

/**
 * Adaptive Personal Pace Profile Persistence
 */
export const getUserPaceProfile = async (uid: string): Promise<PaceProfile> => {
  const path = `users/${uid}/paceProfile/default`;
  try {
    const paceRef = doc(db, 'users', uid, 'paceProfile', 'default');
    const snap = await getDoc(paceRef);
    if (snap.exists()) {
      return snap.data() as PaceProfile;
    }
    return {
      paceMultiplier: 1.0,
      completedSessionsCount: 0,
      recentSessions: [],
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const saveUserPaceProfile = async (
  uid: string,
  profile: PaceProfile
): Promise<void> => {
  const path = `users/${uid}/paceProfile/default`;
  try {
    const paceRef = doc(db, 'users', uid, 'paceProfile', 'default');
    await setDoc(paceRef, profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Daily Generated Plan Persistence
 */
export const saveTodayPlan = async (
  uid: string,
  dateKey: string,
  tasks: StudyTask[]
): Promise<void> => {
  const path = `users/${uid}/plans/${dateKey}`;
  try {
    const planRef = doc(db, 'users', uid, 'plans', dateKey);
    await setDoc(planRef, {
      userId: uid,
      dateKey,
      tasks,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserTodayPlan = async (
  uid: string,
  dateKey: string
): Promise<StudyTask[] | null> => {
  const path = `users/${uid}/plans/${dateKey}`;
  try {
    const planRef = doc(db, 'users', uid, 'plans', dateKey);
    const snap = await getDoc(planRef);
    if (snap.exists()) {
      const data = snap.data();
      return (data.tasks || []) as StudyTask[];
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

/**
 * AI Tutor Chat Sessions Persistence
 */
export const saveUserChatSession = async (
  uid: string,
  session: ChatSession
): Promise<void> => {
  const path = `users/${uid}/aiChats/${session.id}`;
  try {
    const chatRef = doc(db, 'users', uid, 'aiChats', session.id);
    await setDoc(chatRef, {
      ...session,
      userId: uid,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserChatSessions = async (uid: string): Promise<ChatSession[]> => {
  const path = `users/${uid}/aiChats`;
  try {
    const colRef = collection(db, 'users', uid, 'aiChats');
    const snap = await getDocs(colRef);
    const sessions: ChatSession[] = [];
    snap.forEach((docSnap) => {
      sessions.push({ id: docSnap.id, ...docSnap.data() } as ChatSession);
    });
    sessions.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
    return sessions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const deleteUserChatSession = async (
  uid: string,
  sessionId: string
): Promise<void> => {
  const path = `users/${uid}/aiChats/${sessionId}`;
  try {
    const chatRef = doc(db, 'users', uid, 'aiChats', sessionId);
    await deleteDoc(chatRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
