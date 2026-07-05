import { useState, useRef } from 'react';
import { trpc } from '@/providers/trpc';
import { useAppData } from '@/hooks/useAppData';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';
import AppShell from '@/components/AppShell';
import ProviderSelection from '@/components/dna-upload/ProviderSelection';
import { FileSelected } from '@/components/dna-upload/FileUpload';
import AncestryResults from '@/components/dna-upload/AncestryResults';
import ManualHeritage from '@/components/dna-upload/ManualHeritage';
import { manualRegions } from '@/components/dna-upload/data';
import type { UploadFile, AncestryRegion } from '@/components/dna-upload/data';

type UploadState = 'select' | 'file_selected' | 'parsing' | 'confirm' | 'saving' | 'results';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const REGION_COLORS = ['#00C853', '#38BDF8', '#F59E0B', '#7E57C2', '#EC4899', '#64748B'];

function formatFileSize(bytes: number): string {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${mb.toFixed(1)} MB`;
}

function detectFormat(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('23andme')) return '23andMe';
  if (lower.includes('ancestry')) return 'AncestryDNA';
  if (lower.includes('myheritage')) return 'MyHeritage';
  if (lower.endsWith('.csv')) return 'CSV Raw';
  return 'Raw DNA';
}

export default function DnaUploadPage() {
  const navigate = useNavigate();
  const { selectedStudentId } = useAppData();
  const utils = trpc.useUtils();

  const parseRaw = trpc.dna.parseRaw.useMutation();
  const uploadDna = trpc.dna.upload.useMutation();

  const [state, setState] = useState<UploadState>('select');
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [showManualSheet, setShowManualSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [snpCount, setSnpCount] = useState(0);
  const [confirmedRegions, setConfirmedRegions] = useState<AncestryRegion[]>([]);

  // Hold the raw file text between steps without re-reading.
  const fileTextRef = useRef<string>('');

  const handleFileSelect = async (file: File) => {
    setError(null);
    setSelectedFile({
      name: file.name || 'dna_raw_data.txt',
      size: formatFileSize(file.size),
      type: file.type || 'text/plain',
      format: detectFormat(file.name),
    });
    try {
      fileTextRef.current = await file.text();
    } catch {
      fileTextRef.current = '';
    }
    setState('file_selected');
  };

  // Step: parse the raw file on the server, then move to heritage confirmation.
  const handleUpload = async () => {
    setError(null);
    if (!fileTextRef.current) {
      setError('Could not read the file contents. Please choose the file again.');
      return;
    }
    setState('parsing');
    try {
      const parsed = await parseRaw.mutateAsync({ fileText: fileTextRef.current });
      setSnpCount(parsed.snpCount);
      setWarnings(parsed.warnings);
      // Raw SNP files don't contain ancestry %, so we ask the parent to confirm
      // heritage regions next. We pre-open the manual heritage sheet.
      setState('confirm');
      setShowManualSheet(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse the file.');
      setState('file_selected');
    }
  };

  // Build ancestry regions from the parent's confirmed selection, then persist.
  const handleManualSave = async (
    regionIds: string[],
    confidence: number,
    notes: string,
  ) => {
    setShowManualSheet(false);
    if (regionIds.length === 0) {
      setError('Please select at least one heritage region.');
      setState('confirm');
      return;
    }

    // Distribute a rough percentage across selected regions (parent-confirmed,
    // not a genetic measurement — labeled as such in the UI).
    const share = Math.round(100 / regionIds.length);
    const regions: AncestryRegion[] = regionIds.map((id, i) => {
      const meta = manualRegions.find((r) => r.id === id);
      const pct = i === regionIds.length - 1 ? 100 - share * (regionIds.length - 1) : share;
      return {
        id,
        name: meta?.name ?? id,
        percentage: pct,
        color: REGION_COLORS[i % REGION_COLORS.length],
        flag: meta?.flag ?? '🌍',
      };
    });
    setConfirmedRegions(regions);

    if (!selectedStudentId) {
      // No student selected (e.g. opened directly) — still show results locally.
      setState('results');
      return;
    }

    setState('saving');
    try {
      await uploadDna.mutateAsync({
        studentId: selectedStudentId,
        provider: selectedFile?.format ?? 'raw',
        rawData: { confidence, notes, markerCount: snpCount },
        ancestrySummary: regions.map((r) => ({
          region: r.name,
          percentage: r.percentage,
          color: r.color,
        })),
        primaryRegion: regions[0]?.name,
        primaryPercentage: regions[0]?.percentage,
      });
      await utils.dna.getByStudent.invalidate({ studentId: selectedStudentId });
      setState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your results.');
      setState('confirm');
    }
  };

  const handleContinue = () => navigate('/gap-analysis');

  const resetToSelect = () => {
    setState('select');
    setSelectedFile(null);
    setError(null);
    setWarnings([]);
    fileTextRef.current = '';
  };

  const handleBack = () => {
    if (state === 'file_selected') resetToSelect();
    else if (state === 'results') navigate('/assessments');
    else if (state === 'confirm') setState('file_selected');
    else navigate('/assessments');
  };

  const getTitle = () => {
    switch (state) {
      case 'select': return 'DNA Upload';
      case 'file_selected': return 'File Ready';
      case 'parsing': return 'Reading File…';
      case 'confirm': return 'Confirm Heritage';
      case 'saving': return 'Saving…';
      case 'results': return 'Your Results';
      default: return 'DNA Upload';
    }
  };

  return (
    <>
      <AppShell title={getTitle()} showBack={state !== 'parsing' && state !== 'saving'} onBack={handleBack}>
        <div className="min-h-[100dvh]" style={{ background: 'radial-gradient(circle at 50% 0%, #2D1B69, #0A0C1B)' }}>
          {error && (
            <div className="mx-5 mt-4 flex items-start gap-2 rounded-xl border border-softRed/30 bg-softRed/10 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-softRed shrink-0 mt-0.5" />
              <p className="text-sm text-softRed">{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {state === 'select' && (
              <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: easeOutExpo }}>
                <ProviderSelection onFileSelect={handleFileSelect} onManualEntry={() => { setState('confirm'); setShowManualSheet(true); }} />
              </motion.div>
            )}

            {state === 'file_selected' && selectedFile && (
              <motion.div key="file_selected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: easeOutExpo }}>
                <FileSelected file={selectedFile} onUpload={handleUpload} onRemove={resetToSelect} />
              </motion.div>
            )}

            {(state === 'parsing' || state === 'saving') && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="px-5 py-8 min-h-[60vh] flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 text-vibrantGreen animate-spin mb-4" />
                <h3 className="font-body text-lg font-semibold text-white mb-1">
                  {state === 'parsing' ? 'Reading your DNA file…' : 'Saving your heritage profile…'}
                </h3>
                <p className="text-xs text-mediumGray">
                  {state === 'parsing' ? 'Validating markers and detecting your provider.' : 'Almost there.'}
                </p>
              </motion.div>
            )}

            {state === 'confirm' && !showManualSheet && (
              <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="px-5 py-8 min-h-[50vh] flex flex-col items-center justify-center text-center">
                {snpCount > 0 && (
                  <p className="text-sm text-vibrantGreen mb-2">
                    ✓ {snpCount.toLocaleString()} markers read successfully
                  </p>
                )}
                {warnings.length > 0 && (
                  <div className="mb-4 text-xs text-amber-400 max-w-sm">
                    {warnings.map((w, i) => <p key={i}>{w}</p>)}
                  </div>
                )}
                <p className="text-sm text-lightSilver mb-4 max-w-sm">
                  Raw DNA files contain genetic markers but not an ancestry breakdown.
                  Confirm the heritage regions your family identifies with so we can
                  tailor your study plan.
                </p>
                <button onClick={() => setShowManualSheet(true)} className="glass-btn px-6">
                  Confirm Heritage Regions
                </button>
              </motion.div>
            )}

            {state === 'results' && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: easeOutExpo }}>
                <AncestryResults onContinue={handleContinue} onUploadDifferent={resetToSelect} regions={confirmedRegions} markerCount={snpCount} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AppShell>

      <AnimatePresence>
        {showManualSheet && (
          <ManualHeritage onSave={handleManualSave} onClose={() => setShowManualSheet(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
