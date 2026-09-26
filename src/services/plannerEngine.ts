import {
  Course,
  Exam,
  StudyUnit,
  StudyTask,
  DailyCheckInState,
  CourseDifficulty,
  CourseStudyStyle,
  PaceProfile,
  FocusSessionLog,
  DailyReview,
  UserProfile,
} from '../types';

/**
 * Sensible dental course workload defaults.
 * These are starting estimates only; student experience overrides them.
 */
export const DENTAL_WORKLOAD_DEFAULTS: Record<
  string,
  {
    difficulty: CourseDifficulty;
    studyStyle: CourseStudyStyle;
    currentConfidence: number;
    isBehind: boolean;
  }
> = {
  'Oral Pathology': {
    difficulty: 'Hard',
    studyStyle: 'Mixed',
    currentConfidence: 50,
    isBehind: false,
  },
  'Dental Radiology': {
    difficulty: 'Moderate',
    studyStyle: 'Visual',
    currentConfidence: 65,
    isBehind: false,
  },
  'Operative Dentistry / Restorative Dentistry': {
    difficulty: 'Moderate',
    studyStyle: 'Practical',
    currentConfidence: 65,
    isBehind: false,
  },
  'Dental Anatomy': {
    difficulty: 'Moderate',
    studyStyle: 'Visual',
    currentConfidence: 70,
    isBehind: false,
  },
  'Oral Histology': {
    difficulty: 'Hard',
    studyStyle: 'Visual',
    currentConfidence: 55,
    isBehind: false,
  },
  'Endodontics': {
    difficulty: 'Hard',
    studyStyle: 'Practical',
    currentConfidence: 50,
    isBehind: false,
  },
  'Periodontology': {
    difficulty: 'Moderate',
    studyStyle: 'Conceptual',
    currentConfidence: 60,
    isBehind: false,
  },
  'Prosthodontics': {
    difficulty: 'Hard',
    studyStyle: 'Practical',
    currentConfidence: 55,
    isBehind: false,
  },
  'Oral and Maxillofacial Surgery': {
    difficulty: 'Very Hard',
    studyStyle: 'Mixed',
    currentConfidence: 45,
    isBehind: false,
  },
  'Orthodontics': {
    difficulty: 'Hard',
    studyStyle: 'Conceptual',
    currentConfidence: 55,
    isBehind: false,
  },
  'Pediatric Dentistry': {
    difficulty: 'Moderate',
    studyStyle: 'Mixed',
    currentConfidence: 70,
    isBehind: false,
  },
  'Pharmacology': {
    difficulty: 'Very Hard',
    studyStyle: 'Memorization',
    currentConfidence: 45,
    isBehind: false,
  },
  'Biochemistry': {
    difficulty: 'Hard',
    studyStyle: 'Conceptual',
    currentConfidence: 50,
    isBehind: false,
  },
  'General Pathology': {
    difficulty: 'Hard',
    studyStyle: 'Memorization',
    currentConfidence: 55,
    isBehind: false,
  },
  'Oral Medicine': {
    difficulty: 'Hard',
    studyStyle: 'Mixed',
    currentConfidence: 55,
    isBehind: false,
  },
};

export const getDefaultCourseWorkload = (courseName: string) => {
  const match = Object.keys(DENTAL_WORKLOAD_DEFAULTS).find((k) =>
    courseName.toLowerCase().includes(k.toLowerCase())
  );
  if (match) return DENTAL_WORKLOAD_DEFAULTS[match];
  return {
    difficulty: 'Moderate' as CourseDifficulty,
    studyStyle: 'Mixed' as CourseStudyStyle,
    currentConfidence: 60,
    isBehind: false,
  };
};

/**
 * Starter study units for exams if an exam does not yet have units
 */
export const generateStarterUnitsForExam = (
  examId: string,
  courseName: string
): StudyUnit[] => {
  const lower = courseName.toLowerCase();
  if (lower.includes('pathology')) {
    return [
      {
        id: `unit-${examId}-1`,
        examId,
        title: 'White & Keratotic Lesions (Leukoplakia, Lichen Planus)',
        estimatedMinutes: 40,
        status: 'in_progress',
        confidence: 45,
        priority: 'high',
      },
      {
        id: `unit-${examId}-2`,
        examId,
        title: 'Odontogenic Cysts & Tumors (Ameloblastoma, OKC)',
        estimatedMinutes: 45,
        status: 'not_started',
        confidence: 40,
        priority: 'high',
      },
      {
        id: `unit-${examId}-3`,
        examId,
        title: 'Salivary Gland Neoplasms (Pleomorphic Adenoma, Mucoepidermoid)',
        estimatedMinutes: 35,
        status: 'not_started',
        confidence: 60,
        priority: 'medium',
      },
      {
        id: `unit-${examId}-4`,
        examId,
        title: 'Bone Pathologies & Fibro-Osseous Lesions',
        estimatedMinutes: 35,
        status: 'not_started',
        confidence: 55,
        priority: 'medium',
      },
      {
        id: `unit-${examId}-5`,
        examId,
        title: 'Differential Diagnosis Spotters & Past MCQs',
        estimatedMinutes: 30,
        status: 'not_started',
        confidence: 50,
        priority: 'high',
      },
    ];
  } else if (lower.includes('radiology')) {
    return [
      {
        id: `unit-${examId}-1`,
        examId,
        title: 'Intraoral vs Extraoral Projection Errors & Physics',
        estimatedMinutes: 30,
        status: 'completed',
        confidence: 75,
        priority: 'low',
      },
      {
        id: `unit-${examId}-2`,
        examId,
        title: 'Periapical Radiolucencies & Periodontal Bone Loss Staging',
        estimatedMinutes: 40,
        status: 'in_progress',
        confidence: 55,
        priority: 'high',
      },
      {
        id: `unit-${examId}-3`,
        examId,
        title: 'CBCT Principles & TMJ Imaging Hallmarks',
        estimatedMinutes: 35,
        status: 'not_started',
        confidence: 50,
        priority: 'medium',
      },
      {
        id: `unit-${examId}-4`,
        examId,
        title: 'Maxillofacial Landmarks & Radiopacities Review',
        estimatedMinutes: 30,
        status: 'not_started',
        confidence: 65,
        priority: 'medium',
      },
    ];
  } else if (lower.includes('restorative') || lower.includes('operative')) {
    return [
      {
        id: `unit-${examId}-1`,
        examId,
        title: 'Cavity Classifications & Biological Principles of Prep',
        estimatedMinutes: 35,
        status: 'in_progress',
        confidence: 65,
        priority: 'medium',
      },
      {
        id: `unit-${examId}-2`,
        examId,
        title: 'Adhesive Dentistry: Etch-and-Rinse vs Self-Etch Systems',
        estimatedMinutes: 40,
        status: 'not_started',
        confidence: 50,
        priority: 'high',
      },
      {
        id: `unit-${examId}-3`,
        examId,
        title: 'Composite Layering, C-Factor & Polymerization Shrinkage',
        estimatedMinutes: 35,
        status: 'not_started',
        confidence: 55,
        priority: 'high',
      },
      {
        id: `unit-${examId}-4`,
        examId,
        title: 'Clinical Matrices, Wedges & Contact Point Mastery',
        estimatedMinutes: 30,
        status: 'not_started',
        confidence: 70,
        priority: 'low',
      },
    ];
  } else {
    return [
      {
        id: `unit-${examId}-1`,
        examId,
        title: 'High-Yield Core Lectures 1–3 Review',
        estimatedMinutes: 40,
        status: 'in_progress',
        confidence: 55,
        priority: 'high',
      },
      {
        id: `unit-${examId}-2`,
        examId,
        title: 'Key Clinical Diagnostic Criteria',
        estimatedMinutes: 35,
        status: 'not_started',
        confidence: 50,
        priority: 'high',
      },
      {
        id: `unit-${examId}-3`,
        examId,
        title: 'Midterm Chapter Practice Questions & Cases',
        estimatedMinutes: 30,
        status: 'not_started',
        confidence: 60,
        priority: 'medium',
      },
    ];
  }
};

/**
 * 4. Priority Engine:
 * Computes deterministic internal priority score and human-readable explanations.
 */
export interface ScoredStudyCandidate {
  unit: StudyUnit;
  exam: Exam;
  course?: Course;
  score: number;
  reason: string;
  reasonAr: string;
}

export const scoreStudyUnit = (
  unit: StudyUnit,
  exam: Exam,
  course?: Course
): ScoredStudyCandidate => {
  let score = 0;

  // 1. Exam proximity
  const days = Math.max(0, exam.daysRemaining);
  if (days <= 2) score += 60;
  else if (days <= 5) score += 45;
  else if (days <= 9) score += 30;
  else if (days <= 14) score += 15;
  else score += 5;

  // 2. Course difficulty
  const difficulty = course?.difficulty || getDefaultCourseWorkload(exam.courseName).difficulty;
  if (difficulty === 'Very Hard') score += 25;
  else if (difficulty === 'Hard') score += 18;
  else if (difficulty === 'Moderate') score += 10;
  else score += 0;

  // 3. Confidence gap (lower confidence = higher priority)
  const confidence = typeof unit.confidence === 'number' ? unit.confidence : 50;
  score += Math.round((100 - confidence) * 0.35);

  // 4. Target grade urgency
  const target = exam.targetGrade || '90%+';
  if (target.includes('95') || target.toUpperCase().includes('A+')) score += 20;
  else if (target.includes('90') || target.toUpperCase().includes('A')) score += 15;
  else if (target.includes('85') || target.toUpperCase().includes('B+')) score += 10;
  else score += 5;

  // 5. Unit priority
  if (unit.priority === 'high') score += 30;
  else if (unit.priority === 'medium') score += 15;

  // 6. User is behind on lectures in this course
  if (course?.isBehind) score += 20;

  // 7. Continuity boost for in-progress work
  if (unit.status === 'in_progress') score += 12;

  // Generate plain human-readable explanations (no math formulas)
  let reason = '';
  let reasonAr = '';

  if (days <= 5 && confidence < 60) {
    reason = `Prioritized because your ${exam.courseName} exam is in ${days} days and this topic has low confidence (${confidence}%).`;
    reasonAr = `تمت الأولويّة لاقتراب امتحان ${exam.courseName} خلال ${days} أيام وانخفاض مستوى التمكن (${confidence}%).`;
  } else if (days <= 5) {
    reason = `Prioritized for upcoming ${exam.courseName} exam in ${days} days.`;
    reasonAr = `أولوية مراجعة لامتحان ${exam.courseName} القادم خلال ${days} أيام.`;
  } else if (unit.priority === 'high' && (difficulty === 'Hard' || difficulty === 'Very Hard')) {
    reason = `Prioritized due to High exam priority and ${difficulty} course difficulty.`;
    reasonAr = `أولوية مرتفعة لصعوبة المقرر (${difficulty}) والأهمية الامتحانية العالية.`;
  } else if (confidence < 50) {
    reason = `Prioritized to strengthen low-confidence core concepts (${confidence}%).`;
    reasonAr = `أولوية لتعزيز المفاهيم ذات التمكن المنخفض (${confidence}%).`;
  } else if (course?.isBehind) {
    reason = `Prioritized to help you catch up on lectures in ${exam.courseName}.`;
    reasonAr = `أولوية لمساعدتكِ على استدراك المحاضرات المتراكمة في ${exam.courseName}.`;
  } else {
    reason = `High-yield curriculum milestone for ${exam.courseName}.`;
    reasonAr = `محطة دراسية عالية الأهمية في مقرر ${exam.courseName}.`;
  }

  return {
    unit,
    exam,
    course,
    score,
    reason,
    reasonAr,
  };
};

/**
 * 5. Daily Capacity Calculation
 */
export interface DailyCapacityResult {
  totalMinutes: number;
  maxBlockMinutes: number;
  recommendBreaks: boolean;
  intensityNote: string;
}

export const calculateDailyCapacity = (
  checkIn: DailyCheckInState,
  profile?: UserProfile
): DailyCapacityResult => {
  // Base minutes from check-in or profile
  let baseMinutes = 120;
  if (checkIn.timeAvailable === '30m') baseMinutes = 30;
  else if (checkIn.timeAvailable === '1h') baseMinutes = 60;
  else if (checkIn.timeAvailable === '2h') baseMinutes = 120;
  else if (checkIn.timeAvailable === '3h+') baseMinutes = 180;
  else if (checkIn.timeAvailable === 'custom' && checkIn.customMinutes) {
    baseMinutes = checkIn.customMinutes;
  } else if (profile?.dailyStudyTargetHours) {
    baseMinutes = Math.round(profile.dailyStudyTargetHours * 60);
  }

  // Energy factor
  let energyFactor = 1.0;
  if (checkIn.energy === 'high') energyFactor = 1.05;
  else if (checkIn.energy === 'okay') energyFactor = 1.0;
  else if (checkIn.energy === 'tired') energyFactor = 0.8;
  else if (checkIn.energy === 'exhausted') energyFactor = 0.65;

  // Focus factor
  let focusFactor = 1.0;
  if (checkIn.focus === 'focused') focusFactor = 1.0;
  else if (checkIn.focus === 'average') focusFactor = 0.9;
  else if (checkIn.focus === 'distracted') focusFactor = 0.8;
  else if (checkIn.focus === 'cant_start') focusFactor = 0.7;

  const calculatedMinutes = Math.max(30, Math.round(baseMinutes * energyFactor * focusFactor));

  // Determine study block sizing
  const isTiredOrDistracted =
    checkIn.energy === 'tired' ||
    checkIn.energy === 'exhausted' ||
    checkIn.focus === 'distracted' ||
    checkIn.focus === 'cant_start';

  const maxBlockMinutes = isTiredOrDistracted ? 25 : 45;

  let intensityNote = 'Balanced standard study blocks';
  if (checkIn.energy === 'exhausted' || checkIn.energy === 'tired') {
    intensityNote = 'Tired: Reduced intensity with micro-sessions and active recall';
  } else if (checkIn.focus === 'distracted' || checkIn.focus === 'cant_start') {
    intensityNote = 'Low Focus: Short 20–25 minute focused sprints with frequent recovery';
  } else if (checkIn.energy === 'high' && checkIn.focus === 'focused') {
    intensityNote = 'Peak Stamina: Deep focus blocks and high-yield coverage';
  }

  return {
    totalMinutes: calculatedMinutes,
    maxBlockMinutes,
    recommendBreaks: calculatedMinutes >= 60,
    intensityNote,
  };
};

/**
 * 13. Adaptive Pace Multiplier (No AI):
 * Compares estimated duration vs actual duration.
 * Damped moving average between 0.8 and 1.6. Requires >= 3 completed sessions.
 */
export const calculatePaceMultiplier = (
  paceProfile?: PaceProfile | null,
  newSession?: { estimatedMinutes: number; actualMinutes: number }
): { multiplier: number; sessionCount: number } => {
  let count = paceProfile?.completedSessionsCount || 0;
  let sessions = [...(paceProfile?.recentSessions || [])];

  if (newSession && newSession.estimatedMinutes > 0 && newSession.actualMinutes > 0) {
    count += 1;
    sessions.push({
      ...newSession,
      timestamp: new Date().toISOString(),
    });
    if (sessions.length > 10) sessions = sessions.slice(-10);
  }

  if (count < 3 || sessions.length < 3) {
    return { multiplier: 1.0, sessionCount: count };
  }

  // Calculate moving ratio
  const ratios = sessions.map((s) => s.actualMinutes / s.estimatedMinutes);
  const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;

  // Dampen gently towards 1.0 (70% weight on average, 30% baseline)
  const smoothed = 0.7 * avgRatio + 0.3 * 1.0;
  const clamped = Math.min(1.6, Math.max(0.8, Math.round(smoothed * 100) / 100));

  return { multiplier: clamped, sessionCount: count };
};

/**
 * 6 & 7. Build My Day:
 * Generates personalized daily study schedule using stored exams, study units, courses,
 * daily capacity, and pace multiplier.
 */
export interface BuildMyDayParams {
  courses: Course[];
  exams: Exam[];
  checkIn: DailyCheckInState;
  existingTasks: StudyTask[];
  profile?: UserProfile;
  paceMultiplier?: number;
}

export const buildMyDayPlan = ({
  courses,
  exams,
  checkIn,
  existingTasks,
  profile,
  paceMultiplier = 1.0,
}: BuildMyDayParams): StudyTask[] => {
  const capacity = calculateDailyCapacity(checkIn, profile);
  const targetMinutes = capacity.totalMinutes;
  const maxBlock = capacity.maxBlockMinutes;

  // Separate today's already-completed tasks so we do not discard finished achievements
  const completedTodayTasks = existingTasks.filter((t) => t.status === 'completed');
  const completedMinutes = completedTodayTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);

  let remainingBudget = Math.max(0, targetMinutes - completedMinutes);
  if (remainingBudget < 25) {
    // If user already hit target, allow a light review or keep current
    remainingBudget = 30;
  }

  // Collect and score all candidate study units across exams
  const candidates: ScoredStudyCandidate[] = [];

  for (const exam of exams) {
    const units = exam.units || [];
    const course = courses.find((c) => c.name === exam.courseName || c.id === exam.courseId);

    for (const unit of units) {
      if (unit.status !== 'completed') {
        candidates.push(scoreStudyUnit(unit, exam, course));
      }
    }
  }

  // Sort candidates by priority score descending
  candidates.sort((a, b) => b.score - a.score);

  const newPlannedTasks: StudyTask[] = [];
  let allocatedMinutes = 0;
  let sessionIndex = 1;

  for (const candidate of candidates) {
    if (allocatedMinutes >= remainingBudget) break;

    const { unit, exam, course, reason, reasonAr } = candidate;
    const baseUnitMins = Math.max(20, Math.round(unit.estimatedMinutes * paceMultiplier));

    const courseColor = course?.color || 'teal';
    const courseId = course?.id || exam.courseId || 'course-default';

    // Break urgent or long work into smaller blocks when capacity is constrained or energy is low
    if (baseUnitMins > maxBlock) {
      const part1Mins = maxBlock;
      const part2Mins = Math.max(15, baseUnitMins - maxBlock);

      newPlannedTasks.push({
        id: `task-${Date.now()}-${sessionIndex++}`,
        courseId,
        courseName: exam.courseName,
        courseColor,
        title: `${unit.title} — Part 1 (Core Concepts)`,
        durationMinutes: part1Mins,
        status: 'pending',
        type: 'chapter',
        date: new Date().toISOString().split('T')[0],
        examId: exam.id,
        unitId: unit.id,
        reason,
        reasonAr,
        priorityLevel: unit.priority,
        priorityScore: candidate.score,
      });
      allocatedMinutes += part1Mins;

      // Add a 10-minute break if more study is planned
      if (allocatedMinutes + 10 <= remainingBudget) {
        newPlannedTasks.push({
          id: `task-break-${Date.now()}-${sessionIndex++}`,
          courseId,
          courseName: 'Rest & Recovery',
          courseColor: 'slate',
          title: 'Break · Mental Decompression & Hydration',
          durationMinutes: 10,
          status: 'pending',
          type: 'review',
          date: new Date().toISOString().split('T')[0],
          reason: 'Scheduled rest prevents cognitive fatigue and improves recall.',
          reasonAr: 'استراحة مبرمجة لمنع الإرهاق الذهني وتثبيت المعلومات.',
          isBreak: true,
        });
        allocatedMinutes += 10;
      }

      if (allocatedMinutes < remainingBudget) {
        const fitMins = Math.min(part2Mins, remainingBudget - allocatedMinutes);
        newPlannedTasks.push({
          id: `task-${Date.now()}-${sessionIndex++}`,
          courseId,
          courseName: exam.courseName,
          courseColor,
          title: `${unit.title} — Part 2 (Application & Review)`,
          durationMinutes: Math.max(15, fitMins),
          status: 'pending',
          type: 'review',
          date: new Date().toISOString().split('T')[0],
          examId: exam.id,
          unitId: unit.id,
          reason: `Continuation of high-yield exam prep for ${exam.courseName}.`,
          reasonAr: `استكمال التحضير عالي العائد لامتحان ${exam.courseName}.`,
          priorityLevel: unit.priority,
          priorityScore: candidate.score - 5,
        });
        allocatedMinutes += Math.max(15, fitMins);
      }
    } else {
      newPlannedTasks.push({
        id: `task-${Date.now()}-${sessionIndex++}`,
        courseId,
        courseName: exam.courseName,
        courseColor,
        title: unit.title,
        durationMinutes: baseUnitMins,
        status: 'pending',
        type: 'chapter',
        date: new Date().toISOString().split('T')[0],
        examId: exam.id,
        unitId: unit.id,
        reason,
        reasonAr,
        priorityLevel: unit.priority,
        priorityScore: candidate.score,
      });
      allocatedMinutes += baseUnitMins;

      // Add break if total time exceeds 50 minutes and budget permits
      if (allocatedMinutes + 35 <= remainingBudget) {
        newPlannedTasks.push({
          id: `task-break-${Date.now()}-${sessionIndex++}`,
          courseId,
          courseName: 'Rest & Recovery',
          courseColor: 'slate',
          title: 'Break · Cognitive Reset',
          durationMinutes: 10,
          status: 'pending',
          type: 'review',
          date: new Date().toISOString().split('T')[0],
          reason: 'Scheduled interval to preserve clinical stamina.',
          reasonAr: 'استراحة مجدولة للحفاظ على التركيز السريري.',
          isBreak: true,
        });
        allocatedMinutes += 10;
      }
    }
  }

  // Fallback: If no exam units were found or candidates were empty, create tasks from active courses
  if (newPlannedTasks.length === 0 && courses.length > 0) {
    const activeCourses = courses.filter((c) => c.status !== 'archived');
    for (let i = 0; i < Math.min(activeCourses.length, 2); i++) {
      const c = activeCourses[i];
      const taskDuration = Math.min(45, maxBlock);
      newPlannedTasks.push({
        id: `task-course-${Date.now()}-${i}`,
        courseId: c.id,
        courseName: c.name,
        courseColor: c.color,
        title: `${c.name} — Core Topic Review & Clinical Cases`,
        durationMinutes: taskDuration,
        status: 'pending',
        type: 'lecture',
        date: new Date().toISOString().split('T')[0],
        reason: `Curriculum progression in ${c.name}.`,
        reasonAr: `متابعة المنهاج الأكاديمي في ${c.name}.`,
        priorityLevel: 'medium',
      });
    }
  }

  // Combine completed tasks with newly planned tasks
  return [...completedTodayTasks, ...newPlannedTasks];
};

/**
 * 11. Replan My Week:
 * Recalculates unfinished work across remaining days before exams.
 */
export interface ReplanWeekAnalysis {
  isOverCapacity: boolean;
  totalWorkloadMinutes: number;
  availableCapacityMinutes: number;
  remainingDays: number;
  warningMessage?: string;
  recommendedActions: {
    title: string;
    description: string;
    actionType: 'prioritize_essential' | 'increase_time' | 'exam_rescue';
  }[];
  plannedDistribution: {
    date: string;
    dayName: string;
    assignedUnits: { unitTitle: string; courseName: string; durationMinutes: number }[];
    totalMinutes: number;
  }[];
}

export const analyzeReplanWeek = (
  courses: Course[],
  exams: Exam[],
  dailyCapacityMinutes: number
): ReplanWeekAnalysis => {
  // Find closest exam
  let closestExamDays = 7;
  for (const ex of exams) {
    if (ex.daysRemaining < closestExamDays) {
      closestExamDays = Math.max(1, ex.daysRemaining);
    }
  }

  const daysToPlan = Math.min(7, closestExamDays);
  const totalAvailable = daysToPlan * dailyCapacityMinutes;

  // Calculate total unfinished units
  const allUnfinishedUnits: { unit: StudyUnit; exam: Exam; course?: Course; score: number }[] = [];
  let totalWorkload = 0;

  for (const ex of exams) {
    const units = ex.units || [];
    const course = courses.find((c) => c.name === ex.courseName || c.id === ex.courseId);
    for (const u of units) {
      if (u.status !== 'completed') {
        const scored = scoreStudyUnit(u, ex, course);
        allUnfinishedUnits.push({ unit: u, exam: ex, course, score: scored.score });
        totalWorkload += u.estimatedMinutes;
      }
    }
  }

  allUnfinishedUnits.sort((a, b) => b.score - a.score);

  const isOverCapacity = totalWorkload > totalAvailable;

  const recommendedActions: ReplanWeekAnalysis['recommendedActions'] = [
    {
      title: 'Prioritize Essential Topics',
      description: 'Focus strictly on High-Priority and low-confidence exam chapters, parking optional overviews.',
      actionType: 'prioritize_essential',
    },
    {
      title: 'Increase Available Study Time',
      description: `Expand daily target by ${Math.ceil((totalWorkload - totalAvailable) / daysToPlan)} minutes/day to cover the syllabus comfortably.`,
      actionType: 'increase_time',
    },
    {
      title: 'Create an Exam Rescue Plan',
      description: 'Compress remaining days into high-yield triage spotters and university exam past questions.',
      actionType: 'exam_rescue',
    },
  ];

  // Distribute units across days (Day 1 through daysToPlan)
  const distribution: ReplanWeekAnalysis['plannedDistribution'] = [];
  const dayNames = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  for (let d = 0; d < daysToPlan; d++) {
    distribution.push({
      date: `Day +${d}`,
      dayName: dayNames[d] || `Day ${d + 1}`,
      assignedUnits: [],
      totalMinutes: 0,
    });
  }

  let dayIdx = 0;
  for (const item of allUnfinishedUnits) {
    // Round-robin or fill-first into daily limits
    const currentDay = distribution[dayIdx];
    if (currentDay.totalMinutes + item.unit.estimatedMinutes <= dailyCapacityMinutes * 1.25) {
      currentDay.assignedUnits.push({
        unitTitle: item.unit.title,
        courseName: item.exam.courseName,
        durationMinutes: item.unit.estimatedMinutes,
      });
      currentDay.totalMinutes += item.unit.estimatedMinutes;
    } else {
      // Advance to next day if available
      if (dayIdx + 1 < daysToPlan) {
        dayIdx++;
        distribution[dayIdx].assignedUnits.push({
          unitTitle: item.unit.title,
          courseName: item.exam.courseName,
          durationMinutes: item.unit.estimatedMinutes,
        });
        distribution[dayIdx].totalMinutes += item.unit.estimatedMinutes;
      }
    }
  }

  return {
    isOverCapacity,
    totalWorkloadMinutes: totalWorkload,
    availableCapacityMinutes: totalAvailable,
    remainingDays: daysToPlan,
    warningMessage: isOverCapacity
      ? 'Your current available study time may not be enough to complete everything before the exam.'
      : undefined,
    recommendedActions,
    plannedDistribution: distribution,
  };
};

/**
 * 12. Exam Rescue Mode Plan Generator:
 * Creates compressed triage plan prioritizing:
 * 1. Unfinished high-priority topics
 * 2. Low-confidence topics
 * 3. High-yield summary review
 * 4. Practice questions / MCQs
 */
export interface ExamRescueItem {
  id: string;
  stepNumber: number;
  category: 'high_priority' | 'low_confidence' | 'high_yield_review' | 'practice_mcqs';
  title: string;
  courseName: string;
  estimatedMinutes: number;
  badge: string;
}

export const generateExamRescuePlan = (
  exam: Exam,
  course?: Course,
  availableMinutes = 120
): ExamRescueItem[] => {
  const units = exam.units || [];
  const items: ExamRescueItem[] = [];
  let step = 1;

  // 1. Unfinished high-priority topics
  const highPriorityUnits = units.filter(
    (u) => u.status !== 'completed' && u.priority === 'high'
  );
  for (const u of highPriorityUnits.slice(0, 2)) {
    items.push({
      id: `rescue-${step}`,
      stepNumber: step++,
      category: 'high_priority',
      title: u.title,
      courseName: exam.courseName,
      estimatedMinutes: Math.min(35, u.estimatedMinutes),
      badge: 'High Priority Topic',
    });
  }

  // 2. Low-confidence topics (< 55%)
  const lowConfidenceUnits = units.filter(
    (u) => u.status !== 'completed' && u.confidence < 55 && !items.some((i) => i.title === u.title)
  );
  for (const u of lowConfidenceUnits.slice(0, 2)) {
    items.push({
      id: `rescue-${step}`,
      stepNumber: step++,
      category: 'low_confidence',
      title: `${u.title} (Core Focus)`,
      courseName: exam.courseName,
      estimatedMinutes: 25,
      badge: `Low Confidence (${u.confidence}%)`,
    });
  }

  // 3. High-yield summary review
  items.push({
    id: `rescue-${step}`,
    stepNumber: step++,
    category: 'high_yield_review',
    title: `${exam.courseName}: Pathognomonic Spotters & Differential Table`,
    courseName: exam.courseName,
    estimatedMinutes: 20,
    badge: 'High-Yield Pearl Review',
  });

  // 4. Practice questions / MCQs
  items.push({
    id: `rescue-${step}`,
    stepNumber: step++,
    category: 'practice_mcqs',
    title: `Rapid Fire University MCQs & Case Spotters (${exam.courseName})`,
    courseName: exam.courseName,
    estimatedMinutes: 25,
    badge: 'Active Recall & MCQs',
  });

  return items;
};

/**
 * 18. Motivation Engine:
 * Generates honest, data-backed motivational statements using REAL stored progress only.
 * Avoids generic praise or guilt-based streak pressure.
 */
export interface MotivationContext {
  tasks: StudyTask[];
  dailyReviews: DailyReview[];
  focusSessions: FocusSessionLog[];
  courses: Course[];
  exams: Exam[];
}

export const getRealDataMotivation = (
  ctx: MotivationContext,
  language: 'en' | 'ar'
): string | null => {
  const isAr = language === 'ar';
  const completedToday = ctx.tasks.filter((t) => t.status === 'completed' && !t.isBreak);
  const totalToday = ctx.tasks.filter((t) => !t.isBreak);

  // 1. Task progress comparison today
  if (totalToday.length > 0 && completedToday.length === totalToday.length) {
    return isAr
      ? `أنجزتِ جميع مهام اليوم (${completedToday.length} من ${totalToday.length}). خطة اليوم مكتملة بنجاح!`
      : `All planned work for today is complete (${completedToday.length} of ${totalToday.length} tasks). Well done!`;
  }

  // 2. Comparison with yesterday's review
  if (ctx.dailyReviews.length > 0 && totalToday.length > 0) {
    const yesterdayReview = ctx.dailyReviews[0];
    const yesterdayRatio =
      yesterdayReview.totalTasksCount > 0
        ? Math.round((yesterdayReview.completedTasksCount / yesterdayReview.totalTasksCount) * 100)
        : 0;
    const todayRatio = Math.round((completedToday.length / totalToday.length) * 100);

    if (todayRatio > yesterdayRatio && yesterdayRatio > 0) {
      return isAr
        ? `بالأمس أنجزتِ ${yesterdayRatio}% من خطتكِ. اليوم حققتِ بالفعل ${todayRatio}%.`
        : `Yesterday you completed ${yesterdayRatio}% of your plan. Today you're already at ${todayRatio}%.`;
    }
  }

  // 3. Completed units in a specific course this week
  const weekSessions = ctx.focusSessions.filter((s) => {
    const diff = (Date.now() - new Date(s.completedAt).getTime()) / (1000 * 3600 * 24);
    return diff <= 7;
  });

  if (weekSessions.length >= 2) {
    const courseCounts: Record<string, number> = {};
    for (const s of weekSessions) {
      courseCounts[s.courseName] = (courseCounts[s.courseName] || 0) + 1;
    }
    const topCourse = Object.keys(courseCounts).sort(
      (a, b) => courseCounts[b] - courseCounts[a]
    )[0];
    if (topCourse && courseCounts[topCourse] >= 2) {
      return isAr
        ? `أكملتِ ${courseCounts[topCourse]} جلسات دراسية لمقرر ${topCourse} خلال هذا الأسبوع.`
        : `You have completed ${courseCounts[topCourse]} study sessions for ${topCourse} this week.`;
    }
  }

  // 4. Confidence increase recorded
  const confidenceGains = ctx.focusSessions
    .filter(
      (s) =>
        s.confidenceBefore !== undefined &&
        s.confidenceAfter > s.confidenceBefore
    )
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  if (confidenceGains.length > 0) {
    const recent = confidenceGains[0];
    return isAr
      ? `ارتفعت ثقتكِ في ${recent.courseName} من ${recent.confidenceBefore}% إلى ${recent.confidenceAfter}%.`
      : `Your confidence in ${recent.courseName} increased from ${recent.confidenceBefore}% to ${recent.confidenceAfter}%.`;
  }

  // 5. Plain factual progress
  if (completedToday.length > 0) {
    return isAr
      ? `تم إنجاز ${completedToday.length} من أصل ${totalToday.length} مهام مخططة لليوم.`
      : `${completedToday.length} of ${totalToday.length} tasks complete today.`;
  }

  return null;
};
