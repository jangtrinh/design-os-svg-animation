import React, { useState } from 'react';
import { CodexHeroInput } from './CodexHeroInput';
import { CodexDesktopWindow } from './CodexDesktopWindow';
import { CodexPrModal } from './CodexPrModal';
import { CodexDiffViewer } from './CodexDiffViewer';
import { FlashStashPhotobooth } from './FlashStashPhotobooth';

export const CodexAppShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'input' | 'window' | 'diff' | 'photobooth'>('window');
  const [isPrModalOpen, setIsPrModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
      {/* Top Section Navigation */}
      <nav className="mb-6 flex items-center gap-2 bg-slate-800/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-lg">
        <button
          onClick={() => setActiveTab('input')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'input' ? 'bg-white text-slate-900 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Hero Input Bar
        </button>
        <button
          onClick={() => setActiveTab('window')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'window' ? 'bg-white text-slate-900 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Desktop Execution
        </button>
        <button
          onClick={() => setActiveTab('diff')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'diff' ? 'bg-white text-slate-900 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Diff Viewer
        </button>
        <button
          onClick={() => setActiveTab('photobooth')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'photobooth' ? 'bg-white text-slate-900 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          4. Flash Stash App
        </button>
        <button
          onClick={() => setIsPrModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
        >
          Open PR Modal
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="w-full flex justify-center">
        {activeTab === 'input' && <CodexHeroInput />}
        {activeTab === 'window' && (
          <CodexDesktopWindow 
            onReviewChanges={() => setActiveTab('diff')}
            onOpenCommitModal={() => setIsPrModalOpen(true)}
          />
        )}
        {activeTab === 'diff' && <CodexDiffViewer />}
        {activeTab === 'photobooth' && <FlashStashPhotobooth />}
      </div>

      {/* PR Creation Modal */}
      <CodexPrModal 
        isOpen={isPrModalOpen} 
        onClose={() => setIsPrModalOpen(false)} 
      />
    </div>
  );
};
