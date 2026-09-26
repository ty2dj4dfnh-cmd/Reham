import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  X,
  BookOpen,
  Calendar,
  Clock,
  Target,
  Zap,
  Sun,
  Moon,
  BatteryCharging,
  Stethoscope,
  Smile,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  UserProfile,
  Language,
  Course,
  Exam,
  AcademicYear,
} from '../types';

interface OnboardingModalProps {
  initialName: string;
  initialEmail?: string;
  onComplete: (data: {
    profile: Partial<UserProfile>;
    courses: Course[];
    firstExam?: Exam;
  }) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const DENTAL_COURSE_SUGGESTIONS = [
  'Dental Anatomy',
  'Oral Histology',
  'Physiology',
  'Biochemistry',
  'General Pathology',
  'Pharmacology',
  'Oral Pathology',
  'Dental Radiology',
  'Prosthodontics',
  'Periodontology',
  'Operative Dentistry / Restorative Dentistry',
  'Endodontics',
  'Orthodontics',
  'Pediatric Dentistry',
  'Oral and Maxillofacial Surgery',
  'Oral Medicine',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialName,
  initialEmail,
  onComplete,
  language,
  onLanguageChange,
}) => {
  const [step, setStep] = useState<number>(1);

  // STEP 1: Personalize DentalMind
  const [name, setName] = useState(initialName || '');
  const [university, setUniversity] = useState('');
  const [country, setCountry] = useState('');
  const [program, setProgram] = useState<'Dentistry' | 'Other'>('Dentistry');
  const [customProgram, setCustomProgram] = useState('');
  const [academicYear, setAcademicYear] = useState<AcademicYear>('3');
  const [preferredLang, setPreferredLang] = useState<Language>(language);

  // STEP 2: Current Courses
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedCourseNames, setSelectedCourseNames] = useState<string[]>([
    'Oral Pathology',
    'Dental Radiology',
    'Operative Dentistry / Restorative Dentistry',
  ]);
  const [customCourseInput, setCustomCourseInput] = useState('');

  // STEP 3: Upcoming Exams (Optional)
  const [hasUpcomingExam, setHasUpcomingExam] = useState<boolean | null>(null);
  const [examCourse, setExamCourse] = useState<string>('');
  const [examTitle, setExamTitle] = useState<string>('Midterm Examination');
  const [examDate, setExamDate] = useState<string>('2026-10-18');
  const [targetScore, setTargetScore] = useState<string>('90%+');

  // STEP 4: Study Goals & Habits
  const [dailyTarget, setDailyTarget] = useState<'1h' | '2h' | '3h' | '4h+'>('2h');
  const [weeklyDays, setWeeklyDays] = useState<number>(5);
  const [studyStyle, setStudyStyle] = useState<
    'Deep focus blocks' | 'Short spaced sessions' | 'Exam-driven revision' | 'Clinical practice review'
  >('Deep focus blocks');
  const [energyPeak, setEnergyPeak] = useState<'Morning' | 'Afternoon' | 'Night'>('Afternoon');

  // STEP 5: AI Study Companion Setup animation states
  const [setupStage, setSetupStage] = useState<number>(0);

  // Sync preferred language changes
  const handleLangChange = (newLang: Language) => {
    setPreferredLang(newLang);
    onLanguageChange(newLang);
  };

  const isAr = preferredLang === 'ar';

  const toggleCourseSelection = (cName: string) => {
    if (selectedCourseNames.includes(cName)) {
      setSelectedCourseNames(selectedCourseNames.filter((c) => c !== cName));
    } else {
      setSelectedCourseNames([...selectedCourseNames, cName]);
    }
  };

  const handleAddCustomCourse = () => {
    const trimmed = customCourseInput.trim();
    if (trimmed && !selectedCourseNames.includes(trimmed)) {
      setSelectedCourseNames([...selectedCourseNames, trimmed]);
      setCustomCourseInput('');
    }
  };

  const filteredSuggestions = DENTAL_COURSE_SUGGESTIONS.filter((c) =>
    c.toLowerCase().includes(courseSearch.toLowerCase())
  );

  // Trigger automated setup animation when reaching step 5
  useEffect(() => {
    if (step === 5) {
      const timer1 = setTimeout(() => setSetupStage(1), 1000);
      const timer2 = setTimeout(() => setSetupStage(2), 2200);
      const timer3 = setTimeout(() => setSetupStage(3), 3400);
      const timer4 = setTimeout(() => {
        finalizeAndEnterDashboard();
      }, 4600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [step]);

  const finalizeAndEnterDashboard = () => {
    // Generate Courses
    const colors = ['teal', 'emerald', 'cyan', 'blue', 'indigo', 'purple'];
    const generatedCourses: Course[] = selectedCourseNames.map((cName, idx) => ({
      id: `course-${Date.now()}-${idx}`,
      code: `DENT-${academicYear}0${idx + 1}`,
      name: cName,
      nameAr: cName,
      color: colors[idx % colors.length],
      progressPercent: idx === 0 ? 35 : idx === 1 ? 20 : 10,
      nextExamDate: hasUpcomingExam && examCourse === cName ? examDate : '2026-11-15',
      nextExamDays: hasUpcomingExam && examCourse === cName ? 24 : 35,
      lecturesCompleted: idx === 0 ? 3 : 1,
      totalLectures: 14,
      questionsSolved: idx === 0 ? 45 : 15,
      totalQuestions: 180,
      confidence: idx === 0 ? 'High' : 'Needs Review',
      weakTopics: ['Differential Criteria', 'Histopathology Signs'],
      weakTopicsAr: ['المعايير التفريقية', 'العلامات النسيجية المرضية'],
      overview: `University curriculum course in ${cName}.`,
      overviewAr: `مقرر دراسي جامعي في ${cName}.`,
      instructor: 'Faculty of Dentistry',
      semester: 'Current Semester',
      status: 'active',
      createdAt: new Date().toISOString(),
    }));

    // First exam if provided
    let firstExam: Exam | undefined = undefined;
    if (hasUpcomingExam && examCourse) {
      const examDateObj = new Date(examDate);
      const today = new Date('2026-09-24');
      const diffDays = Math.max(
        1,
        Math.round((examDateObj.getTime() - today.getTime()) / (1000 * 3600 * 24))
      );

      firstExam = {
        id: `exam-${Date.now()}`,
        courseName: examCourse,
        examType: 'Midterm',
        examTitle: examTitle.trim() || 'Midterm Examination',
        examDate,
        daysRemaining: diffDays,
        preparationPercent: 45,
        initialPreparationPercent: 45,
        targetGrade: targetScore.trim() || '90%+',
        topicsRemainingCount: 5,
        highYieldTopics: [
          'High-Yield Differential Diagnoses',
          'Clinical Radiographic Hallmarks',
          'Past University MCQs & Cases',
        ],
        createdAt: new Date().toISOString(),
      };
    }

    let dailyHoursNum = 2;
    if (dailyTarget === '1h') dailyHoursNum = 1;
    if (dailyTarget === '2h') dailyHoursNum = 2;
    if (dailyTarget === '3h') dailyHoursNum = 3;
    if (dailyTarget === '4h+') dailyHoursNum = 4.5;

    onComplete({
      profile: {
        name: name.trim() || initialName || 'Doctor',
        university: university.trim(),
        country: country.trim(),
        program:
          program === 'Dentistry'
            ? 'Bachelor of Dental Surgery (BDS)'
            : customProgram.trim() || 'Dentistry',
        year: academicYear === 'Internship' ? 'Dental Internship' : `Year ${academicYear}`,
        academicYear,
        preferredLanguage: preferredLang,
        dailyStudyTargetHours: dailyHoursNum,
        weeklyStudyDays: weeklyDays,
        studyStyle,
        energyPeak,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      },
      courses: generatedCourses,
      firstExam,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Step Tracker */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-teal-600 text-white shadow-xs">
                <Stethoscope className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  DentalMind
                </span>
                <span className="text-[11px] text-slate-400">
                  {isAr ? 'إعداد حساب طبيب الأسنان' : 'Dental Student Onboarding'}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {isAr ? `الخطوة ${step} من 5` : `Step ${step} of 5`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Contents */}
        <div className="p-6 md:p-8 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* STEP 1: Personalize DentalMind */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isAr ? 'لنتعرف عليكِ أولاً ونخصص دنتال مايند.' : "Let's personalize DentalMind."}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr
                    ? 'أخبرينا عن كليتكِ وسنتكِ الدراسية لنخصص لكِ رفيقاً دراسياً ذكياً.'
                    : 'Tell us about your dental faculty and academic year so DentalMind adapts to your curriculum.'}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الاسم *' : 'Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isAr ? 'مثال: ريهام' : 'e.g. Reham'}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الجامعة / كلية طب الأسنان' : 'University / Faculty'}
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder={isAr ? 'مثال: كلية طب الأسنان' : 'e.g. Faculty of Dentistry'}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الدولة' : 'Country'}
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={isAr ? 'مثال: فلسطين، الأردن، مصر...' : 'e.g. Palestine, Jordan, Egypt, UK...'}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'البرنامج الدراسي' : 'Program'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setProgram('Dentistry')}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        program === 'Dentistry'
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isAr ? 'طب وجراحة الأسنان' : 'Dentistry'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProgram('Other')}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        program === 'Other'
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isAr ? 'برنامج آخر' : 'Other'}
                    </button>
                  </div>
                  {program === 'Other' && (
                    <input
                      type="text"
                      value={customProgram}
                      onChange={(e) => setCustomProgram(e.target.value)}
                      placeholder={isAr ? 'حددي البرنامج الأكاديمي' : 'Specify your program'}
                      className="mt-2 w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                    />
                  )}
                </div>
              </div>

              {/* Academic Year Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? 'السنة الدراسية' : 'Academic Year'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {(['1', '2', '3', '4', '5', '6', 'Internship'] as AcademicYear[]).map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setAcademicYear(yr)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all cursor-pointer ${
                        academicYear === yr
                          ? 'border-teal-500 bg-teal-600 text-white font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {yr === 'Internship' ? (isAr ? 'امتياز' : 'Intern') : isAr ? `سنة ${yr}` : `Year ${yr}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Interface Language */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? 'لغة الواجهة المفضلة' : 'Preferred Interface Language'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleLangChange('en')}
                    className={`p-3 rounded-2xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      preferredLang === 'en'
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    English (LTR)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLangChange('ar')}
                    className={`p-3 rounded-2xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      preferredLang === 'ar'
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    العربية (RTL)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Current Courses */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isAr ? 'ما هي مقرراتكِ الدراسية لهذا الفصل؟' : 'What are you studying this semester?'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr
                    ? 'اختاري مقرراتكِ من القائمة المقترحة أو أضيفي مقررات مخصصة.'
                    : 'Select your current dental subjects from the suggestions or add custom course names.'}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute start-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder={
                    isAr
                      ? 'ابحثي في مقررات الأسنان (مثل: علم الأمراض، الأشعة، المداواة)...'
                      : 'Search dental subjects (e.g. Pathology, Radiology, Restorative)...'
                  }
                  className="w-full ps-9 pe-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Selected Courses Chips */}
              {selectedCourseNames.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isAr ? `المقررات المختارة (${selectedCourseNames.length}):` : `Selected (${selectedCourseNames.length}):`}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCourseNames.map((cName) => (
                      <span
                        key={cName}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800"
                      >
                        <span>{cName}</span>
                        <button
                          type="button"
                          onClick={() => toggleCourseSelection(cName)}
                          className="hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Courses Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  {isAr ? 'دليل مقررات طب الأسنان الشائعة:' : 'Dental Curriculum Catalog:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1">
                  {filteredSuggestions.map((cName) => {
                    const isSelected = selectedCourseNames.includes(cName);
                    return (
                      <button
                        key={cName}
                        type="button"
                        onClick={() => toggleCourseSelection(cName)}
                        className={`p-2.5 rounded-xl border text-start text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-100 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate pe-2">{cName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Course */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {isAr ? 'مقرركِ غير مدرج؟ أضيفي اسماً مخصصاً:' : 'Course not listed? Add custom course:'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customCourseInput}
                    onChange={(e) => setCustomCourseInput(e.target.value)}
                    placeholder={
                      isAr ? 'مثال: زراعة الأسنان السريرية' : 'e.g. Implantology Clinical Lab'
                    }
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCourse}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة' : 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Upcoming Exams (Optional) */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isAr ? 'هل لديكِ امتحانات قادمة؟ (اختياري)' : 'Do you have an upcoming exam?'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr
                    ? 'إضافة موعد امتحانكِ القادم يفعّل ميزة العد التنازلي والمراجعة الذكية عالية العائد.'
                    : 'Adding your upcoming exam enables adaptive countdown pacing and high-yield topic distribution.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setHasUpcomingExam(true);
                    if (!examCourse && selectedCourseNames.length > 0) {
                      setExamCourse(selectedCourseNames[0]);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    hasUpcomingExam === true
                      ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {isAr ? 'نعم، أود إضافة امتحان' : 'Yes, add an exam'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHasUpcomingExam(false);
                    setStep(4);
                  }}
                  className={`p-3.5 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    hasUpcomingExam === false
                      ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {isAr ? 'تخطي للآن' : 'Skip for now'}
                </button>
              </div>

              {hasUpcomingExam && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4 pt-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'المقرر الدراسي *' : 'Course *'}
                    </label>
                    <select
                      value={examCourse}
                      onChange={(e) => setExamCourse(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                    >
                      {selectedCourseNames.map((cName) => (
                        <option key={cName} value={cName}>
                          {cName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {isAr ? 'عنوان الامتحان' : 'Exam Title'}
                      </label>
                      <input
                        type="text"
                        value={examTitle}
                        onChange={(e) => setExamTitle(e.target.value)}
                        placeholder={isAr ? 'مثال: امتحان منتصف الفصل' : 'e.g. Midterm Examination'}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {isAr ? 'تاريخ الامتحان' : 'Exam Date'}
                      </label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'العلامة / النتيجة المستهدفة' : 'Target Score / Grade'}
                    </label>
                    <input
                      type="text"
                      value={targetScore}
                      onChange={(e) => setTargetScore(e.target.value)}
                      placeholder={isAr ? 'مثال: 90%+ أو A' : 'e.g. 90%+, A, 3.8 GPA'}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Study Goals & Habits */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isAr ? 'أهدافكِ وعاداتكِ الدراسية' : 'Study Goals & Habits'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr
                    ? 'يساعدنا هذا في ضبط ساعات وجداول المذاكرة المتوازنة دون إرهاق.'
                    : 'Configure your pacing preferences to prevent burnout and match your clinical stamina.'}
                </p>
              </div>

              {/* Daily study target */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? 'هدف المذاكرة اليومي:' : 'Daily study target:'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['1h', '2h', '3h', '4h+'] as const).map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDailyTarget(hrs)}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                        dailyTarget === hrs
                          ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {hrs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly study target */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? 'أيام المذاكرة أسبوعياً:' : 'Weekly study target (days per week):'}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setWeeklyDays(num)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                        weeklyDays === num
                          ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isAr ? `${num} أيام` : `${num} days`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Study style */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? 'أسلوب المذاكرة المفضل:' : 'Study style:'}
                </label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: 'Deep focus blocks',
                      title: isAr ? 'فترات تركيز عميقة' : 'Deep focus blocks',
                      desc: isAr ? 'جلسات متواصلة دون مقاطعة' : 'Extended uninterrupted study blocks',
                    },
                    {
                      id: 'Short spaced sessions',
                      title: isAr ? 'جلسات قصيرة متباعدة' : 'Short spaced sessions',
                      desc: isAr ? 'بومودورو واسترجاع سريع' : 'Pomodoros & spaced repetition',
                    },
                    {
                      id: 'Exam-driven revision',
                      title: isAr ? 'مراجعة موجهة للامتحانات' : 'Exam-driven revision',
                      desc: isAr ? 'نقاط عالية العائد وبنوك أسئلة' : 'High-yield recall & MCQ question banks',
                    },
                    {
                      id: 'Clinical practice review',
                      title: isAr ? 'مراجعة الحالات السريرية' : 'Clinical practice review',
                      desc: isAr ? 'حالات تشخيصية ومعايير تفريقية' : 'Case studies & differential criteria',
                    },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setStudyStyle(style.id as any)}
                      className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                        studyStyle === style.id
                          ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/60 ring-1 ring-teal-500 text-teal-900 dark:text-teal-100'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{style.title}</span>
                        {studyStyle === style.id && <Check className="w-3.5 h-3.5 text-teal-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {style.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy peak */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? 'ذروة الطاقة واليقظة الذهنية:' : 'Energy peak:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Morning', title: isAr ? 'صباحاً' : 'Morning', icon: Sun },
                    { id: 'Afternoon', title: isAr ? 'ظهراً وعصراً' : 'Afternoon', icon: Zap },
                    { id: 'Night', title: isAr ? 'ليلاً' : 'Night', icon: Moon },
                  ].map((peak) => {
                    const Icon = peak.icon;
                    return (
                      <button
                        key={peak.id}
                        type="button"
                        onClick={() => setEnergyPeak(peak.id as any)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          energyPeak === peak.id
                            ? 'border-teal-500 bg-teal-600 text-white font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{peak.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: AI Study Companion Setup */}
          {step === 5 && (
            <div className="py-8 space-y-8 animate-in fade-in text-center max-w-lg mx-auto">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center shadow-xl animate-pulse">
                  <Stethoscope className="w-10 h-10" />
                </div>
                <div className="absolute -top-1 -end-1 w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {isAr ? 'جارٍ تهيئة رفيقكِ الدراسي...' : 'Setting up your study companion...'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr
                    ? 'نقوم بتحليل مقرراتكِ السريرية وتوزيع المهام وفق أوقات طاقتكِ.'
                    : 'Calibrating adaptive roadmap to match your clinical schedule and exams.'}
                </p>
              </div>

              {/* 4 Staged Setup Items */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-start space-y-3.5">
                {/* 1: Personalizing your study companion... */}
                <div className="flex items-center gap-3">
                  {setupStage >= 1 ? (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin shrink-0" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      setupStage >= 1
                        ? 'text-teal-900 dark:text-teal-200 font-bold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isAr ? 'تخصيص رفيقكِ الدراسي...' : 'Personalizing your study companion...'}
                  </span>
                </div>

                {/* 2: Analyzing your semester curriculum... */}
                <div className="flex items-center gap-3">
                  {setupStage >= 2 ? (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : setupStage === 1 ? (
                    <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      setupStage >= 2
                        ? 'text-teal-900 dark:text-teal-200 font-bold'
                        : setupStage === 1
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isAr
                      ? `تحليل الخطة الدراسية (${selectedCourseNames.length} مقررات)...`
                      : `Analyzing your semester curriculum (${selectedCourseNames.length} courses)...`}
                  </span>
                </div>

                {/* 3: Building adaptive study plan... */}
                <div className="flex items-center gap-3">
                  {setupStage >= 3 ? (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : setupStage === 2 ? (
                    <div className="w-6 h-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      setupStage >= 3
                        ? 'text-teal-900 dark:text-teal-200 font-bold'
                        : setupStage === 2
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isAr ? 'بناء خطة المذاكرة المتكيفة...' : 'Building adaptive study plan...'}
                  </span>
                </div>

                {/* 4: Ready! */}
                <div className="flex items-center gap-3">
                  {setupStage >= 3 ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-bold ${
                      setupStage >= 3
                        ? 'text-emerald-600 dark:text-emerald-400 text-sm'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isAr ? 'جاهز! الدخول إلى دنتال مايند...' : 'Ready! Entering DentalMind...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {step < 5 && (
          <div className="flex items-center justify-between p-5 sm:p-6 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{isAr ? 'رجوع' : 'Back'}</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={() => {
                if (step === 1 && !name.trim()) return;
                if (step === 2 && selectedCourseNames.length === 0) return;
                setStep(step + 1);
              }}
              disabled={
                (step === 1 && !name.trim()) || (step === 2 && selectedCourseNames.length === 0)
              }
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>{step === 4 ? (isAr ? 'تهيئة الحساب' : 'Launch Setup') : isAr ? 'متابعة' : 'Continue'}</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
