import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, GripHorizontal } from 'lucide-react';
import { manualRegions } from './data';

interface ManualHeritageProps {
  onSave: (regions: string[], confidence: number, notes: string) => void;
  onClose: () => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function ManualHeritage({ onSave, onClose }: ManualHeritageProps) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState('');

  const toggleRegion = (id: string) => {
    setSelectedRegions(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave(selectedRegions, confidence, notes);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex flex-col justify-end"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-[#1E293B] rounded-t-3xl max-h-[85vh] overflow-y-auto"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <GripHorizontal className="w-6 h-6 text-[#64748B]" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <h3 className="font-body text-lg font-semibold text-white mb-2">
            Tell Us About Your Family&apos;s Heritage
          </h3>
          <p className="text-xs text-[#64748B] mb-5">
            Select the regions your family identifies with. This helps us curate relevant content.
          </p>

          {/* Region Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {manualRegions.map((region, i) => {
              const isSelected = selectedRegions.includes(region.id);
              return (
                <motion.button
                  key={region.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, ease: easeOutExpo }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleRegion(region.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex items-center gap-2 ${
                    isSelected
                      ? 'border-[#00C853] bg-[rgba(0,200,83,0.08)]'
                      : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]'
                  }`}
                >
                  <span className="text-lg">{region.flag}</span>
                  <span className={`text-xs font-medium ${isSelected ? 'text-[#00C853]' : 'text-[#CBD5E1]'}`}>
                    {region.name}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#00C853] ml-auto" />}
                </motion.button>
              );
            })}
          </div>

          {/* Free Text */}
          <div className="mb-6">
            <label className="text-xs text-[#64748B] mb-2 block">
              Any specific countries or cultures? (optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., Nigeria, Ghana, Jamaica..."
              rows={3}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white placeholder-[#334155] focus:outline-none focus:border-[#00C853] transition-all resize-none"
            />
          </div>

          {/* Confidence Slider */}
          <div className="mb-6">
            <label className="text-xs text-[#64748B] mb-3 block">
              How sure are you about these regions?
            </label>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => setConfidence(val)}
                  className={`flex-1 h-2 rounded-full transition-all duration-200 ${
                    val <= confidence ? 'bg-[#00C853]' : 'bg-[#1E293B]'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-[#64748B]">
              <span>Not sure</span>
              <span>Very certain</span>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={selectedRegions.length === 0}
            className={`glass-btn w-full ${selectedRegions.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Save Heritage Info
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
