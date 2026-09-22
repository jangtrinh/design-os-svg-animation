import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pin } from 'lucide-react';

export const FlashStashPhotobooth: React.FC = () => {
  const [headingScale, setHeadingScale] = useState<number>(1);

  return (
    <div className="relative w-full max-w-6xl h-[780px] bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 flex overflow-hidden font-sans select-none">
      {/* Main Browser Window */}
      <div className="flex-1 flex flex-col bg-[#141311]">
        {/* Browser Top Bar */}
        <header className="h-11 bg-[#211F1C] border-b border-white/5 flex items-center justify-between px-4">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>

          <div className="w-80 h-7 bg-white/5 rounded-md flex items-center justify-center font-mono text-xs text-zinc-400">
            http://localhost:3000
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-md text-xs text-zinc-300">
            <span>Ask ChatGPT</span>
          </div>
        </header>

        {/* Photobooth Body */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <motion.h1 
            animate={{ scale: headingScale }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="text-7xl md:text-8xl font-black text-[#FAF5E8] tracking-widest text-center leading-none mb-8 uppercase"
          >
            FLASH<br />STASH
          </motion.h1>

          {/* 3D Hardware Photobooth Device */}
          <div className="relative w-72 h-96 bg-gradient-to-b from-[#2D2C28] to-[#1B1A17] rounded-[32px] border border-white/10 shadow-2xl flex flex-col items-center p-5">
            {/* Corner Screws */}
            <span className="absolute top-4 left-4 w-2.5 h-2.5 rounded-full bg-[#888680] shadow-inner" />
            <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#888680] shadow-inner" />
            <span className="absolute bottom-4 left-4 w-2.5 h-2.5 rounded-full bg-[#888680] shadow-inner" />
            <span className="absolute bottom-4 right-4 w-2.5 h-2.5 rounded-full bg-[#888680] shadow-inner" />

            {/* Sensors Row */}
            <div className="w-full flex items-center justify-between px-3 mb-6">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
              </div>

              {/* Camera Lens */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border-2 border-slate-600 shadow-inner flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-black/80 border border-slate-700" />
              </div>

              {/* Speaker Grille */}
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="w-1 h-1 rounded-full bg-black/70" />
                ))}
              </div>
            </div>

            {/* Printed Polaroid Photo */}
            <div className="w-52 bg-[#F4F1EA] rounded-md p-2.5 pb-5 shadow-xl flex flex-col items-center">
              <div className="w-full h-40 bg-slate-800 rounded overflow-hidden">
                <svg viewBox="0 0 200 200" className="w-full h-full bg-slate-300">
                  <circle cx="100" cy="110" r="55" fill="#4ADE80"/>
                  <circle cx="75" cy="70" r="16" fill="#4ADE80"/>
                  <circle cx="125" cy="70" r="16" fill="#4ADE80"/>
                  <circle cx="75" cy="70" r="8" fill="#1E293B"/>
                  <circle cx="125" cy="70" r="8" fill="#1E293B"/>
                  <path d="M65 115 Q100 135 135 115" stroke="#1E293B" strokeWidth="3" fill="none"/>
                  <path d="M60 140 L140 140 L150 200 L50 200 Z" fill="#111827"/>
                  <text x="100" y="172" fill="#FFFFFF" fontSize="10" fontWeight="700" textAnchor="middle">OpenAI</text>
                </svg>
              </div>
              <div className="w-full flex justify-between font-mono text-[10px] text-stone-500 mt-2 px-1">
                <span>SHOT 7</span>
                <span>08:17 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mini Companion Window */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-12 right-12 w-80 bg-white rounded-xl shadow-2xl border border-zinc-200/90 flex flex-col overflow-hidden text-xs"
      >
        <div className="h-9 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between px-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>
          <span className="font-semibold text-zinc-800">Photobooth polish</span>
          <Pin className="w-3.5 h-3.5 text-zinc-400 rotate-45" />
        </div>

        <div className="p-3 flex flex-col gap-2.5 max-h-72 overflow-y-auto">
          <div className="self-end bg-zinc-100 px-2.5 py-1.5 rounded-xl text-zinc-800">
            remove the emoji in the heading
          </div>
          <div className="text-zinc-600">
            Removed the emoji from the heading, and npm run build passes.
          </div>
          <div className="self-end bg-zinc-100 px-2.5 py-1.5 rounded-xl text-zinc-800">
            make the heading twice as large
          </div>
          <div className="text-zinc-600">
            Done — the heading is now twice as large (text-8xl / md:text-9xl). Build passes.
          </div>
        </div>

        <div className="p-2.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-zinc-400">Ask for follow-up changes</span>
          <button 
            onClick={() => setHeadingScale(headingScale === 1 ? 1.15 : 1)}
            className="px-2 py-0.5 bg-zinc-900 text-white rounded text-[10px] font-medium"
          >
            Toggle Size
          </button>
        </div>
      </motion.div>
    </div>
  );
};
