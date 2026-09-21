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
              <svg className="w-14 h-14" viewBox="0 0 256 257" fill="currentColor">
                <path d="m50.228 170.321 50.357-28.257.843-2.463-.843-1.361h-2.462l-8.426-.518-28.775-.778-24.952-1.037-24.175-1.296-6.092-1.297L0 125.796l.583-3.759 5.12-3.434 7.324.648 16.202 1.101 24.304 1.685 17.629 1.037 26.118 2.722h4.148l.583-1.685-1.426-1.037-1.101-1.037-25.147-17.045-27.22-18.017-14.258-10.37-7.713-5.25-3.888-4.925-1.685-10.758 7-7.713 9.397.649 2.398.648 9.527 7.323 20.35 15.75L94.817 91.9l3.889 3.24 1.555-1.102.195-.777-1.75-2.917-14.453-26.118-15.425-26.572-6.87-11.018-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0 82.05 1.426l4.472 3.888 6.61 15.101 10.694 23.786 16.591 32.34 4.861 9.592 2.592 8.879.973 2.722h1.685v-1.556l1.36-18.211 2.528-22.36 2.463-28.776.843-8.1 4.018-9.722 7.971-5.25 6.222 2.981 5.12 7.324-.713 4.73-3.046 19.768-5.962 30.98-3.889 20.739h2.268l2.593-2.593 10.499-13.934 17.628-22.036 7.778-8.749 9.073-9.657 5.833-4.601h11.018l8.1 12.055-3.628 12.443-11.342 14.388-9.398 12.184-13.48 18.147-8.426 14.518.778 1.166 2.01-.194 30.46-6.481 16.462-2.982 19.637-3.37 8.88 4.148.971 4.213-3.5 8.62-20.998 5.184-24.628 4.926-36.682 8.685-.454.324.519.648 16.526 1.555 7.065.389h17.304l32.21 2.398 8.426 5.574 5.055 6.805-.843 5.184-12.962 6.611-17.498-4.148-40.83-9.721-14-3.5h-1.944v1.167l11.666 11.406 21.387 19.314 26.767 24.887 1.36 6.157-3.434 4.86-3.63-.518-23.526-17.693-9.073-7.972-20.545-17.304h-1.36v1.814l4.73 6.935 25.017 37.59 1.296 11.536-1.814 3.76-6.481 2.268-7.13-1.297-14.647-20.544-15.1-23.138-12.185-20.739-1.49.843-7.194 77.448-3.37 3.953-7.778 2.981-6.48-4.925-3.436-7.972 3.435-15.749 4.148-20.544 3.37-16.333 3.046-20.285 1.815-6.74-.13-.454-1.49.194-15.295 20.999-23.267 31.433-18.406 19.702-4.407 1.75-7.648-3.954.713-7.064 4.277-6.286 25.47-32.405 15.36-20.092 9.917-11.6-.065-1.686h-.583L44.07 198.125l-12.055 1.555-5.185-4.86.648-7.972 2.463-2.593 20.35-13.999-.064.065Z" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
