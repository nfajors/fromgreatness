import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { RegistrationData } from '@/pages/AuthPage';

interface RegisterStep1Props {
  data: RegistrationData;
  onChange: (data: RegistrationData) => void;
  onContinue: () => void;
  onSignIn: () => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = useMemo(() => {
    let criteria = 0;
    if (password.length >= 8) criteria++;
    if (/[A-Z]/.test(password)) criteria++;
    if (/[0-9]/.test(password)) criteria++;
    if (/[^A-Za-z0-9]/.test(password)) criteria++;

    const colors = ['#F87171', '#F59E0B', '#38BDF8', '#00C853'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];

    return {
      score: criteria,
      label: criteria === 0 && password.length > 0 ? 'Weak' : labels[criteria - 1] || '',
      color: criteria === 0 && password.length > 0 ? '#F87171' : colors[criteria - 1] || '#334155',
    };
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= score ? color : '#1E293B',
            }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

export default function RegisterStep1({ data, onChange, onContinue, onSignIn }: RegisterStep1Props) {
  const fullName = data.fullName;
  const email = data.email;
  const password = data.password;
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  const setFullName = (v: string) => onChange({ ...data, fullName: v });
  const setEmail = (v: string) => onChange({ ...data, email: v });
  const setPassword = (v: string) => onChange({ ...data, password: v });

  const canContinue =
    fullName.trim() &&
    email.trim() &&
    password.length >= 8 &&
    password === confirmPassword &&
    agreedToTerms;

  const inputClasses = cn(
    'h-[52px] w-full rounded-xl pl-12 pr-4 text-white placeholder:text-[#334155] transition-all duration-200',
    'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]'
  );

  const getFocusStyle = (field: string) =>
    focusField === field
      ? { borderColor: '#00C853', boxShadow: '0 0 0 3px rgba(0,200,83,0.15)' }
      : {};

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
          <div className="w-3 h-3 rounded-full bg-vibrantGreen" />
          <div className="w-12 h-1 rounded-full bg-[#1E293B]">
            <div className="w-0 h-full rounded-full bg-vibrantGreen" />
          </div>
          <div className="w-3 h-3 rounded-full bg-[#1E293B] border border-[#334155]" />
        </div>
      </div>
      <p className="text-center text-xs text-[#64748B] mb-4 uppercase tracking-wider font-semibold">
        Step 1 of 2 — Account Info
      </p>

      <motion.h2
        className="font-display text-[28px] font-medium text-white text-center mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: easeOutExpo }}
      >
        Create Your Account
      </motion.h2>
      <p className="text-center text-lightSilver mb-6">
        Start your family's cultural reconnection journey.
      </p>

      {/* Form */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="section-label block mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
            <Input
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onFocus={() => setFocusField('name')}
              onBlur={() => setFocusField(null)}
              className={inputClasses}
              style={getFocusStyle('name')}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="section-label block mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
            <Input
              type="email"
              placeholder="parent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusField('email')}
              onBlur={() => setFocusField(null)}
              className={inputClasses}
              style={getFocusStyle('email')}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="section-label block mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
            <Input
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusField('password')}
              onBlur={() => setFocusField(null)}
              className={inputClasses}
              style={getFocusStyle('password')}
            />
          </div>
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="section-label block mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusField('confirm')}
              onBlur={() => setFocusField(null)}
              className={inputClasses}
              style={getFocusStyle('confirm')}
            />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-softRed mt-1">Passwords do not match</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-3 pt-2">
          <Checkbox
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            className="mt-0.5 border-[rgba(255,255,255,0.2)]"
          />
          <p className="text-sm text-lightSilver leading-relaxed">
            I agree to the{' '}
            <button type="button" className="text-vibrantGreen hover:underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-vibrantGreen hover:underline">
              Privacy Policy
            </button>
          </p>
        </div>

        {/* Continue Button */}
        <motion.button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="glass-btn w-full h-[52px] text-base rounded-full mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
          whileHover={canContinue ? { scale: 1.02 } : {}}
          whileTap={canContinue ? { scale: 0.98 } : {}}
        >
          Continue
        </motion.button>

        {/* Back Link */}
        <p className="text-center text-sm text-[#64748B] mt-4">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSignIn}
            className="text-vibrantGreen hover:underline font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </motion.div>
  );
}
