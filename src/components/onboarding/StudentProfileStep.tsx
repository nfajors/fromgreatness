import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

interface StudentProfileStepProps {
  onContinue: () => void;
  onBack: () => void;
  onCreateStudent?: (data: { fullName: string; age: number; grade: string; ethnicitySelfReported?: string; interests?: string[] }) => void;
  isCreating?: boolean;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const grades = [
  '3rd Grade', '4th Grade', '5th Grade', '6th Grade',
  '7th Grade', '8th Grade', '9th Grade', '10th Grade',
];

const learningPreferences = [
  'Visual learner', 'Reading/writing', 'Hands-on activities', 'Audio/verbal', 'Game-based',
];
const interests = [
  'Music', 'Sports', 'Art', 'Science', 'Cooking', 'Fashion', 'Stories', 'Travel',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
};

export default function StudentProfileStep({ onContinue, onBack, onCreateStudent, isCreating }: StudentProfileStepProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [grade, setGrade] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoHover, setPhotoHover] = useState(false);

  const togglePreference = (pref: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const hasBirthDate = !!(month && day && year);

  // Accurate age from full birth date (accounts for whether the birthday has
  // occurred yet this year), not a naive year subtraction.
  const computedAge = (() => {
    if (!hasBirthDate) return null;
    const birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (Number.isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  })();

  const ageInRange = computedAge !== null && computedAge >= 8 && computedAge <= 15;
  const ageError =
    hasBirthDate && computedAge !== null && !ageInRange
      ? `fromGreatness is designed for children ages 8–15 (this birth date is age ${computedAge}). Please check the birth year.`
      : null;

  const canContinue =
    !!firstName.trim() && !!month && !!day && !!year && !!grade && ageInRange;

  return (
    <motion.div
      className="px-4 pt-4 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.p className="section-label mb-2" variants={itemVariants}>
        STEP 3 OF 5
      </motion.p>
      <motion.h2
        className="font-display text-[28px] font-medium text-white mb-2"
        variants={itemVariants}
      >
        Create Your Child's Profile
      </motion.h2>
      <motion.p className="text-lightSilver mb-6" variants={itemVariants}>
        Tell us about the student so we can personalize their experience.
      </motion.p>

      {/* Profile Photo Upload */}
      <motion.div className="flex justify-center mb-6" variants={itemVariants}>
        <div
          {...getRootProps()}
          className={cn(
            'w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden',
            photoHover ? 'border-vibrantGreen bg-[rgba(0,200,83,0.05)]' : 'border-[#334155]'
          )}
          onMouseEnter={() => setPhotoHover(true)}
          onMouseLeave={() => setPhotoHover(false)}
        >
          <input {...getInputProps()} />
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="flex flex-col items-center">
              <Camera className="w-6 h-6 text-[#64748B] mb-1" />
              <span className="text-[10px] text-[#64748B]">Add Photo</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Student's First Name */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="section-label block mb-2">Student's First Name *</label>
        <Input
          type="text"
          placeholder="e.g. Maya"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="h-[52px] w-full rounded-xl px-4 text-white placeholder:text-[#334155] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] focus-visible:border-vibrantGreen focus-visible:ring-[rgba(0,200,83,0.15)]"
        />
      </motion.div>

      {/* Student's Last Name */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="section-label block mb-2">Student's Last Name</label>
        <Input
          type="text"
          placeholder="e.g. Johnson"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="h-[52px] w-full rounded-xl px-4 text-white placeholder:text-[#334155] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] focus-visible:border-vibrantGreen focus-visible:ring-[rgba(0,200,83,0.15)]"
        />
      </motion.div>

      {/* Date of Birth */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="section-label block mb-2">Date of Birth *</label>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="flex-1 h-[52px] rounded-xl px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:border-vibrantGreen focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,200,83,0.15)] appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            <option value="" className="bg-[#1E293B]">Month</option>
            {months.map((m, i) => (
              <option key={m} value={String(i + 1).padStart(2, '0')} className="bg-[#1E293B]">
                {m}
              </option>
            ))}
          </select>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-20 h-[52px] rounded-xl px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:border-vibrantGreen focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,200,83,0.15)] appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            <option value="" className="bg-[#1E293B]">Day</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')} className="bg-[#1E293B]">
                {i + 1}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-24 h-[52px] rounded-xl px-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:border-vibrantGreen focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,200,83,0.15)] appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            <option value="" className="bg-[#1E293B]">Year</option>
            {Array.from({ length: 16 }, (_, i) => {
              const y = 2017 - i;
              return (
                <option key={y} value={String(y)} className="bg-[#1E293B]">
                  {y}
                </option>
              );
            })}
          </select>
        </div>
        {ageError && (
          <p className="text-xs text-softRed mt-2" role="alert">
            {ageError}
          </p>
        )}
      </motion.div>
      <motion.div className="mb-6" variants={itemVariants}>
        <label className="section-label block mb-2">Grade Level *</label>
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-full h-[52px] rounded-xl px-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:border-vibrantGreen focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,200,83,0.15)] appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
        >
          <option value="" className="bg-[#1E293B] text-[#64748B]">Select grade level</option>
          {grades.map((g) => (
            <option key={g} value={g} className="bg-[#1E293B]">
              {g}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Learning Preferences */}
      <motion.div className="mb-6" variants={itemVariants}>
        <label className="section-label block mb-3">Learning Preferences (optional)</label>
        <div className="flex flex-wrap gap-2">
          {learningPreferences.map((pref) => {
            const selected = selectedPreferences.includes(pref);
            return (
              <button
                key={pref}
                type="button"
                onClick={() => togglePreference(pref)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                  selected
                    ? 'bg-[rgba(0,200,83,0.1)] border-[rgba(0,200,83,0.3)] text-vibrantGreen'
                    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-lightSilver hover:border-[rgba(255,255,255,0.15)]'
                )}
              >
                {pref}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Interests */}
      <motion.div className="mb-8" variants={itemVariants}>
        <label className="section-label block mb-3">Interests (optional)</label>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => {
            const selected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                  selected
                    ? 'bg-[rgba(0,200,83,0.1)] border-[rgba(0,200,83,0.3)] text-vibrantGreen'
                    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-lightSilver hover:border-[rgba(255,255,255,0.15)]'
                )}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div className="flex gap-3" variants={itemVariants}>
        <button
          type="button"
          onClick={onBack}
          className="ghost-btn flex-1 h-12 rounded-full"
        >
          Back
        </button>
        <motion.button
          type="button"
          onClick={() => {
            if (onCreateStudent && computedAge !== null && ageInRange) {
              onCreateStudent({
                fullName: `${firstName} ${lastName}`.trim(),
                age: computedAge,
                grade,
                interests: selectedInterests,
              });
              onContinue();
            }
          }}
          disabled={!canContinue || isCreating}
          className={cn(
            'flex-1 h-12 rounded-full font-semibold text-base transition-all duration-300',
            canContinue
              ? 'glass-btn'
              : 'bg-[rgba(255,255,255,0.05)] text-[#64748B] border border-[rgba(255,255,255,0.08)] cursor-not-allowed'
          )}
          whileHover={canContinue ? { scale: 1.02 } : {}}
          whileTap={canContinue ? { scale: 0.98 } : {}}
        >
          {isCreating ? 'Creating...' : 'Continue'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
