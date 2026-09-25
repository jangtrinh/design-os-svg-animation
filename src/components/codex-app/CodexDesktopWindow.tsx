import React from 'react';
import { motion } from 'framer-motion';
import { Plus, NotePencil, Clock, SquaresFour, PushPin, Folder, Play, Code, Laptop, GitBranch, CaretRight, Lock, Microphone, Square, ArrowUpRight, DotsThree } from '@phosphor-icons/react';

export interface CodexDesktopWindowProps {
  onReviewChanges?: () => void;
  onOpenCommitModal?: () => void;
}

export const CodexDesktopWindow: React.FC<CodexDesktopWindowProps> = ({
  onReviewChanges,
  onOpenCommitModal,
}) => {
  const steps = [
    { label: 'Explored 1 file, 4 searches, 1 list', isCode: false },
    { label: 'Edited page.tsx +3 -1', isCode: true },
    { label: 'Edited page.tsx +58 -0', isCode: true },
    { label: 'Explored 1 file', isCode: false },
    { label: 'Edited page.tsx +2 -0', isCode: true },
    { label: 'Edited page.tsx +14 -1', isCode: true },
    { label: 'Explored 1 file, 1 search', isCode: false },
  ];

  return (
    <div className="w-full max-w-6xl h-[780px] bg-white rounded-2xl shadow-2xl border border-zinc-200/80 flex overflow-hidden font-sans select-none">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-50/80 border-r border-zinc-200/70 flex flex-col p-4">
        {/* macOS Traffic Lights */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
          </div>
        </div>

        {/* Top Navigation */}
        <div className="flex flex-col gap-1 mb-5">
          <div className="flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100/80 cursor-pointer">
            <NotePencil className="w-4 h-4 text-zinc-500" />
            <span>New thread</span>
          </div>
          <div className="flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100/80 cursor-pointer">
            <Clock className="w-4 h-4 text-zinc-500" />
            <span>Automations</span>
          </div>
          <div className="flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100/80 cursor-pointer">
            <SquaresFour className="w-4 h-4 text-zinc-500" />
            <span>Skills</span>
          </div>
        </div>

        {/* Pinned Threads */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center justify-between px-2.5 py-1 rounded-md text-xs text-zinc-600 hover:bg-zinc-100 cursor-pointer">
            <div className="flex items-center gap-2 truncate">
              <PushPin className="w-3.5 h-3.5 text-zinc-400 rotate-45" />
              <span className="truncate">Photobooth polish</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">3d</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1 rounded-md text-xs text-zinc-600 hover:bg-zinc-100 cursor-pointer">
            <div className="flex items-center gap-2 truncate">
              <PushPin className="w-3.5 h-3.5 text-zinc-400 rotate-45" />
              <span className="truncate">Create a video game</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">2d</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1 rounded-md text-xs text-zinc-600 hover:bg-zinc-100 cursor-pointer">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="truncate">Brainstorming new features</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">3d</span>
          </div>
        </div>

        {/* Section: Threads */}
        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mt-2 mb-1">
          <span>Threads</span>
          <Plus className="w-3.5 h-3.5 text-zinc-500 cursor-pointer" />
        </div>

        <div className="flex flex-col gap-0.5 overflow-y-auto">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 hover:bg-zinc-100/80 cursor-pointer">
            <Folder className="w-3.5 h-3.5 text-zinc-400" />
            <span>recipe-app</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs bg-zinc-200/70 font-medium text-zinc-900 cursor-pointer">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full border border-blue-600 animate-spin" />
              <span className="truncate">Add drag and drop to gallery...</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">3m</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 hover:bg-zinc-100/80 cursor-pointer">
            <Folder className="w-3.5 h-3.5 text-zinc-400" />
            <span>photobooth</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 hover:bg-zinc-100/80 cursor-pointer">
            <Folder className="w-3.5 h-3.5 text-zinc-400" />
            <span>developers-website</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Top Window Bar */}
        <header className="h-14 border-b border-zinc-200/80 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-zinc-900">Add drag and drop to gallery photos</h3>
            <span className="text-xs text-zinc-400">photobooth</span>
            <DotsThree className="w-4 h-4 text-zinc-400 cursor-pointer" />
          </div>

          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors">
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              <Code className="w-3.5 h-3.5" />
              <span>Open</span>
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              <Laptop className="w-3.5 h-3.5" />
              <span>Checkout on local</span>
            </button>
            <button 
              onClick={onOpenCommitModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Create branch here</span>
            </button>
          </div>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-5">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-zinc-100 text-zinc-900 px-4 py-2.5 rounded-2xl max-w-lg text-sm leading-relaxed">
              Add drag and drop to the photos in the gallery
            </div>
          </div>

          {/* Execution Steps */}
          <div className="flex flex-col gap-1.5 font-mono text-xs max-w-xl">
            {steps.map((step, idx) => (
              <div key={idx} className={`flex items-center gap-2 ${step.isCode ? 'text-emerald-600' : 'text-zinc-500'}`}>
                <CaretRight className="w-3.5 h-3.5 text-zinc-400" />
                <span>{step.label}</span>
              </div>
            ))}
          </div>

          {/* AI Markdown Explanation */}
          <div className="text-sm text-zinc-800 leading-relaxed max-w-2xl">
            <p>
              Added HTML5 drag-and-drop reordering for the gallery photos with visual feedback (highlight on drop target, slight opacity on the dragged card) and persistence via the existing photos state. The images are set non-draggable so the card itself is the drag source, and drag is disabled while generating to match the rest of the UI.
            </p>
            <p className="mt-3 font-medium text-zinc-900">Files touched</p>
            <p className="text-blue-600 font-mono text-xs mt-0.5">
              • page.tsx <span className="text-zinc-500">(drag state + handlers, draggable list items)</span>
            </p>
          </div>

          {/* Thinking Status */}
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Thinking</span>
          </div>
        </div>

        {/* Bottom Dock */}
        <footer className="p-6 border-t border-zinc-100 bg-white">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2 font-medium text-zinc-600">
              <span>1 file changed</span>
              <span className="text-emerald-600 font-semibold">+77</span>
              <span className="text-rose-600 font-semibold">-2</span>
            </div>
            <button 
              onClick={onReviewChanges}
              className="flex items-center gap-1 font-semibold text-zinc-900 hover:text-blue-600 transition-colors"
            >
              <span>Review changes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3 flex flex-col gap-3">
            <div className="text-sm text-zinc-400">Ask for follow-up changes</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-200/50">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2.5 py-1 bg-zinc-100 rounded-md text-xs font-medium text-zinc-700">GPT-5.2-Codex</span>
                <span className="px-2.5 py-1 bg-zinc-100 rounded-md text-xs font-medium text-zinc-700">Extra high</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <Microphone className="w-3.5 h-3.5 text-zinc-400" />
                <button className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                  <Square className="w-3 h-3 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
