import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { useAppData } from '@/hooks/useAppData';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  MessageCircle,
  UtensilsCrossed,
  Shirt,
  Flame,
  Clock,
  TrendingUp,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import CircularProgress from '@/components/study-plans/CircularProgress';
import DomainProgressCard from '@/components/study-plans/DomainProgressCard';
import ModuleCard from '@/components/study-plans/ModuleCard';
import ModuleDetailSheet from '@/components/study-plans/ModuleDetailSheet';
import type { ModuleData } from '@/components/study-plans/ModuleCard';

/* ------------------------------------------------------------------ */
/*  Domain configuration                                               */
/* ------------------------------------------------------------------ */

interface DomainConfig {
  key: string;
  label: string;
  color: string;
  icon: typeof BookOpen;
  modules: ModuleData[];
  completed: number;
}

const domains: DomainConfig[] = [
  {
    key: 'History',
    label: 'History',
    color: '#00C853',
    icon: BookOpen,
    completed: 4,
    modules: [
      { id: 1, title: 'The Kingdom of Ghana', description: 'Discover the first great West African empire, its gold trade, and lasting influence on the region.', duration: '25 min', difficulty: 'Beginner', rating: '4.8', status: 'completed', lessons: 5 },
      { id: 2, title: 'The Mali Empire & Mansa Musa', description: 'Explore the richest empire in West African history and its legendary ruler.', duration: '30 min', difficulty: 'Beginner', rating: '4.9', status: 'completed', lessons: 6 },
      { id: 3, title: 'The Songhai Empire', description: 'Learn about the largest empire in African history and its scholarly legacy.', duration: '25 min', difficulty: 'Intermediate', rating: '4.7', status: 'completed', lessons: 5 },
      { id: 4, title: 'The Transatlantic Journey', description: 'Understand the forced migration and its impact on African diaspora communities.', duration: '35 min', difficulty: 'Intermediate', rating: '4.8', status: 'completed', lessons: 5 },
      { id: 5, title: 'The Abolition Movement', description: 'Explore resistance, rebellion, and the fight for freedom across the diaspora.', duration: '30 min', difficulty: 'Intermediate', rating: '4.6', status: 'in-progress', lessons: 5 },
      { id: 6, title: 'Great Zimbabwe', description: 'Uncover the mysteries of the great stone city and its trading networks.', duration: '25 min', difficulty: 'Intermediate', rating: '4.7', status: 'locked', lessons: 5 },
      { id: 7, title: 'The Ashanti Kingdom', description: 'Dive into the powerful Akan empire known for its gold and kente cloth.', duration: '30 min', difficulty: 'Advanced', rating: '4.9', status: 'locked', lessons: 6 },
      { id: 8, title: 'Modern West African Nations', description: 'From colonization to independence — the formation of modern nations.', duration: '35 min', difficulty: 'Advanced', rating: '4.5', status: 'locked', lessons: 6 },
    ],
  },
  {
    key: 'Language',
    label: 'Language',
    color: '#7E57C2',
    icon: MessageCircle,
    completed: 2,
    modules: [
      { id: 1, title: 'Yoruba Greetings & Introductions', description: 'Master essential Yoruba greetings and learn the cultural context behind them.', duration: '20 min', difficulty: 'Beginner', rating: '4.9', status: 'completed', lessons: 7 },
      { id: 2, title: 'Twi Basic Phrases', description: 'Learn common Twi expressions used in everyday conversation in Ghana.', duration: '20 min', difficulty: 'Beginner', rating: '4.8', status: 'completed', lessons: 5 },
      { id: 3, title: 'Igbo Counting & Numbers', description: 'Learn to count from 1 to 20 in Igbo and understand the base-20 number system.', duration: '20 min', difficulty: 'Beginner', rating: '4.9', status: 'in-progress', lessons: 5 },
      { id: 4, title: 'Swahili Greetings', description: 'Explore the lingua franca of East Africa and its widespread cultural importance.', duration: '25 min', difficulty: 'Beginner', rating: '4.7', status: 'locked', lessons: 6 },
      { id: 5, title: 'West African Proverbs', description: 'Discover the wisdom encoded in traditional proverbs across West African cultures.', duration: '25 min', difficulty: 'Intermediate', rating: '4.8', status: 'locked', lessons: 5 },
      { id: 6, title: 'Pronunciation Practice', description: 'Master tonal patterns and unique sounds in West African languages.', duration: '30 min', difficulty: 'Intermediate', rating: '4.6', status: 'locked', lessons: 5 },
      { id: 7, title: 'Writing Systems: Nsibidi', description: 'Explore ancient African writing symbols and their modern resurgence.', duration: '25 min', difficulty: 'Advanced', rating: '4.9', status: 'locked', lessons: 5 },
      { id: 8, title: 'Conversational Practice', description: 'Put your skills together in simulated everyday dialogues.', duration: '30 min', difficulty: 'Advanced', rating: '4.5', status: 'locked', lessons: 5 },
      { id: 9, title: 'Language Family Tree', description: 'Understand the relationships between African languages and their evolution.', duration: '35 min', difficulty: 'Advanced', rating: '4.7', status: 'locked', lessons: 6 },
      { id: 10, title: 'Cultural Context of Speech', description: 'Explore how language encodes cultural values, respect, and social structures.', duration: '30 min', difficulty: 'Advanced', rating: '4.8', status: 'locked', lessons: 5 },
    ],
  },
  {
    key: 'Food',
    label: 'Food',
    color: '#F59E0B',
    icon: UtensilsCrossed,
    completed: 3,
    modules: [
      { id: 1, title: 'Jollof Rice: History & Recipe', description: 'Cook the iconic West African dish while learning its debated origins.', duration: '30 min', difficulty: 'Beginner', rating: '4.9', status: 'completed', lessons: 5 },
      { id: 2, title: 'Fufu & Soup Traditions', description: 'Master the art of fufu preparation and explore regional soup variations.', duration: '35 min', difficulty: 'Beginner', rating: '4.8', status: 'completed', lessons: 5 },
      { id: 3, title: 'Plantain: Sweet & Savory', description: 'From alloco to tostones, explore the versatility of plantain across cultures.', duration: '25 min', difficulty: 'Beginner', rating: '4.7', status: 'completed', lessons: 4 },
      { id: 4, title: 'Spice Blends of West Africa', description: 'Create authentic spice blends and understand their medicinal properties.', duration: '30 min', difficulty: 'Intermediate', rating: '4.9', status: 'in-progress', lessons: 5 },
      { id: 5, title: 'Traditional Breakfast Foods', description: 'Start the day with akara, kenkey, and other morning traditions.', duration: '25 min', difficulty: 'Intermediate', rating: '4.6', status: 'locked', lessons: 4 },
      { id: 6, title: 'Festival & Celebration Foods', description: 'Explore the dishes that mark special occasions across West Africa.', duration: '30 min', difficulty: 'Intermediate', rating: '4.8', status: 'locked', lessons: 5 },
    ],
  },
  {
    key: 'Dress',
    label: 'Dress',
    color: '#F8BBD0',
    icon: Shirt,
    completed: 2,
    modules: [
      { id: 1, title: 'Kente Cloth: Patterns & Meaning', description: 'Decode the colors and patterns of Ghana\'s most famous textile.', duration: '25 min', difficulty: 'Beginner', rating: '4.9', status: 'completed', lessons: 5 },
      { id: 2, title: 'Adinkra Symbols', description: 'Learn the visual language of symbols stamped on cloth and their proverbs.', duration: '25 min', difficulty: 'Beginner', rating: '4.8', status: 'completed', lessons: 5 },
      { id: 3, title: 'Dashiki & Modern Adaptations', description: 'From traditional wear to global fashion — trace the dashiki\'s journey.', duration: '20 min', difficulty: 'Beginner', rating: '4.7', status: 'in-progress', lessons: 4 },
      { id: 4, title: 'Traditional Headwraps (Gele)', description: 'Master the art of tying gele and learn their cultural significance.', duration: '30 min', difficulty: 'Intermediate', rating: '4.8', status: 'locked', lessons: 5 },
      { id: 5, title: 'Beadwork & Jewelry', description: 'Explore the symbolism and craftsmanship of African beads and adornments.', duration: '25 min', difficulty: 'Intermediate', rating: '4.6', status: 'locked', lessons: 5 },
      { id: 6, title: 'Textile Dyeing Techniques', description: 'From adire to bogolan, discover resist-dyeing methods across cultures.', duration: '30 min', difficulty: 'Intermediate', rating: '4.9', status: 'locked', lessons: 5 },
      { id: 7, title: 'Ceremonial Attire', description: 'Understand the clothing traditions for weddings, funerals, and rites of passage.', duration: '30 min', difficulty: 'Advanced', rating: '4.7', status: 'locked', lessons: 5 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Overview Section                                                   */
/* ------------------------------------------------------------------ */

function OverviewSection({
  onDomainClick,
}: {
  onDomainClick: (index: number) => void;
}) {
  const navigate = useNavigate();

  const totalModules = domains.reduce((sum, d) => sum + d.modules.length, 0);
  const totalCompleted = domains.reduce((sum, d) => sum + d.completed, 0);
  const overallProgress = Math.round((totalCompleted / totalModules) * 100);

  const domainIcons = [
    <BookOpen key="h" className="w-5 h-5" />,
    <MessageCircle key="l" className="w-5 h-5" />,
    <UtensilsCrossed key="f" className="w-5 h-5" />,
    <Shirt key="d" className="w-5 h-5" />,
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-[28px] leading-tight text-white mb-1">
          Ama&apos;s Study Plan
        </h1>
        <p className="text-sm text-lightSilver">
          West African Heritage &bull; 12-week curriculum
        </p>
      </motion.div>

      {/* Overall Progress Card */}
      <motion.div
        className="liquid-glass p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="flex flex-col items-center mb-5">
          <CircularProgress
            percentage={overallProgress}
            size={130}
            strokeWidth={10}
            sublabel="Complete"
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="font-mono text-lg font-semibold text-vibrantGreen">
                {totalCompleted}
              </span>
              <span className="text-xs text-mediumGray">of {totalModules}</span>
            </div>
            <p className="text-[10px] text-mediumGray uppercase tracking-wider">
              Modules Done
            </p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-accentBlue" />
              <span className="font-mono text-lg font-semibold text-accentBlue">
                8h 30m
              </span>
            </div>
            <p className="text-[10px] text-mediumGray uppercase tracking-wider">
              Time Spent
            </p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-amber" />
              <span className="font-mono text-lg font-semibold text-amber">
                15
              </span>
            </div>
            <p className="text-[10px] text-mediumGray uppercase tracking-wider">
              Day Streak
            </p>
          </motion.div>
        </div>

        {/* Weekly goal */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-[rgba(255,255,255,0.03)]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-vibrantGreen" />
            <span className="text-xs text-lightSilver">Weekly Goal</span>
          </div>
          <span className="text-xs font-mono text-vibrantGreen">
            2 of 3 sessions
          </span>
        </div>

        {/* Continue CTA */}
        <button
          onClick={() => navigate('/learn')}
          className="glass-btn w-full text-sm py-3"
        >
          Continue Learning
        </button>
      </motion.div>

      {/* Domain Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="font-body text-sm font-semibold text-white mb-3">
          Domains
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {domains.map((domain, i) => (
            <DomainProgressCard
              key={domain.key}
              title={domain.label}
              completed={domain.completed}
              total={domain.modules.length}
              icon={domainIcons[i]}
              color={domain.color}
              index={i}
              onClick={() => onDomainClick(i)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Domain Panel                                                       */
/* ------------------------------------------------------------------ */

function DomainPanel({
  domain,
  onModuleClick,
}: {
  domain: DomainConfig;
  onModuleClick: (module: ModuleData) => void;
}) {
  const Icon = domain.icon;
  const progress = Math.round((domain.completed / domain.modules.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Domain header */}
      <div className="flex items-start gap-3 mb-1">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: `${domain.color}15`,
            border: `1px solid ${domain.color}30`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: domain.color }} />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl text-white">{domain.label}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden max-w-[120px]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: domain.color,
                }}
              />
            </div>
            <span className="text-xs text-mediumGray">
              {domain.completed} of {domain.modules.length} completed
            </span>
          </div>
        </div>
      </div>

      {/* Module list */}
      <div className="space-y-3">
        {domain.modules.map((module, i) => (
          <ModuleCard
            key={module.id}
            module={module}
            index={i}
            domainColor={domain.color}
            onClick={() => onModuleClick(module)}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

const tabOrder = ['Overview', 'History', 'Language', 'Food', 'Dress'];

export default function StudyPlansPage() {
  const { selectedStudentId } = useAppData();
  const { data: dbPlans } = trpc.studyPlan.listByStudent.useQuery(
    { studentId: selectedStudentId ?? 0 },
    { enabled: !!selectedStudentId }
  );
  const { data: progressStats } = trpc.progress.getStats.useQuery(
    { studentId: selectedStudentId ?? 0 },
    { enabled: !!selectedStudentId }
  );
  const updateModuleStatus = trpc.studyPlan.updateModuleStatus.useMutation();
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
  const [selectedDomain, setSelectedDomain] = useState('History');

  const handleDomainClick = (index: number) => {
    setActiveTab(domains[index].key);
  };

  const handleModuleClick = (module: ModuleData) => {
    setSelectedModule(module);
    setSelectedDomain(activeTab);
  };

  const activeDomain = domains.find((d) => d.key === activeTab);

  return (
    <AppShell title="Study Plans">
      <div className="relative">
        {/* Tab Bar */}
        <div className="sticky top-0 z-30 bg-[rgba(15,23,42,0.95)] backdrop-blur-[12px] border-b border-[rgba(255,255,255,0.06)] -mx-5 px-5">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabOrder.map((tab) => {
              const isActive = activeTab === tab;
              const domainConfig =
                tab !== 'Overview'
                  ? domains.find((d) => d.key === tab)
                  : null;
              const tabColor = domainConfig?.color || '#00C853';

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors"
                  style={{
                    color: isActive ? tabColor : '#64748B',
                    background: isActive
                      ? `${tabColor}10`
                      : 'transparent',
                  }}
                >
                  {tab}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{ backgroundColor: tabColor }}
                      layoutId="activeTabIndicator"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          <AnimatePresence mode="wait">
            {activeTab === 'Overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <OverviewSection onDomainClick={handleDomainClick} />
              </motion.div>
            ) : activeDomain ? (
              <DomainPanel
                key={activeDomain.key}
                domain={activeDomain}
                onModuleClick={handleModuleClick}
              />
            ) : null}
          </AnimatePresence>
        </div>

        {/* Module Detail Bottom Sheet */}
        <ModuleDetailSheet
          module={selectedModule}
          domain={selectedDomain}
          onClose={() => setSelectedModule(null)}
        />

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </AppShell>
  );
}
