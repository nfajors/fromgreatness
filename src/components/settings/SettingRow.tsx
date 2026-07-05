import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingRowProps {
  icon: ReactNode;
  label: string;
  subtitle?: string;
  rightElement?: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}

export default function SettingRow({
  icon,
  label,
  subtitle,
  rightElement,
  onClick,
  destructive = false,
}: SettingRowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 py-4 px-1 text-left transition-colors active:bg-[rgba(255,255,255,0.03)] ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-lightSilver">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${destructive ? 'text-softRed' : 'text-white'}`}>
          {label}
        </p>
        {subtitle && (
          <p className="text-xs text-mediumGray mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right element */}
      <div className="flex-shrink-0">
        {rightElement || (onClick && (
          <ChevronRight className="w-4 h-4 text-mediumGray" />
        ))}
      </div>
    </button>
  );
}
