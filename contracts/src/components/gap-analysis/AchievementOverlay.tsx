import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Coins } from 'lucide-react';

interface AchievementOverlayProps {
  visible: boolean;
  onContinue: () => void;
}

export default function AchievementOverlay({
  visible,
  onContinue,
}: AchievementOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="liquid-glass w-full max-w-[340px] p-8 flex flex-col items-center text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              delay: 0.1,
            }}
          >
            {/* Trophy icon */}
            <motion.div
              className="mb-5"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
                  boxShadow: '0 0 30px rgba(212,175,55,0.4)',
                }}
              >
                <Trophy className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* Text */}
            <h2 className="font-display text-2xl text-white mb-1">
              Achievement Unlocked!
            </h2>
            <h3 className="font-body text-lg font-semibold text-vibrantGreen mb-2">
              Heritage Explorer
            </h3>
            <p className="text-sm text-lightSilver mb-5">
              You completed your first heritage analysis!
            </p>

            {/* Coins */}
            <div className="flex items-center gap-2 mb-6">
              <Coins className="w-5 h-5 text-amber" />
              <motion.span
                className="font-mono text-xl font-semibold text-amber"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                +50 coins
              </motion.span>
            </div>

            {/* Continue button */}
            <button
              onClick={onContinue}
              className="glass-btn w-full text-sm py-3 px-6"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
