import { useState, useRef, useEffect, useCallback } from 'react';
import { trpc } from '@/providers/trpc';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ParentalConsentStepProps {
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

export default function ParentalConsentStep({ onContinue, onBack }: ParentalConsentStepProps) {
  const [consents, setConsents] = useState({
    dataCollection: false,
    communication: false,
    photoVideo: false,
    terms: false,
  });
  const [guardianName, setGuardianName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const allRequiredChecked =
    consents.dataCollection && consents.communication && consents.terms && guardianName.trim().length > 0;

  const recordConsent = trpc.consent.record.useMutation();

  const handleConsentContinue = async () => {
    try {
      await recordConsent.mutateAsync({
        guardianName: guardianName.trim(),
        dataCollection: consents.dataCollection,
        communication: consents.communication,
        photoVideo: consents.photoVideo,
        terms: consents.terms,
        signatureProvided: hasSigned,
      });
    } catch {
      // Even if recording fails we don't hard-block onboarding, but the attempt
      // is logged server-side; the parent can re-consent later.
    }
    onContinue();
  };

  // Canvas signature setup
  const getCanvasPos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCanvasPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCanvasPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#00C853';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      setHasSigned(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSigned(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    }
  }, []);

  return (
    <motion.div
      className="px-4 pt-4 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.p className="section-label mb-2" variants={itemVariants}>
        STEP 2 OF 5
      </motion.p>
      <motion.h2
        className="font-display text-[28px] font-medium text-white mb-2"
        variants={itemVariants}
      >
        Parental Consent
      </motion.h2>
      <motion.p className="text-lightSilver mb-6" variants={itemVariants}>
        To comply with federal law and protect your child, we need your consent.
      </motion.p>

      {/* Consent Card */}
      <motion.div
        className="liquid-glass p-5 mb-6"
        variants={itemVariants}
      >
        {/* Section 1: Data Collection */}
        <div className="mb-5">
          <h3 className="font-body text-sm font-semibold text-white mb-2">
            Data Collection Consent
          </h3>
          <div className="flex items-start gap-3">
            <Checkbox
              checked={consents.dataCollection}
              onCheckedChange={(checked) =>
                setConsents((prev) => ({ ...prev, dataCollection: checked as boolean }))
              }
              className="mt-0.5 border-[rgba(255,255,255,0.2)]"
            />
            <div>
              <p className="text-sm text-lightSilver leading-relaxed">
                I consent to fromGreatness collecting and processing my child's assessment responses, learning progress data, and DNA heritage information for the purpose of generating personalized study plans.
              </p>
              <p className="text-xs text-[#64748B] mt-1">
                All data is encrypted and stored securely. You can request data deletion at any time from your account settings.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Communication */}
        <div className="mb-5">
          <h3 className="font-body text-sm font-semibold text-white mb-2">
            Communication Consent
          </h3>
          <div className="flex items-start gap-3">
            <Checkbox
              checked={consents.communication}
              onCheckedChange={(checked) =>
                setConsents((prev) => ({ ...prev, communication: checked as boolean }))
              }
              className="mt-0.5 border-[rgba(255,255,255,0.2)]"
            />
            <p className="text-sm text-lightSilver leading-relaxed">
              I consent to receive progress notifications and learning recommendations about my child's activity on the platform.
            </p>
          </div>
        </div>

        {/* Section 3: Photo/Video */}
        <div className="mb-5">
          <h3 className="font-body text-sm font-semibold text-white mb-2">
            Photo/Video Consent
          </h3>
          <div className="flex items-start gap-3">
            <Checkbox
              checked={consents.photoVideo}
              onCheckedChange={(checked) =>
                setConsents((prev) => ({ ...prev, photoVideo: checked as boolean }))
              }
              className="mt-0.5 border-[rgba(255,255,255,0.2)]"
            />
            <div>
              <p className="text-sm text-lightSilver leading-relaxed">
                I consent to my child recording optional video reflections during the Cultural Identity assessment. These recordings stay on your device for personal reflection and are not uploaded or stored on our servers.
              </p>
              <button type="button" className="text-xs text-accentBlue hover:underline mt-1">
                Learn more about video privacy
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Terms */}
        <div>
          <h3 className="font-body text-sm font-semibold text-white mb-2">
            Terms Agreement
          </h3>
          <div className="flex items-start gap-3">
            <Checkbox
              checked={consents.terms}
              onCheckedChange={(checked) =>
                setConsents((prev) => ({ ...prev, terms: checked as boolean }))
              }
              className="mt-0.5 border-[rgba(255,255,255,0.2)]"
            />
            <p className="text-sm text-lightSilver leading-relaxed">
              I have read and agree to the{' '}
              <button type="button" className="text-vibrantGreen hover:underline">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-vibrantGreen hover:underline">
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </motion.div>

      {/* Guardian Name */}
      <motion.div className="mb-6" variants={itemVariants}>
        <label className="section-label block mb-2">
          Please enter your full name to confirm consent
        </label>
        <Input
          type="text"
          placeholder="e.g. Jane Smith"
          value={guardianName}
          onChange={(e) => setGuardianName(e.target.value)}
          className="h-[52px] w-full rounded-xl px-4 text-white placeholder:text-[#334155] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] focus-visible:border-vibrantGreen focus-visible:ring-[rgba(0,200,83,0.15)]"
        />
      </motion.div>

      {/* Digital Signature Pad */}
      <motion.div className="mb-6" variants={itemVariants}>
        <div className="flex items-center justify-between mb-2">
          <label className="section-label">Digital Signature</label>
          {hasSigned && (
            <button
              type="button"
              onClick={clearSignature}
              className="text-xs text-[#64748B] hover:text-lightSilver transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="relative rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-24 cursor-crosshair touch-none"
            style={{ touchAction: 'none' }}
          />
          {!hasSigned && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[#334155] text-sm">Sign here</span>
            </div>
          )}
        </div>
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
          onClick={handleConsentContinue}
          disabled={!allRequiredChecked || recordConsent.isPending}
          className={cn(
            'flex-1 h-12 rounded-full font-semibold text-base transition-all duration-300',
            allRequiredChecked
              ? 'glass-btn'
              : 'bg-[rgba(255,255,255,0.05)] text-[#64748B] border border-[rgba(255,255,255,0.08)] cursor-not-allowed'
          )}
          whileHover={allRequiredChecked ? { scale: 1.02 } : {}}
          whileTap={allRequiredChecked ? { scale: 0.98 } : {}}
        >
          I Consent
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
