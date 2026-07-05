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

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-[#334155]" />
        <span className="text-sm text-[#64748B]">or</span>
        <div className="flex-1 h-px bg-[#334155]" />
      </div>

      {/* Social Login */}
      <button
        type="button"
        className="ghost-btn w-full h-12 mb-3 flex items-center justify-center gap-3 text-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>
      <button
        type="button"
        className="ghost-btn w-full h-12 flex items-center justify-center gap-3 text-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.73.74 3.62 1.88h-.09c-.65.37-1.4 1.07-1.4 2.22 0 2.13 2.02 2.58 2.08 2.64-1.27 3.66-3.15 5.13-4.8 5.29zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        Continue with Apple
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
