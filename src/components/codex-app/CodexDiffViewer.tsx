import React from 'react';
import { motion } from 'framer-motion';
import { Chat, ArrowUp, ArrowCounterClockwise, Plus, Check } from '@phosphor-icons/react';

export interface CodexDiffViewerProps {
  onStageAll?: () => void;
  onRevertAll?: () => void;
}

export const CodexDiffViewer: React.FC<CodexDiffViewerProps> = ({
  onStageAll,
  onRevertAll,
}) => {
  return (
    <div className="w-full max-w-6xl h-[780px] bg-white rounded-2xl shadow-2xl border border-zinc-200/80 flex overflow-hidden font-sans select-none">
      {/* Left Chat Pane */}
      <div className="w-1/2 border-r border-zinc-200/80 flex flex-col p-6 bg-white">
        <div className="text-xs font-semibold text-zinc-500 mb-3">Fixing nested button issue</div>
        
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 text-sm text-zinc-800 leading-relaxed">
          <p>
            I'll remove the nested &lt;button&gt; issue by turning the outer card control into a non-button element with button semantics, then run a build.
          </p>

          <p>
            Fixed. The error was caused by a &lt;button&gt; (delete) inside another &lt;button&gt; (card).
          </p>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Validation: npm run build succeeds.</span>
          </div>

          <p className="text-xs text-zinc-500">
            This removes the invalid nested button and the hydration error.
          </p>
        </div>

        {/* Input Bar with 1 comment chip */}
        <div className="mt-4 pt-4 border-t border-zinc-100">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 rounded-md text-xs font-semibold text-zinc-800 mb-2">
            <Chat className="w-3.5 h-3.5 text-zinc-600" />
            <span>1 comment</span>
          </div>

          <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3 flex flex-col gap-2.5">
            <div className="text-sm text-zinc-700 font-medium">Address review comments</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-zinc-200/60 rounded text-xs text-zinc-700 font-medium">Agent</span>
                <span className="px-2 py-0.5 bg-zinc-200/60 rounded text-xs text-zinc-700 font-medium">GPT-5.2-Codex</span>
                <span className="px-2 py-0.5 bg-zinc-200/60 rounded text-xs text-zinc-700 font-medium">Medium</span>
              </div>
              <button className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Diff Pane */}
      <div className="w-1/2 flex flex-col bg-white overflow-hidden">
        {/* Diff Header */}
        <div className="h-11 bg-zinc-50/80 border-b border-zinc-200/80 flex items-center justify-between px-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800">app/page.tsx</span>
            <span className="text-emerald-600 font-medium">+648</span>
            <span className="text-rose-600 font-medium">-302</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span>Unstaged 31</span>
            <span>Staged 1</span>
          </div>
        </div>

        {/* Diff Code Table */}
        <div className="flex-1 overflow-y-auto font-mono text-xs">
          <div className="flex border-b border-zinc-100">
            <div className="w-12 py-1 px-2 text-right text-zinc-400 bg-zinc-50 select-none">21</div>
            <div className="flex-1 py-1 px-3 text-zinc-700">const DB_NAME = "photobooth.db";</div>
          </div>
          <div className="flex border-b border-zinc-100">
            <div className="w-12 py-1 px-2 text-right text-zinc-400 bg-zinc-50 select-none">22</div>
            <div className="flex-1 py-1 px-3 text-zinc-700">const DB_VERSION = 1;</div>
          </div>
          <div className="flex bg-emerald-50 text-emerald-900 border-b border-emerald-100">
            <div className="w-12 py-1 px-2 text-right text-emerald-700 bg-emerald-100/70 select-none">24</div>
            <div className="flex-1 py-1 px-3">+ const LOCAL_STORAGE_MAX_PHOTOS = 8;</div>
          </div>
          <div className="flex bg-emerald-50 text-emerald-900 border-b border-emerald-100">
            <div className="w-12 py-1 px-2 text-right text-emerald-700 bg-emerald-100/70 select-none">25</div>
            <div className="flex-1 py-1 px-3">+ const LOCAL_STORAGE_MAX_CHARS = 4_000_000;</div>
          </div>

          {/* Inline Comment */}
          <div className="my-3 mx-4 p-3 bg-white rounded-xl border border-zinc-200 shadow-md flex flex-col gap-1 font-sans">
            <div className="text-[11px] text-zinc-400">Review comment on line 103</div>
            <div className="text-sm font-medium text-zinc-900">change this to gpt-5.2</div>
          </div>

          <div className="flex bg-emerald-50 text-emerald-900 border-b border-emerald-100">
            <div className="w-12 py-1 px-2 text-right text-emerald-700 bg-emerald-100/70 select-none">103</div>
            <div className="flex-1 py-1 px-3">+ model: "gpt-5.2",</div>
          </div>
          <div className="flex border-b border-zinc-100">
            <div className="w-12 py-1 px-2 text-right text-zinc-400 bg-zinc-50 select-none">104</div>
            <div className="flex-1 py-1 px-3 text-zinc-700">instructions:</div>
          </div>
        </div>

        {/* Floating Action Pill */}
        <div className="p-4 border-t border-zinc-100 flex items-center justify-end gap-2 bg-white">
          <button 
            onClick={onRevertAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <ArrowCounterClockwise className="w-3.5 h-3.5" />
            <span>Revert all</span>
          </button>
          <button 
            onClick={onStageAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Stage all</span>
          </button>
        </div>
      </div>
    </div>
  );
};
