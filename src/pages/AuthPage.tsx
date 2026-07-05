import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterStep1 from '@/components/auth/RegisterStep1';
import RegisterStep2 from '@/components/auth/RegisterStep2';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

type AuthState = 'login' | 'register-step1' | 'register-step2' | 'forgot-password';

export type RegistrationData = {
  fullName: string;
  email: string;
  password: string;
};

const easeSmooth = [0.4, 0, 0.2, 1] as [number, number, number, number];

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function AuthPage() {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [direction, setDirection] = useState(1);

  // Shared registration data so Step 1's inputs flow into Step 2's account creation.
  const [registration, setRegistration] = useState<RegistrationData>({
    fullName: '',
    email: '',
    password: '',
  });

  const transitionTo = (newState: AuthState, dir: number = 1) => {
    setDirection(dir);
    setAuthState(newState);
  };

  const showBack = authState !== 'login';
  const pageTitle =
    authState === 'register-step1' || authState === 'register-step2'
      ? 'fromGreatness'
      : undefined;

  const handleBack = () => {
    if (authState === 'register-step2') {
      transitionTo('register-step1', -1);
    } else if (authState === 'register-step1') {
      transitionTo('login', -1);
    } else if (authState === 'forgot-password') {
      transitionTo('login', -1);
    }
  };

  return (
    <div
      className="min-h-[100dvh] relative"
      style={{
        background: '#0A0C1B',
      }}
    >
      {/* Radial gradient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, #2D1B69 0%, transparent 50%)',
          opacity: 0.15,
        }}
      />

      {/* Main container */}
      <div className="relative z-10 max-w-[430px] mx-auto min-h-[100dvh] flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-14 flex items-center justify-center px-4 bg-[rgba(10,12,27,0.8)] backdrop-blur-[12px]">
          {showBack && (
            <button
              onClick={handleBack}
              className="absolute left-4 text-lightSilver hover:text-white transition-colors"
              aria-label="Go back"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          {pageTitle ? (
            <h1 className="font-display text-lg font-semibold text-white">
              {pageTitle}
            </h1>
          ) : (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-vibrantGreen" />
              <span className="font-display text-lg font-semibold text-white">
                fromGreatness
              </span>
            </div>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col px-6 pt-8 pb-12 overflow-y-auto">
          {/* Logo + Headline for Login */}
          {authState === 'login' && (
            <motion.div
              className="flex flex-col items-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <Shield className="w-16 h-16 text-vibrantGreen mb-4" />
              <h1 className="font-display text-[28px] font-medium text-white mb-1">
                Welcome Back
              </h1>
              <p className="text-lightSilver text-center">
                Sign in to continue your family's journey.
              </p>
            </motion.div>
          )}

          {/* Auth Forms with AnimatePresence */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={authState}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: easeSmooth }}
              className="w-full"
            >
              {authState === 'login' && (
                <LoginForm
                  onRegister={() => transitionTo('register-step1', 1)}
                  onForgotPassword={() => transitionTo('forgot-password', 1)}
                />
              )}
              {authState === 'register-step1' && (
                <RegisterStep1
                  data={registration}
                  onChange={setRegistration}
                  onContinue={() => transitionTo('register-step2', 1)}
                  onSignIn={() => transitionTo('login', -1)}
                />
              )}
              {authState === 'register-step2' && (
                <RegisterStep2
                  registration={registration}
                  onBack={() => transitionTo('register-step1', -1)}
                />
              )}
              {authState === 'forgot-password' && (
                <ForgotPasswordForm
                  onBack={() => transitionTo('login', -1)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
