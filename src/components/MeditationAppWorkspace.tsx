import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";

const EASE_SPRING = [0.16, 1, 0.3, 1] as const;

export interface MeditationAppWorkspaceProps {
  onNextScene?: () => void;
}

export const MeditationAppWorkspace: React.FC<MeditationAppWorkspaceProps> = ({
  onNextScene,
}) => {
  // State
  const [colorTheme, setColorTheme] = useState<"Default" | "Moss" | "Dusk">("Default");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isTweaksOpen, setIsTweaksOpen] = useState<boolean>(true);

  // Comment tool state
  const [activeTool, setActiveTool] = useState<"select" | "comment">("select");
  const [hasCommentPin, setHasCommentPin] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("Add a dark mode toggle");
  const [isCommentSubmitted, setIsCommentSubmitted] = useState<boolean>(false);
  const [hasDarkModeControl, setHasDarkModeControl] = useState<boolean>(false);

  // Countdown timer simulation for "Forest Rain"
  const [secondsLeft, setSecondsLeft] = useState<number>(14 * 60 + 28); // 14:28
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Theme palettes for the iOS meditation app
  const themes = {
    Default: {
      bg: isDarkMode ? "#1C1917" : "#F5F5F4",
      card: isDarkMode ? "#292524" : "#FFFFFF",
      accent: "#0D9488", // teal-600
      glow: "#2DD4BF",
      textPrimary: isDarkMode ? "#FAFAF9" : "#1C1917",
      textMuted: isDarkMode ? "#A8A29E" : "#78716C",
    },
    Moss: {
      bg: isDarkMode ? "#141A13" : "#F4F7F2",
      card: isDarkMode ? "#1F291E" : "#FFFFFF",
      accent: "#4D7C0F", // moss green
      glow: "#84CC16",
      textPrimary: isDarkMode ? "#F7FEE7" : "#1A2E05",
      textMuted: isDarkMode ? "#A3E635" : "#4D7C0F",
    },
    Dusk: {
      bg: isDarkMode ? "#1E1B2E" : "#F5F3FF",
      card: isDarkMode ? "#2E2A4A" : "#FFFFFF",
      accent: "#7C3AED", // violet
      glow: "#A78BFA",
      textPrimary: isDarkMode ? "#F5F3FF" : "#2E1065",
      textMuted: isDarkMode ? "#C4B5FD" : "#6D28D9",
    },
  };

  const currentTheme = themes[colorTheme];

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "comment" && !hasCommentPin) {
      setHasCommentPin(true);
    }
  };

  const handleApplyComment = () => {
    setIsCommentSubmitted(true);
    // Claude generates the dark mode control into the right panel
    setTimeout(() => {
      setHasDarkModeControl(true);
      setHasCommentPin(false);
      setActiveTool("select");
    }, 600);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex w-full h-screen font-sans transition-colors duration-500 select-none relative ${
        isDarkMode ? "bg-[#0A0A0C] text-[#F4F4F5]" : "bg-[#FAF9F5] text-[#18181B]"
      }`}
    >
      {/* 1. TOP FLOATING TOOLBAR */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1 bg-[#18181B]/90 backdrop-blur border border-[#3F3F46] rounded-full shadow-xl">
        <button
          onClick={() => setActiveTool("select")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
            activeTool === "select"
              ? "bg-[#27272A] text-white"
              : "text-[#A1A1AA] hover:text-white"
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>
          <span>Select</span>
        </button>

        <button
          onClick={() => {
            setActiveTool("comment");
            if (!hasCommentPin) setHasCommentPin(true);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
            activeTool === "comment"
              ? "bg-[#D96B43] text-white shadow-sm"
              : "text-[#A1A1AA] hover:text-white"
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Comment</span>
        </button>

        <button
          onClick={() => setIsTweaksOpen(!isTweaksOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
            isTweaksOpen
              ? "bg-[#27272A] text-white"
              : "text-[#A1A1AA] hover:text-white"
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span>Tweaks</span>
        </button>

        {onNextScene && (
          <button
            onClick={onNextScene}
            className="flex items-center gap-1.5 px-3 py-1.5 ml-2 bg-[#D96B43] hover:bg-[#c2410c] text-white rounded-full text-[12px] font-medium transition-colors cursor-pointer"
          >
            <span>Next: Scene 4</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* 2. MAIN CANVAS AREA (PHONE MOCKUP) */}
      <main
        onClick={handleCanvasClick}
        className="flex-1 h-full flex items-center justify-center p-8 relative overflow-hidden"
      >
        {/* Ambient glow behind device */}
        <div
          className="absolute w-[420px] h-[720px] rounded-[60px] blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
          style={{ background: currentTheme.accent }}
        />

        {/* iOS Phone Mockup Device (320px x 640px) */}
        <motion.div
          layout
          transition={{ duration: 0.5, ease: EASE_SPRING }}
          className="w-[320px] h-[640px] rounded-[48px] border-[6px] border-[#27272A] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_20px_50px_-10px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-between p-6 relative transition-colors duration-500"
          style={{ backgroundColor: currentTheme.bg }}
        >
          {/* Tactile Specular Gloss Sheen Reflection */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-t-[44px] z-20" />

          {/* Dynamic Island / Notch */}
          <div className="w-24 h-5 bg-[#27272A] rounded-full mx-auto mb-2 shrink-0 z-30" />

          {/* Header Title */}
          <div className="flex justify-between items-center mt-2 z-10">
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase opacity-60" style={{ color: currentTheme.textMuted }}>
                Session
              </span>
              <h2 className="text-[20px] font-serif font-bold tracking-tight" style={{ color: currentTheme.textPrimary }}>
                Forest Rain
              </h2>
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: currentTheme.accent }}>
                <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" />
              </svg>
            </div>
          </div>

          {/* Central Enso Breathing Ring & Radial Gradient Pulse */}
          <div className="flex-1 flex flex-col items-center justify-center relative my-4">
            {/* Luminous Radial Gradient Breath Pulse */}
            <motion.div
              animate={{
                scale: [0.85, 1.25, 0.85],
                opacity: [0.25, 0.65, 0.25],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${currentTheme.glow} 0%, ${currentTheme.accent}33 45%, transparent 70%)`,
                filter: "blur(8px)",
              }}
            />

            {/* Enso Ring SVG with Gradient Stroke */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="ensoReactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={currentTheme.glow} />
                    <stop offset="100%" stopColor={currentTheme.accent} />
                  </linearGradient>
                </defs>
                <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth="4" fill="none" className="text-black/10 dark:text-white/10" />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="68"
                  stroke="url(#ensoReactGrad)"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="427"
                  animate={{ strokeDashoffset: [160, 95, 160] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                />
              </svg>

              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg transition-colors duration-500 z-10"
                style={{ backgroundColor: currentTheme.card }}
              >
                <span className="text-[26px] font-mono font-bold tracking-tight" style={{ color: currentTheme.textPrimary }}>
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-[9px] uppercase font-semibold tracking-wider mt-0.5" style={{ color: currentTheme.accent }}>
                  Breathing
                </span>
              </motion.div>
            </div>
          </div>

          {/* Play/Pause & Soundscape Controls */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-2xl transition-colors duration-500 shadow-sm" style={{ backgroundColor: currentTheme.card }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: currentTheme.accent }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[12px] font-medium leading-none" style={{ color: currentTheme.textPrimary }}>Rain Ambient</div>
                  <div className="text-[10px] leading-tight mt-1 opacity-70" style={{ color: currentTheme.textMuted }}>Binaural Beats</div>
                </div>
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white cursor-pointer"
                style={{ backgroundColor: currentTheme.accent }}
              >
                {isPlaying ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* 3. PIN COMMENT TOOL OVERLAY */}
        <AnimatePresence>
          {hasCommentPin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-1/2 left-[62%] z-40 w-72 bg-[#18181B] border border-[#3F3F46] rounded-xl p-3.5 shadow-2xl text-white"
            >
              {/* Pin indicator pointer */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-[#D96B43] flex items-center justify-center text-[10px] font-bold">
                  1
                </div>
                <span className="text-[12px] font-medium text-[#F4F4F5]">Canvas Comment</span>
              </div>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full h-16 bg-[#27272A] border border-[#3F3F46] rounded-lg p-2 text-[12px] text-white focus:outline-none focus:border-[#D96B43] resize-none"
              />

              <div className="flex justify-end gap-2 mt-2.5">
                <button
                  onClick={() => setHasCommentPin(false)}
                  className="px-2.5 py-1 text-[11px] text-[#A1A1AA] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyComment}
                  className="px-3 py-1 bg-[#D96B43] text-white text-[11px] font-medium rounded-lg hover:bg-[#c2410c] transition-colors cursor-pointer"
                >
                  Send
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. RIGHT TWEAKS & CONTROL PANEL */}
      <AnimatePresence>
        {isTweaksOpen && (
          <motion.aside
            key="meditation-tweaks"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_SPRING }}
            className="w-[320px] h-full bg-[#27272A] border-l border-[#3F3F46] p-5 overflow-y-auto flex flex-col gap-6 z-20 shrink-0 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#3F3F46]">
              <span className="font-medium text-[15px]">Tweaks Panel</span>
              <button onClick={() => setIsTweaksOpen(false)} className="text-[#A1A1AA] hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* COLOR PALETTE (Nature Themes: Default -> Moss) */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                Color Palette
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["Default", "Moss", "Dusk"] as const).map((themeName) => (
                  <button
                    key={themeName}
                    onClick={() => setColorTheme(themeName)}
                    className={`py-2 px-3 rounded-lg text-[12px] font-medium border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      colorTheme === themeName
                        ? "bg-[#18181B] border-[#D96B43] text-white shadow-sm"
                        : "bg-[#1F1F23] border-[#3F3F46] text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          themeName === "Default"
                            ? "#0D9488"
                            : themeName === "Moss"
                            ? "#4D7C0F"
                            : "#7C3AED",
                      }}
                    />
                    <span>{themeName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* DYNAMIC INTEGRATION: Dark Mode Switch generated from Comment */}
            {hasDarkModeControl && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 p-3 bg-[#18181B] border border-[#059669]/40 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                    <span className="text-[12px] font-medium text-[#F4F4F5]">Dark Mode Toggle</span>
                  </div>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      isDarkMode ? "bg-[#D96B43] justify-end" : "bg-[#3F3F46] justify-start"
                    }`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" />
                  </button>
                </div>
                <span className="text-[10px] text-[#A1A1AA]">
                  Generated from canvas comment: &quot;Add a dark mode toggle&quot;
                </span>
              </motion.div>
            )}

            {/* Soundscape Ambience */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                Soundscape
              </span>
              <div className="flex items-center justify-between text-[13px] text-[#E4E4E7]">
                <span>Volume</span>
                <span className="font-mono text-[#A1A1AA]">72%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="72"
                className="w-full accent-[#D96B43]"
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};
