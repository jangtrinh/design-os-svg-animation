import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { ExpandingInput } from "./ExpandingInput";
import { InteractiveGlobeWorkspace } from "./InteractiveGlobeWorkspace";
import { MeditationAppWorkspace } from "./MeditationAppWorkspace";
import { InlineEditingWorkspace } from "./InlineEditingWorkspace";
import { ExportHandoffModal } from "./ExportHandoffModal";

export type SceneId = 1 | 2 | 3 | 4 | 5;

const SCENE_NAMES: Record<SceneId, { title: string; timecode: string }> = {
  1: { title: "Expanding Prompt", timecode: "00:00 – 00:07" },
  2: { title: "3D Globe & Tweaks", timecode: "00:08 – 00:26" },
  3: { title: "Meditation App & Pin Comment", timecode: "00:27 – 00:44" },
  4: { title: "Inline Editing & Chart Morph", timecode: "00:45 – 01:03" },
  5: { title: "Export & CLI Handoff", timecode: "01:04 – 01:22" },
};

export const ClaudeDesignShowcase: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<SceneId>(1);

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col bg-[#121214] font-sans">
      {/* GLOBAL SCENE SWITCHER BAR */}
      <nav className="h-12 bg-[#18181B] border-b border-[#27272A] px-6 flex items-center justify-between z-50 shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D96B43] animate-pulse" />
          <span className="font-serif text-[15px] font-bold text-white">
            Claude Design Interactive Studio
          </span>
        </div>

        {/* 5 Scene Navigation Tabs */}
        <div className="flex items-center bg-[#27272A] p-1 rounded-full border border-[#3F3F46] gap-1">
          {([1, 2, 3, 4, 5] as SceneId[]).map((sceneId) => (
            <button
              key={sceneId}
              onClick={() => setCurrentScene(sceneId)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                currentScene === sceneId
                  ? "bg-[#D96B43] text-white shadow-sm"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              <span>Scene {sceneId}</span>
              <span className="text-[9px] opacity-70 hidden md:inline">
                ({SCENE_NAMES[sceneId].timecode})
              </span>
            </button>
          ))}
        </div>

        {/* Navigation Step buttons */}
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentScene === 1}
            onClick={() => setCurrentScene((prev) => Math.max(1, prev - 1) as SceneId)}
            className="px-2.5 py-1 text-[11px] text-[#A1A1AA] hover:text-white disabled:opacity-30 cursor-pointer flex items-center gap-1"
          >
            <CaretLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <button
            disabled={currentScene === 5}
            onClick={() => setCurrentScene((prev) => Math.min(5, prev + 1) as SceneId)}
            className="px-2.5 py-1 text-[11px] text-[#D96B43] hover:text-white disabled:opacity-30 font-medium cursor-pointer flex items-center gap-1"
          >
            <span>Next</span>
            <CaretRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* ACTIVE SCENE VIEWPORT */}
      <div className="flex-1 w-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentScene === 1 && (
            <motion.div
              key="scene-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full flex items-center justify-center bg-[#FAF9F5]"
            >
              <ExpandingInput onComplete={() => setCurrentScene(2)} autoPlay={false} />
            </motion.div>
          )}

          {currentScene === 2 && (
            <motion.div
              key="scene-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <InteractiveGlobeWorkspace onNextScene={() => setCurrentScene(3)} />
            </motion.div>
          )}

          {currentScene === 3 && (
            <motion.div
              key="scene-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <MeditationAppWorkspace onNextScene={() => setCurrentScene(4)} />
            </motion.div>
          )}

          {currentScene === 4 && (
            <motion.div
              key="scene-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <InlineEditingWorkspace onNextScene={() => setCurrentScene(5)} />
            </motion.div>
          )}

          {currentScene === 5 && (
            <motion.div
              key="scene-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <ExportHandoffModal onRestartShowcase={() => setCurrentScene(1)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClaudeDesignShowcase;
