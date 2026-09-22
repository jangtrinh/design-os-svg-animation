import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Lock, 
  Mic, 
  ArrowUp, 
  GitBranch, 
  Folder, 
  Check, 
  ChevronDown, 
  Gamepad2, 
  Search, 
  FileText 
} from 'lucide-react';

export interface CodexHeroInputProps {
  initialWorkspace?: string;
  onWorkspaceChange?: (workspace: string) => void;
  onSubmitPrompt?: (prompt: string, mode: 'local' | 'worktree' | 'cloud') => void;
}

export const CodexHeroInput: React.FC<CodexHeroInputProps> = ({
  initialWorkspace = 'recipe-app',
  onWorkspaceChange,
  onSubmitPrompt,
}) => {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mode, setMode] = useState<'local' | 'worktree' | 'cloud'>('local');
  const [prompt, setPrompt] = useState('Localize my app and add the option to change units');

  const workspaces = [
    { name: 'recipe-app', badge: null },
    { name: 'My Skills', badge: 'skills' },
    { name: 'photobooth', badge: null },
    { name: 'developers-website', badge: null },
    { name: 'wanderlust', badge: null },
    { name: 'openai-apps-sdk-examples', badge: null },
  ];

  const handleSelectWorkspace = (name: string) => {
    setWorkspace(name);
    setIsDropdownOpen(false);
    onWorkspaceChange?.(name);
  };

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmitPrompt?.(prompt, mode);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-4xl mx-auto font-sans">
      {/* Header Unit */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8 relative"
      >
        <svg 
          className="w-14 h-14 mb-4 text-zinc-900" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
          <path d="M9 13l2 2-2 2M13 17h3"/>
        </svg>

        <h2 className="text-4xl font-medium tracking-tight text-zinc-900">Let's build</h2>

        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 text-3xl font-normal text-zinc-500 hover:text-zinc-800 transition-colors mt-1 focus:outline-none"
        >
          <span>{workspace}</span>
          <ChevronDown className={`w-6 h-6 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Popover */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-36 z-50 w-72 bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-2"
            >
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-3 py-2">
                Select your workspace
              </div>
              <div className="flex flex-col gap-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.name}
                    onClick={() => handleSelectWorkspace(ws.name)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                      ws.name === workspace ? 'bg-zinc-100 font-medium text-zinc-900' : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 text-zinc-500" />
                      <span>{ws.name}</span>
                    </div>
                    {ws.name === workspace && <Check className="w-4 h-4 text-zinc-900" />}
                    {ws.badge && (
                      <span className="text-[10px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded">
                        {ws.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Input Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-900/5 p-6 flex flex-col gap-4"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          className="w-full text-xl text-zinc-900 placeholder-zinc-400 resize-none outline-none font-normal leading-relaxed"
          placeholder="Ask Codex anything, @ to add files, / for commands"
        />

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <div className="flex items-center gap-2.5">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 text-sm font-medium cursor-pointer hover:bg-zinc-200/70 transition-colors">
              <span>GPT-5.2-Codex</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 text-sm font-medium cursor-pointer hover:bg-zinc-200/70 transition-colors">
              <span>Extra high</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <Lock className="w-4 h-4" />
            </button>
            <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSubmit}
              className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-md hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sub-bar Mode Toggle */}
      <div className="w-full flex items-center justify-between px-3 mt-3 text-sm text-zinc-500">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setMode('local')}
            className={`font-medium transition-colors ${mode === 'local' ? 'text-zinc-900 font-semibold' : 'hover:text-zinc-700'}`}
          >
            Local
          </button>
          <button 
            onClick={() => setMode('worktree')}
            className={`font-medium transition-colors ${mode === 'worktree' ? 'text-zinc-900 font-semibold' : 'hover:text-zinc-700'}`}
          >
            Worktree
          </button>
          <button 
            onClick={() => setMode('cloud')}
            className={`font-medium transition-colors ${mode === 'cloud' ? 'text-zinc-900 font-semibold' : 'hover:text-zinc-700'}`}
          >
            Cloud
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-600">
          <GitBranch className="w-4 h-4" />
          <span>main</span>
        </div>
      </div>

      {/* Suggestion Cards Row */}
      <div className="grid grid-cols-3 gap-4 w-full mt-8">
        <div className="p-4 bg-white/80 border border-zinc-200/70 rounded-2xl shadow-sm hover:border-zinc-300 transition-all cursor-pointer">
          <Gamepad2 className="w-5 h-5 text-zinc-600 mb-3" />
          <p className="text-sm font-medium text-zinc-800">Create a classic snake game</p>
        </div>
        <div className="p-4 bg-white/80 border border-zinc-200/70 rounded-2xl shadow-sm hover:border-zinc-300 transition-all cursor-pointer">
          <Search className="w-5 h-5 text-zinc-600 mb-3" />
          <p className="text-sm font-medium text-zinc-800">Find and fix a bugs in my code</p>
        </div>
        <div className="p-4 bg-white/80 border border-zinc-200/70 rounded-2xl shadow-sm hover:border-zinc-300 transition-all cursor-pointer">
          <FileText className="w-5 h-5 text-zinc-600 mb-3" />
          <p className="text-sm font-medium text-zinc-800">Summarize this app in a $pdf</p>
        </div>
      </div>
    </div>
  );
};
