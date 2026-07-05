import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, ExternalLink, Shield, Lock } from 'lucide-react';
import { providerOptions } from './data';

interface ProviderSelectionProps {
  onFileSelect: (file: File) => void;
  onManualEntry: () => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function ProviderSelection({ onFileSelect, onManualEntry }: ProviderSelectionProps) {
  const providerInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/zip': ['.zip'],
    },
    multiple: false,
  });

  return (
    <div className="px-5 py-6">
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
        className="text-center mb-6"
      >
        <h1 className="font-display text-4xl font-medium text-white mb-3">
          Upload DNA Data
        </h1>
        <p className="text-sm text-[#CBD5E1] max-w-xs mx-auto">
          Upload your child&apos;s raw DNA file to unlock precise heritage mapping and personalized study plans.
        </p>
      </motion.div>

      {/* Security Note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, ease: easeOutExpo }}
        className="flex items-center justify-center gap-2 mb-6"
      >
        <Shield className="w-4 h-4 text-[#00C853]" />
        <span className="text-xs text-[#00C853] font-medium">
          Your data is encrypted with AES-256 and processed securely
        </span>
      </motion.div>

      {/* Primary Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ease: easeOutExpo }}
        className={`mb-4 transition-all duration-300 ${
          isDragActive ? 'scale-[1.02]' : ''
        }`}
      >
        <div {...getRootProps()} className="cursor-pointer">
          <div
            className={`liquid-glass p-8 flex flex-col items-center text-center transition-all duration-300 ${
              isDragActive
                ? 'border-[#00C853] bg-[rgba(0,200,83,0.05)]'
                : 'border-dashed border-[rgba(0,200,83,0.3)]'
            }`}
            style={{
              borderStyle: 'dashed',
              borderWidth: '2px',
              borderColor: isDragActive ? '#00C853' : 'rgba(0,200,83,0.3)',
            }}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <UploadCloud className={`w-12 h-12 mb-4 ${isDragActive ? 'text-[#00C853]' : 'text-[#64748B]'}`} />
            </motion.div>
            <p className="text-base font-semibold text-white mb-1">
              {isDragActive ? 'Drop your file here!' : 'Drag & drop or tap to browse'}
            </p>
            <p className="text-xs text-[#64748B]">
              Supports: .txt, .csv, .json, .zip
            </p>
          </div>
        </div>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 my-5"
      >
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
        <span className="text-xs text-[#64748B]">or choose a provider</span>
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
      </motion.div>

      {/* Provider Options */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Hidden input shared by all provider tiles */}
        <input
          ref={providerInputRef}
          type="file"
          accept=".txt,.csv,.json,.zip"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileSelect(f);
            e.target.value = '';
          }}
        />
        {providerOptions.map((provider, i) => (
          <motion.button
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.1, ease: easeOutExpo }}
            onClick={() => {
              // Open the real file picker; the chosen file is read for real.
              providerInputRef.current?.click();
            }}
            className="w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 hover:scale-[1.02]"
            style={{
              background: provider.bgGradient,
              borderColor: provider.borderColor,
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-display text-lg font-bold text-white"
              style={{ backgroundColor: `${provider.color}30`, border: `1px solid ${provider.color}50` }}
            >
              {provider.name[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{provider.name}</p>
              <p className="text-xs text-[#CBD5E1]">{provider.description}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#64748B]" />
          </motion.button>
        ))}
      </div>

      {/* Manual Entry */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, ease: easeOutExpo }}
        className="text-center mb-6"
      >
        <p className="text-sm text-[#64748B] mb-1">Don&apos;t have a DNA file?</p>
        <button
          onClick={onManualEntry}
          className="text-sm text-[#00C853] hover:text-[#38BDF8] transition-colors font-medium"
        >
          Enter heritage manually
        </button>
      </motion.div>

      {/* Supported Providers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-1 mb-2">
          <Lock className="w-3 h-3 text-[#334155]" />
          <span className="text-[10px] text-[#334155] uppercase tracking-wider">Compatible with</span>
        </div>
        <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1">
          {['23andMe', 'AncestryDNA', 'MyHeritage', 'FamilyTreeDNA', 'Nebula'].map(name => (
            <span key={name} className="text-[10px] text-[#334155]">{name}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
