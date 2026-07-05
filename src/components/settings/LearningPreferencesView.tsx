import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface LearningPreferencesViewProps {
  onBack: () => void;
}

export default function LearningPreferencesView({ onBack }: LearningPreferencesViewProps) {
  const [intensity, setIntensity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [language, setLanguage] = useState('English');
  const [dailyGoal, setDailyGoal] = useState([45]);
  const [weekendStudy, setWeekendStudy] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [textSize, setTextSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');

  const intensityOptions: Array<'Low' | 'Medium' | 'High'> = ['Low', 'Medium', 'High'];
  const languages = ['English', 'Spanish', 'French', 'Portuguese', 'Swahili'];
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
          <h1 className="font-body text-base font-semibold text-white mx-auto">Learning Preferences</h1>
        </header>

        <div className="px-5 pb-24 pt-4 space-y-6">
          {/* Study Intensity */}
          <div>
            <label className="block text-xs font-medium text-mediumGray mb-3 uppercase tracking-wide">
              Default Study Intensity
            </label>
            <div className="flex gap-2">
              {intensityOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setIntensity(option)}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                    intensity === option
                      ? 'bg-vibrantGreen text-white shadow-[0_0_12px_rgba(0,200,83,0.3)]'
                      : 'bg-[rgba(255,255,255,0.05)] text-lightSilver border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Content Language */}
          <div>
            <label className="block text-xs font-medium text-mediumGray mb-3 uppercase tracking-wide">
              Content Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors appearance-none"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang} className="bg-surface">
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Daily Study Goal */}
          <div>
            <label className="block text-xs font-medium text-mediumGray mb-3 uppercase tracking-wide">
              Daily Study Goal
            </label>
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white">{dailyGoal[0]} minutes</span>
                <span className="text-xs text-vibrantGreen font-medium">
                  {dailyGoal[0] >= 60 ? `${Math.floor(dailyGoal[0] / 60)}h ${dailyGoal[0] % 60}m` : `${dailyGoal[0]} min`}
                </span>
              </div>
              <Slider
                value={dailyGoal}
                onValueChange={setDailyGoal}
                min={15}
                max={120}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-mediumGray">15 min</span>
                <span className="text-xs text-mediumGray">120 min</span>
              </div>
            </div>
          </div>

          {/* Weekend Study Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-white">Weekend Study</p>
              <p className="text-xs text-mediumGray mt-0.5">Include Saturdays and Sundays</p>
            </div>
            <Switch
              checked={weekendStudy}
              onCheckedChange={setWeekendStudy}
              className="data-[state=checked]:bg-vibrantGreen"
            />
          </div>

          {/* Auto-play Videos Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-white">Auto-play Videos</p>
              <p className="text-xs text-mediumGray mt-0.5">Automatically play video content</p>
            </div>
            <Switch
              checked={autoPlay}
              onCheckedChange={setAutoPlay}
              className="data-[state=checked]:bg-vibrantGreen"
            />
          </div>

          {/* Text Size */}
          <div>
            <label className="block text-xs font-medium text-mediumGray mb-3 uppercase tracking-wide">
              Text Size
            </label>
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
