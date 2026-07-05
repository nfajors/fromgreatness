import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface NotificationItem {
  id: string;
  label: string;
  enabled: boolean;
}

interface NotificationsViewProps {
  onBack: () => void;
}

export default function NotificationsView({ onBack }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'weekly-report', label: 'Weekly Progress Report', enabled: true },
    { id: 'daily-reminders', label: 'Daily Learning Reminders', enabled: true },
    { id: 'achievements', label: 'Achievement Notifications', enabled: true },
    { id: 'video-approvals', label: 'Video Upload Approvals', enabled: true },
    { id: 'new-content', label: 'New Content Alerts', enabled: true },
    { id: 'streak', label: 'Streak Reminders', enabled: true },
    { id: 'marketing', label: 'Marketing & Updates', enabled: false },
    { id: 'email', label: 'Email Notifications', enabled: true },
    { id: 'push', label: 'Push Notifications', enabled: true },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

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
          <h1 className="font-body text-base font-semibold text-white mx-auto">Notifications</h1>
        </header>

        <div className="px-5 pb-24 pt-4">
          {/* Notification Toggles */}
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            {notifications.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-4 py-4"
                style={{ borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                <span className="text-sm text-white">{item.label}</span>
                <Switch
                  checked={item.enabled}
                  onCheckedChange={() => toggleNotification(item.id)}
                  className="data-[state=checked]:bg-vibrantGreen"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
