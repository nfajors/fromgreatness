import { motion } from 'framer-motion';
import { Brain, Target, Globe, Lock, CheckCircle2, Clock, Play, Sparkles } from 'lucide-react';
import type { AssessmentStatus } from './types';

interface AssessmentOverviewProps {
  childName: string;
  statuses: Record<string, AssessmentStatus>;
  onStart: (id: string) => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const assessments = [
  {
    id: 'personality',
    title: 'Personality Test',
    subtitle: 'Discover strengths & traits',
    duration: '15 min',
    questions: '30 questions',
    icon: Brain,
    color: '#00C853',
    bgGradient: 'linear-gradient(135deg, rgba(0,200,83,0.15), rgba(0,200,83,0.05))',
    borderColor: 'rgba(0,200,83,0.3)',
  },
  {
    id: 'achievement',
    title: 'Achievement Test',
    subtitle: 'Academic & creative abilities',
    duration: '20 min',
    questions: '25 questions',
    icon: Target,
    color: '#F59E0B',
    bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    borderColor: 'rgba(245,158,11,0.3)',
  },
  {
    id: 'cultural',
    title: 'Cultural Identity Test',
    subtitle: 'Heritage & identity exploration',
    duration: '25 min',
    questions: '20 questions',
    icon: Globe,
    color: '#F8BBD0',
    bgGradient: 'linear-gradient(135deg, rgba(248,187,208,0.15), rgba(248,187,208,0.05))',
    borderColor: 'rgba(248,187,208,0.3)',
  },
];

function getStatusConfig(status: AssessmentStatus) {
  switch (status) {
    case 'completed':
      return { label: 'Completed', icon: CheckCircle2, className: 'text-[#00C853]' };
    case 'in_progress':
      return { label: 'In Progress', icon: Play, className: 'text-[#38BDF8]' };
    case 'locked':
      return { label: 'Locked', icon: Lock, className: 'text-[#64748B]' };
    default:
      return { label: 'Not Started', icon: Sparkles, className: 'text-[#64748B]' };
  }
}

export default function AssessmentOverview({ childName, statuses, onStart }: AssessmentOverviewProps) {
  const completedCount = Object.values(statuses).filter(s => s === 'completed').length;
  const overallPercent = Math.round((completedCount / 3) * 100);

  const canStart = (id: string) => {
    if (id === 'personality') return statuses[id] !== 'locked';
    if (id === 'achievement') return statuses.personality === 'completed';
    if (id === 'cultural') return statuses.achievement === 'completed';
    return false;
  };

  return (
    <div className="px-5 py-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
        className="text-center mb-6"
      >
        <h1 className="font-display text-4xl font-medium text-white mb-2">
          Let's Get to Know {childName}
        </h1>
        <p className="text-sm text-[#CBD5E1]">
          Complete all three to unlock your personalized study plan. Take your time!
        </p>
      </motion.div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.1 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="relative w-28 h-28 mb-2">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none" stroke="#1E293B" strokeWidth="8"
            />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="url(#progressGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${overallPercent * 2.64} ${264 - overallPercent * 2.64}`}
              initial={{ strokeDasharray: "0 264" }}
              animate={{ strokeDasharray: `${overallPercent * 2.64} ${264 - overallPercent * 2.64}` }}
              transition={{ duration: 1, ease: easeOutExpo, delay: 0.3 }}
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00C853" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-medium text-white">{overallPercent}%</span>
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider">Done</span>
          </div>
        </div>
        <p className="text-xs text-[#64748B]">
          {completedCount} of 3 completed
        </p>
      </motion.div>

      {/* Assessment Cards */}
      <div className="flex flex-col gap-4">
        {assessments.map((a, i) => {
          const status = statuses[a.id];
          const statusConfig = getStatusConfig(status);
          const StatusIcon = statusConfig.icon;
          const isUnlocked = canStart(a.id);
          const isCompleted = status === 'completed';

          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.15 + i * 0.1 }}
              className={`liquid-glass relative overflow-hidden ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}
              style={{
                borderLeft: isCompleted ? `4px solid ${a.color}` : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: a.bgGradient, border: `1px solid ${a.borderColor}` }}
                    >
                      <a.icon className="w-5 h-5" style={{ color: a.color }} />
                    </div>
                    <div>
                      <h3 className="font-body text-base font-semibold text-white">{a.title}</h3>
                      <p className="text-xs text-[#CBD5E1]">{a.subtitle}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${statusConfig.className}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span className="font-medium">{statusConfig.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#64748B] mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {a.duration}
                  </span>
                  <span>|</span>
                  <span>{a.questions}</span>
                </div>

                <button
                  onClick={() => isUnlocked && onStart(a.id)}
                  disabled={!isUnlocked}
                  className={`w-full py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border border-[rgba(0,200,83,0.3)]'
                      : status === 'in_progress'
                      ? 'glass-btn'
                      : isUnlocked
                      ? 'glass-btn'
                      : 'bg-[rgba(255,255,255,0.03)] text-[#64748B] border border-[rgba(255,255,255,0.08)] cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  ) : status === 'in_progress' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" /> Resume
                    </span>
                  ) : isUnlocked ? (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" /> Start
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" /> Locked
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
