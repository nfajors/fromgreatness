import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { trpc } from '@/providers/trpc';

interface LoginFormProps {
  onRegister: () => void;
  onForgotPassword: () => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function LoginForm({ onRegister, onForgotPassword }: LoginFormProps) {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate('/parent-dashboard');
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    loginMutation.mutate({ email: email.trim(), password });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
    >
      {/* Email Field */}
      <div className="mb-4">
        <label className="section-label block mb-2">Email</label>
        <div className="relative">
          <Mail
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
            style={{ color: '#64748B' }}
          />
          <Input
            type="email"
            placeholder="parent@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            className={cn(
              'h-[52px] w-full rounded-xl pl-12 pr-4 text-white placeholder:text-[#334155] transition-all duration-200',
              'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]'
            )}
            style={
              emailFocused
                ? {
                    borderColor: '#00C853',
                    boxShadow: '0 0 0 3px rgba(0,200,83,0.15)',
                  }
                : {}
            }
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="mb-4">
        <label className="section-label block mb-2">Password</label>
        <div className="relative">
          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
            style={{ color: '#64748B' }}
          />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            className={cn(
              'h-[52px] w-full rounded-xl pl-12 pr-12 text-white placeholder:text-[#334155] transition-all duration-200',
              'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]'
            )}
            style={
              passwordFocused
                ? {
                    borderColor: '#00C853',
                    boxShadow: '0 0 0 3px rgba(0,200,83,0.15)',
                  }
                : {}
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-lightSilver transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Remember Me Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={rememberMe}
            onCheckedChange={setRememberMe}
          />
          <span className="text-sm text-lightSilver">Remember me</span>
        </div>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-vibrantGreen hover:underline"
        >
          Forgot password?
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-softRed mb-4 text-center" role="alert">
          {error}
        </p>
      )}

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="glass-btn w-full h-[52px] text-base rounded-full mb-6 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {loginMutation.isPending ? 'Signing In…' : 'Sign In'}
      </button>

      {/* Bottom Text */}
      <p className="text-center mt-8 text-sm text-[#64748B]">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onRegister}
          className="text-vibrantGreen hover:underline font-medium"
        >
          Get Started
        </button>
      </p>
    </motion.form>
  );
}
