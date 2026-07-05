import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Map, ChevronDown, ChevronUp } from 'lucide-react';
import CountUp from 'react-countup';
import { ancestryRegions as defaultRegions } from './data';
import type { AncestryRegion } from './data';

interface AncestryResultsProps {
  onContinue: () => void;
  onUploadDifferent: () => void;
  regions?: AncestryRegion[];
  markerCount?: number;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

function RegionCard({ region, index }: { region: AncestryRegion; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.1, ease: easeOutExpo }}
      className="mb-3"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg">{region.flag}</span>
          <span className="text-sm text-white font-medium flex-1">{region.name}</span>
          <span className="font-mono text-sm font-medium" style={{ color: region.color }}>
            <CountUp end={region.percentage} duration={2} delay={0.5 + index * 0.1} suffix="%" />
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#64748B]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#64748B]" />
          )}
        </div>

        {/* Animated bar */}
        <div className="h-2.5 bg-[#1E293B] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: region.color }}
            initial={{ width: 0 }}
            animate={{ width: `${region.percentage}%` }}
            transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.6 + index * 0.1 }}
          />
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className="overflow-hidden"
          >
            <div className="mt-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
              <p className="text-xs text-[#CBD5E1]">
                Your DNA shows {region.percentage}% {region.name} heritage.
                This region contributes to your genetic ancestry profile
                and will inform personalized content in your study plan.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AncestryResults({ onContinue, onUploadDifferent, regions, markerCount }: AncestryResultsProps) {
  const ancestryRegions = regions && regions.length > 0 ? regions : defaultRegions;
  const [confettiPieces] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 300 - 150,
      y: Math.random() * -200 - 50,
      rotation: Math.random() * 720 - 360,
      color: ['#00C853', '#38BDF8', '#F59E0B', '#7E57C2', '#F8BBD0'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.3,
    }))
  );

  return (
    <div className="px-5 py-6">
      {/* Confetti burst */}
      {confettiPieces.map(piece => (
        <motion.div
          key={piece.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: piece.x,
            y: piece.y,
            opacity: 0,
            rotate: piece.rotation,
          }}
          transition={{ duration: 1.5, ease: easeOutExpo, delay: piece.delay }}
          className="fixed left-1/2 top-[20%] w-2 h-2 rounded-sm pointer-events-none z-50"
          style={{ backgroundColor: piece.color }}
        />
      ))}

      {/* Success Check */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="flex justify-center mb-4"
      >
        <div className="w-16 h-16 rounded-full bg-[rgba(0,200,83,0.1)] border-2 border-[#00C853] flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#00C853]" />
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ease: easeOutExpo }}
        className="font-display text-3xl font-medium text-white text-center mb-2"
      >
        DNA Analysis Complete!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ease: easeOutExpo }}
        className="text-sm text-[#CBD5E1] text-center mb-6"
      >
        We found <span className="text-[#00C853] font-mono font-medium">700,000+</span> genetic markers mapping to your heritage.
      </motion.p>

      {/* Map placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, ease: easeOutExpo }}
        className="relative h-[180px] rounded-2xl overflow-hidden mb-6 border border-[rgba(255,255,255,0.06)]"
      >
        <img
          src="/ancestry-map.jpg"
          alt="Ancestry map"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback gradient if image not found
            (e.target as HTMLImageElement).style.display = 'none';
            (e.currentTarget.parentElement as HTMLDivElement).style.background = 'radial-gradient(circle at 30% 50%, rgba(0,200,83,0.2), transparent 60%), radial-gradient(circle at 70% 30%, rgba(56,189,248,0.15), transparent 50%), #0A0C1B';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C1B]/80 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <Map className="w-4 h-4 text-[#00C853]" />
          <span className="text-xs text-[#CBD5E1]">Heritage origins mapped</span>
        </div>
      </motion.div>

      {/* Ancestry Breakdown Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, ease: easeOutExpo }}
        className="liquid-glass p-5 mb-6"
      >
        <h3 className="font-body text-base font-semibold text-white mb-4">Your Heritage Breakdown</h3>

        {ancestryRegions.map((region, i) => (
          <RegionCard key={region.id} region={region} index={i} />
        ))}

        <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] text-center">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider">
            {markerCount && markerCount > 0
              ? `Analyzed ${markerCount.toLocaleString()} genetic markers`
              : 'Heritage regions confirmed'}
          </span>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, ease: easeOutExpo }}
        className="flex flex-col gap-3"
      >
        <button onClick={onContinue} className="glass-btn w-full">
          Generate My Study Plan
        </button>
        <button
          onClick={onUploadDifferent}
          className="ghost-btn w-full text-sm"
        >
          Upload Different File
        </button>
      </motion.div>
    </div>
  );
}
