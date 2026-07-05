import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];
const springTransition = { type: 'spring' as const, stiffness: 300, damping: 20 };

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: easeOutExpo }}
    >
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <motion.h2
              className="font-display text-[28px] font-medium text-white text-center mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4, ease: easeOutExpo }}
            >
              Reset Your Password
            </motion.h2>
            <p className="text-center text-lightSilver mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            {/* Email Field */}
            <div className="mb-6">
              <label className="section-label block mb-2">Email</label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: '#64748B' }}
                />
                <Input
                  type="email"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="h-[52px] w-full rounded-xl pl-12 pr-4 text-white placeholder:text-[#334155] transition-all duration-200 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]"
                  style={
                    focused
                      ? {
                          borderColor: '#00C853',
                          boxShadow: '0 0 0 3px rgba(0,200,83,0.15)',
                        }
                      : {}
                  }
                />
              </div>
            </div>

            {/* Send Reset Link Button */}
            <motion.button
              type="submit"
              className="glass-btn w-full h-[52px] text-base rounded-full mb-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send Reset Link
            </motion.button>

            {/* Back to Login */}
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-2 w-full text-sm text-vibrantGreen hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            className="flex flex-col items-center text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springTransition}
            >
              <CheckCircle2 className="w-12 h-12 text-vibrantGreen mb-4" />
            </motion.div>
            <motion.h2
              className="font-display text-[28px] font-medium text-white mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              Check your email!
            </motion.h2>
            <motion.p
              className="text-lightSilver mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              We've sent a password reset link to your inbox.
            </motion.p>
            <motion.button
              type="button"
              onClick={onBack}
              className="glass-btn px-8 h-12 rounded-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Sign In
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
