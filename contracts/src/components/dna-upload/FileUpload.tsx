import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, X, Dna } from 'lucide-react';
import CountUp from 'react-countup';
import { uploadStages } from './data';
import type { UploadFile } from './data';

interface FileUploadProps {
  file: UploadFile;
  onCancel: () => void;
  onComplete: () => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function FileUpload({ file, onCancel, onComplete }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  // Simulate upload progress
  useEffect(() => {
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 800);
          return 100;
        }
        // Determine stage based on progress
        const stageIndex = uploadStages.findIndex(
          s => prev >= s.min && prev < s.max
        );
        if (stageIndex >= 0) setCurrentStage(stageIndex);

        // Increment by random amount
        return Math.min(prev + Math.random() * 3 + 0.5, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  const stage = uploadStages[currentStage] || uploadStages[uploadStages.length - 1];
  const speed = (Math.random() * 2 + 2).toFixed(1);

  return (
    <div className="px-5 py-8 min-h-[100dvh] flex flex-col items-center justify-center">
      {/* DNA Helix Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="mb-6 relative"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-[60px] h-[60px] flex items-center justify-center"
          style={{ filter: 'drop-shadow(0 0 12px rgba(0,200,83,0.4))' }}
        >
          <Dna className="w-14 h-14 text-[#00C853]" />
        </motion.div>
        <div className="absolute inset-0 rounded-full bg-[rgba(0,200,83,0.1)] animate-glow-pulse" />
      </motion.div>

      {/* Status */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ease: easeOutExpo }}
        className="font-body text-lg font-semibold text-white mb-1 text-center"
      >
        {uploadProgress >= 100 ? 'Upload Complete!' : stage.label}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-[#64748B] mb-6 text-center"
      >
        {file.name}
      </motion.p>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ease: easeOutExpo }}
        className="w-full max-w-[280px] mb-4"
      >
        <div className="h-3 bg-[#1E293B] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{ background: 'linear-gradient(90deg, #00C853, #38BDF8)' }}
            initial={{ width: 0 }}
            animate={{ width: `${uploadProgress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Shimmer effect */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'shimmer 1.5s infinite',
                backgroundSize: '200% 100%',
              }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Percentage */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, ease: easeOutExpo }}
        className="text-center mb-2"
      >
        <span className="font-display text-4xl text-[#00C853]">
          <CountUp end={Math.round(uploadProgress)} duration={0.5} suffix="%" />
        </span>
      </motion.div>

      {/* Speed/ETA */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-[#64748B] mb-8"
      >
        {uploadProgress < 100 ? `${speed} MB/s • About ${Math.ceil((100 - uploadProgress) / 10)} seconds remaining` : 'Processing complete!'}
      </motion.p>

      {/* Cancel Button */}
      {uploadProgress < 100 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onCancel}
          className="ghost-btn text-xs"
        >
          Cancel Upload
        </motion.button>
      )}
    </div>
  );
}

// File selected state component
interface FileSelectedProps {
  file: UploadFile;
  onUpload: () => void;
  onRemove: () => void;
}

export function FileSelected({ file, onUpload, onRemove }: FileSelectedProps) {
  const [showPreview, setShowPreview] = useState(false);

  const previewData = `rsid\tchromosome\tposition\tgenotype
rs4477212\t1\t82154\tAA
rs3094315\t1\t752566\tAA
rs3131972\t1\t752721\tGG
rs12124819\t1\t776546\tAT
rs11240777\t1\t798959\tGG`;

  return (
    <div className="px-5 py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: easeOutExpo }}
      >
        {/* File Card */}
        <div className="liquid-glass p-5 mb-4 relative">
          <button
            onClick={onRemove}
            className="absolute top-3 right-3 text-[#64748B] hover:text-[#F87171] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.3)] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#00C853]" />
            </div>
            <div>
              <h3 className="font-body text-base font-semibold text-white mb-0.5">{file.name}</h3>
              <p className="text-xs text-[#64748B]">{file.size}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="pill-badge text-[10px]">{file.format} format detected</span>
          </div>
        </div>

        {/* Preview Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: easeOutExpo }}
          className="mb-6"
        >
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-between w-full text-left py-3"
          >
            <span className="text-sm text-[#CBD5E1]">Preview first 5 lines</span>
            <motion.span animate={{ rotate: showPreview ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </motion.span>
          </button>

          <motion.div
            initial={false}
            animate={{ height: showPreview ? 'auto' : 0, opacity: showPreview ? 1 : 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className="overflow-hidden"
          >
            <div className="bg-[#0A0C1B] rounded-xl p-3 border border-[rgba(255,255,255,0.06)] overflow-x-auto">
              <pre className="font-mono text-[11px] text-[#CBD5E1] leading-relaxed">
                {previewData}
              </pre>
            </div>
          </motion.div>
        </motion.div>

        {/* Upload Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: easeOutExpo }}
          onClick={onUpload}
          className="glass-btn w-full"
        >
          Upload & Analyze
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onRemove}
          className="w-full text-center text-xs text-[#64748B] hover:text-lightSilver mt-4 transition-colors"
        >
          Choose different file
        </motion.button>
      </motion.div>
    </div>
  );
}
