import { motion } from 'framer-motion';
import {
  BookOpen,
  MessageCircle,
  UtensilsCrossed,
  Shirt,
  ArrowRight,
} from 'lucide-react';

const domainIcons = {
  History: BookOpen,
  Language: MessageCircle,
  Food: UtensilsCrossed,
  Dress: Shirt,
};

const domainColors: Record<string, string> = {
  History: '#00C853',
  Language: '#7E57C2',
  Food: '#F59E0B',
  Dress: '#F8BBD0',
};

const domainGradients: Record<string, string> = {
  History: 'linear-gradient(135deg, #00C853, #0D47A1)',
  Language: 'linear-gradient(135deg, #7E57C2, #00C853)',
  Food: 'linear-gradient(135deg, #F59E0B, #00C853)',
  Dress: 'linear-gradient(135deg, #F8BBD0, #00C853)',
};

interface GapCardProps {
  domain: 'History' | 'Language' | 'Food' | 'Dress';
  current: number;
  heritage: number;
  insight: string;
  index: number;
}

export default function GapCard({
  domain,
  current,
  heritage,
  insight,
  index,
}: GapCardProps) {
  const gap = heritage - current;
  const Icon = domainIcons[domain];
  const color = domainColors[domain];
  const gapColor = gap > 40 ? '#F87171' : gap > 20 ? '#F59E0B' : '#00C853';

  return (
    <motion.div
      className="liquid-glass p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.5 + index * 0.15,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
    >
      {/* Domain accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl"
        style={{ background: domainGradients[domain] }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 ml-2">
        <Icon className="w-5 h-5" style={{ color }} />
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color }}
        >
          {domain}
        </span>
      </div>

      {/* Score bars */}
      <div className="space-y-3 mb-4 ml-2">
        {/* Current bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-lightSilver">Current Knowledge</span>
            <span className="text-xs font-mono text-lightSilver">{current}%</span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${current}%` }}
              transition={{
                delay: 0.8 + index * 0.15,
                duration: 1,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            />
          </div>
        </div>

        {/* Heritage bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-lightSilver">Heritage Potential</span>
            <span className="text-xs font-mono text-vibrantGreen">{heritage}%</span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-vibrantGreen"
              initial={{ width: 0 }}
              animate={{ width: `${heritage}%` }}
              transition={{
                delay: 0.8 + index * 0.15,
                duration: 1,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            />
          </div>
        </div>
      </div>

      {/* Gap indicator */}
      <div className="flex items-center gap-2 ml-2 mb-3">
        <ArrowRight className="w-4 h-4 text-mediumGray" />
        <motion.span
          className="font-mono text-sm font-semibold"
          style={{ color: gapColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 + index * 0.15 }}
        >
          Gap: {gap}%
        </motion.span>
        {gap > 40 && (
          <motion.span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: gapColor }}
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Insight */}
      <p className="text-xs text-mediumGray leading-relaxed ml-2">{insight}</p>
    </motion.div>
  );
}
