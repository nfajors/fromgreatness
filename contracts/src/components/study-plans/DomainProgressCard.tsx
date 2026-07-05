import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface DomainProgressCardProps {
  title: string;
  completed: number;
  total: number;
  icon: ReactNode;
  color: string;
  index: number;
  onClick: () => void;
}

export default function DomainProgressCard({
  title,
  completed,
  total,
  icon,
  color,
  index,
  onClick,
}: DomainProgressCardProps) {
  const progress = Math.round((completed / total) * 100);

  return (
    <motion.button
      className="rounded-2xl p-4 text-left w-full relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.2 + index * 0.1,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
    >
      {/* Top color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ backgroundColor: color }}
      />

      {/* Icon */}
      <div className="mb-3" style={{ color }}>
        {icon}
      </div>

      {/* Title */}
      <h3 className="font-body text-sm font-semibold text-white mb-2">{title}</h3>

      {/* Progress bar */}
      <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-2">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            delay: 0.4 + index * 0.1,
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
        />
      </div>

      {/* Stats */}
      <p className="text-xs text-mediumGray">
        <span style={{ color }}>{completed}</span> of {total} modules
      </p>
    </motion.button>
  );
}
