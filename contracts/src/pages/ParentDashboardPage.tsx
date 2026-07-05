import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Trophy, Target, Bell, CheckCircle, Video,
  Clock, Coins, BarChart3,
  ChevronDown, Play, X, Plus,
  ArrowRight, BookOpen, Globe, ChefHat, Shirt,
  Check,
} from 'lucide-react';
import AppShell from '@/components/AppShell';

/* ─── easing token ─── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeSmooth = [0.4, 0, 0.2, 1] as [number, number, number, number];

/* ═══════════════════════════════════════════════════════════
   1.  HEADER  (greeting + date + bell)
   ═══════════════════════════════════════════════════════════ */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

/* ═══════════════════════════════════════════════════════════
   2.  STAT CARDS
   ═══════════════════════════════════════════════════════════ */
const stats = [
  { label: 'Study Streak', value: '12 days', sub: 'Keep it going!', icon: Flame, color: '#F59E0B' },
  { label: 'Modules Done', value: '24 of 48', sub: 'completed', icon: Trophy, color: '#00C853' },
  { label: 'Weekly Goal', value: '80%', sub: 'on track', icon: Target, color: '#38BDF8' },
];

/* ═══════════════════════════════════════════════════════════
   3.  ACTIVITY FEED DATA
   ═══════════════════════════════════════════════════════════ */
interface ActivityItem {
  id: number;
  title: string;
  subtitle: string;
  time: string;
  icon: typeof CheckCircle;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  action?: { label: string; color: string };
  unread: boolean;
}

const activities: ActivityItem[] = [
  {
    id: 1,
    title: "Jordan completed 'Introduction to Swahili' module",
    subtitle: 'Language domain \u2022 Score: 92%',
    time: '2h ago',
    icon: CheckCircle,
    iconBg: 'rgba(0,200,83,0.15)',
    iconColor: '#00C853',
    borderColor: '#00C853',
    unread: true,
  },
  {
    id: 2,
    title: 'Jordan submitted Cultural Identity video',
    subtitle: 'Pending your review',
    time: '5h ago',
    icon: Video,
    iconBg: 'rgba(56,189,248,0.15)',
    iconColor: '#38BDF8',
    borderColor: '#38BDF8',
    action: { label: 'Review', color: '#38BDF8' },
    unread: true,
  },
  {
    id: 3,
    title: "New achievement unlocked: First Week Complete!",
    subtitle: 'Jordan earned a new badge',
    time: '1d ago',
    icon: Trophy,
    iconBg: 'rgba(212,175,55,0.15)',
    iconColor: '#D4AF37',
    borderColor: '#D4AF37',
    action: { label: 'Celebrate', color: '#00C853' },
    unread: true,
  },
  {
    id: 4,
    title: 'Study reminder: History module due tomorrow',
    subtitle: 'The Mali Empire & Mansa Musa',
    time: '1d ago',
    icon: Clock,
    iconBg: 'rgba(245,158,11,0.15)',
    iconColor: '#F59E0B',
    borderColor: '#F59E0B',
    action: { label: 'View', color: '#F59E0B' },
    unread: false,
  },
  {
    id: 5,
    title: 'Jordan earned 50 coins this week',
    subtitle: 'Great progress!',
    time: '2d ago',
    icon: Coins,
    iconBg: 'rgba(212,175,55,0.15)',
    iconColor: '#D4AF37',
    borderColor: '#D4AF37',
    unread: false,
  },
  {
    id: 6,
    title: 'Weekly progress report available',
    subtitle: '4.5 hours of learning this week',
    time: '3d ago',
    icon: BarChart3,
    iconBg: 'rgba(56,189,248,0.15)',
    iconColor: '#38BDF8',
    borderColor: '#38BDF8',
    action: { label: 'View', color: '#38BDF8' },
    unread: false,
  },
];

/* ═══════════════════════════════════════════════════════════
   4.  VIDEO APPROVAL DATA
   ═══════════════════════════════════════════════════════════ */
interface PendingVideo {
  id: number;
  title: string;
  student: string;
  module: string;
  date: string;
  duration: string;
}

const pendingVideos: PendingVideo[] = [
  { id: 1, title: 'Cultural Identity Response', student: 'Jordan', module: 'Cultural Identity', date: 'Jan 5, 2025', duration: '1:45' },
  { id: 2, title: 'Family History Interview', student: 'Jordan', module: 'Family Roots', date: 'Jan 4, 2025', duration: '2:30' },
];

/* ═══════════════════════════════════════════════════════════
   5.  DOMAIN PROGRESS DATA
   ═══════════════════════════════════════════════════════════ */
const domains = [
  { name: 'History', icon: BookOpen, gradient: 'from-[#00C853] to-[#0D47A1]', percent: 60, modules: '4 of 8', hours: '3.5 hrs' },
  { name: 'Language', icon: Globe, gradient: 'from-[#7E57C2] to-[#00C853]', percent: 30, modules: '3 of 10', hours: '2 hrs' },
  { name: 'Food', icon: ChefHat, gradient: 'from-[#F59E0B] to-[#00C853]', percent: 50, modules: '3 of 6', hours: '1.5 hrs' },
  { name: 'Dress', icon: Shirt, gradient: 'from-[#F8BBD0] to-[#00C853]', percent: 28, modules: '2 of 7', hours: '1 hr' },
];

/* ═══════════════════════════════════════════════════════════
   6.  STUDY PLAN DATA
   ═══════════════════════════════════════════════════════════ */
const weekModules = [
  { day: 'M', label: 'Mon', completed: true },
  { day: 'T', label: 'Tue', completed: true },
  { day: 'W', label: 'Wed', completed: true },
  { day: 'T', label: 'Thu', completed: false },
  { day: 'F', label: 'Fri', completed: false },
  { day: 'S', label: 'Sat', planned: true },
  { day: 'S', label: 'Sun', planned: false },
];

const studyModules = [
  { title: 'The Ashanti Kingdom', domain: 'History', completed: true },
  { title: 'Yoruba Greetings', domain: 'Language', completed: false },
  { title: 'Spice Blends of West Africa', domain: 'Food', completed: false },
];

type Intensity = 'low' | 'medium' | 'high';

/* ═══════════════════════════════════════════════════════════
   7.  FAMILY DATA
   ═══════════════════════════════════════════════════════════ */
const familyMembers = [
  { name: 'Jordan', age: 10, progress: '24 of 48 modules', color: '#00C853' },
];

/* ═══════════════════════════════════════════════════════════
   ─── PAGE COMPONENT ───
   ═══════════════════════════════════════════════════════════ */
export default function ParentDashboardPage() {
  const [greeting] = useState(() => getGreeting());
  const [currentDate] = useState(() => formatDate());
  const [unreadCount] = useState(3);
  const [activityItems, setActivityItems] = useState(activities);
  const [videoExpanded, setVideoExpanded] = useState(true);
  const [videoList, setVideoList] = useState(pendingVideos);
  const [intensity, setIntensity] = useState<Intensity>('medium');
  const [toast, setToast] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<PendingVideo | null>(null);

  /* ── helpers ── */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleApprove = useCallback((videoId: number) => {
    setVideoList(prev => prev.filter(v => v.id !== videoId));
    showToast('Video approved successfully');
    setSelectedVideo(null);
  }, [showToast]);

  const handleRequestChanges = useCallback((videoId: number) => {
    setVideoList(prev => prev.filter(v => v.id !== videoId));
    showToast('Change request sent to Jordan');
  }, [showToast]);

  const markAllRead = useCallback(() => {
    setActivityItems(prev => prev.map(a => ({ ...a, unread: false })));
    showToast('All activities marked as read');
  }, [showToast]);

  /* ── intensity labels ── */
  const intensityMap: Record<Intensity, string> = { low: 'Low', medium: 'Medium', high: 'High' };

  return (
    <AppShell title="Dashboard">
      <div className="px-5 pt-5 pb-6 space-y-6">

        {/* ═══════ HEADER GREETING ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeSmooth }}
          className="flex items-start justify-between"
        >
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">
              Good {greeting}, Sarah
            </h2>
            <p className="text-sm text-mediumGray mt-1">{currentDate}</p>
          </div>
          <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5 text-lightSilver" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber text-[10px] font-bold text-black rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </motion.section>

        {/* ═══════ STATS CARDS ═══════ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: easeOutExpo }}
              className="liquid-glass flex-shrink-0 w-[120px] p-4 flex flex-col items-center text-center"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: `${s.color}20` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <span className="font-display text-[22px] font-semibold text-white leading-tight">
                {s.value}
              </span>
              <span className="text-[10px] text-mediumGray uppercase tracking-wide font-medium mt-0.5">
                {s.label}
              </span>
              <span className="text-[10px] text-mediumGray mt-0.5">{s.sub}</span>
            </motion.div>
          ))}
        </motion.section>

        {/* ═══════ ACTIVITY FEED ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: easeOutExpo }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-body text-lg font-semibold text-white">Recent Activity</h3>
            <button onClick={markAllRead} className="text-xs text-mediumGray hover:text-lightSilver transition-colors">
              Mark all read
            </button>
          </div>

          <div className="relative max-h-[340px] overflow-y-auto pr-1 space-y-2.5 pb-4">
            {activityItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.4, ease: easeOutExpo }}
                  className="relative flex gap-3 p-3 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderLeft: item.unread ? `3px solid ${item.borderColor}` : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: item.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-lightSilver leading-snug">{item.title}</p>
                    <p className="text-xs text-mediumGray mt-0.5">{item.subtitle}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-mutedSlate uppercase tracking-wide">{item.time}</span>
                      {item.action && (
                        <button
                          className="text-xs font-medium hover:opacity-80 transition-opacity"
                          style={{ color: item.action.color }}
                          onClick={() => item.action?.label === 'Review' && setSelectedVideo({
                            id: item.id,
                            title: 'Cultural Identity Response',
                            student: 'Jordan',
                            module: 'Cultural Identity',
                            date: 'Jan 5, 2025',
                            duration: '1:45',
                          })}
                        >
                          {item.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {/* fade at bottom */}
            <div className="sticky bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-baseDark to-transparent pointer-events-none" />
          </div>
        </motion.section>

        {/* ═══════ VIDEO APPROVAL ═══════ */}
        {videoList.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: easeOutExpo }}
          >
            <button
              onClick={() => setVideoExpanded(!videoExpanded)}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-body text-lg font-semibold text-white">
                  Pending Video Reviews
                </h3>
                <span className="w-5 h-5 rounded-full bg-vibrantGreen text-[10px] font-bold text-black flex items-center justify-center">
                  {videoList.length}
                </span>
              </div>
              <motion.div
                animate={{ rotate: videoExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-mediumGray" />
              </motion.div>
            </button>

            <AnimatePresence>
              {videoExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: easeSmooth }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3">
                    {videoList.map((video, i) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: i * 0.1, duration: 0.4, ease: easeOutExpo }}
                        className="liquid-glass p-3 flex gap-3"
                      >
                        {/* Thumbnail */}
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="relative w-[100px] h-[56px] rounded-lg bg-surface flex-shrink-0 flex items-center justify-center overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-deepPurple/40 to-baseIndigo/60" />
                          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                            <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
                          </div>
                        </button>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-lightSilver font-medium truncate">{video.title}</p>
                          <p className="text-xs text-mediumGray">{video.student} &bull; {video.module}</p>
                          <p className="text-[10px] text-mutedSlate mt-0.5">{video.date} &bull; {video.duration}</p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleApprove(video.id)}
                              className="px-3 py-1 text-[10px] font-semibold rounded-full bg-gradient-to-r from-vibrantGreen to-accentBlue text-white shadow-cta"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRequestChanges(video.id)}
                              className="px-3 py-1 text-[10px] font-semibold rounded-full ghost-btn"
                            >
                              Request Changes
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* ═══════ DOMAIN PROGRESS ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: easeOutExpo }}
        >
          <h3 className="font-body text-lg font-semibold text-white mb-3">Learning Progress</h3>
          <div className="space-y-4">
            {domains.map((d, i) => {
              const Icon = d.icon;
              return (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65 + i * 0.15, duration: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-lightSilver" />
                      <span className="text-sm text-lightSilver font-medium">{d.name}</span>
                    </div>
                    <span className="text-sm text-white font-display font-semibold">{d.percent}%</span>
                  </div>
                  {/* Progress bar track */}
                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${d.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${d.percent}%` }}
                      transition={{ delay: 0.7 + i * 0.15, duration: 1, ease: easeOutExpo }}
                    />
                  </div>
                  <p className="text-[10px] text-mediumGray mt-1">
                    {d.modules} modules &bull; {d.hours} spent
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ═══════ STUDY PLAN SUMMARY ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5, ease: easeOutExpo }}
          className="liquid-glass p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-body text-base font-semibold text-white">Current Study Plan</h3>
            <button className="text-xs text-vibrantGreen font-medium hover:opacity-80">View All</button>
          </div>
          <p className="text-sm text-lightSilver">West African Heritage &mdash; 12 Weeks</p>
          <p className="text-xs text-mediumGray mt-1 flex items-center gap-1">
            Up next: The Abolition Movement (History)
            <ArrowRight className="w-3 h-3" />
          </p>

          {/* This week&apos;s modules */}
          <div className="mt-4 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-mutedSlate font-semibold">This Week</p>
            {studyModules.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-glassBorder last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${m.completed ? 'bg-vibrantGreen' : 'border border-mediumGray'}`}>
                    {m.completed && <Check className="w-3 h-3 text-black" />}
                  </div>
                  <span className={`text-sm ${m.completed ? 'text-mediumGray line-through' : 'text-lightSilver'}`}>{m.title}</span>
                </div>
                <span className="text-[10px] text-mutedSlate">{m.domain}</span>
              </div>
            ))}
          </div>

          {/* Week mini calendar */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-glassBorder">
            {weekModules.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-mutedSlate">{d.label}</span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.03, type: 'spring', stiffness: 300 }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold
                    ${d.completed ? 'bg-vibrantGreen text-black' : d.planned ? 'border border-vibrantGreen text-vibrantGreen' : 'border border-mediumGray/30 text-mediumGray'}
                    ${i === 3 ? 'ring-2 ring-vibrantGreen/50' : ''}
                  `}
                >
                  {d.completed && <Check className="w-3 h-3" />}
                  {!d.completed && d.day}
                </motion.div>
              </div>
            ))}
          </div>

          {/* Intensity selector */}
          <div className="mt-4 pt-3 border-t border-glassBorder">
            <p className="text-[10px] uppercase tracking-wider text-mutedSlate font-semibold mb-2">Adjust Intensity</p>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as Intensity[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setIntensity(level)}
                  className={`flex-1 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                    intensity === level
                      ? 'bg-gradient-to-r from-vibrantGreen to-accentBlue text-white shadow-cta'
                      : 'ghost-btn'
                  }`}
                >
                  {intensityMap[level]}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ═══════ FAMILY MEMBERS ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5, ease: easeOutExpo }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-body text-lg font-semibold text-white">Your Family</h3>
            <button className="flex items-center gap-1 text-xs text-mediumGray hover:text-lightSilver transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Child
            </button>
          </div>
          <div className="flex gap-3">
            {familyMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 + i * 0.08, duration: 0.4, ease: easeOutExpo }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  width: 100,
                }}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vibrantGreen to-accentBlue flex items-center justify-center">
                    <span className="text-base font-bold text-white">{member.name[0]}</span>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-vibrantGreen border-2 border-baseDark" />
                </div>
                <span className="text-xs text-lightSilver font-medium">{member.name}</span>
                <span className="text-[10px] text-mediumGray">Age {member.age}</span>
                <span className="text-[9px] text-mutedSlate">{member.progress}</span>
              </motion.div>
            ))}

            {/* Add child card */}
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.93, duration: 0.4, ease: easeOutExpo }}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-dashed border-mediumGray/40 hover:border-mediumGray transition-colors"
              style={{ width: 100, background: 'rgba(255,255,255,0.01)' }}
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-mediumGray/40 flex items-center justify-center">
                <Plus className="w-5 h-5 text-mediumGray" />
              </div>
              <span className="text-[10px] text-mediumGray">Add Child</span>
            </motion.button>
          </div>
        </motion.section>

        {/* bottom spacer */}
        <div className="h-4" />
      </div>

      {/* ═══════ VIDEO PLAYER MODAL ═══════ */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
              className="w-full max-w-[360px] bg-surface rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-glassBorder">
                <div>
                  <p className="text-sm text-white font-medium">{selectedVideo.title}</p>
                  <p className="text-xs text-mediumGray">{selectedVideo.student} &bull; {selectedVideo.module}</p>
                </div>
                <button onClick={() => setSelectedVideo(null)} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-lightSilver" />
                </button>
              </div>
              {/* Video placeholder */}
              <div className="aspect-video bg-baseIndigo flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-deepPurple/30 to-baseIndigo/60" />
                <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-10 hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-white ml-1" fill="white" />
                </button>
              </div>
              {/* Actions */}
              <div className="p-4 flex gap-2">
                <button
                  onClick={() => handleApprove(selectedVideo.id)}
                  className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-vibrantGreen to-accentBlue text-white text-sm font-semibold shadow-cta"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRequestChanges(selectedVideo.id)}
                  className="flex-1 py-2.5 rounded-full ghost-btn text-sm font-medium"
                >
                  Request Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ TOAST ═══════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className="fixed top-4 left-1/2 z-[70] flex items-center gap-2 px-4 py-3 rounded-xl bg-[rgba(30,41,59,0.95)] backdrop-blur-xl border border-glassBorder"
            style={{ maxWidth: 320 }}
          >
            <CheckCircle className="w-4 h-4 text-vibrantGreen flex-shrink-0" />
            <span className="text-sm text-lightSilver">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
