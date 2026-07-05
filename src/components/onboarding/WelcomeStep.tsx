import { motion } from 'framer-motion';
import { Shield, ArrowRight, UserPlus, ClipboardCheck } from 'lucide-react';

interface WelcomeStepProps {
  onContinue: () => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

export default function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <motion.div
      className="flex flex-col items-center text-center px-4 pt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Shield Logo with glow */}
      <motion.div
        className="relative mb-8"
        variants={itemVariants}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.6 }}
      >
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-30"
          style={{
            width: 120,
            height: 120,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, #00C853, transparent 70%)',
          }}
        />
        <Shield className="w-[120px] h-[120px] text-vibrantGreen relative z-10" />
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="font-display text-[36px] font-medium text-white mb-3 leading-tight"
        variants={itemVariants}
      >
        Welcome to fromGreatness
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg text-lightSilver mb-8 max-w-[360px] leading-relaxed"
        variants={itemVariants}
      >
        You're about to start an incredible journey of cultural discovery for your child. It only takes a few minutes to get everything set up.
      </motion.p>

      {/* Preview Items */}
      <motion.div className="w-full space-y-3 mb-8" variants={containerVariants}>
        <motion.div
          className="flex items-center gap-4 p-4 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-left"
          variants={itemVariants}
        >
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.2)] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-vibrantGreen" />
          </div>
          <div>
            <h3 className="font-body text-sm font-semibold text-white">Secure parental consent</h3>
            <p className="text-xs text-[#64748B]">COPPA-compliant process</p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-4 p-4 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-left"
          variants={itemVariants}
        >
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.2)] flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-vibrantGreen" />
          </div>
          <div>
            <h3 className="font-body text-sm font-semibold text-white">Create your child's profile</h3>
            <p className="text-xs text-[#64748B]">Age, interests, learning preferences</p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-4 p-4 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-left"
          variants={itemVariants}
        >
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.2)] flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5 text-vibrantGreen" />
          </div>
          <div>
            <h3 className="font-body text-sm font-semibold text-white">Complete 3 quick assessments</h3>
            <p className="text-xs text-[#64748B]">Personality, achievement, and cultural identity</p>
          </div>
        </motion.div>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        type="button"
        onClick={onContinue}
        className="glass-btn w-full h-[52px] text-base rounded-full flex items-center justify-center gap-2"
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Let's Get Started
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      {/* Skip Option */}
      <motion.p
        className="text-center text-sm text-[#64748B] mt-4"
        variants={itemVariants}
      >
        Already completed onboarding?{' '}
        <button type="button" className="text-vibrantGreen hover:underline font-medium">
          Go to Dashboard
        </button>
      </motion.p>
    </motion.div>
  );
}
