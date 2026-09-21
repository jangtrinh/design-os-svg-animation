import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ExpandingInputProps {
  onComplete?: () => void;
  autoPlay?: boolean;
}

const EASE_SPRING = [0.16, 1, 0.3, 1] as const;
const TARGET_PROMPT =
  "tạo một bản đồ tương tác hiển thị sự luân chuyển văn hóa giữa các thành phố bằng một quả địa cầu xoay có đường nối phát sáng trên nền tối.";

export const ExpandingInput: React.FC<ExpandingInputProps> = ({
  onComplete,
  autoPlay = false,
}) => {
  // 0: Collapsed Button, 1: Expanded Input, 2: Loading Claude Star
  const [state, setState] = useState<0 | 1 | 2>(0);
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(false);
  const [showAttachments, setShowAttachments] = useState<boolean>(false);

  useEffect(() => {
    if (autoPlay && state === 0) {
      const timer = setTimeout(() => setState(1), 600);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, state]);

  // Expand and trigger file upload simulation + typewriter
  useEffect(() => {
    if (state !== 1) return;

    // Simulate file attachments dropping in after 200ms
    const attachTimer = setTimeout(() => setShowAttachments(true), 250);

    // Typewriter effect starting after badges appear (~20ms per char)
    let typingTimer: NodeJS.Timeout;
    const startTyping = setTimeout(() => {
      let idx = 0;
      typingTimer = setInterval(() => {
        idx++;
        setDisplayedText(TARGET_PROMPT.slice(0, idx));
        if (idx >= TARGET_PROMPT.length) {
          clearInterval(typingTimer);
          setIsTypingComplete(true);
        }
      }, 20);
    }, 450);

    return () => {
      clearTimeout(attachTimer);
      clearTimeout(startTyping);
      clearInterval(typingTimer);
    };
  }, [state]);

  const handleSend = () => {
    setState(2);
    if (onComplete) {
      setTimeout(() => onComplete(), 1600);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[300px] bg-[#FAF9F5] p-6 font-sans">
      <AnimatePresence mode="wait">
        {/* State 0: Collapsed Pill Button */}
        {state === 0 && (
          <motion.button
            key="collapsed-btn"
            layoutId="prompt-box"
            onClick={() => setState(1)}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.4, ease: EASE_SPRING }}
            className="flex items-center justify-center gap-2.5 h-12 w-[130px] rounded-full bg-[#F4F4F5] border border-[#E4E4E7] shadow-sm hover:shadow cursor-pointer transition-shadow"
            aria-label="Open Design Prompt"
          >
            {/* Palette Icon */}
            <svg
              className="w-[18px] h-[18px] text-[#52525B]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
            <span className="text-[15px] font-medium text-[#18181B] tracking-tight">
              Design
            </span>
          </motion.button>
        )}

        {/* State 1: Expanding Multiline Form with Attachments & Typewriter */}
        {state === 1 && (
          <motion.div
            key="expanded-form"
            layoutId="prompt-box"
            initial={{ width: 130, height: 48, borderRadius: 9999 }}
            animate={{ width: 680, minHeight: 140, borderRadius: 20 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_SPRING }}
            className="flex flex-col justify-between w-full max-w-[680px] min-h-[148px] bg-[#FFFFFF] border border-[#E4E4E7] rounded-[20px] p-4 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.06)] relative"
          >
            {/* Top File Badges (flows.docx, cities.xlsx) */}
            <div className="flex items-center gap-2 mb-2.5 min-h-[26px]">
              <AnimatePresence>
                {showAttachments && (
                  <>
                    <motion.div
                      key="badge-word"
                      initial={{ opacity: 0, y: -8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E0E7FF] text-[#2563EB] rounded-[6px] text-[12px] font-medium select-none"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="8" y1="13" x2="16" y2="13" />
                        <line x1="8" y1="17" x2="12" y2="17" />
                      </svg>
                      <span>flows.docx</span>
                    </motion.div>

                    <motion.div
                      key="badge-excel"
                      initial={{ opacity: 0, y: -8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, delay: 0.08 }}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[#DCFCE7] text-[#16A34A] rounded-[6px] text-[12px] font-medium select-none"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="8" y1="11" x2="12" y2="17" />
                        <line x1="12" y1="11" x2="8" y2="17" />
                      </svg>
                      <span>cities.xlsx</span>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Prompt Text / Typewriter */}
            <div className="flex-1 w-full pr-12 min-h-[48px]">
              {displayedText.length === 0 ? (
                <span className="text-[15px] text-[#A1A1AA] italic">
                  Describe what you want to create...
                </span>
              ) : (
                <p className="text-[15px] leading-relaxed text-[#18181B] font-normal select-none">
                  {displayedText}
                  {!isTypingComplete && (
                    <motion.span
                      animate={{ opacity: [1, 0.15, 1], scaleY: [1, 0.9, 1] }}
                      transition={{ repeat: Infinity, duration: 0.85, ease: "easeInOut" }}
                      className="inline-block w-[2px] h-[18px] ml-1 bg-[#D96B43] rounded-full shadow-[0_0_8px_rgba(217,107,67,0.7)] align-middle"
                    />
                  )}
                </p>
              )}
            </div>

            {/* Bottom Row: Send Button */}
            <div className="flex justify-end items-center mt-2">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleSend}
                className="w-9 h-9 rounded-full bg-[#D96B43] flex items-center justify-center text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(217,107,67,0.4)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.15),0_8px_20px_rgba(217,107,67,0.5)] cursor-pointer transition-all"
                title="Send Prompt"
              >
                <svg
                  className="w-[18px] h-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* State 2: Claude Multi-Wing Red-Orange Star Spinner with Breathing Glow */}
        {state === 2 && (
          <motion.div
            key="spinner-loading"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_SPRING }}
            className="flex items-center justify-center p-8"
          >
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.06, 1],
                filter: [
                  "drop-shadow(0 0 8px rgba(217, 107, 67, 0.55)) drop-shadow(0 0 16px rgba(217, 107, 67, 0.25))",
                  "drop-shadow(0 0 18px rgba(217, 107, 67, 0.95)) drop-shadow(0 0 32px rgba(217, 107, 67, 0.45))",
                  "drop-shadow(0 0 8px rgba(217, 107, 67, 0.55)) drop-shadow(0 0 16px rgba(217, 107, 67, 0.25))",
                ],
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 1.8, ease: "linear" },
                scale: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                filter: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
              }}
              className="w-16 h-16 flex items-center justify-center text-[#D96B43]"
            >
              <svg className="w-14 h-14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12.5523 2 13 2.44772 13 3V8.17157L16.6569 4.51472C17.0474 4.12419 17.6805 4.12419 18.0711 4.51472C18.4616 4.90524 18.4616 5.53841 18.0711 5.92893L14.4142 9.58579H19.5858C20.1381 9.58579 20.5858 10.0335 20.5858 10.5858C20.5858 11.1381 20.1381 11.5858 19.5858 11.5858H14.4142L18.0711 15.2426C18.4616 15.6332 18.4616 16.2663 18.0711 16.6569C17.6805 17.0474 17.0474 17.0474 16.6569 16.6569L13 13V18.1716C13 18.7239 12.5523 19.1716 12 19.1716C11.4477 19.1716 11 18.7239 11 18.1716V13L7.34315 16.6569C6.95262 17.0474 6.31946 17.0474 5.92893 16.6569C5.53841 16.2663 5.53841 15.6332 5.92893 15.2426L9.58579 11.5858H4.41421C3.86193 11.5858 3.41421 11.1381 3.41421 10.5858C3.41421 10.0335 3.86193 9.58579 4.41421 9.58579H9.58579L5.92893 5.92893C5.53841 5.53841 5.53841 4.90524 5.92893 4.51472L11 8.17157V3C11 2.44772 11 2 12 2Z" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
