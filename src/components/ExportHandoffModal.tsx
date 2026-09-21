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
              <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12.5523 2 13 2.44772 13 3V8.17157L16.6569 4.51472C17.0474 4.12419 17.6805 4.12419 18.0711 4.51472C18.4616 4.90524 18.4616 5.53841 18.0711 5.92893L14.4142 9.58579H19.5858C20.1381 9.58579 20.5858 10.0335 20.5858 10.5858C20.5858 11.1381 20.1381 11.5858 19.5858 11.5858H14.4142L18.0711 15.2426C18.4616 15.6332 18.4616 16.2663 18.0711 16.6569C17.6805 17.0474 17.0474 17.0474 16.6569 16.6569L13 13V18.1716C13 18.7239 12.5523 19.1716 12 19.1716C11.4477 19.1716 11 18.7239 11 18.1716V13L7.34315 16.6569C6.95262 17.0474 6.31946 17.0474 5.92893 16.6569C5.53841 16.2663 5.53841 15.6332 5.92893 15.2426L9.58579 11.5858H4.41421C3.86193 11.5858 3.41421 11.1381 3.41421 10.5858C3.41421 10.0335 3.86193 9.58579 4.41421 9.58579H9.58579L5.92893 5.92893C5.53841 5.53841 5.53841 4.90524 5.92893 4.51472C6.31946 4.12419 6.95262 4.12419 7.34315 4.51472L11 8.17157V3C11 2.44772 11.4477 2 12 2Z" />
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
