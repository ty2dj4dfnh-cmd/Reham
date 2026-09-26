export type Language = 'en' | 'ar';
export type ThemeMode = 'light' | 'dark';

export type NavSection =
  | 'today'
  | 'courses'
  | 'plan'
  | 'lectures'
  | 'tutor'
  | 'exams'
  | 'focus'
  | 'achievements'
  | 'profile';

export type EnergyLevel = 'high' | 'okay' | 'tired' | 'exhausted';
export type FocusLevel = 'focused' | 'average' | 'distracted' | 'cant_start';
export type AvailableTime = '30m' | '1h' | '2h' | '3h+' | 'custom';
export type DayPriority = 'exam_prep' | 'finish_lectures' | 'review' | 'practice_mcqs' | 'catch_up' | 'ai_decide';

export type MotivationStyle = 'gentle' | 'balanced' | 'challenge';
export type AcademicYear = '1' | '2' | '3' | '4' | '5' | '6' | 'Internship';
export type CourseStatus = 'active' | 'archived';

export interface DailyCheckInState {
  completedToday: boolean;
  energy: EnergyLevel;
  focus: FocusLevel;
  timeAvailable: AvailableTime;
  customMinutes?: number;
  priority: DayPriority;
  lastCompletedDate?: string;
  timestamp?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'rescheduled';

export type StudyUnitStatus = 'not_started' | 'in_progress' | 'completed';
export type StudyUnitPriority = 'low' | 'medium' | 'high';

export interface StudyUnit {
  id: string;
  examId?: string;
  courseId?: string;
  courseName?: string;
  title: string;
  estimatedMinutes: number;
  status: StudyUnitStatus;
  confidence: number; // 0–100
  priority: StudyUnitPriority;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
}

export type CourseDifficulty = 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
export type CourseStudyStyle = 'Memorization' | 'Conceptual' | 'Visual' | 'Practical' | 'Mixed';

export interface StudyTask {
  id: string;
  userId?: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  title: string;
  durationMinutes: number;
  status: TaskStatus;
  type: 'chapter' | 'lecture' | 'review' | 'mcq' | 'lab';
  date?: string;
  rescheduleHistory?: string[];
  completedAt?: string;
  examId?: string;
  unitId?: string;
  reason?: string;
  reasonAr?: string;
  priorityScore?: number;
  priorityLevel?: 'low' | 'medium' | 'high';
  actualMinutesSpent?: number;
  sessionFeedback?: 'Easy' | 'Good' | 'Difficult' | 'Very difficult';
  confidenceAfter?: number;
  isBreak?: boolean;
}

export interface Course {
  id: string;
  userId?: string;
  code: string;
  name: string;
  nameAr: string;
  color: string;
  progressPercent: number;
  nextExamDate: string;
  nextExamDays: number;
  lecturesCompleted: number;
  totalLectures: number;
  questionsSolved: number;
  totalQuestions: number;
  confidence: 'High' | 'Moderate' | 'Needs Review';
  weakTopics: string[];
  weakTopicsAr: string[];
  overview: string;
  overviewAr: string;
  instructor: string;
  semester: string;
  status?: CourseStatus;
  // Workload profile
  difficulty?: CourseDifficulty;
  studyStyle?: CourseStudyStyle;
  currentConfidence?: number; // 0-100%
  isBehind?: boolean; // Behind on lectures: Yes / No
  createdAt?: string;
  updatedAt?: string;
}

export type LectureFormat = 'pdf' | 'ppt' | 'notes' | 'audio';

export interface LecturePage {
  pageNumber: number;
  text: string;
  heading?: string;
  keyPoints?: string[];
}

export interface DocumentChunk {
  chunkIndex: number;
  totalChunks: number;
  startPage: number;
  endPage: number;
  title: string;
  titleAr?: string;
  summary: string;
  content: string;
  pages: LecturePage[];
  logicalDomain:
    | 'introduction_definitions'
    | 'classification_etiology'
    | 'pathogenesis_mechanisms'
    | 'clinical_manifestations'
    | 'diagnostics_radiography_histology'
    | 'differential_comparisons'
    | 'treatment_protocols'
    | 'complications_prognosis_pearls';
}

export interface NoteSection {
  id: string;
  category: string; // Definitions, Classifications, Etiology, Clinical Features, Radiography, Histopathology, Treatment, Complications, Prognosis, Numbers, Comparisons, Professor Highlights
  categoryAr?: string;
  title: string;
  titleAr?: string;
  content: string;
  sourcePage?: number;
  isFromLecture: boolean; // true = from uploaded lecture, false = additional clinical explanation
}

export interface CoverageCheckData {
  coverageScore: number; // e.g. 94%
  topicsDetectedCount: number;
  topicsCoveredCount: number;
  representedTopics: string[];
  potentiallyMissingTopics: string[];
  coverageNote: string;
}

export interface CompleteNotesData {
  sections: NoteSection[];
  coverageCheck: CoverageCheckData;
  generatedAt: string;
}

export interface ExplanationVariantsData {
  simpleEn: string;
  detailedEn: string;
  arabicWithEnglishTerms: string;
  sourcePages?: number[];
}

export interface MCQItem {
  id: string;
  question: string;
  questionAr?: string;
  options: string[];
  optionsAr?: string[];
  correctIndex: number;
  explanation: string;
  clinicalPearl: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  sourcePage?: number;
  topic?: string;
  timesAttempted?: number;
  timesCorrect?: number;
}

export interface FlashcardItem {
  id: string;
  term: string;
  definition: string;
  category: string;
  sourcePage?: number;
  status?: 'known' | 'review_again';
}

export interface FillInBlankItem {
  id?: string;
  sentence: string;
  missingWord: string;
  hint: string;
  sourcePage?: number;
  topic?: string;
  explanation?: string;
}

export interface PracticeExamConfig {
  questionCount: number; // 5, 10, 20, or custom
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  types: ('mcq' | 'fill_in_blank' | 'short_answer')[];
  timerEnabled: boolean;
  durationMinutes: number;
}

export interface PracticeExamResult {
  id: string;
  lectureId: string;
  lectureTitle: string;
  date: string;
  score: number;
  totalQuestions: number;
  accuracyPercent: number;
  timeSpentSeconds: number;
  strongTopics: string[];
  weakTopics: string[];
  missedQuestionIds: string[];
}

export interface QuestionBankItem {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  lectureId: string;
  lectureTitle: string;
  topic: string;
  type: 'mcq' | 'fill_in_blank' | 'short_answer';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  clinicalPearl?: string;
  sourcePage?: number;
  timesAttempted: number;
  timesCorrect: number;
  createdAt: string;
}

export interface TopicWeaknessStat {
  topic: string;
  courseName: string;
  totalAnswered: number;
  totalCorrect: number;
  accuracyPercent: number;
  status: 'critical' | 'needs_review' | 'solid';
}

export interface LectureProgressData {
  notesReviewed: boolean;
  flashcardsMastered: number;
  flashcardsTotal: number;
  mcqsAttempted: number;
  mcqsCorrect: number;
  blanksAttempted: number;
  blanksCorrect: number;
  practiceExamCompleted: boolean;
  lastExamScorePercent?: number;
}

export interface Lecture {
  id: string;
  userId?: string;
  courseId: string;
  courseName: string;
  title: string;
  titleAr?: string;
  format: LectureFormat;
  dateAdded: string;
  durationMin: number;
  slidesCount?: number;
  pageCount?: number;
  fileName?: string;
  fileSize?: string;
  isHighYield: boolean;
  status: 'completed' | 'in_progress' | 'not_started';
  explanation: string;
  explanationVariants?: ExplanationVariantsData;
  quickSummary?: string[];
  highYieldSummary: string[];
  highYieldReview?: {
    category: string;
    categoryAr?: string;
    items: string[];
    sourcePage?: number;
  }[];
  notes: string;
  completeNotes?: CompleteNotesData;
  parsedPages?: LecturePage[];
  chunks?: DocumentChunk[];
  mcqs: MCQItem[];
  flashcards: FlashcardItem[];
  fillInBlanks: FillInBlankItem[];
  practiceExamAttempts?: PracticeExamResult[];
  progressTracking?: LectureProgressData;
  questionBankCount?: number;
}

export interface Exam {
  id: string;
  userId?: string;
  courseId?: string;
  courseName: string;
  courseNameAr?: string;
  examType: 'Midterm' | 'Final' | 'OSCE' | 'Practical Quiz';
  examTitle?: string;
  examDate: string;
  daysRemaining: number;
  preparationPercent: number;
  initialPreparationPercent?: number;
  targetGrade: string;
  topicsRemainingCount: number;
  highYieldTopics: string[];
  units?: StudyUnit[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FocusSessionLog {
  id: string;
  userId: string;
  taskId: string;
  examId?: string;
  courseName: string;
  taskTitle: string;
  unitId?: string;
  estimatedMinutes: number;
  actualMinutes: number;
  feedback: 'Easy' | 'Good' | 'Difficult' | 'Very difficult';
  confidenceBefore?: number;
  confidenceAfter: number;
  completedAt: string;
  notes?: string;
}

export type CouldntFinishReason =
  | 'Ran out of time'
  | 'Task took longer than expected'
  | "Couldn't focus"
  | 'Too tired'
  | "Didn't understand the topic"
  | 'Something came up';

export type CouldntFinishAction =
  | 'Move to later today'
  | 'Move to tomorrow'
  | 'Split into smaller tasks'
  | 'Replan my week';

export interface CouldntFinishLog {
  id: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  courseName: string;
  reason: CouldntFinishReason;
  actionTaken: CouldntFinishAction;
  timestamp: string;
}

export interface DailyReview {
  id: string;
  userId: string;
  dateKey: string;
  satisfactionRating: number; // 1-5
  biggestObstacle: string;
  noteForTomorrow?: string;
  plannedMinutes: number;
  completedMinutes: number;
  completedTasksCount: number;
  totalTasksCount: number;
  timestamp: string;
}

export interface PaceProfile {
  paceMultiplier: number; // default 1.0
  completedSessionsCount: number;
  recentSessions: {
    estimatedMinutes: number;
    actualMinutes: number;
    timestamp: string;
  }[];
}

export interface FocusResetDay {
  dayNumber: number;
  title: string;
  titleAr: string;
  task: string;
  taskAr: string;
  durationMin: number;
  completed: boolean;
  reflectionPrompt: string;
}

export interface Achievement {
  id: string;
  userId?: string;
  title: string;
  titleAr?: string;
  category: 'lecture' | 'mcq' | 'hours' | 'streak' | 'exam' | 'custom';
  timestamp: string;
  date?: string;
  courseName?: string;
  isManual?: boolean;
}

export interface UserProfile {
  uid?: string;
  email?: string;
  name: string;
  photoURL?: string;
  program: string;
  year: string;
  academicYear?: AcademicYear | string;
  university: string;
  country?: string;
  preferredLanguage: Language;
  dailyStudyTargetHours: number;
  weeklyStudyDays?: number;
  studyStyle?: string;
  energyPeak?: string;
  studyPreference: 'early_bird' | 'night_owl' | 'balanced';
  studyTechnique: 'pomodoro' | 'flowtime' | 'active_recall';
  busiestDays?: string[];
  studyTimePreference?: string;
  studyChallenges?: string[];
  motivationStyle?: MotivationStyle;
  onboardingCompleted?: boolean;
  notificationReminders: boolean;
  soundEffects: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TutorActionType =
  | 'start_task'
  | 'open_plan'
  | 'start_focus'
  | 'replan_today'
  | 'exam_rescue'
  | 'review_weak_topics'
  | 'open_focus_recovery';

export interface TutorActionButton {
  label: string;
  labelAr?: string;
  type: TutorActionType;
  taskId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  clinicalPearl?: string;
  actions?: TutorActionButton[];
  referencedData?: {
    courseName?: string;
    examName?: string;
    taskTitle?: string;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  titleAr?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}
