import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitCommit, Check, Loader2, X } from 'lucide-react';

export interface CodexPrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const CodexPrModal: React.FC<CodexPrModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      return;
    }

    const timer1 = setTimeout(() => setStep(2), 1500);
    const timer2 = setTimeout(() => setStep(3), 3200);
    const timer3 = setTimeout(() => {
      setStep(4);
      onComplete?.();
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200/80 p-6 flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GitCommit className="w-5 h-5 text-zinc-900" />
            <h3 className="text-base font-semibold text-zinc-900">
              {step < 4 ? 'Committing changes' : 'Pull request created'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-500 -mt-2">
          {step < 4 ? 'Hold tight, this may take a few moments...' : 'Branch successfully pushed and PR opened.'}
        </p>

        {/* Steps List */}
        <div className="flex flex-col gap-3 mt-2">
          {/* Step 1 */}
          <div className="flex items-center gap-3 text-sm text-zinc-700">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'
            }`}>
              <Check className="w-3 h-3" />
            </div>
            <span className={step >= 1 ? 'text-zinc-900 font-medium' : ''}>Committed changes</span>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3 text-sm text-zinc-700">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              step > 2 ? 'bg-emerald-100 text-emerald-600' : step === 2 ? 'text-blue-600' : 'bg-zinc-100 text-zinc-400'
            }`}>
              {step > 2 ? <Check className="w-3 h-3" /> : step === 2 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />}
            </div>
            <span className={step >= 2 ? 'text-zinc-900 font-medium' : 'text-zinc-400'}>
              Pushing to branch codex/add-drag-and-drop-to-gallery-photos
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3 text-sm text-zinc-700">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              step >= 4 ? 'bg-emerald-100 text-emerald-600' : step === 3 ? 'text-blue-600' : 'bg-zinc-100 text-zinc-400'
            }`}>
              {step >= 4 ? <Check className="w-3 h-3" /> : step === 3 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />}
            </div>
            <span className={step >= 3 ? 'text-zinc-900 font-medium' : 'text-zinc-400'}>
              Creating a pull request
            </span>
          </div>
        </div>

        {step === 4 && (
          <div className="mt-2 pt-3 border-t border-zinc-100 flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
