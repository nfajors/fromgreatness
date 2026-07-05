import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ChevronLeft, Loader2, ShieldCheck } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { trpc } from '@/providers/trpc';

interface SubscriptionViewProps {
  onBack: () => void;
}

function formatDate(d?: Date | string | null): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SubscriptionView({ onBack }: SubscriptionViewProps) {
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const utils = trpc.useUtils();

  const { data: subscription, isLoading } = trpc.subscription.get.useQuery();
  const { data: status } = trpc.subscription.status.useQuery();

  const checkoutMutation = trpc.subscription.createCheckout.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
  const portalMutation = trpc.subscription.billingPortal.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
  const cancelMutation = trpc.subscription.cancel.useMutation({
    onSuccess: async () => {
      await utils.subscription.get.invalidate();
      setShowCancelSheet(false);
    },
  });

  const isActive = subscription?.status === 'active';
  const planLabel =
    subscription?.plan === 'annual'
      ? '$75/year'
      : subscription?.plan === 'monthly'
        ? '$9.99/month'
        : subscription?.plan === 'sponsored'
          ? 'Sponsored — Free'
          : '—';

  const stripeReady = status?.stripeEnabled ?? false;

  return (
    <motion.div
      className="min-h-[100dvh] bg-baseDark"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
    >
      <div className="max-w-[430px] mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 h-14 flex items-center px-4 bg-[rgba(10,12,27,0.8)] backdrop-blur-[12px]">
          <button onClick={onBack} className="absolute left-4 text-lightSilver hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-body text-base font-semibold text-white mx-auto">Your Subscription</h1>
        </header>

        <div className="px-5 pb-24 pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-mediumGray">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !subscription || subscription.status !== 'active' ? (
            /* ── No active subscription ── */
            <motion.div
              className="liquid-glass p-6 mb-6 text-center"
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ShieldCheck className="w-12 h-12 text-vibrantGreen mx-auto mb-3" />
              <h3 className="font-body text-lg font-semibold text-white mb-1">
                {subscription?.status === 'cancelled'
                  ? 'Subscription Cancelled'
                  : 'No Active Plan'}
              </h3>
              <p className="text-sm text-lightSilver mb-5">
                Subscribe to unlock personalized study plans for your whole family.
              </p>
              <button
                onClick={() => checkoutMutation.mutate({ plan: 'annual' })}
                disabled={!stripeReady || checkoutMutation.isPending}
                className="w-full glass-btn py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkoutMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Subscribe — $75/Year
              </button>
              {!stripeReady && (
                <p className="text-xs text-mediumGray mt-3">
                  Payments are not enabled in this environment yet.
                </p>
              )}
            </motion.div>
          ) : (
            <>
              {/* Current Plan Card */}
              <motion.div
                className="liquid-glass p-6 mb-6"
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-body text-lg font-semibold text-white">Family Plan</h3>
                  <span className="pill-badge capitalize">{subscription.status}</span>
                </div>
                <p className="font-display text-4xl text-vibrantGreen mb-2">{planLabel}</p>
                <p className="text-sm text-lightSilver mb-1">
                  {subscription.autoRenew ? 'Renews' : 'Expires'}: {formatDate(subscription.expiresAt)}
                </p>
                <p className="text-xs text-mediumGray mb-1">
                  Started: {formatDate(subscription.startedAt)}
                </p>
              </motion.div>

              {/* Payment Method (managed in Stripe) */}
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-lightSilver" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Card on file</p>
                    <p className="text-xs text-mediumGray">Managed securely via Stripe</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  className="w-full ghost-btn py-3.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {portalMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Manage Billing & Payment
                </button>
                <button
                  onClick={() => setShowCancelSheet(true)}
                  className="w-full py-3.5 text-sm font-medium text-softRed hover:text-[#EF4444] transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Sheet */}
      <BottomSheet
        isOpen={showCancelSheet}
        onClose={() => setShowCancelSheet(false)}
        title="Cancel Subscription?"
      >
        <div className="space-y-4 pb-6">
          <p className="text-sm text-lightSilver">
            You&apos;ll keep access until{' '}
            <strong className="text-white">{formatDate(subscription?.expiresAt)}</strong>.
          </p>
          <p className="text-xs text-mediumGray">
            Your data will be preserved. You can reactivate anytime.
          </p>
          <button
            onClick={() => setShowCancelSheet(false)}
            className="w-full glass-btn py-3.5 text-sm font-semibold"
          >
            Keep My Plan
          </button>
          <button
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            className="w-full ghost-btn py-3.5 text-sm font-medium text-softRed flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {cancelMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Cancel Anyway
          </button>
        </div>
      </BottomSheet>
    </motion.div>
  );
}
