import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Clock,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  Exam,
  StudyUnit,
  StudyUnitStatus,
  StudyUnitPriority,
  Language,
} from '../types';

interface ManageUnitsModalProps {
  exam: Exam | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveUnits: (examId: string, units: StudyUnit[]) => void;
  language: Language;
}

export const ManageUnitsModal: React.FC<ManageUnitsModalProps> = ({
  exam,
  isOpen,
  onClose,
  onSaveUnits,
  language,
}) => {
  const isAr = language === 'ar';

  if (!isOpen || !exam) return null;

  const [units, setUnits] = useState<StudyUnit[]>(exam.units || []);

  // Form state for adding/editing a unit
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(35);
  const [status, setStatus] = useState<StudyUnitStatus>('not_started');
  const [confidence, setConfidence] = useState<number>(50);
  const [priority, setPriority] = useState<StudyUnitPriority>('medium');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  const handleStartAdd = () => {
    setEditingUnitId(null);
    setTitle('');
    setEstimatedMinutes(35);
    setStatus('not_started');
    setConfidence(50);
    setPriority('medium');
    setIsAddingNew(true);
  };

  const handleStartEdit = (unit: StudyUnit) => {
    setEditingUnitId(unit.id);
    setTitle(unit.title);
    setEstimatedMinutes(unit.estimatedMinutes);
    setStatus(unit.status);
    setConfidence(unit.confidence);
    setPriority(unit.priority);
    setIsAddingNew(true);
  };

  const handleSaveUnitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingUnitId) {
      const updated = units.map((u) =>
        u.id === editingUnitId
          ? {
              ...u,
              title: title.trim(),
              estimatedMinutes,
              status,
              confidence,
              priority,
            }
          : u
      );
      setUnits(updated);
      onSaveUnits(exam.id, updated);
    } else {
      const newUnit: StudyUnit = {
        id: `unit-${Date.now()}`,
        examId: exam.id,
        title: title.trim(),
        estimatedMinutes,
        status,
        confidence,
        priority,
      };
      const updated = [...units, newUnit];
      setUnits(updated);
      onSaveUnits(exam.id, updated);
    }

    setIsAddingNew(false);
    setEditingUnitId(null);
  };

  const handleDeleteUnit = (unitId: string) => {
    const updated = units.filter((u) => u.id !== unitId);
    setUnits(updated);
    onSaveUnits(exam.id, updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all my-6 animate-in fade-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? 'إدارة وحدات وفصول الامتحان' : 'Manage Exam Study Units'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {exam.courseName} · {exam.examType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Add / Edit Form Card */}
          {isAddingNew ? (
            <form
              onSubmit={handleSaveUnitForm}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {editingUnitId
                    ? isAr ? 'تعديل وحدة دراسية' : 'Edit Study Unit'
                    : isAr ? 'إضافة وحدة أو فصل جديد' : 'Add New Study Unit'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'عنوان الوحدة / الفصل *' : 'Unit / Chapter Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isAr ? 'مثال: الفصل 3 — الآفات البيضاء' : 'e.g. Chapter 3 — White Lesions'}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الوقت المقدر (دقيقة)' : 'Est. Minutes'}
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    step="5"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الحالة' : 'Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StudyUnitStatus)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الأولوية' : 'Priority'}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as StudyUnitPriority)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>{isAr ? 'مستوى الثقة والتمكن الحالي:' : 'Current Confidence:'}</span>
                  <span className="font-mono text-teal-600 font-bold">{confidence}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حفظ الوحدة' : 'Save Unit'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? `الوحدات المسجلة (${units.length}):` : `Units in Exam (${units.length}):`}
              </span>
              <button
                type="button"
                onClick={handleStartAdd}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة وحدة' : 'Add Unit'}</span>
              </button>
            </div>
          )}

          {/* Units List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {units.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400">
                {isAr
                  ? 'لا توجد وحدات دراسية مضافة لهذا الامتحان بعد. أضيفي فصول المنهج لتفعيل الجدولة الذكية.'
                  : 'No units added for this exam yet. Add your syllabus chapters to power the priority engine.'}
              </div>
            ) : (
              units.map((unit) => {
                const isCompleted = unit.status === 'completed';
                return (
                  <div
                    key={unit.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          unit.priority === 'high'
                            ? 'bg-rose-500'
                            : unit.priority === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                        title={`Priority: ${unit.priority}`}
                      />
                      <div>
                        <span
                          className={`font-semibold block ${
                            isCompleted
                              ? 'text-slate-400 dark:text-slate-500 line-through'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {unit.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                          <span>{unit.estimatedMinutes} min</span>
                          <span>·</span>
                          <span>
                            {isAr ? 'تمكن:' : 'Confidence:'} {unit.confidence}%
                          </span>
                          <span>·</span>
                          <span className="capitalize">{unit.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(unit)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        title="Edit Unit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        title="Delete Unit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs cursor-pointer hover:opacity-90"
          >
            {isAr ? 'تم' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
