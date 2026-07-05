import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface CompletionStateProps {
  studentName?: string;
  onRedirect: () => void;
}

// Confetti particle
interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
}

function generateParticles(): Particle[] {
  const colors = ['#00C853', '#7E57C2', '#F59E0B', '#38BDF8', '#F8BBD0', '#D4AF37'];
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 300 - 150,
    y: Math.random() * -200 - 100,
    rotation: Math.random() * 720 - 360,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    duration: Math.random() * 1.5 + 1.5,
    delay: Math.random() * 0.3,
  }));
}

export default function CompletionState({ studentName, onRedirect }: CompletionStateProps) {
  const [particles] = useState(generateParticles);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 100 / 60;
      });
    }, 50);

    const redirectTimer = setTimeout(() => {
      onRedirect();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(redirectTimer);
    };
  }, [onRedirect]);

  return (
    <div className="relative flex flex-col items-center justify-center text-center px-6 py-16 min-h-[60vh] overflow-hidden">
      {/* Confetti Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: '50%',
            top: '40%',
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: [0, p.y * 0.5, p.y],
            opacity: [1, 1, 0],
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        <CheckCircle2 className="w-16 h-16 text-vibrantGreen mb-6" />
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="font-display text-[36px] font-medium text-white mb-2"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        You're All Set!
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg text-lightSilver mb-8 max-w-[320px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {studentName
          ? `${studentName}'s profile is ready. Let's start the assessments.`
          : "Your profile is ready. Let's start the assessments."}
      </motion.p>

      {/* Countdown Progress Bar */}
      <motion.div
        className="w-full max-w-[280px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <div className="h-2 rounded-full bg-[#1E293B] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #00C853, #38BDF8)',
              width: `${progress}%`,
            }}
          />
        </div>
        <p className="text-xs text-[#64748B] mt-2">
          Redirecting in a moment...
        </p>
      </motion.div>
    </div>
  );
}
