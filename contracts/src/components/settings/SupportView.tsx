import { motion } from 'framer-motion';
import { ChevronLeft, HelpCircle, Mail, Bug, FileText, Lock, ShieldCheck, ExternalLink } from 'lucide-react';

interface SupportViewProps {
  onBack: () => void;
}

interface SupportLink {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
}

export default function SupportView({ onBack }: SupportViewProps) {
  const supportLinks: SupportLink[] = [
    { icon: <HelpCircle className="w-5 h-5" />, label: 'Help Center', subtitle: 'FAQs and guides' },
    { icon: <Mail className="w-5 h-5" />, label: 'Contact Support', subtitle: 'Get in touch with our team' },
    { icon: <Bug className="w-5 h-5" />, label: 'Report a Bug', subtitle: 'Help us improve' },
    { icon: <FileText className="w-5 h-5" />, label: 'Terms of Service' },
    { icon: <Lock className="w-5 h-5" />, label: 'Privacy Policy' },
    { icon: <ShieldCheck className="w-5 h-5" />, label: 'COPPA Compliance Info', subtitle: 'Children\'s privacy' },
  ];

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
          <h1 className="font-body text-base font-semibold text-white mx-auto">Support</h1>
        </header>

        <div className="px-5 pb-24 pt-4">
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            {supportLinks.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {}}
                className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-[rgba(255,255,255,0.03)] transition-colors"
                style={{ borderBottom: i < supportLinks.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-lightSilver">
                  {link.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{link.label}</p>
                  {link.subtitle && (
                    <p className="text-xs text-mediumGray mt-0.5">{link.subtitle}</p>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-mediumGray flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
