import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Moon, Volume2, Smartphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface AppSettingsViewProps {
  onBack: () => void;
}

export default function AppSettingsView({ onBack }: AppSettingsViewProps) {
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [textSize, setTextSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');

  const textSizes: Array<'Small' | 'Medium' | 'Large'> = ['Small', 'Medium', 'Large'];

  return (
    <motion.div
      className="min-h-[100dvh] bg-baseDark"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
    >
      <div className="max-w-[430px] mx-auto">
        <header className="sticky top-0 z-40 h-14 flex items-center px-4 bg-[rgba(10,12,27,0.8)] backdrop-blur-[12px]">
          <button onClick={onBack} className="absolute left-4 text-lightSilver hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-body text-base font-semibold text-white mx-auto">App Settings</h1>
        </header>

        <div className="px-5 pb-24 pt-4 space-y-6">
          {/* Dark Mode - Always On, Locked */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-mediumGray mb-3">
              APPEARANCE
            </h3>
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(0,200,83,0.1)] flex items-center justify-center">
                    <Moon className="w-5 h-5 text-vibrantGreen" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Dark Mode</p>
                    <p className="text-xs text-vibrantGreen">fromGreatness is designed for dark mode</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-[rgba(0,200,83,0.1)] rounded-full">
                  <span className="text-xs font-medium text-vibrantGreen">On</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sound & Haptics */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-mediumGray mb-3">
              SOUND &amp; FEEDBACK
            </h3>
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-lightSilver" />
                  <span className="text-sm text-white">Sound Effects</span>
                </div>
                <Switch
                  checked={soundEffects}
                  onCheckedChange={setSoundEffects}
                  className="data-[state=checked]:bg-vibrantGreen"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-lightSilver" />
                  <div>
                    <span className="text-sm text-white">Haptic Feedback</span>
                    <p className="text-xs text-mediumGray">Vibration on mobile</p>
                  </div>
                </div>
                <Switch
                  checked={hapticFeedback}
                  onCheckedChange={setHapticFeedback}
                  className="data-[state=checked]:bg-vibrantGreen"
                />
              </div>
            </div>
          </div>

          {/* Text Size */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-mediumGray mb-3">
              TEXT SIZE
            </h3>
            <div className="flex gap-2">
              {textSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                    textSize === size
                      ? 'bg-vibrantGreen text-white shadow-[0_0_12px_rgba(0,200,83,0.3)]'
                      : 'bg-[rgba(255,255,255,0.05)] text-lightSilver border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
