import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Star,
  Users,
  PlayCircle,
  HelpCircle,
  BookOpen,
  Check,
  X,
} from 'lucide-react';
import type { ModuleData } from './ModuleCard';

const domainColors: Record<string, string> = {
  History: '#00C853',
  Language: '#7E57C2',
  Food: '#F59E0B',
  Dress: '#F8BBD0',
};

const domainImages: Record<string, string> = {
  History: '/feature-history.jpg',
  Language: '/feature-language.jpg',
  Food: '/feature-food.jpg',
  Dress: '/feature-dress.jpg',
};

interface ModuleDetailSheetProps {
  module: ModuleData | null;
  domain: string;
  onClose: () => void;
}

const sampleLessons = [
  'Introduction and Overview',
  'Core Concepts and Fundamentals',
  'Historical Context and Background',
  'Cultural Significance and Meaning',
  'Practical Application and Practice',
  'Interactive Quiz and Review',
];

export default function ModuleDetailSheet({
  module,
  domain,
  onClose,
}: ModuleDetailSheetProps) {
  if (!module) return null;

  const color = domainColors[domain] || '#00C853';
  const image = domainImages[domain] || '/feature-history.jpg';

  return (
    <AnimatePresence>
      {module && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[70] bg-surface rounded-t-3xl overflow-hidden"
            style={{ maxHeight: '85vh', maxWidth: '430px', margin: '0 auto' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-mediumGray/50" />
            </div>

            {/* Thumbnail */}
            <div className="relative mx-4 rounded-2xl overflow-hidden h-40">
              <img
                src={image}
                alt={module.title}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)`,
                }}
              />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pb-8 pt-4 overflow-y-auto">
              {/* Module number */}
              <motion.span
                className="font-mono text-xs font-medium"
                style={{ color }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                M{module.id} • {domain}
              </motion.span>

              {/* Title */}
              <motion.h2
                className="font-display text-2xl text-white mt-1 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {module.title}
              </motion.h2>

              {/* Meta */}
              <motion.div
                className="flex items-center gap-4 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-mediumGray" />
                  <span className="text-xs text-lightSilver">{module.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber" />
                  <span className="text-xs text-lightSilver">{module.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-mediumGray" />
                  <span className="text-xs text-lightSilver">1,240 students</span>
                </div>
              </motion.div>

              {/* Description */}
              <motion.p
                className="text-sm text-lightSilver leading-relaxed mb-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {module.description}
              </motion.p>

              {/* Learning Objectives */}
              <motion.div
                className="mb-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-body text-sm font-semibold text-white mb-3">
                  Learning Objectives
                </h3>
                <ul className="space-y-2">
                  {sampleLessons.map((lesson, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                    >
                      <Check className="w-4 h-4 text-vibrantGreen mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-lightSilver">{lesson}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Content Preview */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="font-body text-sm font-semibold text-white mb-3">
                  Content Preview
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                    <PlayCircle className="w-5 h-5 text-vibrantGreen" />
                    <div>
                      <p className="text-sm text-white">Video Lesson</p>
                      <p className="text-xs text-mediumGray">8 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                    <HelpCircle className="w-5 h-5 text-accentBlue" />
                    <div>
                      <p className="text-sm text-white">Interactive Quiz</p>
                      <p className="text-xs text-mediumGray">10 questions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
                    <BookOpen className="w-5 h-5 text-amber" />
                    <div>
                      <p className="text-sm text-white">Cultural Notes</p>
                      <p className="text-xs text-mediumGray">Reading material</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Start button */}
              <motion.button
                className="glass-btn w-full py-3 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {module.status === 'in-progress' ? 'Continue Module' : 'Start Module'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
