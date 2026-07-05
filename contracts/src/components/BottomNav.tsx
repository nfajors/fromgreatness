import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, ClipboardList, BarChart3, User } from 'lucide-react';
import { memo } from 'react';

const tabs = [
  { path: '/parent-dashboard', label: 'Home', icon: Home },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/study-plans', label: 'Plans', icon: ClipboardList },
  { path: '/assessments', label: 'Activity', icon: BarChart3 },
  { path: '/settings', label: 'Profile', icon: User },
];

const BottomNav = memo(function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(15,23,42,0.85)] backdrop-blur-[20px] border-t border-[rgba(255,255,255,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-[430px] mx-auto flex items-center justify-around py-3">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center gap-1 px-3 py-1 transition-transform active:scale-95"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-vibrantGreen' : 'text-mediumGray'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-vibrantGreen' : 'text-mediumGray'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-vibrantGreen mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

export default BottomNav;
