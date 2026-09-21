import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  FileText,
  BarChart3,
  Palette,
  Globe,
  Zap,
  Copy,
  Check,
  Terminal,
} from "lucide-react";

const EASE_SPRING = [0.16, 1, 0.3, 1] as const;

export interface ExportHandoffModalProps {
  onRestartShowcase?: () => void;
}

export const ExportHandoffModal: React.FC<ExportHandoffModalProps> = ({
  onRestartShowcase,
}) => {
  const [isExportOpen, setIsExportOpen] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<"none" | "claude-code" | "outro">("claude-code");
  const [copied, setCopied] = useState<boolean>(false);

  const CLI_COMMAND = "claude code handoff https://claude.ai/design/p/hemlark-retreat-26";

  const handleCopy = () => {
    navigator.clipboard?.writeText(CLI_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    setActiveModal("outro");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-[#121214] text-[#F4F4F5] font-sans select-none relative overflow-hidden">
      {/* Background Dimmed Interface */}
      <div className="absolute inset-0 bg-[#0A0A0C]/80 backdrop-blur-sm z-10" />

      {/* Top Right Floating Export Menu */}
      <div className="absolute top-6 right-8 z-20">
        <button
          onClick={() => setIsExportOpen(!isExportOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-[#D96B43] hover:bg-[#c2410c] text-white rounded-lg text-[13px] font-medium transition-colors cursor-pointer shadow-lg"
        >
          <span>Export</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isExportOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-2 w-56 bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl py-1.5 z-30"
            >
              {[
                { label: ".zip archive", icon: <Archive className="w-4 h-4 text-[#A1A1AA]" /> },
                { label: "PDF document", icon: <FileText className="w-4 h-4 text-[#A1A1AA]" /> },
                { label: "PPTX presentation", icon: <BarChart3 className="w-4 h-4 text-[#A1A1AA]" /> },
                { label: "Send to Canva", icon: <Palette className="w-4 h-4 text-[#A1A1AA]" /> },
                { label: "Standalone HTML", icon: <Globe className="w-4 h-4 text-[#A1A1AA]" /> },
                { label: "Handoff to Claude Code", icon: <Zap className="w-4 h-4 text-[#D96B43]" />, highlight: true },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.highlight) {
                      setActiveModal("claude-code");
                    }
                  }}
                  className={`w-full px-3.5 py-2 text-left text-[13px] flex items-center gap-2.5 transition-colors cursor-pointer ${
                    item.highlight
                      ? "bg-[#D96B43]/15 text-[#D96B43] font-medium hover:bg-[#D96B43]/25"
                      : "text-[#E4E4E7] hover:bg-[#27272A]"
                  }`}
                >
                  <span className="flex items-center justify-center">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* POPUP MODAL: HANDOFF TO CLAUDE CODE */}
      <AnimatePresence>
        {activeModal === "claude-code" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.35, ease: EASE_SPRING }}
            className="w-full max-w-lg bg-[#18181B] border border-[#27272A] rounded-2xl p-6 shadow-2xl z-30 relative"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#D96B43]/20 flex items-center justify-center text-[#D96B43]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-white">Handoff to Claude Code</h3>
                <p className="text-[12px] text-[#A1A1AA]">
                  Pull this prototype directly into your local terminal workspace
                </p>
              </div>
            </div>

            {/* Terminal Command Box */}
            <div className="bg-[#0A0A0C] border border-[#27272A] rounded-xl p-3.5 mb-5 flex items-center justify-between font-mono text-[13px] relative overflow-hidden shadow-inner">
              {/* Active Copy Ripple Wave */}
              <motion.div
                initial={false}
                animate={{
                  scale: copied ? 35 : 0,
                  opacity: copied ? [0.6, 0.2, 0] : 0,
                }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-12 top-1/2 w-4 h-4 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(52, 211, 153, 0.4) 0%, rgba(52, 211, 153, 0.15) 50%, transparent 70%)",
                }}
              />

              {/* Syntax Token Spans */}
              <div className="flex items-center gap-2 overflow-x-auto pr-3 z-10 select-all">
                <span className="text-[#71717A] font-semibold select-none">$</span>
                <span className="whitespace-nowrap flex items-center gap-1.5">
                  <span className="text-[#D96B43] font-semibold">claude</span>
                  <span className="text-[#60A5FA] font-medium">code</span>
                  <span className="text-[#C084FC] font-medium">handoff</span>
                  <span className="text-[#F4F4F5] flex items-center">
                    <span className="text-[#71717A]">https://</span>
                    <span className="text-[#34D399] font-medium">claude.ai</span>
                    <span className="text-[#FBBF24]">/design/p/hemlark-retreat-26</span>
                  </span>
                </span>
              </div>

              {/* Copy Button with Copied State */}
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-lg transition-all duration-200 cursor-pointer shrink-0 z-10 ${
                  copied
                    ? "bg-[#059669] text-white border border-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    : "bg-[#27272A] hover:bg-[#3F3F46] text-[#F4F4F5] border border-[#3F3F46]"
                }`}
              >
                <span className="flex items-center">
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  )}
                </span>
                <span>{copied ? "Copied!" : "Copy command"}</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setActiveModal("none")}
                className="px-4 py-2 text-[13px] text-[#A1A1AA] hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handleFinish}
                className="px-4 py-2 bg-[#D96B43] hover:bg-[#c2410c] text-white rounded-lg text-[13px] font-medium transition-colors cursor-pointer shadow"
              >
                Done & View Finale
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FINALE OUTRO: PURE WHITE + CLAUDE LOGO & SERIF WORDMARK */}
      <AnimatePresence>
        {activeModal === "outro" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 bg-[#FFFFFF] flex flex-col items-center justify-center select-none"
          >
            {/* Spinning Claude Multi-wing Star */}
            <motion.div
              initial={{ scale: 0.8, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE_SPRING }}
              className="text-[#18181B] mb-4"
            >
              <svg className="w-16 h-16" viewBox="0 0 256 257" fill="currentColor">
                <path d="m50.228 170.321 50.357-28.257.843-2.463-.843-1.361h-2.462l-8.426-.518-28.775-.778-24.952-1.037-24.175-1.296-6.092-1.297L0 125.796l.583-3.759 5.12-3.434 7.324.648 16.202 1.101 24.304 1.685 17.629 1.037 26.118 2.722h4.148l.583-1.685-1.426-1.037-1.101-1.037-25.147-17.045-27.22-18.017-14.258-10.37-7.713-5.25-3.888-4.925-1.685-10.758 7-7.713 9.397.649 2.398.648 9.527 7.323 20.35 15.75L94.817 91.9l3.889 3.24 1.555-1.102.195-.777-1.75-2.917-14.453-26.118-15.425-26.572-6.87-11.018-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0 82.05 1.426l4.472 3.888 6.61 15.101 10.694 23.786 16.591 32.34 4.861 9.592 2.592 8.879.973 2.722h1.685v-1.556l1.36-18.211 2.528-22.36 2.463-28.776.843-8.1 4.018-9.722 7.971-5.25 6.222 2.981 5.12 7.324-.713 4.73-3.046 19.768-5.962 30.98-3.889 20.739h2.268l2.593-2.593 10.499-13.934 17.628-22.036 7.778-8.749 9.073-9.657 5.833-4.601h11.018l8.1 12.055-3.628 12.443-11.342 14.388-9.398 12.184-13.48 18.147-8.426 14.518.778 1.166 2.01-.194 30.46-6.481 16.462-2.982 19.637-3.37 8.88 4.148.971 4.213-3.5 8.62-20.998 5.184-24.628 4.926-36.682 8.685-.454.324.519.648 16.526 1.555 7.065.389h17.304l32.21 2.398 8.426 5.574 5.055 6.805-.843 5.184-12.962 6.611-17.498-4.148-40.83-9.721-14-3.5h-1.944v1.167l11.666 11.406 21.387 19.314 26.767 24.887 1.36 6.157-3.434 4.86-3.63-.518-23.526-17.693-9.073-7.972-20.545-17.304h-1.36v1.814l4.73 6.935 25.017 37.59 1.296 11.536-1.814 3.76-6.481 2.268-7.13-1.297-14.647-20.544-15.1-23.138-12.185-20.739-1.49.843-7.194 77.448-3.37 3.953-7.778 2.981-6.48-4.925-3.436-7.972 3.435-15.749 4.148-20.544 3.37-16.333 3.046-20.285 1.815-6.74-.13-.454-1.49.194-15.295 20.999-23.267 31.433-18.406 19.702-4.407 1.75-7.648-3.954.713-7.064 4.277-6.286 25.47-32.405 15.36-20.092 9.917-11.6-.065-1.686h-.583L44.07 198.125l-12.055 1.555-5.185-4.86.648-7.972 2.463-2.593 20.35-13.999-.064.065Z" />
              </svg>
            </motion.div>

            {/* Serif Wordmark "Claude" */}
            <motion.h1
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-serif text-[42px] font-bold text-[#18181B] tracking-tight"
            >
              Claude
            </motion.h1>

            {onRestartShowcase && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={onRestartShowcase}
                className="mt-8 px-4 py-2 bg-[#F4F4F5] hover:bg-[#E4E4E7] border border-[#E4E4E7] text-[#18181B] rounded-full text-[13px] font-medium cursor-pointer"
              >
                Replay Full Showcase ↺
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
