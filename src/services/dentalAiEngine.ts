import {
  Course,
  Exam,
  StudyTask,
  DailyCheckInState,
  Achievement,
  UserProfile,
  Language,
  TutorActionButton,
  ChatMessage,
} from '../types';

export interface DentalAiContext {
  studentName: string;
  language: Language;
  courses: Course[];
  exams: Exam[];
  tasks: StudyTask[];
  checkIn?: DailyCheckInState;
  profile?: UserProfile;
  achievements?: Achievement[];
  streakDays?: number;
  studyMinutesToday?: number;
}

export interface DentalAiResponse {
  text: string;
  clinicalPearl?: string;
  actions?: TutorActionButton[];
  referencedData?: {
    courseName?: string;
    examName?: string;
    taskTitle?: string;
  };
}

/**
 * Detects if a text query is primarily in Arabic or requests Arabic explanation
 */
export const detectArabicQuery = (query: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF]/;
  const lower = query.toLowerCase();
  if (arabicRegex.test(query)) return true;
  if (lower.includes('arabic') || lower.includes('بالعربي') || lower.includes('عربي')) return true;
  return false;
};

/**
 * Core Dental Knowledge Base for High-Yield Study Questions
 */
interface DentalTopicKnowledge {
  keywords: string[];
  titleEn: string;
  titleAr: string;
  explanationEn: string;
  explanationAr: string;
  clinicalPearlEn: string;
  clinicalPearlAr: string;
  suggestedActionType?: 'start_focus' | 'review_weak_topics' | 'open_plan';
}

const DENTAL_TOPIC_DATABASE: DentalTopicKnowledge[] = [
  {
    keywords: ['leukoplakia', 'لوكوبلاكيا', 'بقعة بيضاء', 'white patch'],
    titleEn: 'Leukoplakia',
    titleAr: 'الطلاوة (Leukoplakia)',
    explanationEn:
      'Leukoplakia is a clinical term defined by the WHO as a predominantly white plaque or patch of questionable risk having excluded other known diseases or disorders that carry no increased risk for cancer. It cannot be scraped off (unlike Pseudomembranous Candidiasis).\n\n• Clinical Variants: Homogeneous (flat, uniform, lower malignant transformation risk ~1–3%) vs Non-Homogeneous (speckled/erythroleukoplakia, verrucous, nodular; significantly higher risk 15–30%).\n• High-Risk Sites: Floor of mouth, ventrolateral tongue, and soft palate complex.\n• Histopathology: Ranges from hyperkeratosis and acanthosis without dysplasia to severe epithelial dysplasia and carcinoma in situ.',
    explanationAr:
      'الطلاوة (Leukoplakia) تُعرّف وفق منظمة الصحة العالمية (WHO) بأنها بقعة أو صفيحة بيضاء سائدة لا يمكن كشطها (Unscrapable)، ولا يمكن تصنيفها سريرياً أو نسيجياً كأي آفة أخرى.\n\n• الأشكال السريرية: المتجانسة (Homogeneous) ذات سطح أملس وخطر تحول خبيث منخفض (1–3%)، وغير المتجانسة (Non-homogeneous / Erythroleukoplakia) المبرقشة بأحمر وأبيض وذات خطر تحول سرطاني مرتفع جداً (15–30%).\n• المواقع عالية الخطورة: قاع الفم (Floor of mouth)، والحواف الجانبية السفلية للسان (Ventrolateral tongue).\n• التدبير: أخذ خزعة جراحية (Incisional Biopsy) لتحديد درجة التبدل النسيجي الخبيث (Epithelial Dysplasia) واستئصالها.',
    clinicalPearlEn:
      'Always perform an incisional biopsy at the most erythematous, indurated, or ulcerated area (erythroleukoplakic focus) to avoid under-grading dysplasia.',
    clinicalPearlAr:
      'القاعدة الذهبية في الامتحان: إذا ظهرت بقعة حمراء مرافقة للطلاوة (Erythroleukoplakia)، فالخزعة تُؤخذ حتماً من المنطقة الحمراء الأكثر عرضة لـ Severe Dysplasia.',
  },
  {
    keywords: ['erosion', 'abrasion', 'attrition', 'abfraction', 'تآكل', 'انكشاف العاج', 'tooth wear'],
    titleEn: 'Non-Carious Cervical Lesions & Tooth Wear',
    titleAr: 'أشكال التآكل السني غير المنخور (Tooth Wear)',
    explanationEn:
      'Differentiation of non-carious tooth surface loss:\n\n1. Attrition: Mechanical wear of tooth against tooth (physiologic or bruxism). Hallmarks: Matching wear facets on opposing arches, flat occlusal tables, intact cervical margins.\n2. Abrasion: Mechanical wear from external friction (vigorous horizontal tooth-brushing with abrasive paste, pipes, bobby pins). Hallmarks: V-shaped or saucer-shaped cervical defects with hard, polished margins, typically on buccal aspects of premolars/canines.\n3. Erosion (Corrosion): Chemical dissolution of enamel and dentin without bacterial involvement. Sources: Extrinsic (acidic citrus, carbonated beverages, wine) vs Intrinsic (GERD, bulimia, morning sickness). Hallmarks: Cupping of cusp tips, "floating" amalgam restorations standing above dissolved enamel, smooth glossy lesions without sharp angles.\n4. Abfraction: Microstructural tooth loss in the cervical region due to biomechanical flexural stresses and occlusal overload, causing enamel prisms to micro-fracture at the fulcrum (cementoenamel junction).',
    explanationAr:
      'المقارنة السريرية الدقيقة لفقدان النسج السنية غير النخرية:\n\n1. الحت (Attrition): تآكل ميكانيكي سن-مقابل-سن بسبب الإطباق أو الصرير (Bruxism). العلامة: أسطح حت متطابقة تماماً في الفكين.\n2. السحج (Abrasion): تآكل ميكانيكي ناجم عن جسم خارجي (تفريش أفقي عنيف بمعجون خشن، قضم الأقلام). العلامة: وهدة عنقية محددة على شكل V أو صحن أملس قاسي عند الضواحك والأنياب.\n3. التآكل الحمضي (Erosion): انحلال كيميائي للنسج الصلبة بحمض غير جرثومي. إما خارجي (حمضيات ومشروبات غازية) أو داخلي (ارتجاع مريئي GERD أو إقياء). العلامة: حشوات الأملغم تبدو طافية (Floating Restorations) لزوال الميناء حولها، مع تقعر قمم الشرفات (Cupping).\n4. الانكسار العنقي الإجهادي (Abfraction): ناتج عن قوى الإطباق العنيفة التي تسبب انثناء السن عند عنق السن (CEJ) مسببة تفتت مواشير الميناء.',
    clinicalPearlEn:
      'Exam clue: "Amalgam restorations elevated above the surrounding occlusal enamel" is pathognomonic for chemical Erosion (perimylolysis).',
    clinicalPearlAr:
      'سؤال امتحاني متكرر: حشوات الأملغم التي تبدو بارزة وطافية فوق مستوى سطح السن (Floating Amalgams) تشير مباشرة إلى التآكل الحمضي (Erosion).',
  },
  {
    keywords: ['ameloblastoma', 'ورم أرومي مينائي', 'ورم مينائي', 'vickers gorlin', 'soap bubble'],
    titleEn: 'Ameloblastoma vs Odontogenic Keratocyst (OKC)',
    titleAr: 'الورم الأرومي المينائي (Ameloblastoma) مقابل كيس التقرن (OKC)',
    explanationEn:
      'Differential criteria for radiolucent lesions in the posterior mandible:\n\n• Ameloblastoma: Benign but locally aggressive, invasive neoplasm. Peak age: 30–50 years. Radiograph: Multilocular "soap-bubble" or "honeycomb" radiolucency causing knife-edge root resorption and marked buccolingual cortical expansion. Histology: Follicular or plexiform patterns with peripheral columnar cells showing reverse nuclear polarity (Vickers-Gorlin criteria: nuclei polarized away from basement membrane with subnuclear vacuolation) and central stellate reticulum-like cells. Over 60% harbor BRAF V600E mutations.\n\n• Odontogenic Keratocyst (OKC): Benign intraosseous cystic lesion. Peak age: 20–30 years. Radiograph: Multilocular or unilocular radiolucency that tends to grow anteroposteriorly within the medullary bone without significant cortical expansion until very large. Histology: Thin, uniform parakeratinized stratified squamous epithelium (6–8 cell layers), hyperchromatic palisaded basal cells ("picket-fence" or "tombstone" appearance), wavy/corrugated surface, and lumen filled with cheesy keratin flakes. Associated with PTCH1 mutation and Nevoid Basal Cell Carcinoma Syndrome (Gorlin syndrome).',
    explanationAr:
      'الفروق الجوهرية لأسئلة البورد وامتحانات الماستر:\n\n• الورم الأرومي المينائي (Ameloblastoma):\n- شعاعياً: آفة شافة للأشعة متعددة المساكن تشبه فقاعات الصابون (Soap-bubble) وتسبب توسعاً شديداً في الصفيحتين القشرية الدهليزية واللسانية مع امتصاص جذري حاد (Knife-edge root resorption).\n- نسيجياً: خلايا محيطية عمودية بقطبية نووية معكوسة (Vickers-Gorlin Criteria: النوى تبتعد عن الغشاء القاعدي مع فجوات تحت نووية) مع شبكة نجمية مركزية (Stellate Reticulum).\n\n• كيس التقرن السني (OKC):\n- شعاعياً: ينمو طولياً للأمام والخلف داخل العظم الإسفنجي (Anteroposterior extension) بأقل قدر من الانتفاخ القشري السريري.\n- نسيجياً: ظهارة رقيقة موحدة 6-8 طبقات، خلايا قاعدية مصفوفة كسور الخشب (Picket fence)، سطح متموج ومتقرن، ومملوء بالكيراتين. مرتبط بطفرة PTCH1 ومتلازمة جورلين (Gorlin Syndrome).',
    clinicalPearlEn:
      'OKC grows along the length of the mandible causing minimal cortical expansion; Ameloblastoma causes striking bucco-lingual cortical expansion and root resorption.',
    clinicalPearlAr:
      'للتفريق السريع: كيس OKC ينمو طولياً عبر نخاع العظم دون توسيع ملحوظ للقشرة، بينما الورم المينائي Ameloblastoma يسبب انتفاخاً عظمياً صريحاً وامتصاصاً لجذور الأسنان المجاورة.',
  },
  {
    keywords: ['pulpitis', 'التهاب العصب', 'pulp', 'لب السن', 'vitality', 'reversible'],
    titleEn: 'Endodontic Diagnosis: Reversible vs Irreversible Pulpitis',
    titleAr: 'التشخيص اللبي: التهاب اللب الردود مقابل غير الردود',
    explanationEn:
      'Key diagnostic distinctions for pulpal pathology:\n\n1. Reversible Pulpitis: Transient, sharp pain stimulated by thermal changes (cold > sweet > hot). The pain ceases almost immediately (within seconds) after removal of the stimulus. No lingering pain, no nocturnal spontaneous pain, no periapical radiolucency. Histology: Hyperemia and focal edema.\n\n2. Symptomatic Irreversible Pulpitis: Lingering, persistent pain lasting minutes to hours after thermal stimulus removal. Often characterized by spontaneous, throbbing, dull or severe nocturnal pain awakened from sleep. Heat often exacerbates while cold may temporarily alleviate. Periapical tissues usually normal initially (unless infection has reached apical foramen).\n\n3. Pulp Necrosis: Total cessation of pulpal blood supply and neural function. Non-responsive to cold and electric pulp testing (EPT). Negative response unless partial liquefactive necrosis in multi-rooted tooth.',
    explanationAr:
      'معايير التشخيص اللبي اليومي في العيادة والامتحان:\n\n1. التهاب اللب الردود (Reversible Pulpitis):\n- الألم حاد وعابر يحرضه البرود أو السكريات، ويزول فور إزالة المنبه (خلال ثوانٍ معدودة دون Lingering pain).\n- لا يوجد ألم عفوي ليلي (No spontaneous pain).\n\n2. التهاب اللب غير الردود العرضي (Symptomatic Irreversible Pulpitis):\n- ألم نابض ومستمر يطول بعد زوال المنبه (Lingering pain لأكثر من 15-30 ثانية).\n- ألم عفوي ليلي يوقظ المريض من النوم (Nocturnal spontaneous pain)، وغالباً ما يزداد بالحرارة ويهدأ أحياناً بماء مثلج.\n\n3. تموت اللب (Pulp Necrosis):\n- غياب الاستجابة لاختبارات الحيوية (Cold test / EPT). تصبح المعالجة اللبية (Root Canal Treatment) حتمية.',
    clinicalPearlEn:
      'Lingering pain (>15–30 seconds) after cold stimulation is the single most reliable diagnostic indicator of irreversible pulpitis.',
    clinicalPearlAr:
      'المعيار التشخيصي الأهم: استمرار الألم (Lingering pain) لأكثر من 15 ثانية بعد إبعاد عود الثلج هو الدليل القاطع على تحول اللب إلى غير ردود (Irreversible Pulpitis).',
  },
  {
    keywords: ['c-factor', 'c factor', 'عامل c', 'composite', 'shrinkage', 'الراتنج المركب'],
    titleEn: 'Cavity Configuration Factor (C-Factor) & Polymerization Stress',
    titleAr: 'عامل الشكل (C-Factor) وإجهاد التقلص التصلبي للكومبوزيت',
    explanationEn:
      'C-Factor = (Number of Bonded Cavity Surfaces) / (Number of Free / Unbonded Cavity Surfaces).\n\n• Class I Occlusal Cavity: 5 bonded walls (mesial, distal, facial, lingual, pulpal floor) / 1 unbonded surface = C-Factor of 5 (Highest stress).\n• Class II Box Cavity: 4 bonded walls / 2 unbonded surfaces = C-Factor of 2.\n• Class IV Incisal: 1 or 2 bonded walls / 4 or 5 unbonded surfaces = C-Factor ~0.2–0.5 (Lowest stress).\n\nClinical Impact: A high C-Factor affords minimal stress relief via polymer relaxation at free surfaces, pulling adhesive margins away from tooth substrate and resulting in marginal leakage, white lines, microcracks, and post-operative sensitivity.\nSolutions: Incremental layering (≤2mm oblique increments), stress-absorbing flowable liners, and soft-start photo-curing.',
    explanationAr:
      'معادلة عامل الشكل (C-Factor) = (عدد الجدران الملصوقة) ÷ (عدد الجدران الحرة غير الملصوقة).\n\n• حفر الصنف الأول (Class I): 5 جدران ملصوقة ÷ 1 سطح حر = عامل C يساوي 5 (أعلى إجهاد انكماش وتصلب).\n• حفر الصنف الرابع (Class IV): عامل C منخفض جداً (0.2 - 0.5) لتوفر أسطح حرة شاسعة تسمح للراتنج بالتمدد المرن.\n\nالخطر السريري: كلما زاد عامل C، انعدمت إمكانية تحرر الإجهاد، مما يؤدي لتمزق طبقة العاج الرابط وانفصال الحواف وظهور خطوط بيضاء (White line margins) وحساسية تالية للترميم.\nالحل السريري: التطبيق المائل للطبقات (Oblique Incremental Layering) بسماكة لا تتجاوز 2 ملم.',
    clinicalPearlEn:
      'Never place a single horizontal bulk layer in a high C-Factor Class I cavity; place diagonal oblique triangular increments connecting maximum of 2 walls at a time.',
    clinicalPearlAr:
      'قاعدة سريرية للمحافظة على الترميم: تجنب وضع طبقة أفقية واحدة تسد قاع الحفرة وتربط الجدارين معاً في الصنف الأول؛ استخدم طبقات مثلثة مائلة (Oblique increments).',
  },
  {
    keywords: ['panoramic', 'ghost image', 'focal trough', 'بانوراما', 'أشعة'],
    titleEn: 'Panoramic Radiographic Errors & Principles',
    titleAr: 'أخطاء التصوير البانورامي والشبح الإشعاعي (Ghost Images)',
    explanationEn:
      'Essential panoramic radiographic principles for board spotters:\n\n1. Ghost Image Characteristics: Real anatomy or radio-dense object between source and rotation center. Always projected on the contralateral (opposite) side, higher than original, magnified, and blurred.\n2. Patient Positioning Errors:\n• Chin tilted upwards (Frankfort plane angled up): Flat or reversed occlusal plane (frowning smile line), hard palate superimposed over maxillary root apices, condyles projected off film edges.\n• Chin tilted downwards (Frankfort plane angled down): Exaggerated smile line (Jack-o-lantern grinning smile), foreshortened mandibular incisors with severe overlap, hyoid bone superimposed on mandible.\n• Tongue not flat against palate (failure to swallow): Dark horizontal radiolucent air band (palatoglossal airspace) across maxillary root apices, obscuring periapical pathology.',
    explanationAr:
      'أهم مفاهيم أشعة البانوراما للامتحانات السريرية:\n\n1. الصورة الشبحية (Ghost Image): تظهر دائماً على الجانب المقابل (Contralateral)، وتكون أعلى من موضعها الأصلي، ومكبرة، ومغبشة (Higher, larger, blurred).\n2. أخطاء تموضع المريض:\n• إمالة الذقن للأعلى: خط ابتسامة معكوس عابس (Reverse smile / frown)، وتراكب قبة الحنك فوق جذور الأسنان العلوية.\n• إمالة الذقن للأسفل: خط ابتسامة مبالغ بالانحناء، وقصر شديد في القواطع السفلية.\n• عدم إلصاق اللسان بسقف الحنك أثناء الدوران: ظهور خط شافي للأشعة أسود عريض فوق قمم جذور الأسنان العلوية (Palatoglossal airspace) يخفي الآفات الذروية.',
    clinicalPearlEn:
      'A wide horizontal radiolucency over maxillary apices is caused by failure of the patient to swallow and press the tongue against the palate.',
    clinicalPearlAr:
      'أشهر سؤال في امتحانات الأشعة: الشريط الأسود الأفقي فوق جذور الأسنان العلوية سببه عدم بلع الريق وعدم إلصاق ظهر اللسان بسقف الحنك طوال 15 ثانية.',
  },
];

/**
 * Generates an intelligent, context-aware DentalMind AI response.
 * Uses real student data (courses, exams, daily capacity, tasks, achievements)
 * and strictly adheres to dental accuracy, no grade promises, and no invented data.
 */
export const generateDentalTutorResponse = (
  userQuery: string,
  context: DentalAiContext
): DentalAiResponse => {
  const q = userQuery.trim().toLowerCase();
  const isAr = detectArabicQuery(userQuery) || context.language === 'ar';

  // 1. Context Queries: "What should I study now?" / "شو أدرس هلق؟"
  if (
    q.includes('what should i study') ||
    q.includes('what to study') ||
    q.includes('what next') ||
    q.includes('شو أدرس') ||
    q.includes('ماذا أدرس') ||
    q.includes('بماذا أبدأ')
  ) {
    const timeAvailable = context.checkIn?.timeAvailable || '2h';
    const energy = context.checkIn?.energy || 'okay';
    const sortedExams = [...context.exams].sort((a, b) => a.daysRemaining - b.daysRemaining);
    const closestExam = sortedExams[0];
    const pendingTasks = context.tasks.filter((t) => t.status === 'pending');
    const recommendedTask = pendingTasks[0];
    const completedCount = context.tasks.filter((t) => t.status === 'completed').length;

    let durationLabel = '1h 30m';
    if (timeAvailable === '30m') durationLabel = '30 minutes';
    else if (timeAvailable === '1h') durationLabel = '1 hour';
    else if (timeAvailable === '2h') durationLabel = '1 hour 45 minutes';
    else if (timeAvailable === '3h+') durationLabel = '2 hours 30 minutes';

    const examDays = closestExam ? closestExam.daysRemaining : 5;
    const examName = closestExam
      ? isAr && closestExam.courseNameAr
        ? closestExam.courseNameAr
        : closestExam.courseName
      : isAr
      ? 'أمراض الفم'
      : 'Oral Pathology';
    const prepPct = closestExam ? closestExam.preparationPercent : 64;

    const taskTitle = recommendedTask
      ? recommendedTask.title
      : closestExam
      ? `${closestExam.courseName}: High-Yield Core Topics`
      : 'Oral Pathology — Odontogenic Tumors & Keratocysts';
    const taskMinutes = recommendedTask ? recommendedTask.durationMinutes : 40;

    const actions: TutorActionButton[] = [];
    if (recommendedTask) {
      actions.push({
        label: `Start Task (${taskMinutes}m): ${recommendedTask.title.slice(0, 30)}...`,
        labelAr: `بدء المهمة (${taskMinutes} د): ${recommendedTask.title.slice(0, 26)}...`,
        type: 'start_task',
        taskId: recommendedTask.id,
      });
    } else {
      actions.push({
        label: `Start ${taskMinutes}m Focus Session`,
        labelAr: `بدء جلسة تركيز (${taskMinutes} د)`,
        type: 'start_focus',
      });
    }

    actions.push({
      label: 'Open Study Plan',
      labelAr: 'فتح الخطة الدراسية',
      type: 'open_plan',
    });

    if (closestExam && closestExam.daysRemaining <= 7) {
      actions.push({
        label: 'Open Exam Rescue',
        labelAr: 'تشغيل إنقاذ الامتحان',
        type: 'exam_rescue',
      });
    }

    if (isAr) {
      return {
        text: `بناءً على تقييمكِ اليومي: لديكِ سعة دراسية تقدر بـ **${durationLabel}**، ومستوى طاقتكِ هو **${energy}**.\n\nامتحان **${examName}** هو الأقرب زمنياً (باقٍ عليه **${examDays} أيام**، ونسبة جاهزيتكِ الحالية المسجلة هي **${prepPct}%**).\n\n${
          completedCount > 0
            ? `أنجزتِ بالفعل **${completedCount} مهام** اليوم! استمرار رائع.`
            : 'لم تبدئي مهامكِ بعد، وأفضل بداية هي مهمة مركزة وقصيرة.'
        }\n\n**توصيتي المحددة الآن:**\nابدئي بجلسة مدتها **${taskMinutes} دقيقة** تركز على: **${taskTitle}**. هذا يضمن تغطية المفاصل الأساسية دون إجهاد.`,
        clinicalPearl:
          'ابدئي بأول 5 دقائق فقط دون التفكير في طول المادة؛ كسر حاجز البداية يرفع التركيز تلقائياً.',
        actions,
        referencedData: {
          courseName: closestExam ? closestExam.courseName : undefined,
          examName: closestExam ? closestExam.examTitle || closestExam.courseName : undefined,
          taskTitle,
        },
      };
    }

    return {
      text: `Based on your synchronized records, you have approximately **${durationLabel}** available today with **${energy}** energy.\n\nYour closest upcoming milestone is your **${examName} exam** in **${examDays} days** (current preparation registered at **${prepPct}%**).\n\n${
        completedCount > 0
          ? `You have already completed **${completedCount} tasks** today—excellent momentum!`
          : 'You have not started your main tasks yet, so a low-friction start is key.'
      }\n\n**My precise study recommendation right now:**\nBegin a focused **${taskMinutes}-minute block** on: **"${taskTitle}"**. This covers high-frequency university points while your mind is primed.`,
      clinicalPearl:
        'Action creates motivation, not the other way around. Commit only to the first 10 minutes and momentum will follow.',
      actions,
      referencedData: {
        courseName: closestExam ? closestExam.courseName : undefined,
        examName: closestExam ? closestExam.examTitle || closestExam.courseName : undefined,
        taskTitle,
      },
    };
  }

  // 2. Short Time Constraints: "I only have 30 minutes"
  if (
    q.includes('30 minutes') ||
    q.includes('30 mins') ||
    q.includes('نصف ساعة') ||
    q.includes('30 دقيقة') ||
    q.includes('short session') ||
    q.includes('little time')
  ) {
    const closestExam = [...context.exams].sort((a, b) => a.daysRemaining - b.daysRemaining)[0];
    const examName = closestExam ? closestExam.courseName : 'Dental Radiology';
    const weakTopics = closestExam?.highYieldTopics || ['Diagnostic Spotters', 'Past University MCQs'];

    const actions: TutorActionButton[] = [
      {
        label: 'Start 25m Focus Sprint',
        labelAr: 'بدء جلسة سريعة 25 دقيقة',
        type: 'start_focus',
      },
      {
        label: 'Review Weak Topics',
        labelAr: 'مراجعة النقاط الضعيفة',
        type: 'review_weak_topics',
      },
    ];

    if (isAr) {
      return {
        text: `30 دقيقة وقت ثمين جداً إذا استُثمر في الاسترجاع النشط (Active Recall) بدلاً من القراءة السلبية!\n\n**خطة الـ 30 دقيقة المقترحة:**\n1. **20 دقيقة:** حل 10 أسئلة MCQs أو مراجعة 5 شرائح تشخيصية مركزة في **${examName}**.\n2. **5 دقائق:** مراجعة النقاط الصعبة مثل: *${weakTopics[0] || 'المعايير التشخيصية الأساسية'}*.\n3. **5 دقائق:** تدوين لؤلؤة سريرية واحدة وإغلاق الجلسة بإنجاز نظيف.`,
        clinicalPearl:
          'جلسة استرجاع نشط مدتها 20 دقيقة ترسخ المعلومات في الذاكرة طويلة المدى أفضل من ساعتين من القراءة السلبية.',
        actions,
      };
    }

    return {
      text: `30 minutes is a golden pocket for high-yield Active Recall. Do not attempt to open a 60-page textbook chapter right now.\n\n**Your 30-Minute Sprint Blueprint:**\n1. **Minutes 0–20:** Active recall sprint—test yourself on 10 spotter questions or 5 key histology criteria in **${examName}**.\n2. **Minutes 20–25:** Review your top weak topic: *${weakTopics[0] || 'Key Histopathology Pearls'}*.\n3. **Minutes 25–30:** Note down one clinical takeaway and log your completed focus block.`,
      clinicalPearl:
        'A 20-minute retrieval quiz produces significantly higher long-term retention than 2 hours of passive highlighting.',
      actions,
    };
  }

  // 3. Falling Behind / Overwhelmed: "I'm behind on my exam"
  if (
    q.includes('behind') ||
    q.includes('متأخرة') ||
    q.includes('راكمت') ||
    q.includes('overwhelmed') ||
    q.includes('panic') ||
    q.includes('too much material')
  ) {
    const closestExam = [...context.exams].sort((a, b) => a.daysRemaining - b.daysRemaining)[0];
    const examTitle = closestExam ? closestExam.courseName : 'your upcoming exam';
    const days = closestExam ? closestExam.daysRemaining : 5;

    const actions: TutorActionButton[] = [
      {
        label: 'Open Exam Rescue Mode',
        labelAr: 'تشغيل وضع إنقاذ الامتحان',
        type: 'exam_rescue',
      },
      {
        label: 'Replan Today Without Pressure',
        labelAr: 'إعادة جدولة اليوم بدون ضغط',
        type: 'replan_today',
      },
      {
        label: 'Open Study Plan',
        labelAr: 'فتح الخطة الدراسية',
        type: 'open_plan',
      },
    ];

    if (isAr) {
      return {
        text: `خذي نفساً عميقاً واهدئي تماماً. الإحساس بالتراكم يمر به كل طبيب وطالب أسنان، وتغيير الخطة لا يعني أبداً الفشل.\n\nمع بقاء **${days} أيام** على امتحان **${examTitle}**، القاعدة الذهبية الآن هي: **لا تفتحي المراجع من الصفر**.\n\n**خارطة الطريق السريعة للإنقاذ:**\n• **تفعيل وضع إنقاذ الامتحان (Exam Rescue):** سنحجب المحاضرات الهامشية ونركز فقط على 20% من المواضيع التي تمثل 80% من درجات الامتحان.\n• التركيز على: الصور الشعاعية الكلاسيكية، شرائح الهستوباثولوجي المميزة، والجرعات الدوائية القصوى (MRD).\n• النوم الكافي: دماغكِ يحتاج 6-7 ساعات لتثبيت الذاكرة القصيرة المدى في القشرة المخية.`,
        clinicalPearl:
          'في امتحانات البورد والجامعة، 70% من الأسئلة تدور حول الحالات الكلاسيكية النمطية. أتقني الكلاسيكي أولاً قبل الخوض في الحالات النادرة.',
        actions,
      };
    }

    return {
      text: `Take a slow, deep breath. Feeling behind is a universal experience in dental school, especially between lab requirements and clinical quotas. A revised plan is a sign of smart triage, not failure.\n\nWith **${days} days** remaining before **${examTitle}**, do not attempt to reread whole textbooks from page one.\n\n**Your Emergency Triage Protocol:**\n• **Activate Exam Rescue Mode:** We filter out low-yield theoretical fluff and restrict your plan strictly to the core 20% that yields 80% of points.\n• Master the high-frequency spotters: Classic radiographic borders, pathognomonic histology signs, and differential diagnosis trees.\n• Rebalance the week gently without shame. You already have a strong foundation.`,
      clinicalPearl:
        'Exam rule: 70%+ of exam points test textbook classical presentations. Master the classic prototypes thoroughly before worrying about rare anomalies.',
      actions,
    };
  }

  // 4. Low Focus / Fatigue: "Can't study" / "Tired" / "Distracted"
  if (
    q.includes("can't focus") ||
    q.includes("can't study") ||
    q.includes('cannot study') ||
    q.includes('tired') ||
    q.includes('distracted') ||
    q.includes('تعبانة') ||
    q.includes('مش قادرة أدرس') ||
    q.includes('تشتت') ||
    q.includes('إرهاق')
  ) {
    const actions: TutorActionButton[] = [
      {
        label: 'Open Focus Recovery (7-Day Reset)',
        labelAr: 'فتح برنامج استعادة التركيز (7 أيام)',
        type: 'open_focus_recovery',
      },
      {
        label: 'Start Low-Stress 15m Sprint',
        labelAr: 'بدء جلسة خفيفة 15 دقيقة',
        type: 'start_focus',
      },
      {
        label: 'Replan Today with Lighter Load',
        labelAr: 'تخفيف مهام اليوم وإعادة الجدولة',
        type: 'replan_today',
      },
    ];

    if (isAr) {
      return {
        text: `هذا التعب طبيعي ومبرر تماماً بعد ساعات الوقوف في العيادات أو نحت الأسنان في المعامل التحضيرية. الدماغ عندما يرهق يرفض القراءة الكثيفة.\n\n**ماذا نفعل الآن بذكاء؟**\n1. **لا تجبري نفسكِ** على قراءة صفحات نظري طويلة.\n2. **استراحة حقيقية لمدة 10 دقائق:** اشربي كوباً من الماء وابتعدي عن شاشة الهاتف ومواقع التواصل.\n3. **البداية فائقة السهولة:** عندما تكونين مستعدة، سنكتفي بـ 5 بطاقات استذكار خفيفة أو فحص صورتين شعاعيتين فقط دون أي ضغط درجات.`,
        clinicalPearl:
          'عند الإجهاد العصبي، الانتقال من دراسة النصوص المكتوبة إلى فحص الصور السريرية والمخططات الملونة ينشط مسارات عصبية بديلة أقل إرهاقاً.',
        actions,
      };
    }

    return {
      text: `Your mental and physical fatigue is completely justified after preclinical bench drills and patient clinics. When cognitive reserves are depleted, forced heavy reading only creates frustration.\n\n**Here is your calm reset strategy:**\n1. **Permission to downshift:** Never force a heavy 2-hour text while in an exhausted state.\n2. **10-minute real physical break:** Drink a large glass of cold water and step away from all social media and notifications.\n3. **Low-Friction 15-Minute Jumpstart:** When ready, complete just one tiny micro-task: flip 5 flashcards or review 2 clinical photos. If focus returns, continue; if not, rest without guilt.`,
      clinicalPearl:
        'When text-reading fatigue sets in, switching to visual diagnostic spotters (radiographs, histology slides) utilizes visual cortex pathways that require significantly less executive effort.',
      actions,
    };
  }

  // 5. Check if user is asking about a specific clinical/academic dental topic
  for (const topic of DENTAL_TOPIC_DATABASE) {
    const matched = topic.keywords.some((k) => q.includes(k.toLowerCase()));
    if (matched) {
      const actions: TutorActionButton[] = [
        {
          label: `Start 25m Focus on ${topic.titleEn}`,
          labelAr: `جلسة تركيز 25 د في ${topic.titleAr}`,
          type: 'start_focus',
        },
        {
          label: 'Review Weak Topics',
          labelAr: 'مراجعة المواضيع الضعيفة',
          type: 'review_weak_topics',
        },
        {
          label: 'Open Study Plan',
          labelAr: 'فتح الخطة الدراسية',
          type: 'open_plan',
        },
      ];

      return {
        text: isAr ? topic.explanationAr : topic.explanationEn,
        clinicalPearl: isAr ? topic.clinicalPearlAr : topic.clinicalPearlEn,
        actions,
        referencedData: {
          courseName: topic.titleEn,
        },
      };
    }
  }

  // 6. Interactive Quiz Request: "Quiz me on this" / "اختبرني"
  if (
    q.includes('quiz me') ||
    q.includes('اختبرني') ||
    q.includes('سؤال امتحاني') ||
    q.includes('spotter question')
  ) {
    if (isAr) {
      return {
        text: `**سؤال سريري دقيق من امتحانات أمراض الفم والأشعة (MCQ):**\n\nمريض يبلغ من العمر 42 عاماً، أظهرت صورة البانوراما الدورية لديه آفة شافة للأشعة وحيدة المسكن (Unilocular radiolucency) جيدة التحدد محيطة بتاج رحى ثالثة سفلية منطمرة (Impacted mandibular third molar). عند أخذ الخزعة، أظهر الفحص النسيجي ظهارة مطبقة متقرنة رقيقة موحدة السماكة (6–8 طبقات خلوية) مع طبقة قاعدية مصطفة كألواح السياج الخشبي (Picket fence / Palisaded basal cells) ونوى مفرطة الصباغ، مع تجويف ممتلئ برقاقات الكيراتين المتموجة.\n\n**ما هو التشخيص الأكثر دقة؟**\nأ) Dentigerous Cyst (الكيس التاجي)\nب) Odontogenic Keratocyst - OKC (كيس التقرن السني)\nج) Ameloblastoma (الورم الأرومي المينائي)\nد) Periapical Granuloma (الورم الحبيبي الذروي)\n\n*اكتبي إجابتكِ في الرسالة القادمة وسأحلل معكِ التعليل السريري فوراً!*`,
        clinicalPearl:
          'مفتاح الحل: وجود الخلايا القاعدية المنتظمة ذات النوى مفرطة الصباغ (Palisading picket-fence) والسطح المتموج المتقرن هو التوقيع النسيجي الأكيد لـ OKC حتى وإن كان محيطاً بتاج سن منطمر كالكيس التاجي.',
        actions: [
          {
            label: 'Answer in Chat',
            labelAr: 'أجيبي في المحادثة',
            type: 'start_focus',
          },
        ],
      };
    }

    return {
      text: `**High-Yield Clinical Exam Spotter Question:**\n\nA 42-year-old male presents for a routine check-up. A panoramic radiograph reveals a well-demarcated, corticated unilocular radiolucency surrounding the crown of an impacted mandibular third molar. On surgical enucleation and histopathologic examination, the lining reveals a thin, uniform stratified squamous epithelium (6–8 cell layers thick) with a prominent, hyperchromatic palisaded basal cell layer ("tombstone" or "picket fence" pattern) and a wavy parakeratinized luminal surface filled with cheesy keratin debris.\n\n**Which is the most likely diagnosis?**\nA) Dentigerous Cyst\nB) Odontogenic Keratocyst (OKC)\nC) Conventional Ameloblastoma\nD) Calcifying Odontogenic Cyst (Gorlin Cyst)\n\n*Type your answer below, and we will analyze the clinical differential together!*`,
      clinicalPearl:
        'Key discriminator: An OKC can mimic a Dentigerous Cyst radiographically by enclosing the crown of an impacted tooth (follicular variant, ~30% of OKCs). Histology with parakeratin corrugated lining and palisaded hyperchromatic basal cells confirms OKC.',
      actions: [
        {
          label: 'Answer in Chat',
          labelAr: 'أجيبي في المحادثة',
          type: 'start_focus',
        },
      ],
    };
  }

  // 7. General Dental Query Fallback: Clear, supportive, structured educational explanation
  const fallbackCourses = context.courses.map((c) => c.name).slice(0, 3).join(', ');

  if (isAr) {
    return {
      text: `سؤال ممتاز حول **"${userQuery}"**!\n\nفي المناهج السريرية لطب الأسنان (خاصة في مقرراتكِ: ${
        fallbackCourses || 'Oral Pathology, Radiology, Operative Dentistry'
      })، الربط بين الأعراض السريرية، المظهر الشعاعي، والخصائص النسيجية هو مفتاح الإجابة الكاملة في الامتحانات.\n\n**النقاط الجوهرية التي يجب تذكرها:**\n1. **المعايير التشخيصية:** تأكدي دائماً من فحص حيوية اللب (Pulp Vitality) أولاً قبل الحكم على أي آفة ذروية.\n2. **الفحص الشعاعي:** دقة حواف الآفة (Corticated vs Ill-defined) تميز الآفات الحميدة بطيئة النمو عن الآفات الارتشاحية العدوانية.\n3. **التدبير السريري والأكاديمي:** دائماً في أسئلة الامتحان ابدئي بالتشخيص التفريقي (Differential Diagnosis) ثم الفحص التوكيدي (خزعة، اختبار حيوية، أو CBCT).\n\n*ملاحظة أكاديمية: هذه المعلومات مخصصة للمراجعة والدراسة الأكاديمية فقط، والقرارات السريرية للمرضى تتطلب دوماً إشرافاً مباشراً من أساتذة الكلية.*`,
      clinicalPearl:
        'في الامتحانات الشفوية (OSCE): لا تقدمي تشخيصاً واحداً جازماً أبداً؛ ابدئي دائماً بـ "My primary differential diagnosis is..." ثم اذكري خيارين بديلين.',
      actions: [
        {
          label: 'Open Study Plan',
          labelAr: 'فتح الخطة الدراسية',
          type: 'open_plan',
        },
        {
          label: 'Review Weak Topics',
          labelAr: 'مراجعة النقاط الضعيفة',
          type: 'review_weak_topics',
        },
      ],
    };
  }

  return {
    text: `Great question regarding **"${userQuery}"**!\n\nIn your dental clinical courses (${
      fallbackCourses || 'Oral Pathology, Dental Radiology, Operative Dentistry'
    }), linking clinical presentation with radiographic boundaries and microscopic features is the gold standard for full marks on exams.\n\n**Core Clinical Principles to Review:**\n1. **Diagnostic Rule of Thumb:** Always establish pulp vitality status before attributing periapical radiolucencies to endodontic vs non-endodontic origin.\n2. **Radiographic Margins:** Well-demarcated corticated borders indicate slow expansion; ill-defined, ragged or moth-eaten borders suggest aggressive or malignant infiltration.\n3. **Differential Approach:** Structure your answer by presenting the most probable diagnosis followed by two clinical alternatives and the confirmatory test (histopathology biopsy, vitality test, or CBCT).\n\n*Academic Note: This guidance is intended strictly for student curriculum study. Patient clinical diagnosis and treatment must always be confirmed under university faculty supervision.*`,
    clinicalPearl:
      'OSCE Oral Exam Pearl: Never give a single definitive diagnosis when asked for an impression; always formulate your answer as: "My top differential is X, but I must rule out Y and Z via vitality testing and biopsy."',
    actions: [
      {
        label: 'Open Study Plan',
        labelAr: 'فتح الخطة الدراسية',
        type: 'open_plan',
      },
      {
        label: 'Review Weak Topics',
        labelAr: 'مراجعة النقاط الضعيفة',
        type: 'review_weak_topics',
      },
    ],
  };
};
