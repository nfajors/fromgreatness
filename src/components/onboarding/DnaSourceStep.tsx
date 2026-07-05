import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dna, Globe, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DnaSourceStepProps {
  onContinue: () => void;
  onBack: () => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
};

export default function DnaSourceStep({ onContinue, onBack }: DnaSourceStepProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    {
      id: 'upload',
      icon: Dna,
      iconColor: '#00C853',
      title: 'Upload DNA File',
      description: 'Upload from 23andMe, AncestryDNA, or raw file',
      detail: 'Most accurate heritage mapping',
      badge: 'RECOMMENDED',
      badgeColor: 'bg-[rgba(0,200,83,0.1)] text-vibrantGreen border-[rgba(0,200,83,0.3)]',
    },
    {
      id: 'manual',
      icon: Globe,
      iconColor: '#38BDF8',
      title: 'Enter Family Heritage Manually',
      description: 'Tell us what you know about your family\'s origins',
      detail: 'Great if you don\'t have DNA data yet',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'skip',
      icon: Clock,
      iconColor: '#64748B',
      title: 'Skip for Now',
      description: 'Set up heritage info later in settings',
      detail: 'Study plans will use manual input only',
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <motion.div
      className="px-4 pt-4 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.p className="section-label mb-2" variants={itemVariants}>
        STEP 4 OF 5
      </motion.p>
      <motion.h2
        className="font-display text-[28px] font-medium text-white mb-2"
        variants={itemVariants}
      >
        DNA Data Source
      </motion.h2>
      <motion.p className="text-lightSilver mb-6" variants={itemVariants}>
        How would you like us to determine your child's genetic heritage?
      </motion.p>

      {/* Option Cards */}
      <motion.div className="space-y-4 mb-8" variants={containerVariants}>
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const Icon = option.icon;

          return (
            <motion.div
              key={option.id}
              variants={itemVariants}
              onClick={() => setSelectedOption(option.id)}
              className={cn(
                'liquid-glass p-5 cursor-pointer relative transition-all duration-200',
                isSelected && 'border-vibrantGreen/50'
              )}
              style={
                isSelected
                  ? { boxShadow: '0 0 20px rgba(0,200,83,0.15), 0 8px 32px rgba(0,0,0,0.2)' }
                  : {}
              }
              whileHover={{ y: -2 }}
            >
              {/* Checkmark badge when selected */}
              {isSelected && (
                <motion.div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-vibrantGreen flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}

              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${option.iconColor}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: option.iconColor }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-body text-sm font-semibold text-white">
                      {option.title}
                    </h3>
                    {option.badge && (
                      <span className={cn('pill-badge text-[10px] px-2 py-0.5', option.badgeColor)}>
                        {option.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-lightSilver">{option.description}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{option.detail}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
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
          onClick={onContinue}
          disabled={!selectedOption}
          className={cn(
            'flex-1 h-12 rounded-full font-semibold text-base transition-all duration-300',
            selectedOption
              ? 'glass-btn'
              : 'bg-[rgba(255,255,255,0.05)] text-[#64748B] border border-[rgba(255,255,255,0.08)] cursor-not-allowed'
          )}
          whileHover={selectedOption ? { scale: 1.02 } : {}}
          whileTap={selectedOption ? { scale: 0.98 } : {}}
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
