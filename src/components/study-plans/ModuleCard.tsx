import { motion } from 'framer-motion';
import {
  Lock,
  Check,
  Clock,
  Star,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

export type ModuleStatus = 'locked' | 'unlocked' | 'in-progress' | 'completed';

export interface ModuleData {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  rating: string;
  status: ModuleStatus;
  lessons?: number;
}

interface ModuleCardProps {
  module: ModuleData;
  index: number;
  domainColor: string;
  onClick: () => void;
}


export default function ModuleCard({
  module,
  index,
  domainColor,
  onClick,
}: ModuleCardProps) {
  const isLocked = module.status === 'locked';
  const isCompleted = module.status === 'completed';
  const isInProgress = module.status === 'in-progress';

  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden ${
        isLocked ? 'opacity-50 grayscale' : ''
      }`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: isLocked ? 0.5 : 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      onClick={!isLocked ? onClick : undefined}
    >
      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: domainColor }}
      />

      <div className="p-4 pl-5 flex items-start gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Module number */}
          <span
            className="font-mono text-xs font-medium"
            style={{ color: domainColor }}
          >
            M{module.id}
          </span>

          {/* Title */}
          <h3 className="font-body text-sm font-semibold text-white mt-0.5 leading-snug">
            {module.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-mediumGray mt-1 line-clamp-2 leading-relaxed">
            {module.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-mediumGray" />
              <span className="text-[11px] text-mediumGray">{module.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-mediumGray" />
              <span className="text-[11px] text-mediumGray">{module.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-mediumGray" />
              <span className="text-[11px] text-mediumGray">{module.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Right side: status icon */}
        <div className="flex-shrink-0 mt-1">
          {isLocked ? (
            <Lock className="w-5 h-5 text-mutedSlate" />
          ) : isCompleted ? (
            <div className="w-6 h-6 rounded-full bg-vibrantGreen flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium" style={{ color: domainColor }}>
                {isInProgress ? 'Continue' : 'Start'}
              </span>
              <ChevronRight className="w-4 h-4" style={{ color: domainColor }} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
