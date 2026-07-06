import { useState, useCallback } from 'react';
import { trpc } from '@/providers/trpc';
import { useAppData } from '@/hooks/useAppData';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import StepIndicator from '@/components/onboarding/StepIndicator';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import ParentalConsentStep from '@/components/onboarding/ParentalConsentStep';
import StudentProfileStep from '@/components/onboarding/StudentProfileStep';
import DnaSourceStep from '@/components/onboarding/DnaSourceStep';
import AssessmentIntroStep from '@/components/onboarding/AssessmentIntroStep';
import CompletionState from '@/components/onboarding/CompletionState';

const TOTAL_STEPS = 5;

const easeSmooth = [0.4, 0, 0.2, 1] as [number, number, number, number];

const stepVariants = {
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

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const { setSelectedStudent } = useAppData();
  const utils = trpc.useUtils();
  const createStudent = trpc.student.create.useMutation({
    onSuccess: (data) => {
      if (data) {
        setSelectedStudent(data.id, data.fullName);
        utils.student.list.invalidate();
      }
    },
  });
  const [direction, setDirection] = useState(1);
  const [showCompletion, setShowCompletion] = useState(false);
  const navigate = useNavigate();

  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleBeginAssessments = useCallback(() => {
    setShowCompletion(true);
  }, []);

  const handleRedirect = useCallback(() => {
    navigate('/dna-upload');
  }, [navigate]);

  return (
    <div
      className="min-h-[100dvh] relative"
      style={{ background: '#0A0C1B' }}
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
          {currentStep > 1 && !showCompletion && (
            <button
              onClick={prevStep}
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
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-vibrantGreen" />
            <span className="font-display text-lg font-semibold text-white">
              fromGreatness
            </span>
          </div>
        </header>

        {/* Step Indicator */}
        {!showCompletion && <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-8">
          <AnimatePresence mode="wait" custom={direction}>
            {showCompletion ? (
              <motion.div
                key="completion"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CompletionState
                  onRedirect={handleRedirect}
                />
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: easeSmooth }}
              >
                {currentStep === 1 && (
                  <WelcomeStep onContinue={nextStep} />
                )}
                {currentStep === 2 && (
                  <ParentalConsentStep
                    onContinue={nextStep}
                    onBack={prevStep}
                  />
                )}
                {currentStep === 3 && (
                  <StudentProfileStep
                    onContinue={nextStep}
                    onBack={prevStep}
                    onCreateStudent={(data) => createStudent.mutate(data)}
                    isCreating={createStudent.isPending}
                  />
                )}
                {currentStep === 4 && (
                  <DnaSourceStep
                    onContinue={nextStep}
                    onBack={prevStep}
                  />
                )}
                {currentStep === 5 && (
                  <AssessmentIntroStep
                    onBegin={handleBeginAssessments}
                    onBack={prevStep}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
