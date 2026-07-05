import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[70] bg-surface rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            style={{ maxWidth: '430px', margin: '0 auto' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-[rgba(255,255,255,0.2)] rounded-full mx-auto mb-4" />
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] transition-colors"
              >
                <X className="w-5 h-5 text-lightSilver" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
