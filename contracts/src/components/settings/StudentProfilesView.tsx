import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, ChevronUp, Edit, Trash2, Plus } from 'lucide-react';
import AddStudentSheet from './AddStudentSheet';

interface Student {
  id: number;
  name: string;
  age: number;
  grade: string;
  avatar: string;
  progress: number;
  lastActive: string;
}

interface StudentProfilesViewProps {
  onBack: () => void;
  students: Student[];
  onAddStudent: (student: { name: string; age: number; grade: string; avatar: string }) => void;
}

export default function StudentProfilesView({ onBack, students, onAddStudent }: StudentProfilesViewProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [studentList, setStudentList] = useState<Student[]>(students);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = (id: number) => {
    setStudentList((prev) => prev.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const handleAddStudent = (student: { name: string; age: number; grade: string; avatar: string }) => {
    const newStudent: Student = {
      ...student,
      id: Date.now(),
      progress: 0,
      lastActive: 'Today',
    };
    setStudentList((prev) => [...prev, newStudent]);
    onAddStudent(student);
  };

  return (
    <motion.div
      className="min-h-[100dvh] bg-baseDark"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
    >
      <div className="max-w-[430px] mx-auto">
        <header className="sticky top-0 z-40 h-14 flex items-center px-4 bg-[rgba(10,12,27,0.8)] backdrop-blur-[12px]">
          <button onClick={onBack} className="absolute left-4 text-lightSilver hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-body text-base font-semibold text-white mx-auto">Student Profiles</h1>
          <button
            onClick={() => setShowAddSheet(true)}
            className="absolute right-4 text-vibrantGreen hover:text-[#00E676] transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </header>

        <div className="px-5 pb-24 pt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-mediumGray">{studentList.length} students configured</p>
          </div>

          {/* Student Cards */}
          <div className="space-y-3">
            {studentList.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden"
              >
                {/* Card Header */}
                <button
                  onClick={() => toggleExpand(student.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{student.name}</p>
                    <p className="text-xs text-mediumGray">{student.age} yrs • {student.grade}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-vibrantGreen font-medium">{student.progress}%</span>
                    {expandedId === student.id ? (
                      <ChevronUp className="w-4 h-4 text-mediumGray" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-mediumGray" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === student.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 border-t border-[rgba(255,255,255,0.06)]">
                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                background: 'linear-gradient(90deg, #00C853, #38BDF8)',
                                width: `${student.progress}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-mediumGray mt-1">
                            Progress: {student.progress}% • Last active: {student.lastActive}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button className="flex-1 ghost-btn py-2 text-xs font-medium flex items-center justify-center gap-1.5">
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="flex-1 py-2 text-xs font-medium text-softRed border border-[rgba(248,113,113,0.3)] rounded-full hover:bg-[rgba(248,113,113,0.1)] transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AddStudentSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={handleAddStudent}
      />
    </motion.div>
  );
}
