import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Dna, Download, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import BottomSheet from './BottomSheet';
import { trpc } from '@/providers/trpc';

interface PrivacyDataViewProps {
  onBack: () => void;
}

export default function PrivacyDataView({ onBack }: PrivacyDataViewProps) {
  const deleteAccount = trpc.auth.deleteAccount.useMutation();

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync({ confirm: true });
      // Account is gone — send them to the landing/auth page.
      window.location.href = '/';
    } catch {
      // If deletion fails, keep the sheet open; the user can retry.
    }
  };

  const [shareAnonymized, setShareAnonymized] = useState(true);
  const [allowAnalytics, setAllowAnalytics] = useState(true);
  const [showDeleteDnaSheet, setShowDeleteDnaSheet] = useState(false);
  const [showDeleteAccountSheet, setShowDeleteAccountSheet] = useState(false);
  const [showExportSheet, setShowExportSheet] = useState(false);
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
          <h1 className="font-body text-base font-semibold text-white mx-auto">Data &amp; Privacy</h1>
        </header>

        <div className="px-5 pb-24 pt-4 space-y-6">
          {/* DNA Data Management */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-mediumGray mb-3">
              DNA DATA
            </h3>
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
              {/* DNA File Card */}
              <div className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,200,83,0.1)] flex items-center justify-center flex-shrink-0">
                  <Dna className="w-5 h-5 text-vibrantGreen" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">ancestry-dna-results.txt</p>
                  <p className="text-xs text-mediumGray">Uploaded: Jan 10, 2025</p>
                  <p className="text-xs text-mediumGray">Format: AncestryDNA</p>
                  <p className="text-xs text-vibrantGreen mt-1">Markers analyzed: 700,000+</p>
                </div>
              </div>

              {/* DNA Actions */}
              <div className="px-4 pb-4 space-y-2">
                <button className="w-full ghost-btn py-2.5 text-xs font-medium">
                  Re-upload File
                </button>
                <button
                  onClick={() => setShowDeleteDnaSheet(true)}
                  className="w-full py-2.5 text-xs font-medium text-softRed hover:text-[#EF4444] transition-colors border border-[rgba(248,113,113,0.2)] rounded-full"
                >
                  Delete DNA Data
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-mediumGray mb-3">
              PRIVACY SETTINGS
            </h3>
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-sm text-white">Share Anonymized Data</p>
                  <p className="text-xs text-mediumGray mt-0.5">Contribute to research</p>
                </div>
                <Switch
                  checked={shareAnonymized}
                  onCheckedChange={setShareAnonymized}
                  className="data-[state=checked]:bg-vibrantGreen"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-4">
                <div>
                  <p className="text-sm text-white">Allow App Analytics</p>
                  <p className="text-xs text-mediumGray mt-0.5">Help improve the app</p>
                </div>
                <Switch
                  checked={allowAnalytics}
                  onCheckedChange={setAllowAnalytics}
                  className="data-[state=checked]:bg-vibrantGreen"
                />
              </div>
            </div>
          </div>

          {/* Download My Data */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-mediumGray mb-3">
              DATA EXPORT
            </h3>
            <button
              onClick={() => setShowExportSheet(true)}
              className="w-full flex items-center gap-3 p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-2xl text-left hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
                <Download className="w-5 h-5 text-lightSilver" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Download My Data</p>
                <p className="text-xs text-mediumGray">Export all your data (GDPR)</p>
              </div>
            </button>
          </div>

          {/* Danger Zone */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-softRed mb-3">
              DANGER ZONE
            </h3>
            <button
              onClick={() => setShowDeleteAccountSheet(true)}
              className="w-full flex items-center gap-3 p-4 bg-[rgba(248,113,113,0.05)] border border-[rgba(248,113,113,0.2)] rounded-2xl text-left hover:bg-[rgba(248,113,113,0.08)] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[rgba(248,113,113,0.1)] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-softRed" />
              </div>
              <div>
                <p className="text-sm font-medium text-softRed">Delete Account</p>
                <p className="text-xs text-mediumGray">Permanently delete all data</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Delete DNA Confirmation Sheet */}
      <BottomSheet
        isOpen={showDeleteDnaSheet}
        onClose={() => setShowDeleteDnaSheet(false)}
        title="Delete DNA Data?"
      >
        <div className="space-y-4 pb-6">
          <p className="text-sm text-softRed">
            Deleting DNA data will reset study plan personalization. Your children&apos;s progress will be preserved but heritage-based content will no longer be personalized.
          </p>
          <button
            onClick={() => setShowDeleteDnaSheet(false)}
            className="w-full glass-btn py-3.5 text-sm font-semibold"
          >
            Keep DNA Data
          </button>
          <button
            onClick={() => setShowDeleteDnaSheet(false)}
            className="w-full ghost-btn py-3.5 text-sm font-medium text-softRed"
          >
            Delete Anyway
          </button>
        </div>
      </BottomSheet>

      {/* Export Data Sheet */}
      <BottomSheet
        isOpen={showExportSheet}
        onClose={() => setShowExportSheet(false)}
        title="Request Data Export"
      >
        <div className="space-y-4 pb-6">
          <p className="text-sm text-lightSilver">
            We&apos;ll prepare a ZIP file with all your account data, including profiles, progress, and DNA analysis results.
          </p>
          <p className="text-xs text-mediumGray">
            This may take up to 24 hours. You&apos;ll receive an email when it&apos;s ready.
          </p>
          <button
            onClick={() => setShowExportSheet(false)}
            className="w-full glass-btn py-3.5 text-sm font-semibold"
          >
            Request Export
          </button>
          <button
            onClick={() => setShowExportSheet(false)}
            className="w-full ghost-btn py-3.5 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </BottomSheet>

      {/* Delete Account Confirmation Sheet */}
      <BottomSheet
        isOpen={showDeleteAccountSheet}
        onClose={() => setShowDeleteAccountSheet(false)}
        title="Delete Your Account?"
      >
        <div className="space-y-4 pb-6">
          <div className="flex items-start gap-3 p-3 bg-[rgba(248,113,113,0.08)] rounded-xl">
            <AlertTriangle className="w-5 h-5 text-softRed flex-shrink-0 mt-0.5" />
            <p className="text-sm text-softRed">
              This action is irreversible. All student profiles, progress data, DNA analysis, and study plans will be permanently deleted.
            </p>
          </div>
          <p className="text-xs text-mediumGray">
            To confirm, type &quot;DELETE&quot; in the field below. Your data will be removed within 30 days per COPPA requirements.
          </p>
          <input
            type="text"
            placeholder="Type DELETE to confirm"
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm placeholder:text-mutedSlate focus:outline-none focus:border-softRed transition-colors"
          />
          <button
            onClick={() => setShowDeleteAccountSheet(false)}
            className="w-full glass-btn py-3.5 text-sm font-semibold"
          >
            Keep My Account
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteAccount.isPending}
            className="w-full py-3.5 text-sm font-medium text-softRed border border-[rgba(248,113,113,0.3)] rounded-full hover:bg-[rgba(248,113,113,0.1)] transition-colors disabled:opacity-60"
          >
            {deleteAccount.isPending ? 'Deleting…' : 'Permanently Delete Account'}
          </button>
        </div>
      </BottomSheet>
    </motion.div>
  );
}
