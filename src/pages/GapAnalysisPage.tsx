import { useState, useEffect } from 'react';
import { trpc } from '@/providers/trpc';
import { useAppData } from '@/hooks/useAppData';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  MapPin,
  BookOpen,
  MessageCircle,
  UtensilsCrossed,
  Shirt,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import CircularGauge from '@/components/gap-analysis/CircularGauge';
import GapCard from '@/components/gap-analysis/GapCard';
import InsightCard from '@/components/gap-analysis/InsightCard';
import AchievementOverlay from '@/components/gap-analysis/AchievementOverlay';

/* ------------------------------------------------------------------ */
/*  Loading State                                                      */
/* ------------------------------------------------------------------ */

const statusMessages = [
  'Comparing genetic markers...',
  'Mapping cultural knowledge gaps...',
  'Identifying learning opportunities...',
  'Building your personalized curriculum...',
];

function LoadingState() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % statusMessages.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      {/* Pulsing brain icon */}
      <motion.div
        className="mb-6"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(0,200,83,0.1)',
            border: '1px solid rgba(0,200,83,0.3)',
            boxShadow: '0 0 20px rgba(0,200,83,0.2)',
          }}
        >
          <Brain className="w-8 h-8 text-vibrantGreen" />
        </div>
      </motion.div>

      <h2 className="font-display text-2xl text-white mb-2 text-center">
        Analyzing Your Heritage...
      </h2>

      {/* Rotating status messages */}
      <div className="h-6 mb-8 overflow-hidden relative w-full max-w-[280px]">
        <motion.p
          key={msgIndex}
          className="text-sm text-mediumGray text-center absolute inset-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {statusMessages[msgIndex]}
        </motion.p>
      </div>

      {/* Shimmer bar */}
      <div className="w-48 h-1.5 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,200,83,0.3) 25%, rgba(0,200,83,0.6) 50%, rgba(0,200,83,0.3) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

const gapData = [
  {
    domain: 'History' as const,
    current: 35,
    heritage: 85,
    insight:
      'Strong in African American history, opportunity in pre-colonial West Africa.',
  },
  {
    domain: 'Language' as const,
    current: 15,
    heritage: 90,
    insight:
      'Minimal exposure to West African languages. Starting with basic greetings in Yoruba or Twi is recommended.',
  },
  {
    domain: 'Food' as const,
    current: 60,
    heritage: 80,
    insight:
      'Shows strong familiarity with West African cuisine. Explore the cultural significance behind dishes.',
  },
  {
    domain: 'Dress' as const,
    current: 25,
    heritage: 75,
    insight:
      'Growing interest in traditional textiles. Kente cloth and Adinkra symbols are great starting points.',
  },
];

const insights = [
  {
    title: 'Language is Your Biggest Opportunity',
    description:
      'Your child has minimal exposure to West African languages. Starting with basic greetings and common phrases in Yoruba and Twi could create an immediate sense of connection.',
    priority: 'High' as const,
    type: 'warning' as const,
  },
  {
    title: 'Food Knowledge is a Strength',
    description:
      'Your child already shows strong familiarity with West African cuisine. We can build on this confidence to explore the cultural significance behind traditional dishes.',
    priority: 'Low' as const,
    type: 'positive' as const,
  },
  {
    title: 'History Gap is Significant',
    description:
      'While your child knows about African American history, there is a large gap in pre-colonial West African kingdoms and the transatlantic journey.',
    priority: 'Medium' as const,
    type: 'info' as const,
  },
];

const modulePreview = [
  { domain: 'History', icon: BookOpen, color: '#00C853', count: 8 },
  { domain: 'Language', icon: MessageCircle, color: '#7E57C2', count: 10 },
  { domain: 'Food', icon: UtensilsCrossed, color: '#F59E0B', count: 6 },
  { domain: 'Dress', icon: Shirt, color: '#F8BBD0', count: 7 },
];

export default function GapAnalysisPage() {
  const navigate = useNavigate();
  const { selectedStudentId, selectedStudentName } = useAppData();
  const { data: studentsList } = trpc.student.list.useQuery();
  const activeStudentId = selectedStudentId ?? studentsList?.[0]?.id ?? null;
  const childName =
    selectedStudentName ??
    studentsList?.find((s) => s.id === activeStudentId)?.fullName?.split(/\s+/)[0] ??
    'your child';
  const { data: existingAnalysis } = trpc.gap.getByStudent.useQuery(
    { studentId: activeStudentId ?? 0 },
    { enabled: !!activeStudentId }
  );
  const { data: dnaData } = trpc.dna.getByStudent.useQuery(
    { studentId: activeStudentId ?? 0 },
    { enabled: !!activeStudentId }
  );
  const generateAnalysis = trpc.gap.generate.useMutation({
    onSuccess: () => {
      setLoading(false);
      setShowAchievement(true);
    },
  });
  const generatePlans = trpc.studyPlan.generate.useMutation();
  const utils = trpc.useUtils();
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAchievement, setShowAchievement] = useState(false);

  const handleViewStudyPlan = async () => {
    if (!activeStudentId) {
      navigate('/study-plans');
      return;
    }
    setGenerating(true);
    try {
      await generatePlans.mutateAsync({ studentId: activeStudentId });
      await utils.studyPlan.listByStudent.invalidate({ studentId: activeStudentId });
    } catch (err) {
      console.warn('Plan generation failed:', err);
    } finally {
      setGenerating(false);
      navigate('/study-plans');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setShowAchievement(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    setShowAchievement(false);
  };

  if (loading) {
    return (
      <AppShell title="Heritage Analysis">
        <LoadingState />
      </AppShell>
    );
  }

  return (
    <AppShell title="Heritage Analysis">
      {/* Achievement overlay */}
      <AchievementOverlay visible={showAchievement} onContinue={handleContinue} />

      {/* Ethereal glow background */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ maxWidth: '430px', margin: '0 auto' }}
      >
        <div
          className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, #7E57C2, #F8BBD0 50%, transparent 70%)',
          }}
        />
      </div>

      <div className="px-5 py-6 space-y-8 relative z-10">
        {/* ---- Report Header ---- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="section-label">YOUR HERITAGE ANALYSIS</span>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: 'rgba(0,200,83,0.1)',
                border: '1px solid rgba(0,200,83,0.3)',
                color: '#00C853',
              }}
            >
              <Sparkles className="w-3 h-3" />
              Generated by fromGreatness AI
            </span>
          </div>

          <h1 className="font-display text-[28px] leading-tight text-white mb-2">
            Discovering {childName}'s Hidden Connections
          </h1>
          <p className="text-sm text-lightSilver leading-relaxed">
            Based on DNA analysis and assessment results, we found meaningful
            opportunities to connect {childName} with their heritage.
          </p>
        </motion.section>

        {/* ---- Overall Gap Score ---- */}
        <motion.section
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-vibrantGreen" />
            <span className="text-xs text-mediumGray uppercase tracking-wider">
              Overall Heritage Gap
            </span>
          </div>
          <CircularGauge value={72} size={180} strokeWidth={12} sublabel="Divergence" />
          <p className="text-xs text-mediumGray mt-2 text-center max-w-[260px]">
            Higher score means greater opportunity to connect with heritage
          </p>
        </motion.section>

        {/* ---- Heritage Identity Card ---- */}
        <motion.section
          className="liquid-glass p-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
        >
          {/* Ancestry map thumbnail */}
          <div className="rounded-2xl overflow-hidden h-[120px] mb-4">
            <img
              src="/ancestry-map.jpg"
              alt="Ancestry Map"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Primary heritage */}
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-vibrantGreen" />
            <h3 className="font-body text-lg font-semibold text-white">
              West African Heritage — 45%
            </h3>
          </div>

          {/* Secondary regions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              'Central African — 23%',
              'British Isles — 5%',
              'Other — 7%',
            ].map((region) => (
              <span
                key={region}
                className="text-xs text-mediumGray bg-surface px-2 py-1 rounded-full"
              >
                {region}
              </span>
            ))}
          </div>

          {/* Assessment insight */}
          <div className="flex items-start gap-2 pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <Sparkles className="w-4 h-4 text-vibrantGreen mt-0.5 flex-shrink-0" />
            <p className="text-xs text-lightSilver">
              {childName} scored highest in Food knowledge and lowest in Language
              fluency.
            </p>
          </div>
        </motion.section>

        {/* ---- Domain Gap Visualization ---- */}
        <section>
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <span className="section-label">DOMAIN BREAKDOWN</span>
            <h2 className="font-display text-2xl text-white mt-1">
              Knowledge vs. Heritage
            </h2>
          </motion.div>

          <div className="space-y-4">
            {gapData.map((data, i) => (
              <GapCard
                key={data.domain}
                domain={data.domain}
                current={data.current}
                heritage={data.heritage}
                insight={data.insight}
                index={i}
              />
            ))}
          </div>
        </section>

        {/* ---- Key Insights ---- */}
        <section>
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <span className="section-label">KEY INSIGHTS</span>
            <h2 className="font-display text-2xl text-white mt-1">
              What We Discovered
            </h2>
          </motion.div>

          <div className="space-y-3">
            {insights.map((insight, i) => (
              <InsightCard
                key={insight.title}
                title={insight.title}
                description={insight.description}
                priority={insight.priority}
                type={insight.type}
                index={i}
              />
            ))}
          </div>
        </section>

        {/* ---- Study Plan Preview ---- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="mb-4">
            <span className="section-label">YOUR STUDY PLAN</span>
            <h2 className="font-display text-2xl text-white mt-1">
              A Personalized Curriculum, Ready to Go
            </h2>
          </div>

          <div className="liquid-glass p-5">
            <h3 className="font-body text-base font-semibold text-white mb-1">
              {childName}'s Heritage Plan
            </h3>
            <p className="text-xs text-mediumGray mb-4">
              12-week adaptive curriculum
            </p>

            {/* Module counts */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {modulePreview.map((mod, i) => {
                const Icon = mod.icon;
                return (
                  <motion.div
                    key={mod.domain}
                    className="flex items-center gap-2 p-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.1 }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: mod.color }}
                    />
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: mod.color }}
                    />
                    <div className="min-w-0">
                      <span className="text-xs text-white font-medium">
                        {mod.domain}
                      </span>
                      <span className="text-xs text-mediumGray ml-1">
                        {mod.count}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Total */}
            <p className="text-sm text-lightSilver mb-3">
              <span className="text-vibrantGreen font-semibold">31 modules</span>
              {' '}&bull; ~2 hours/week
            </p>

            {/* Adaptive note */}
            <div className="flex items-start gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-vibrantGreen mt-0.5 flex-shrink-0" />
              <p className="text-xs text-mediumGray">
                Content difficulty adjusts based on {childName}'s progress and
                engagement.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleViewStudyPlan}
              disabled={generating}
              className="glass-btn w-full text-sm py-3 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {generating && <Loader2 className="w-4 h-4 animate-spin" />}
              {generating ? 'Generating your plan…' : 'Generate Full Study Plan'}
            </button>

            <button
              onClick={() => navigate('/parent-dashboard')}
              className="w-full text-center text-xs text-mediumGray mt-3 hover:text-lightSilver transition-colors"
            >
              I&apos;ll explore later
            </button>
          </div>
        </motion.section>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </AppShell>
  );
}
