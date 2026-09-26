import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Presentation,
  FileCode,
  Mic,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Course, Lecture, LectureFormat, Language } from '../types';
import { translations } from '../i18n/translations';
import { processUploadedLecturePdf } from '../services/pdfLectureEngine';

interface AddLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onAddLecture: (lecture: Lecture) => void;
  language: Language;
}

export const AddLectureModal: React.FC<AddLectureModalProps> = ({
  isOpen,
  onClose,
  courses,
  onAddLecture,
  language,
}) => {
  const isAr = language === 'ar';
  const t = translations[language];

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [uploadDone, setUploadDone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorMessage(
        isAr
          ? 'نوع الملف غير مدعوم. يرجى رفع ملف بصيغة PDF (.pdf).'
          : 'Invalid file format. Please upload a PDF document (.pdf).'
      );
      setSelectedFile(null);
      return false;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage(
        isAr
          ? 'حجم الملف كبير جداً. الحد الأقصى المسموح هو 50 ميغابايت.'
          : 'File size too large. Maximum supported size is 50MB.'
      );
      setSelectedFile(null);
      return false;
    }

    setSelectedFile(file);
    if (!title.trim()) {
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      setTitle(cleanTitle);
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleLoadDemoPdf = () => {
    // Generate a mock dental PDF file for instant testing if no file is on user device
    const demoBlob = new Blob(
      [
        `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000120 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n180\n%%EOF`,
      ],
      { type: 'application/pdf' }
    );
    const demoFile = new File([demoBlob], 'Ameloblastoma_and_Odontogenic_Keratocysts.pdf', {
      type: 'application/pdf',
    });
    validateAndSetFile(demoFile);
    setTitle('Ameloblastoma & Odontogenic Tumors — Comprehensive Lecture');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage(isAr ? 'يرجى إدخال عنوان المحاضرة.' : 'Please enter a lecture title.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage(isAr ? 'يرجى اختيار ملف PDF لرفعه.' : 'Please select a PDF file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setProgressStage(isAr ? 'جاري قراءة صفحات الـ PDF...' : 'Reading PDF slides & structure...');

    try {
      const targetCourse = courses.find((c) => c.id === courseId) || courses[0];

      // Simulated realistic progress ticks
      setTimeout(() => {
        setUploadProgress(45);
        setProgressStage(
          isAr
            ? 'استخراج المفاهيم السريرية والمظاهر الشعاعية والنسجية...'
            : 'Extracting diagnostic criteria, pathology, and treatment...'
        );
      }, 350);

      setTimeout(() => {
        setUploadProgress(78);
        setProgressStage(
          isAr
            ? 'بناء الملاحظات الشاملة، الأسئلة، والبطاقات مع التحقق من التغطية...'
            : 'Synthesizing complete notes, MCQs, and flashcards with source citations...'
        );
      }, 700);

      const newLecture = await processUploadedLecturePdf(
        selectedFile,
        targetCourse.id,
        targetCourse.name,
        title.trim()
      );

      setTimeout(() => {
        setUploadProgress(100);
        setProgressStage(isAr ? 'اكتملت المعالجة بنجاح!' : 'Lecture processed & indexed!');
        setUploadDone(true);

        setTimeout(() => {
          onAddLecture(newLecture);
          onClose();
        }, 600);
      }, 1050);
    } catch (err) {
      console.error('Failed to process uploaded PDF lecture:', err);
      setIsUploading(false);
      setErrorMessage(
        isAr
          ? 'حدث خطأ أثناء معالجة ملف الـ PDF. يرجى التأكد من سلامة الملف وإعادة المحاولة.'
          : 'Error processing PDF lecture. Please verify the file and try again.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? '+ رفع ملف دراسي (PDF)' : '+ Upload Study File'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'رفع ملف السلايدات وتحويله لملاحظات وبطاقات وأسئلة مدعومة بالمصادر'
                  : 'Synthesize complete study notes, spotters, and MCQs from your slides'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Select Course */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {isAr ? 'المقرر الدراسي (Course)' : 'Course'} *
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              disabled={isUploading}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-1 focus:ring-teal-500 focus:outline-hidden text-slate-900 dark:text-slate-100"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Lecture Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {isAr ? 'عنوان المحاضرة (Lecture Title)' : 'Lecture Title'} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              placeholder="e.g., Ameloblastoma & Odontogenic Keratocysts"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-1 focus:ring-teal-500 focus:outline-hidden text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* 3. Choose File (PDF) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {isAr ? 'اختيار الملف (Choose File - PDF)' : 'Choose File (PDF)'} *
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 hover:border-teal-400'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {isAr ? 'انقري للتغيير' : 'Click to change'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <UploadCloud className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isAr ? 'انقري لاختيار ملف PDF أو اسحبيه إلى هنا' : 'Click to browse or drop your PDF slides here'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {isAr ? 'صيغة PDF فقط (حتى 50 ميغابايت)' : 'Standard PDF files only (up to 50MB)'}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Demo File Helper */}
            {!selectedFile && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                <span>{isAr ? 'ليس لديكِ ملف جاهز؟' : 'No local PDF right now?'}</span>
                <button
                  type="button"
                  onClick={handleLoadDemoPdf}
                  className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  {isAr ? 'تحميل نموذج سلايدات الأسنان' : 'Load Sample Dental Slides'}
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2 p-3 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900">
              <div className="flex justify-between text-xs text-teal-800 dark:text-teal-300 font-medium">
                <span className="truncate max-w-[280px]">{progressStage}</span>
                <span className="font-mono font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadDone && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isAr
                  ? 'تم استخراج وتحليل المحاضرة! الملاحظات والأسئلة جاهزة.'
                  : 'Lecture synthesized with source page references! Ready to study.'}
              </span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-2xl shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isUploading
                  ? isAr
                    ? 'جاري التحليل والمعالجة...'
                    : 'Processing Slides...'
                  : isAr
                  ? 'رفع وإنشاء المحاضرة'
                  : 'Upload & Create Lecture'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

