import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { trpc } from '@/providers/trpc';
import type { RegistrationData } from '@/pages/AuthPage';

interface RegisterStep2Props {
  registration: RegistrationData;
  onBack: () => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const features = [
  'Full access to all 4 cultural domains',
  'AI-powered personalized study plans',
  'DNA heritage analysis & mapping',
  'Parent dashboard with progress tracking',
  'Cultural identity gap analysis',
  'Unlimited student profiles',
  'Monthly cultural milestone reports',
  'Priority customer support',
];

export default function RegisterStep2({ registration, onBack }: RegisterStep2Props) {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const registerMutation = trpc.auth.register.useMutation();
  const checkoutMutation = trpc.subscription.createCheckout.useMutation();

  const handleSubscribe = async () => {
    setError(null);
    setWorking(true);
    try {
      // 1) Create the account (also signs the user in via session cookie).
      await registerMutation.mutateAsync({
        name: registration.fullName.trim(),
        email: registration.email.trim(),
        password: registration.password,
      });
      await utils.auth.me.invalidate();

      // 2) Start Stripe Checkout. If payments aren't configured yet, the
      //    backend throws PRECONDITION_FAILED — in that case we proceed to
      //    onboarding so the account is still usable in development.
      try {
        const { url } = await checkoutMutation.mutateAsync({ plan });
        window.location.href = url; // redirect to Stripe hosted checkout
        return;
      } catch (checkoutErr) {
        console.warn('Checkout unavailable, continuing to onboarding:', checkoutErr);
        navigate('/onboarding');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      setWorking(false);
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: easeOutExpo }}
    >
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-vibrantGreen flex items-center justify-center">
            <Check className="w-2 h-2 text-white" />
          </div>
          <div className="w-12 h-1 rounded-full bg-vibrantGreen" />
          <motion.div
            className="w-3 h-3 rounded-full bg-vibrantGreen"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
      </div>
      <p className="text-center text-xs text-[#64748B] mb-4 uppercase tracking-wider font-semibold">
        Step 2 of 2 — Choose Your Plan
      </p>

      <motion.h2
        className="font-display text-[28px] font-medium text-white text-center mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: easeOutExpo }}
      >
        Choose Your Plan
      </motion.h2>

      {/* Annual Plan Card */}
      <motion.div
        className={cn(
          'liquid-glass p-5 mb-4 relative cursor-pointer transition-all duration-300',
          plan === 'annual' && 'border-vibrantGreen/50'
        )}
        style={plan === 'annual' ? { boxShadow: '0 0 30px rgba(0,200,83,0.2), 0 8px 32px rgba(0,0,0,0.2)' } : {}}
        onClick={() => setPlan('annual')}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5, ease: easeOutExpo }}
      >
        {plan === 'annual' && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="pill-badge text-[10px]">Best Value</span>
          </div>
        )}
        <div className="flex items-center justify-between mb-3 pt-1">
          <div>
            <h3 className="font-body text-base font-semibold text-white">Annual</h3>
            <p className="text-xs text-[#64748B]">Billed yearly</p>
          </div>
          <div className="text-right">
            <span className="font-display text-3xl font-medium text-vibrantGreen">$75</span>
            <span className="text-sm text-[#64748B]">/year</span>
          </div>
        </div>
        <p className="text-xs text-[#64748B] mb-3">That's only $6.25/month — save 37% vs monthly</p>

        <motion.div
          className="space-y-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature}
              className="flex items-center gap-2"
              variants={{
                hidden: { opacity: 0, x: -10 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <Check className="w-4 h-4 text-vibrantGreen shrink-0" />
              <span className="text-sm text-lightSilver">{feature}</span>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-end mt-3">
          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
              plan === 'annual' ? 'border-vibrantGreen bg-vibrantGreen' : 'border-[#334155]'
            )}
          >
            {plan === 'annual' && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </div>
      </motion.div>

      {/* Monthly Plan Card */}
      <motion.div
        className={cn(
          'p-5 mb-6 rounded-2xl cursor-pointer transition-all duration-300 border',
          plan === 'monthly'
            ? 'border-vibrantGreen/50 bg-[rgba(255,255,255,0.05)]'
            : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]'
        )}
        style={plan === 'monthly' ? { boxShadow: '0 0 20px rgba(0,200,83,0.15)' } : {}}
        onClick={() => setPlan('monthly')}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: easeOutExpo }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-body text-base font-semibold text-white">Monthly</h3>
            <p className="text-xs text-[#64748B]">Billed monthly, cancel anytime</p>
          </div>
          <div className="text-right">
            <span className="font-display text-3xl font-medium text-white">$9.99</span>
            <span className="text-sm text-[#64748B]">/mo</span>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
              plan === 'monthly' ? 'border-vibrantGreen bg-vibrantGreen' : 'border-[#334155]'
            )}
          >
            {plan === 'monthly' && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <p className="text-sm text-softRed mb-3 text-center" role="alert">
          {error}
        </p>
      )}

      {/* Subscribe Button */}
      <motion.button
        type="button"
        onClick={handleSubscribe}
        disabled={working}
        className="glass-btn w-full h-[52px] text-base rounded-full mb-3 flex items-center justify-center gap-2 disabled:opacity-60"
        whileHover={working ? {} : { scale: 1.02 }}
        whileTap={working ? {} : { scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {working && <Loader2 className="w-4 h-4 animate-spin" />}
        {working
          ? 'Setting up your account…'
          : plan === 'annual'
            ? 'Subscribe Now — $75/Year'
            : 'Subscribe Now — $9.99/Month'}
      </motion.button>

      {/* Guarantee */}
      <p className="text-center text-xs text-[#64748B] mb-6">
        ✓ Secure checkout via Stripe • Cancel anytime
      </p>

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        disabled={working}
        className="ghost-btn w-full h-12 text-sm rounded-full disabled:opacity-60"
      >
        Back
      </button>
    </motion.div>
  );
}
