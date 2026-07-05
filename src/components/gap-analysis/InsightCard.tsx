import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface InsightCardProps {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  type: 'warning' | 'positive' | 'info';
  index: number;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    color: '#F87171',
    barColor: '#F87171',
    badgeBg: 'rgba(248,113,113,0.1)',
    badgeBorder: 'rgba(248,113,113,0.3)',
  },
  positive: {
    icon: CheckCircle2,
    color: '#00C853',
    barColor: '#00C853',
    badgeBg: 'rgba(0,200,83,0.1)',
    badgeBorder: 'rgba(0,200,83,0.3)',
  },
  info: {
    icon: Info,
    color: '#38BDF8',
    barColor: '#38BDF8',
    badgeBg: 'rgba(56,189,248,0.1)',
    badgeBorder: 'rgba(56,189,248,0.3)',
  },
};

const priorityLabels: Record<string, string> = {
  High: 'HIGH PRIORITY',
  Medium: 'MODERATE',
  Low: 'LEVERAGE',
};

export default function InsightCard({
  title,
  description,
  priority,
  type,
  index,
}: InsightCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.6 + index * 0.12,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: config.barColor }}
      />

      <div className="p-5 pl-6">
        {/* Icon + Title */}
        <div className="flex items-start gap-3 mb-2">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: config.color }} />
          <h3 className="font-body text-base font-semibold text-white leading-snug">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-mediumGray leading-relaxed mb-3 ml-8">
          {description}
        </p>

        {/* Priority badge */}
        <motion.div
          className="ml-8 inline-block"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.9 + index * 0.12,
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
        >
          <span
            className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
            style={{
              background: config.badgeBg,
              border: `1px solid ${config.badgeBorder}`,
              color: config.color,
            }}
          >
            {priorityLabels[priority]}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
