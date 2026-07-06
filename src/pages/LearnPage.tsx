import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Coins, Star,
  Play, Lock, Check, X, ArrowRight, Trophy,
  BookOpen, Globe, ChefHat, Shirt, Footprints,
  MessageCircle, Video,
  Target, Zap, Brain, GraduationCap, Sparkles,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { trpc } from '@/providers/trpc';

/* ═══════════════════════════════════════════════
   CONSTANTS & TYPES
   ═══════════════════════════════════════════════ */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeSmooth = [0.4, 0, 0.2, 1] as [number, number, number, number];
const easeSpring = [0.32, 0.72, 0, 1] as [number, number, number, number];

/* ── greeting ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

/* ── domain config ── */
const domainConfig: Record<string, { icon: typeof BookOpen; gradient: string; color: string }> = {
  History: { icon: BookOpen, gradient: 'from-[#00C853] to-[#0D47A1]', color: '#00C853' },
  Language: { icon: Globe, gradient: 'from-[#7E57C2] to-[#00C853]', color: '#7E57C2' },
  Food: { icon: ChefHat, gradient: 'from-[#F59E0B] to-[#00C853]', color: '#F59E0B' },
  Dress: { icon: Shirt, gradient: 'from-[#F8BBD0] to-[#00C853]', color: '#F8BBD0' },
};

/* ── slide types ── */
type SlideType = 'text' | 'image' | 'video' | 'quiz' | 'activity';

interface Slide {
  type: SlideType;
  title: string;
  content: string;
  image?: string;
  caption?: string;
  question?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  activityDesc?: string;
}

/* ═══════════════════════════════════════════════
   MODULE DATA
   ═══════════════════════════════════════════════ */
const continueCards = [
  { title: 'The Transatlantic Journey', domain: 'History', progress: 65, image: 'feature-history.jpg' },
  { title: 'Igbo Counting & Numbers', domain: 'Language', progress: 40, image: 'feature-language.jpg' },
  { title: 'Spice Blends of West Africa', domain: 'Food', progress: 10, image: 'feature-food.jpg' },
];

const todaysModules = [
  { id: 1, title: 'The Kingdom of Ghana', domain: 'History', difficulty: 'Beginner', duration: '25 min', lessons: 5, completed: true, status: 'completed' as const },
  { id: 2, title: 'Yoruba Greetings', domain: 'Language', difficulty: 'Beginner', duration: '15 min', lessons: 4, completed: false, status: 'available' as const },
  { id: 3, title: 'Jollof Rice Masterclass', domain: 'Food', difficulty: 'Intermediate', duration: '30 min', lessons: 6, completed: false, status: 'available' as const },
  { id: 4, title: 'Kente Cloth Patterns', domain: 'Dress', difficulty: 'Beginner', duration: '20 min', lessons: 5, completed: false, status: 'locked' as const },
  { id: 5, title: "Mansa Musa's Pilgrimage", domain: 'History', difficulty: 'Intermediate', duration: '35 min', lessons: 7, completed: false, status: 'available' as const },
];

const sampleSlides: Slide[] = [
  {
    type: 'text',
    title: 'The Kingdom of Ghana',
    content: 'The Kingdom of Ghana was a medieval civilization that flourished in West Africa from approximately 300 to 1100 CE. Despite its name, the ancient kingdom was located about 500 miles north of present-day Ghana.',
    caption: 'Key term: Ghana means "warrior king"',
  },
  {
    type: 'image',
    title: 'Ancient Trade Routes',
    content: 'Ghana sat at the crossroads of major trade routes connecting North Africa with sub-Saharan regions.',
    image: 'feature-history.jpg',
    caption: 'Map of trans-Saharan trade routes',
  },
  {
    type: 'quiz',
    title: 'Quick Check',
    content: 'Test your knowledge!',
    question: 'What was the main source of wealth for the Kingdom of Ghana?',
    options: ['Gold trade', 'Farming', 'Fishing', 'Mining'],
    correctAnswer: 0,
    explanation: 'Ghana controlled the gold trade between salt mines and gold-rich regions.',
  },
  {
    type: 'video',
    title: 'The Gold-Salt Trade',
    content: 'Watch how the gold-salt trade shaped the kingdom.',
    caption: 'Video: 2 min',
  },
  {
    type: 'activity',
    title: 'Reflection',
    content: 'Think about how trade routes connected different cultures.',
    activityDesc: 'Write one way trade helped share ideas between cultures.',
  },
];

/* ── achievements ── */
const achievements = [
  { id: 'first_steps', name: 'First Steps', desc: 'Complete 1 module', icon: Footprints, unlocked: true, color: '#00C853' },
  { id: 'streak_starter', name: 'Streak Starter', desc: '3-day streak', icon: Flame, unlocked: true, color: '#F59E0B' },
  { id: 'history_buff', name: 'History Buff', desc: '3 history modules', icon: BookOpen, unlocked: true, color: '#00C853' },
  { id: 'language_learner', name: 'Language Learner', desc: '3 language modules', icon: MessageCircle, unlocked: false, color: '#7E57C2' },
  { id: 'food_explorer', name: 'Food Explorer', desc: '3 food modules', icon: ChefHat, unlocked: false, color: '#F59E0B' },
  { id: 'culture_keeper', name: 'Culture Keeper', desc: '3 dress modules', icon: Shirt, unlocked: false, color: '#F8BBD0' },
  { id: 'video_star', name: 'Video Star', desc: 'Submit first video', icon: Video, unlocked: true, color: '#38BDF8' },
  { id: 'week_warrior', name: 'Week Warrior', desc: '7-day streak', icon: Zap, unlocked: true, color: '#00C853' },
  { id: 'halfway', name: 'Halfway There', desc: '50% complete', icon: Target, unlocked: false, color: '#D4AF37' },
];

/* ═══════════════════════════════════════════════
   CONFETTI PARTICLE (inline component)
   ═══════════════════════════════════════════════ */
interface Particle {
  id: number; x: number; color: string; size: number;
  angle: number; speed: number; delay: number;
}

function generateParticles(count: number): Particle[] {
  const colors = ['#00C853', '#7E57C2', '#D4AF37', '#F59E0B', '#38BDF8', '#F8BBD0'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 6 + 4,
    angle: Math.random() * 360,
    speed: Math.random() * 0.5 + 0.3,
    delay: Math.random() * 0.3,
  }));
}

function ConfettiBurst({ particles }: { particles: Particle[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: '30%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            rotate: p.angle,
          }}
          initial={{ y: 0, opacity: 1, scale: 1 }}
          animate={{
            y: [0, -120 - Math.random() * 80, 300 + Math.random() * 100],
            x: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100],
            opacity: [1, 1, 0],
            rotate: p.angle + 360 * (Math.random() > 0.5 ? 1 : -1),
            scale: [1, 1.2, 0.5],
          }}
          transition={{ duration: 2 + p.speed, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function LearnPage() {
  /* ── real gamification data ── */
  const { data: studentsList } = trpc.student.list.useQuery();
  const learnStudentId = studentsList?.[0]?.id;
  const { data: gameSummary } = trpc.activity.summary.useQuery(
    { studentId: learnStudentId ?? 0 },
    { enabled: !!learnStudentId },
  );
  const { data: realAchievements } = trpc.achievement.getByStudent.useQuery(
    { studentId: learnStudentId ?? 0 },
    { enabled: !!learnStudentId },
  );

  /* ── core state ── */
  const [greeting] = useState(() => getGreeting());
  const [bonusCoins, setBonusCoins] = useState(0);
  const coinBalance = (gameSummary?.coins ?? 0) + bonusCoins;
  const setCoinBalance = (fn: (p: number) => number) => setBonusCoins((b) => fn(b));
  const streak = gameSummary?.streakDays ?? 0;
  const [dailyProgress, setDailyProgress] = useState(1); // 1 of 2 modules done
  const dailyGoal = 2;
  const xp = gameSummary?.xp ?? 0;
  const level = {
    num: gameSummary?.level?.num ?? 1,
    title: gameSummary?.level?.title ?? 'Seedling',
    nextXP: gameSummary?.level?.nextLevelXp ?? 250,
  };
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  /* ── lesson player state ── */
  const [activeModule, setActiveModule] = useState<typeof todaysModules[0] | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides] = useState<Slide[]>(sampleSlides);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [coinPopup, setCoinPopup] = useState<{ amount: number; show: boolean }>({ amount: 0, show: false });

  /* ── celebration state ── */
  const [showCelebration, setShowCelebration] = useState(false);
  const [confettiParticles] = useState(() => generateParticles(50));

  /* ── toast ── */
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ── scroll ref ── */
  const carouselRef = useRef<HTMLDivElement>(null);

  /* ── handlers ── */
  const startModule = useCallback((mod: typeof todaysModules[0]) => {
    if (mod.status === 'locked') return;
    setActiveModule(mod);
    setCurrentSlide(0);
    setQuizAnswer(null);
    setQuizCorrect(null);
  }, []);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((p) => p + 1);
      setQuizAnswer(null);
      setQuizCorrect(null);
    }
  }, [currentSlide, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((p) => p - 1);
      setQuizAnswer(null);
      setQuizCorrect(null);
    }
  }, [currentSlide]);

  const submitQuiz = useCallback((idx: number) => {
    setQuizAnswer(idx);
    const slide = slides[currentSlide];
    const isCorrect = idx === slide.correctAnswer;
    setQuizCorrect(isCorrect);
    if (isCorrect) {
      setCoinBalance((p) => p + 10);
      setCoinPopup({ amount: 10, show: true });
      setTimeout(() => setCoinPopup((p) => ({ ...p, show: false })), 1500);
    }
  }, [currentSlide, slides]);

  const completeLesson = useCallback(() => {
    setCoinBalance((p) => p + 50);
    setShowCelebration(true);
    setDailyProgress((p) => Math.min(p + 1, dailyGoal));
  }, []);

  const closeCelebration = useCallback(() => {
    setShowCelebration(false);
    setActiveModule(null);
    showToast('+50 coins earned! Module complete!');
  }, [showToast]);

  /* ── xp bar percentage ── */
  const xpPercent = Math.min(100, (xp / level.nextXP) * 100);

  /* ── real achievements mapped to display shape ── */
  const achIconMap: Record<string, typeof BookOpen> = {
    footprints: Footprints,
    brain: Brain,
    dna: Sparkles,
    'book-open': BookOpen,
    library: BookOpen,
    'graduation-cap': GraduationCap,
    flame: Flame,
  };
  const achColors = ['#00C853', '#7E57C2', '#D4AF37', '#F59E0B', '#38BDF8', '#F8BBD0'];
  const displayAchievements = (realAchievements ?? []).map((a, i) => ({
    id: a.id,
    name: a.name,
    icon: achIconMap[a.icon] ?? Trophy,
    unlocked: a.earned,
    color: achColors[i % achColors.length],
  }));

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <AppShell title="Learn">
      <div className="px-5 pt-5 pb-6 space-y-6">

        {/* ═══ DAILY GOAL HUB ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeSmooth }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">
                Good {greeting}, Jordan!
              </h2>
            </div>
            <div className="flex items-center gap-1.5 bg-amber/10 border border-amber/30 rounded-full px-3 py-1">
              <Coins className="w-4 h-4 text-amber" />
              <span className="text-sm font-semibold text-amber">{coinBalance}</span>
            </div>
          </div>

          {/* Daily Goal Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: easeOutExpo }}
            className="liquid-glass p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-body text-base font-semibold text-white">Today&apos;s Goal: {dailyGoal} modules</h3>
              <div className="flex items-center gap-1 pill-badge">
                <Flame className="w-3.5 h-3.5 text-amber" />
                <span>{streak} day streak!</span>
              </div>
            </div>
            <p className="text-xs text-mediumGray mb-3">{dailyProgress} of {dailyGoal} completed</p>
            {/* Progress bar */}
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-vibrantGreen to-accentBlue"
                initial={{ width: 0 }}
                animate={{ width: `${(dailyProgress / dailyGoal) * 100}%` }}
                transition={{ duration: 0.8, ease: easeSmooth }}
              />
            </div>
            {/* Level & XP */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-mediumGray uppercase tracking-wide">Level {level.num}: {level.title}</span>
                  <span className="text-[10px] text-mediumGray">{xp}/{level.nextXP} XP</span>
                </div>
                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-vibrantGreen"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: easeSmooth }}
                  />
                </div>
              </div>
              <Star className="w-5 h-5 text-heritageGold" />
            </div>
          </motion.div>
        </motion.section>

        {/* ═══ CONTINUE LEARNING CAROUSEL ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: easeOutExpo }}
        >
          <h3 className="font-body text-base font-semibold text-white mb-3">Continue Where You Left Off</h3>
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide snap-x snap-mandatory"
          >
            {continueCards.map((card, i) => {
              const cfg = domainConfig[card.domain] || domainConfig.History;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.5, ease: easeOutExpo }}
                  className="flex-shrink-0 w-[260px] liquid-glass overflow-hidden snap-start"
                >
                  {/* Thumbnail area */}
                  <div className="h-[100px] relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-60`} />
                    <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)]" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      <span className="pill-badge !py-0.5 !px-2 !text-[10px] flex items-center gap-1">
                        <Icon className="w-3 h-3" />
                        {card.domain}
                      </span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-body text-sm font-semibold text-white mb-1">{card.title}</h4>
                    <p className="text-xs text-mediumGray mb-2">{card.progress}% complete</p>
                    <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mb-3">
                      <div className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient}`} style={{ width: `${card.progress}%` }} />
                    </div>
                    <button className="flex items-center gap-1 text-xs font-semibold text-vibrantGreen hover:opacity-80 transition-opacity">
                      Continue <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ═══ MODULE FEED ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: easeOutExpo }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-body text-base font-semibold text-white">Explore Modules</h3>
            <button className="text-xs text-mediumGray hover:text-lightSilver transition-colors">Filter</button>
          </div>

          <div className="space-y-2.5">
            {todaysModules.map((mod, i) => {
              const cfg = domainConfig[mod.domain] || domainConfig.History;
              const Icon = cfg.icon;
              const isExpanded = expandedModule === mod.id;
              const diffColor = mod.difficulty === 'Beginner' ? '#00C853' : mod.difficulty === 'Intermediate' ? '#F59E0B' : '#F87171';

              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.4, ease: easeOutExpo }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {/* Main row */}
                  <button
                    className="w-full flex items-center gap-3 p-3 text-left"
                    onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                  >
                    {/* Thumbnail */}
                    <div className={`w-[52px] h-[52px] rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0 opacity-80`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: cfg.color }}>{mod.domain}</span>
                        <span className="text-[10px]" style={{ color: diffColor }}>{mod.difficulty}</span>
                      </div>
                      <h4 className="text-sm text-lightSilver font-medium truncate">{mod.title}</h4>
                      <p className="text-[10px] text-mediumGray">{mod.lessons} lessons &bull; {mod.duration}</p>
                    </div>
                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {mod.status === 'completed' ? (
                        <div className="w-8 h-8 rounded-full bg-vibrantGreen/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-vibrantGreen" />
                        </div>
                      ) : mod.status === 'locked' ? (
                        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
                          <Lock className="w-4 h-4 text-mediumGray" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-vibrantGreen/20 flex items-center justify-center">
                          <Play className="w-4 h-4 text-vibrantGreen ml-0.5" fill="#00C853" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && mod.status !== 'locked' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: easeSmooth }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-1 space-y-1.5">
                          {/* Lesson list */}
                          {Array.from({ length: mod.lessons }, (_, li) => (
                            <div key={li} className="flex items-center gap-2 py-1.5">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${li < 2 ? 'bg-vibrantGreen' : 'border border-mediumGray/50'}`}>
                                {li < 2 ? <Check className="w-3 h-3 text-black" /> : <span className="text-[9px] text-mediumGray">{li + 1}</span>}
                              </div>
                              <span className="text-xs text-lightSilver">Lesson {li + 1}: {['Intro', 'Discovery', 'Practice', 'Quiz', 'Review', 'Activity', 'Wrap-up'][li] || 'Lesson'}</span>
                            </div>
                          ))}
                          <button
                            onClick={(e) => { e.stopPropagation(); startModule(mod); }}
                            className="w-full mt-2 py-2.5 rounded-full glass-btn text-sm font-semibold"
                          >
                            {mod.status === 'completed' ? 'Review Module' : 'Start Module'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ═══ ACHIEVEMENTS GRID ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: easeOutExpo }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-body text-base font-semibold text-white">Your Achievements</h3>
            <span className="text-xs text-mediumGray">{displayAchievements.filter(a => a.unlocked).length} of {displayAchievements.length} earned</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {displayAchievements.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + i * 0.04, duration: 0.4, ease: easeOutExpo }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center"
                  style={{
                    background: badge.unlocked ? `${badge.color}10` : 'rgba(255,255,255,0.02)',
                    border: badge.unlocked ? `1px solid ${badge.color}30` : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: badge.unlocked ? `${badge.color}20` : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: badge.unlocked ? badge.color : '#64748B' }}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${badge.unlocked ? 'text-lightSilver' : 'text-mediumGray'}`}>
                    {badge.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* bottom spacer */}
        <div className="h-4" />
      </div>

      {/* ═══════════════════════════════════════════
         LESSON PLAYER (full-screen overlay)
         ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {activeModule && !showCelebration && (
          <motion.div
            key="lesson-player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-baseIndigo flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-glassBorder bg-[rgba(10,12,27,0.8)] backdrop-blur-xl z-10">
              <button
                onClick={() => setActiveModule(null)}
                className="flex items-center gap-1 text-lightSilver hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-body text-sm font-semibold text-white truncate max-w-[180px] text-center">
                {activeModule.title}
              </h3>
              <span className="text-xs text-mediumGray">
                {currentSlide + 1}/{slides.length}
              </span>
            </div>

            {/* Slide content */}
            <div className="flex-1 overflow-y-auto relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: easeSmooth }}
                  className="p-5"
                >
                  {renderSlideContent(slides[currentSlide], quizAnswer, quizCorrect, submitQuiz)}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom navigation */}
            <div className="border-t border-glassBorder bg-baseDark/80 backdrop-blur-xl px-5 py-4 z-10">
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {slides.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentSlide ? 'w-6 bg-vibrantGreen' : i < currentSlide ? 'w-2 bg-vibrantGreen/50' : 'w-2 bg-surface'
                    }`}
                  />
                ))}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="px-4 py-3 rounded-full ghost-btn text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentSlide === slides.length - 1 ? (
                  <button
                    onClick={completeLesson}
                    className="flex-1 py-3 rounded-full glass-btn text-sm font-semibold"
                  >
                    Complete Lesson
                  </button>
                ) : (
                  <button
                    onClick={nextSlide}
                    className="flex-1 py-3 rounded-full glass-btn text-sm font-semibold"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>

            {/* Coin popup */}
            <AnimatePresence>
              {coinPopup.show && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                  <Coins className="w-10 h-10 text-amber" />
                  <span className="font-display text-2xl text-amber font-semibold">+{coinPopup.amount} coins!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
         COMPLETION CELEBRATION
         ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[70] bg-baseIndigo flex flex-col items-center justify-center p-6 overflow-hidden"
          >
            <ConfettiBurst particles={confettiParticles} />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
              className="relative mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-heritageGold to-amber flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.4)]">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 w-24 h-24 rounded-full"
                style={{ boxShadow: '0 0 30px rgba(212,175,55,0.3)' }}
              />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: easeOutExpo }}
              className="font-display text-3xl font-semibold text-white mb-2"
            >
              Module Complete!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: easeOutExpo }}
              className="text-lg text-vibrantGreen font-display mb-6"
            >
              {activeModule?.title || 'The Kingdom of Ghana'}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: easeOutExpo }}
              className="flex items-center gap-6 mb-8"
            >
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber" />
                <span className="text-sm text-amber font-semibold">+50 coins</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-vibrantGreen" />
                <span className="text-sm text-vibrantGreen font-semibold">+1 Badge</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: easeOutExpo }}
              className="w-full max-w-[280px] space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-mediumGray">Time spent</span>
                <span className="text-white font-medium">18 minutes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-mediumGray">Correct answers</span>
                <span className="text-white font-medium">4 of 5</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-mediumGray">XP earned</span>
                <span className="text-vibrantGreen font-medium">+120 XP</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5, ease: easeOutExpo }}
              className="w-full max-w-[280px] mt-8 space-y-3"
            >
              <button
                onClick={closeCelebration}
                className="w-full py-3.5 rounded-full glass-btn text-sm font-semibold"
              >
                Continue Learning
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
         TOAST
         ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ duration: 0.4, ease: easeSpring }}
            className="fixed top-4 left-1/2 z-[80] flex items-center gap-2 px-4 py-3 rounded-xl bg-[rgba(30,41,59,0.95)] backdrop-blur-xl border border-glassBorder"
            style={{ maxWidth: 320 }}
          >
            <Check className="w-4 h-4 text-vibrantGreen flex-shrink-0" />
            <span className="text-sm text-lightSilver">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE CONTENT RENDERER
   ═══════════════════════════════════════════════ */
function renderSlideContent(
  slide: Slide,
  quizAnswer: number | null,
  quizCorrect: boolean | null,
  onQuizSubmit: (idx: number) => void,
) {
  switch (slide.type) {
    case 'text':
      return (
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-white">{slide.title}</h3>
          <p className="text-base text-lightSilver leading-relaxed">{slide.content}</p>
          {slide.caption && (
            <div className="p-3 rounded-xl bg-vibrantGreen/10 border border-vibrantGreen/20">
              <p className="text-sm text-vibrantGreen">{slide.caption}</p>
            </div>
          )}
        </div>
      );

    case 'image':
      return (
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-white">{slide.title}</h3>
          <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-surface relative">
            <div className="absolute inset-0 bg-gradient-to-br from-deepPurple/40 to-baseIndigo/60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-mediumGray/30" />
            </div>
          </div>
          <p className="text-base text-lightSilver leading-relaxed">{slide.content}</p>
          {slide.caption && <p className="text-xs text-mediumGray text-center">{slide.caption}</p>}
        </div>
      );

    case 'video':
      return (
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-white">{slide.title}</h3>
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-surface relative">
            <div className="absolute inset-0 bg-gradient-to-br from-deepPurple/40 to-baseIndigo/60" />
            <button className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform">
                <Play className="w-7 h-7 text-white ml-1" fill="white" />
              </div>
            </button>
          </div>
          <p className="text-base text-lightSilver leading-relaxed">{slide.content}</p>
          {slide.caption && <p className="text-xs text-mediumGray">{slide.caption}</p>}
        </div>
      );

    case 'quiz':
      return (
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-white">{slide.title}</h3>
          <p className="text-base text-lightSilver font-medium">{slide.question}</p>
          <div className="space-y-2">
            {slide.options?.map((opt, i) => {
              const isSelected = quizAnswer === i;
              const showCorrect = quizCorrect !== null;
              const isCorrect = i === slide.correctAnswer;
              let borderColor = 'rgba(255,255,255,0.08)';
              let bgColor = 'rgba(255,255,255,0.03)';
              if (showCorrect && isCorrect) { borderColor = '#00C853'; bgColor = 'rgba(0,200,83,0.1)'; }
              else if (showCorrect && isSelected && !isCorrect) { borderColor = '#F87171'; bgColor = 'rgba(248,113,113,0.1)'; }
              else if (isSelected) { borderColor = '#38BDF8'; bgColor = 'rgba(56,189,248,0.1)'; }

              return (
                <button
                  key={i}
                  disabled={showCorrect}
                  onClick={() => onQuizSubmit(i)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200"
                  style={{ background: bgColor, border: `1.5px solid ${borderColor}` }}
                >
                  <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ color: showCorrect && isCorrect ? '#00C853' : showCorrect && isSelected ? '#F87171' : '#64748B' }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-lightSilver">{opt}</span>
                  {showCorrect && isCorrect && <Check className="w-4 h-4 text-vibrantGreen ml-auto" />}
                  {showCorrect && isSelected && !isCorrect && <X className="w-4 h-4 text-softRed ml-auto" />}
                </button>
              );
            })}
          </div>
          {quizCorrect === false && slide.explanation && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-mediumGray">
              {slide.explanation}
            </motion.p>
          )}
          {quizCorrect === true && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-vibrantGreen" />
              <span className="text-sm text-vibrantGreen font-medium">Correct! +10 coins</span>
            </motion.div>
          )}
        </div>
      );

    case 'activity':
      return (
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-white">{slide.title}</h3>
          <p className="text-base text-lightSilver leading-relaxed">{slide.content}</p>
          {slide.activityDesc && (
            <div className="p-4 rounded-xl bg-accentBlue/10 border border-accentBlue/20">
              <p className="text-sm text-accentBlue">{slide.activityDesc}</p>
            </div>
          )}
          <div className="p-4 rounded-xl bg-surface/50 border border-glassBorder">
            <textarea
              placeholder="Type your answer here..."
              className="w-full bg-transparent text-sm text-lightSilver placeholder-mutedSlate resize-none outline-none"
              rows={3}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}
