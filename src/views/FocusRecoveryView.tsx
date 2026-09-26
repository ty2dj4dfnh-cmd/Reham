import React, { useState } from 'react';
import {
  HeartPulse,
  Sparkles,
  CheckCircle2,
  Circle,
  HelpCircle,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertCircle,
  Clock,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { FocusResetDay, Language } from '../types';
import { translations } from '../i18n/translations';

interface FocusRecoveryViewProps {
  resetDays: FocusResetDay[];
  onToggleDayCompleted: (dayNumber: number) => void;
  language: Language;
}

export const FocusRecoveryView: React.FC<FocusRecoveryViewProps> = ({
  resetDays,
  onToggleDayCompleted,
  language,
}) => {
  const t = translations[language];

  // Self-check questionnaire state
  const [distractionScore, setDistractionScore] = useState<number>(3);
  const [phoneCheckFrequency, setPhoneCheckFrequency] = useState<string>('often');
  const [shortFormTime, setShortFormTime] = useState<string>('45m');
  const [sleepQuality, setSleepQuality] = useState<string>('fair');
  const [startDifficulty, setStartDifficulty] = useState<string>('high');
  const [checkCalculated, setCheckCalculated] = useState(false);

  // Audio ambience simulator state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<'library' | 'rain' | 'lofi'>('library');

  const completedCount = resetDays.filter((d) => d.completed).length;
  const resetPercent = Math.round((completedCount / resetDays.length) * 100);

  const tracks = [
    { id: 'library', name: language === 'ar' ? 'هدوء مكتبة طب الأسنان' : 'Quiet Dental Library' },
    { id: 'rain', name: language === 'ar' ? 'مطر على نافذة العيادة' : 'Gentle Clinic Rain' },
    { id: 'lofi', name: language === 'ar' ? 'إيقاع دراسة الاستعاضة' : 'Prostho Study Lo-Fi' },
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.focus.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.focus.subtitle}
            </p>
          </div>
        </div>

        {/* Responsible Disclaimer Box */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <span>{t.focus.disclaimer}</span>
        </div>
      </div>

      {/* Focus & Distraction Self-Check */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t.focus.selfCheckTitle}
          </h2>
          <span className="text-xs text-teal-600 font-semibold">
            {checkCalculated
              ? language === 'ar'
                ? 'تم تقييم الإيقاع'
                : 'Pacing Calibrated'
              : language === 'ar'
              ? 'تقييم ذاتي غير سريري'
              : 'Self-Check'}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Question 1: Distraction */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              1. {t.focus.qDistracted}
            </label>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { val: 1, label: language === 'ar' ? 'هادئ جداً' : 'Very Calm' },
                { val: 2, label: language === 'ar' ? 'طفيف' : 'Mild' },
                { val: 3, label: language === 'ar' ? 'متوسط' : 'Moderate' },
                { val: 4, label: language === 'ar' ? 'شديد' : 'Scattered' },
              ].map((lvl) => (
                <button
                  key={lvl.val}
                  type="button"
                  onClick={() => setDistractionScore(lvl.val)}
                  className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                    distractionScore === lvl.val
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Phone checks */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              2. {t.focus.qPhone}
            </label>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { id: 'rare', label: language === 'ar' ? 'نادراً' : 'Rarely (<2/hr)' },
                { id: 'often', label: language === 'ar' ? 'أحياناً' : 'Every 15 min' },
                { id: 'constant', label: language === 'ar' ? 'باستمرار' : 'Constantly' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPhoneCheckFrequency(opt.id)}
                  className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                    phoneCheckFrequency === opt.id
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Short form */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              3. {t.focus.qReels}
            </label>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { id: 'none', label: language === 'ar' ? '<15 دقيقة' : '< 15 mins' },
                { id: '45m', label: language === 'ar' ? '30-60 دقيقة' : '30-60 mins' },
                { id: 'high', label: language === 'ar' ? 'أكثر من ساعة' : '1+ hour' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setShortFormTime(opt.id)}
                  className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                    shortFormTime === opt.id
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: Difficulty starting */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              4. {t.focus.qStart}
            </label>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { id: 'easy', label: language === 'ar' ? 'سهل' : 'Smooth' },
                { id: 'fair', label: language === 'ar' ? 'يحتاج جهداً' : 'Takes Effort' },
                { id: 'high', label: language === 'ar' ? 'صعب جداً' : 'Very Hard' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStartDifficulty(opt.id)}
                  className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                    startDifficulty === opt.id
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setCheckCalculated(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {language === 'ar' ? 'تحديث خطة استعادة التركيز' : 'Calibrate Focus Roadmap'}
            </span>
          </button>
        </div>
      </div>

      {/* 7-Day Focus Reset Roadmap */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.focus.resetTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.focus.resetSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
              {completedCount} / {resetDays.length} {t.focus.dayProgress} ({resetPercent}%)
            </span>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${resetPercent}%` }}
          />
        </div>

        {/* Days checklist */}
        <div className="space-y-3 pt-2">
          {resetDays.map((day) => (
            <div
              key={day.dayNumber}
              className={`p-4 rounded-2xl border transition-all ${
                day.completed
                  ? 'bg-slate-50/80 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleDayCompleted(day.dayNumber)}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      day.completed
                        ? 'bg-teal-600 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-teal-500'
                    }`}
                    aria-label={`Toggle day ${day.dayNumber}`}
                  >
                    {day.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">
                        Day {day.dayNumber}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {language === 'ar' ? day.titleAr : day.title}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({day.durationMin}m)
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {language === 'ar' ? day.taskAr : day.task}
                    </p>

                    <div className="mt-2 text-[11px] text-teal-800 dark:text-teal-300 italic">
                      💡 {day.reflectionPrompt}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Built-in Ambience Player */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-600/10 text-teal-600">
            {isPlayingAudio ? (
              <Volume2 className="w-5 h-5 animate-pulse" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {t.focus.ambientPlayer}
            </div>
            <div className="text-[11px] text-slate-400">
              {isPlayingAudio ? 'Active focus audio stream' : 'Muted · Click play to start background stream'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {tracks.map((trk) => (
              <button
                key={trk.id}
                onClick={() => setSelectedTrack(trk.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedTrack === trk.id
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {trk.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
            aria-label={isPlayingAudio ? 'Pause ambient audio' : 'Play ambient audio'}
          >
            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
        </div>
      </div>
    </div>
  );
};
