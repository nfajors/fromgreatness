import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle2, X, Trophy, Zap } from 'lucide-react';
import { achievementQuestions as staticAchievementQuestions } from './data';
import type { AchievementQuestion } from './data';
import CountUp from 'react-countup';

interface AchievementTestProps {
  onComplete: () => void;
  onExit: () => void;
  savedAnswers?: Record<number, number>;
  onSave: (answers: Record<number, number>) => void;
  questions?: AchievementQuestion[];
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const domainColors: Record<string, string> = {
  History: '#00C853',
  Language: '#7E57C2',
  Food: '#F59E0B',
  Dress: '#F8BBD0',
  Identity: '#38BDF8',
};

export default function AchievementTest({ onComplete, onExit, savedAnswers = {}, onSave, questions }: AchievementTestProps) {
  const achievementQuestions = questions && questions.length > 0 ? questions : staticAchievementQuestions;
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>(savedAnswers);
  const [direction, setDirection] = useState(1);
  const [showComplete, setShowComplete] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Build a STABLE sequence of unique questions once, ordered easy→medium→hard.
  // This fixes two bugs: (1) questions repeating (old code looped a small
  // per-difficulty pool with `% length`), and (2) a different question flashing
  // when difficulty changed mid-test (the active list used to change on each
  // answer). The sequence no longer depends on the live `difficulty` state.
  const orderedQuestions = useMemo(() => {
    const byDifficulty = (d: string) => achievementQuestions.filter(q => q.difficulty === d);
    const seq = [...byDifficulty('easy'), ...byDifficulty('medium'), ...byDifficulty('hard')];
    const pool = seq.length > 0 ? seq : achievementQuestions;
    // De-duplicate by id and cap at 25 unique questions.
    const seen = new Set<number>();
    const unique = pool.filter(q => (seen.has(q.id) ? false : (seen.add(q.id), true)));
    return unique.slice(0, 25);
  }, [achievementQuestions]);

  const activeQuestions = orderedQuestions;
  const question = activeQuestions[currentQ];
  const totalQuestions = activeQuestions.length;
  const progress = totalQuestions > 0 ? ((currentQ + 1) / totalQuestions) * 100 : 0;

  const handleAnswer = useCallback((optionIndex: number) => {
    if (feedback || !question) return;

    const isCorrect = optionIndex === question.correctIndex;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    setAnswers(prev => {
      const next = { ...prev, [question.id]: optionIndex };
      onSave(next);
      return next;
    });

    // Update streak and difficulty
    if (isCorrect) {
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak >= 3) {
          setDifficulty(d => d === 'easy' ? 'medium' : d === 'medium' ? 'hard' : 'hard');
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 1500);
        }
        return newStreak;
      });
    } else {
      setStreak(0);
      setDifficulty(d => d === 'hard' ? 'medium' : d === 'medium' ? 'easy' : 'easy');
    }

    // Auto-advance
    setTimeout(() => {
      setFeedback(null);
      if (currentQ < totalQuestions - 1) {
        setDirection(1);
        setCurrentQ(q => q + 1);
      } else {
        setShowComplete(true);
      }
    }, isCorrect ? 800 : 1200);
  }, [currentQ, feedback, question, onSave, totalQuestions]);

  const handlePrev = () => {
    if (currentQ > 0) {
      setDirection(-1);
      setCurrentQ(q => q - 1);
      setFeedback(null);
    }
  };

  // Calculate scores
  const calculateScore = () => {
    let correct = 0;
    Object.entries(answers).forEach(([qId, ansIdx]) => {
      const q = achievementQuestions.find(aq => aq.id === Number(qId));
      if (q && q.correctIndex === ansIdx) correct++;
    });
    return { correct, total: totalQuestions, percent: Math.round((correct / totalQuestions) * 100) };
  };

  const calculateDomainScores = () => {
    const domains: Record<string, { correct: number; total: number }> = {};
    achievementQuestions.forEach(q => {
      if (!domains[q.domain]) domains[q.domain] = { correct: 0, total: 0 };
      domains[q.domain].total++;
      if (answers[q.id] === q.correctIndex) {
        domains[q.domain].correct++;
      }
    });
    return Object.entries(domains).map(([domain, scores]) => ({
      domain,
      percent: Math.round((scores.correct / scores.total) * 100) || 0,
    }));
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '30%' : '-30%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-30%' : '30%', opacity: 0 }),
  };

  if (showComplete) {
    const score = calculateScore();
    const domainScores = calculateDomainScores();
    const scoreColor = score.percent >= 70 ? '#00C853' : score.percent >= 50 ? '#F59E0B' : '#F87171';

    return (
      <div className="px-5 py-8 min-h-[100dvh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-[rgba(245,158,11,0.1)] border-2 border-[#F59E0B] flex items-center justify-center mb-6"
        >
          <Trophy className="w-10 h-10 text-[#F59E0B]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ease: easeOutExpo }}
          className="font-display text-3xl font-medium text-white text-center mb-2"
        >
          Achievement Test Complete!
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, ease: easeOutExpo }}
          className="text-center mb-6"
        >
          <span className="font-display text-6xl font-medium" style={{ color: scoreColor }}>
            <CountUp end={score.percent} duration={2} suffix="%" />
          </span>
          <p className="text-sm text-[#CBD5E1] mt-1">
            {score.correct} of {score.total} correct
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, ease: easeOutExpo }}
          className="w-full max-w-sm mb-8"
        >
          <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3">Score by Category</p>
          <div className="flex flex-col gap-3">
            {domainScores.map((ds, i) => (
              <motion.div
                key={ds.domain}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1, ease: easeOutExpo }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white font-medium">{ds.domain}</span>
                  <span className="text-sm font-mono" style={{ color: domainColors[ds.domain] }}>
                    {ds.percent}%
                  </span>
                </div>
                <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: domainColors[ds.domain] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${ds.percent}%` }}
                    transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.9 + i * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, ease: easeOutExpo }}
          onClick={onComplete}
          className="glass-btn"
        >
          Continue to Cultural Identity Test
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Level Up Badge */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-4 left-0 right-0 z-50 flex justify-center"
          >
            <div className="bg-[#1E293B] border border-[rgba(245,158,11,0.5)] rounded-full px-5 py-3 flex items-center gap-2 shadow-lg"
              style={{ boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}
            >
              <Zap className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-sm font-semibold text-[#F59E0B]">Level Up!</span>
              <span className="text-xs text-[#CBD5E1]">Difficulty increased</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider">
            Question {currentQ + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-2">
            {streak > 1 && (
              <span className="text-[10px] text-[#F59E0B] font-mono flex items-center gap-1">
                <Zap className="w-3 h-3" /> {streak} streak
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{
              backgroundColor: `${domainColors[question?.domain || 'History']}20`,
              color: domainColors[question?.domain || 'History'],
              border: `1px solid ${domainColors[question?.domain || 'History']}40`,
            }}>
              {question?.domain}
            </span>
          </div>
        </div>
        <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #F59E0B, #F8BBD0)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
          />
        </div>
      </div>

      {/* Question */}
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
              <span className="font-mono text-sm mb-2 block" style={{ color: domainColors[question?.domain || 'History'] }}>
                Q{question?.id}
              </span>
              <h3 className="font-body text-xl font-semibold text-white leading-relaxed">
                {question?.text}
              </h3>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              {question?.options.map((option, idx) => {
                const isSelected = answers[question.id] === idx;
                const showCorrect = feedback && idx === question.correctIndex;
                const showIncorrect = feedback && isSelected && idx !== question.correctIndex;

                return (
                  <motion.button
                    key={idx}
                    whileTap={!feedback ? { scale: 0.98 } : undefined}
                    onClick={() => handleAnswer(idx)}
                    disabled={!!feedback}
                    className={`w-full text-left px-4 py-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                      showCorrect
                        ? 'border-[#00C853] bg-[rgba(0,200,83,0.12)]'
                        : showIncorrect
                        ? 'border-[#F87171] bg-[rgba(248,113,113,0.12)]'
                        : isSelected
                        ? 'border-[#F59E0B] bg-[rgba(245,158,11,0.08)]'
                        : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)]'
                    } ${feedback ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <span className={`text-sm font-medium ${
                      showCorrect ? 'text-[#00C853]' : showIncorrect ? 'text-[#F87171]' : 'text-[#CBD5E1]'
                    }`}>
                      {option}
                    </span>
                    {showCorrect && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
                      </motion.div>
                    )}
                    {showIncorrect && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <X className="w-5 h-5 text-[#F87171]" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 text-center text-sm font-semibold ${
                  feedback === 'correct' ? 'text-[#00C853]' : 'text-[#F87171]'
                }`}
              >
                {feedback === 'correct' ? 'Correct! Well done!' : 'Not quite. The correct answer is highlighted.'}
              </motion.div>
            )}
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
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>
      </div>
    </div>
  );
}
