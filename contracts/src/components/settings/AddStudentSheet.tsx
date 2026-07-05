import { useState } from 'react';
import { motion } from 'framer-motion';
import BottomSheet from './BottomSheet';

const AVATAR_OPTIONS = [
  '/testimonial-avatar-1.jpg',
  '/testimonial-avatar-2.jpg',
  '/testimonial-avatar-3.jpg',
  '/child-learning.jpg',
  '/family-connection.jpg',
  '/hero-gradient-bg.jpg',
];

interface AddStudentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (student: { name: string; age: number; grade: string; avatar: string }) => void;
}

export default function AddStudentSheet({ isOpen, onClose, onAdd }: AddStudentSheetProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState(10);
  const [grade, setGrade] = useState('5th Grade');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name, age, grade, avatar: selectedAvatar });
    setName('');
    setAge(10);
    setGrade('5th Grade');
    setSelectedAvatar(AVATAR_OPTIONS[0]);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add Student">
      <div className="space-y-6 pb-8">
        {/* Student Name */}
        <div>
          <label className="block text-xs font-medium text-mediumGray mb-2 uppercase tracking-wide">
            Student Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter student's name"
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm placeholder:text-mutedSlate focus:outline-none focus:border-vibrantGreen transition-colors"
          />
        </div>

        {/* Age Dropdown */}
        <div>
          <label className="block text-xs font-medium text-mediumGray mb-2 uppercase tracking-wide">
            Age
          </label>
          <select
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors appearance-none"
          >
            {Array.from({ length: 8 }, (_, i) => i + 8).map((a) => (
              <option key={a} value={a} className="bg-surface">
                {a} years old
              </option>
            ))}
          </select>
        </div>

        {/* Grade Dropdown */}
        <div>
          <label className="block text-xs font-medium text-mediumGray mb-2 uppercase tracking-wide">
            Grade
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors appearance-none"
          >
            {['3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade'].map((g) => (
              <option key={g} value={g} className="bg-surface">
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Avatar Selector */}
        <div>
          <label className="block text-xs font-medium text-mediumGray mb-3 uppercase tracking-wide">
            Choose Avatar
          </label>
          <div className="flex gap-3 flex-wrap">
            {AVATAR_OPTIONS.map((avatar, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedAvatar(avatar)}
                className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-colors ${
                  selectedAvatar === avatar ? 'border-vibrantGreen' : 'border-transparent'
                }`}
              >
                <img src={avatar} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className="w-full glass-btn py-3.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Student
        </button>
      </div>
    </BottomSheet>
  );
}
