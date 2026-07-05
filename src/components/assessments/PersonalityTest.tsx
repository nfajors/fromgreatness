import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { personalityQuestions, traitLabels, traitColors } from './data';

interface PersonalityTestProps {
  onComplete: () => void;
  onExit: () => void;
  savedAnswers?: Record<number, number>;
  onSave: (answers: Record<number, number>) => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const likertOptions = [
  { label: 'Strongly Disagree', value: 1 },
  { label: 'Disagree', value: 2 },
  { label: 'Neutral', value: 3 },
  { label: 'Agree', value: 4 },
  { label: 'Strongly Agree', value: 5 },
];

export default function PersonalityTest({ onComplete, onExit, savedAnswers = {}, onSave }: PersonalityTestProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>(savedAnswers);
  const [direction, setDirection] = useState(1);
  const [showComplete, setShowComplete] = useState(false);
  const [confettiPieces] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 360 - 180,
      y: Math.random() * -300 - 50,
      rotation: Math.random() * 720 - 360,
      color: ['#00C853', '#38BDF8', '#F59E0B', '#7E57C2', '#F8BBD0'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.3,
    }))
  );

  const question = personalityQuestions[currentQ];
  const progress = ((currentQ + 1) / personalityQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = useCallback((value: number) => {
    setAnswers(prev => {
      const next = { ...prev, [question.id]: value };
      onSave(next);
      return next;
    });
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQ < personalityQuestions.length - 1) {
        setDirection(1);
        setCurrentQ(q => q + 1);
      } else {
        setShowComplete(true);
      }
    }, 400);
  }, [question.id, currentQ, onSave]);

  const handlePrev = () => {
    if (currentQ > 0) {
      setDirection(-1);
      setCurrentQ(q => q - 1);
    }
  };

  const handleNext = () => {
    if (currentQ < personalityQuestions.length - 1 && answers[question.id]) {
      setDirection(1);
      setCurrentQ(q => q + 1);
    }
  };

  // Calculate top 3 traits
  const calculateTraits = () => {
    const traitScores: Record<string, number> = {};
    const traitCounts: Record<string, number> = {};
    personalityQuestions.forEach(q => {
      const score = answers[q.id] || 3;
      traitScores[q.trait] = (traitScores[q.trait] || 0) + score;
      traitCounts[q.trait] = (traitCounts[q.trait] || 0) + 1;
    });
    const averaged = Object.entries(traitScores).map(([trait, score]) => ({
      trait,
      avg: score / (traitCounts[trait] || 1),
    }));
    averaged.sort((a, b) => b.avg - a.avg);
    return averaged.slice(0, 3).map(t => t.trait);
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '30%' : '-30%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-30%' : '30%', opacity: 0 }),
  };

  if (showComplete) {
    const topTraits = calculateTraits();
    return (
      <div className="px-5 py-8 min-h-[100dvh] flex flex-col items-center justify-center">
        {/* Confetti */}
        {confettiPieces.map(piece => (
          <motion.div
            key={piece.id}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              x: piece.x,
              y: piece.y,
              opacity: 0,
              rotate: piece.rotation,
              scale: 0.5,
            }}
            transition={{ duration: 1.5, ease: easeOutExpo, delay: piece.delay }}
            className="fixed left-1/2 top-1/3 w-2 h-2 rounded-sm pointer-events-none z-50"
            style={{ backgroundColor: piece.color }}
          />
        ))}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-[rgba(0,200,83,0.1)] border-2 border-[#00C853] flex items-center justify-center mb-6"
        >
          <Sparkles className="w-10 h-10 text-[#00C853]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ease: easeOutExpo }}
          className="font-display text-3xl font-medium text-white text-center mb-3"
        >
          Personality Test Complete!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ease: easeOutExpo }}
          className="text-[#CBD5E1] text-center mb-8"
        >
          We learned a lot about how your child learns best.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, ease: easeOutExpo }}
          className="mb-8"
        >
          <p className="text-xs text-[#64748B] uppercase tracking-wider text-center mb-3">Top Traits</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {topTraits.map((trait, i) => (
              <motion.span
                key={trait}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.15, ease: easeOutExpo }}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{
                  backgroundColor: `${(traitColors as Record<string, string>)[trait]}20`,
                  border: `1px solid ${(traitColors as Record<string, string>)[trait]}50`,
                  color: (traitColors as Record<string, string>)[trait],
                }}
              >
                {(traitLabels as Record<string, string>)[trait]}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, ease: easeOutExpo }}
          onClick={onComplete}
          className="glass-btn"
        >
          Continue to Achievement Test
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Progress bar at top */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider">
            Question {currentQ + 1} of {personalityQuestions.length}
          </span>
          <span className="text-[10px] text-[#00C853] font-mono">
            {answeredCount}/{personalityQuestions.length}
          </span>
        </div>
        <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #00C853, #38BDF8)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 px-5 py-6 flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQ}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: easeOutExpo }}
            className="liquid-glass p-6 flex-1 flex flex-col"
          >
            <div className="mb-6">
              <span className="font-mono text-sm text-[#00C853] mb-2 block">
                Q{question.id}
              </span>
              <h3 className="font-body text-xl font-semibold text-white leading-relaxed">
                {question.text}
              </h3>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              {likertOptions.map((option) => {
                const isSelected = answers[question.id] === option.value;
                return (
                  <motion.button
                    key={option.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full text-left px-4 py-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'border-[#00C853] bg-[rgba(0,200,83,0.08)]'
                        : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)]'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-[#CBD5E1]'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Check className="w-5 h-5 text-[#00C853]" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentQ === 0}
            className={`ghost-btn flex items-center gap-2 ${currentQ === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={onExit}
            className="text-xs text-[#64748B] hover:text-lightSilver transition-colors"
          >
            Save & Exit
          </button>
          <button
            onClick={handleNext}
            disabled={currentQ === personalityQuestions.length - 1 || !answers[question.id]}
            className={`ghost-btn flex items-center gap-2 ${(currentQ === personalityQuestions.length - 1 || !answers[question.id]) ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
