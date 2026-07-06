import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  User,
  CreditCard,
  Wallet,
  Users,
  UserPlus,
  Bell,
  Globe,
  Calendar,
  Dna,
  Download,
  Shield,
  HelpCircle,
  Mail,
  FileText,
  Lock,
  Trash2,
  Camera,
  LogOut,
  Settings,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import SectionHeader from '@/components/settings/SectionHeader';
import SettingRow from '@/components/settings/SettingRow';
import EditProfileSheet from '@/components/settings/EditProfileSheet';
import AddStudentSheet from '@/components/settings/AddStudentSheet';
import SubscriptionView from '@/components/settings/SubscriptionView';
import StudentProfilesView from '@/components/settings/StudentProfilesView';
import NotificationsView from '@/components/settings/NotificationsView';
import LearningPreferencesView from '@/components/settings/LearningPreferencesView';
import PrivacyDataView from '@/components/settings/PrivacyDataView';
import AppSettingsView from '@/components/settings/AppSettingsView';
import SupportView from '@/components/settings/SupportView';

type SubScreen =
  | 'main'
  | 'editProfile'
  | 'subscription'
  | 'studentProfiles'
  | 'notifications'
  | 'learningPreferences'
  | 'privacyData'
  | 'appSettings'
  | 'support';

interface Student {
  id: number;
  name: string;
  age: number;
  grade: string;
  avatar: string;
  progress: number;
  lastActive: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: studentsList } = trpc.student.list.useQuery();
  const { data: subscription } = trpc.subscription.get.useQuery(undefined, {
    enabled: !!user,
  });
  const [subScreen, setSubScreen] = useState<SubScreen>('main');
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showAddStudentSheet, setShowAddStudentSheet] = useState(false);

  // Profile state - connected to auth
  const [profile, setProfile] = useState({
    name: user?.name || 'Parent Account',
    email: user?.email || '',
    phone: '',
    avatar: user?.avatar || '',
    memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2025',
  });

  // Students — derived from the real database list for this parent.
  const students: Student[] = (studentsList ?? []).map((s) => ({
    id: s.id,
    name: s.fullName,
    age: s.age,
    grade: s.grade,
    avatar: s.avatarUrl || '/child-learning.jpg',
    progress: 0,
    lastActive: '—',
  }));

  const navigateTo = (screen: SubScreen) => {
    setSubScreen(screen);
  };

  const goBack = () => {
    setSubScreen('main');
  };

  const handleSaveProfile = (updated: { name: string; email: string; phone: string }) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const createStudent = trpc.student.create.useMutation();
  const utils = trpc.useUtils();

  const handleAddStudent = async (student: { name: string; age: number; grade: string; avatar: string }) => {
    await createStudent.mutateAsync({
      fullName: student.name,
      age: student.age,
      grade: student.grade,
      avatarUrl: student.avatar,
    });
    await utils.student.list.invalidate();
  };

  // Render sub-screens
  if (subScreen === 'subscription') {
    return <SubscriptionView onBack={goBack} />;
  }

  if (subScreen === 'studentProfiles') {
    return (
      <StudentProfilesView
        onBack={goBack}
        students={students}
        onAddStudent={handleAddStudent}
      />
    );
  }

  if (subScreen === 'notifications') {
    return <NotificationsView onBack={goBack} />;
  }

  if (subScreen === 'learningPreferences') {
    return <LearningPreferencesView onBack={goBack} />;
  }

  if (subScreen === 'privacyData') {
    return <PrivacyDataView onBack={goBack} />;
  }

  if (subScreen === 'appSettings') {
    return <AppSettingsView onBack={goBack} />;
  }

  if (subScreen === 'support') {
    return <SupportView onBack={goBack} />;
  }

  // Main Settings View
  return (
    <AppShell title="Settings" showBack={false}>
      <div className="px-5 pt-6 pb-8">
        {/* Profile Header - Connected to Auth */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          {/* Avatar */}
          <div className="relative mb-4">
            <motion.div
              className="w-20 h-20 rounded-full overflow-hidden"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEditSheet(true)}
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Camera overlay - always visible on mobile */}
            <button
              onClick={() => setShowEditSheet(true)}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-vibrantGreen flex items-center justify-center shadow-lg"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Name */}
          <h2 className="font-display text-2xl font-semibold text-white mb-1">
            {profile.name}
          </h2>

          {/* Email */}
          <p className="text-sm text-mediumGray mb-3">{profile.email}</p>

          {/* Member Since */}
          <p className="text-xs text-mediumGray mb-3">
            Member since {profile.memberSince}
          </p>

          {/* Plan Badge */}
          <span className="pill-badge mb-4">Annual Member</span>

          {/* Edit Profile Button */}
          <button
            onClick={() => setShowEditSheet(true)}
            className="ghost-btn py-2.5 px-6 text-xs font-medium"
          >
            Edit Profile
          </button>
        </motion.div>

        {/* Section 1: Account */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SectionHeader title="Account" />
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden px-3">
            <SettingRow
              icon={<User className="w-5 h-5" />}
              label="Edit Profile"
              subtitle="Name, email, password"
              onClick={() => setShowEditSheet(true)}
            />
            <SettingRow
              icon={<CreditCard className="w-5 h-5" />}
              label="Subscription"
              subtitle="$75/year • Renews Jan 15, 2026"
              rightElement={
                <div className="flex items-center gap-2">
                  <span className="pill-badge text-[10px] py-1 px-2">Active</span>
                  <ChevronRight className="w-4 h-4 text-mediumGray" />
                </div>
              }
              onClick={() => navigateTo('subscription')}
            />
            <SettingRow
              icon={<Wallet className="w-5 h-5" />}
              label="Payment Methods"
              subtitle="Visa •••• 4242"
              onClick={() => navigateTo('subscription')}
            />
          </div>
        </motion.div>

        {/* Section 2: Family */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <SectionHeader title="Family" />
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden px-3">
            <SettingRow
              icon={<Users className="w-5 h-5" />}
              label="Student Profiles"
              subtitle={`${students.length} students configured`}
              onClick={() => navigateTo('studentProfiles')}
            />
            <SettingRow
              icon={<UserPlus className="w-5 h-5" />}
              label="Add New Student"
              subtitle="Set up another child's profile"
              onClick={() => setShowAddStudentSheet(true)}
            />
          </div>
        </motion.div>

        {/* Section 3: Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader title="Preferences" />
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden px-3">
            <SettingRow
              icon={<Bell className="w-5 h-5" />}
              label="Notifications"
              subtitle="Progress alerts, reminders, achievements"
              onClick={() => navigateTo('notifications')}
            />
            <SettingRow
              icon={<Globe className="w-5 h-5" />}
              label="Language"
              subtitle="English"
              onClick={() => {}}
            />
            <SettingRow
              icon={<Calendar className="w-5 h-5" />}
              label="Learning Schedule"
              subtitle="Mon-Fri • 4:00 PM"
              onClick={() => navigateTo('learningPreferences')}
            />
          </div>
        </motion.div>

        {/* Section 4: Data & Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <SectionHeader title="Data & Privacy" />
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden px-3">
            <SettingRow
              icon={<Dna className="w-5 h-5" />}
              label="DNA Data Management"
              subtitle="View, re-upload, or delete DNA data"
              onClick={() => navigateTo('privacyData')}
            />
            <SettingRow
              icon={<Download className="w-5 h-5" />}
              label="Download Data"
              subtitle="Export all your data (GDPR)"
              onClick={() => navigateTo('privacyData')}
            />
            <SettingRow
              icon={<Shield className="w-5 h-5" />}
              label="Privacy Settings"
              subtitle="COPPA controls, consent management"
              onClick={() => navigateTo('privacyData')}
            />
          </div>
        </motion.div>

        {/* Section 5: App Settings */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionHeader title="App Settings" />
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden px-3">
            <SettingRow
              icon={<Settings className="w-5 h-5" />}
              label="App Settings"
              subtitle="Dark mode, sound, text size"
              onClick={() => navigateTo('appSettings')}
            />
            <SettingRow
              icon={<Sliders className="w-5 h-5" />}
              label="Learning Preferences"
              subtitle="Intensity, goals, language"
              onClick={() => navigateTo('learningPreferences')}
            />
          </div>
        </motion.div>

        {/* Section 6: Support */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <SectionHeader title="Support" />
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden px-3">
            <SettingRow
              icon={<HelpCircle className="w-5 h-5" />}
              label="Help Center"
              onClick={() => navigateTo('support')}
            />
            <SettingRow
              icon={<Mail className="w-5 h-5" />}
              label="Contact Support"
              onClick={() => navigateTo('support')}
            />
            <SettingRow
              icon={<FileText className="w-5 h-5" />}
              label="Terms of Service"
              onClick={() => navigateTo('support')}
            />
            <SettingRow
              icon={<Lock className="w-5 h-5" />}
              label="Privacy Policy"
              onClick={() => navigateTo('support')}
            />
          </div>
        </motion.div>

        {/* Section 7: Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SectionHeader title="Account Actions" />
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden px-3">
            <button
              className="w-full flex items-center gap-3 py-4 px-1 text-left transition-colors active:bg-[rgba(255,255,255,0.03)]"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-lightSilver">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-lightSilver">Sign Out</span>
            </button>
            <button
              onClick={() => navigateTo('privacyData')}
              className="w-full flex items-center gap-3 py-4 px-1 text-left transition-colors active:bg-[rgba(255,255,255,0.03)]"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[rgba(248,113,113,0.1)] flex items-center justify-center text-softRed">
                <Trash2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-softRed">Delete Account</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Sheets */}
      <EditProfileSheet
        isOpen={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      <AddStudentSheet
        isOpen={showAddStudentSheet}
        onClose={() => setShowAddStudentSheet(false)}
        onAdd={handleAddStudent}
      />
    </AppShell>
  );
}
