import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface AppShellProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function AppShell({ children, title, showBack, onBack }: AppShellProps) {
  return (
    <div className="min-h-[100dvh] bg-baseDark">
      <div className="max-w-[430px] mx-auto relative min-h-[100dvh] bg-baseDark">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-14 flex items-center justify-center px-4 bg-[rgba(10,12,27,0.8)] backdrop-blur-[12px]">
          {showBack && (
            <button
              onClick={onBack}
              className="absolute left-4 text-lightSilver hover:text-white"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          {title ? (
            <h1 className="font-body text-base font-semibold text-white">{title}</h1>
          ) : (
            <span className="font-display text-lg font-semibold text-white">fromGreatness</span>
          )}
        </header>

        {/* Scrollable Content */}
        <div className="pb-20 overflow-y-auto">
          {children}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
