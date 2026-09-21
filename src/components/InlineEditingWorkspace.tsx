import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE_SPRING = [0.16, 1, 0.3, 1] as const;

export interface InlineEditingWorkspaceProps {
  onNextScene?: () => void;
}

export const InlineEditingWorkspace: React.FC<InlineEditingWorkspaceProps> = ({
  onNextScene,
}) => {
  // Project tab: 1 = Hemlark Retreat '26, 2 = Slide Report (Bar/Line chart)
  const [activeProject, setActiveProject] = useState<1 | 2>(1);

  // --- PROJECT 1: HEMLARK RETREAT STATE ---
  const [photoType, setPhotoType] = useState<"forest" | "coastline">("forest");
  const [headingFontSize, setHeadingFontSize] = useState<number>(42); // 28 to 56
  const [activeTool, setActiveTool] = useState<"none" | "comment" | "knobs">("none");
  const [showPhotoComment, setShowPhotoComment] = useState<boolean>(false);
  const [isKnobsPanelOpen, setIsKnobsPanelOpen] = useState<boolean>(false);

  // --- PROJECT 2: CHART MORPH STATE ---
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [showChartComment, setShowChartComment] = useState<boolean>(false);

  // Chart Data: 5 months of growth
  const chartData = [
    { label: "Jan", val: 35 },
    { label: "Feb", val: 62 },
    { label: "Mar", val: 48 },
    { label: "Apr", val: 85 },
    { label: "May", val: 94 },
  ];

  return (
    <div className="flex flex-col w-full h-screen bg-[#121214] text-[#F4F4F5] font-sans select-none overflow-hidden">
      {/* 1. TOP HEADER & SWITCHER */}
      <header className="h-14 border-b border-[#27272A] bg-[#18181B] px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-serif font-bold text-[#D96B43]">Claude Inline Editor</span>
          <div className="h-4 w-px bg-[#3F3F46]" />
          <div className="flex bg-[#27272A] p-0.5 rounded-lg border border-[#3F3F46]">
            <button
              onClick={() => setActiveProject(1)}
              className={`px-3 py-1 text-[12px] font-medium rounded-md transition-colors cursor-pointer ${
                activeProject === 1 ? "bg-[#18181B] text-white" : "text-[#A1A1AA]"
              }`}
            >
              1. Hemlark Retreat
            </button>
            <button
              onClick={() => setActiveProject(2)}
              className={`px-3 py-1 text-[12px] font-medium rounded-md transition-colors cursor-pointer ${
                activeProject === 2 ? "bg-[#18181B] text-white" : "text-[#A1A1AA]"
              }`}
            >
              2. Chart Morph
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNextScene && (
            <button
              onClick={onNextScene}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D96B43] hover:bg-[#c2410c] text-white rounded-lg text-[12px] font-medium cursor-pointer transition-colors"
            >
              <span>Export & Handoff</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ======================================================== */}
        {/* VIEW 1: HEMLARK RETREAT '26 LANDING PAGE */}
        {/* ======================================================== */}
        {activeProject === 1 && (
          <div className="flex-1 flex overflow-hidden relative">
            {/* Center Canvas */}
            <div className="flex-1 overflow-y-auto p-12 flex justify-center items-start bg-[#0A0A0C]">
              <div className="w-full max-w-[760px] bg-[#18181B] border border-[#27272A] rounded-2xl p-8 shadow-2xl relative">
                {/* Hero Image Block with Comment Pin */}
                <div className="relative rounded-xl overflow-hidden h-72 w-full bg-[#27272A] mb-8 group">
                  <motion.div
                    key={photoType}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full relative"
                  >
                    {photoType === "forest" ? (
                      /* Misty Forest Mock Art */
                      <div className="w-full h-full bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#022c22] flex flex-col items-center justify-center p-6 text-center">
                        <span className="text-3xl mb-2">🌲🌫️</span>
                        <span className="text-[13px] text-[#94A3B8] font-mono">
                          Misty Pine Forest Canopy • North Coast
                        </span>
                      </div>
                    ) : (
                      /* Coastline Photo Mock Art */
                      <div className="w-full h-full bg-gradient-to-b from-[#0C4A6E] via-[#0369A1] to-[#082f49] flex flex-col items-center justify-center p-6 text-center">
                        <span className="text-3xl mb-2">🌊🏖️</span>
                        <span className="text-[13px] text-[#BAE6FD] font-mono">
                          Pacific Coastline Bluff • Shoreline Waves
                        </span>
                      </div>
                    )}
                  </motion.div>

                  {/* Floating Action Trigger on Image */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => setShowPhotoComment(!showPhotoComment)}
                      className="px-3 py-1 bg-[#18181B]/80 hover:bg-[#18181B] backdrop-blur border border-[#3F3F46] rounded-full text-[12px] text-white flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <svg className="w-3.5 h-3.5 text-[#D96B43]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>Comment: Swap Photo</span>
                    </button>
                  </div>

                  {/* Comment Popup Box */}
                  <AnimatePresence>
                    {showPhotoComment && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-14 right-4 z-30 w-72 bg-[#18181B] border border-[#3F3F46] rounded-xl p-3.5 shadow-2xl"
                      >
                        <span className="text-[12px] font-medium text-[#F4F4F5] block mb-1">
                          Comment on Image
                        </span>
                        <p className="text-[12px] text-[#A1A1AA] bg-[#27272A] p-2 rounded-lg font-mono mb-2">
                          &quot;Swap this to the coastline photo&quot;
                        </p>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setPhotoType("coastline");
                              setShowPhotoComment(false);
                            }}
                            className="px-3 py-1 bg-[#D96B43] hover:bg-[#c2410c] text-white text-[11px] font-medium rounded-lg cursor-pointer"
                          >
                            Execute Swap
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Editable Headline with "Knobs" Tool Trigger */}
                <div
                  onClick={() => setIsKnobsPanelOpen(true)}
                  className="p-3 -m-3 rounded-xl hover:bg-[#27272A]/40 transition-colors cursor-pointer group relative border border-transparent hover:border-[#3F3F46]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-[#D96B43] opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to edit with Knobs ⚙️
                    </span>
                  </div>
                  <h1
                    style={{ fontSize: `${headingFontSize}px` }}
                    className="font-serif font-bold text-white tracking-tight leading-tight transition-all duration-150"
                  >
                    Hemlark Retreat &apos;26
                  </h1>
                  <p className="text-[15px] text-[#A1A1AA] mt-3 leading-relaxed max-w-xl">
                    A three-day gathering among ancient pines and coastal cliffs, reimagining
                    collective craft and intentional digital spaces.
                  </p>
                </div>
              </div>
            </div>

            {/* Right "Knobs" Typography Drawer */}
            <AnimatePresence>
              {isKnobsPanelOpen && (
                <motion.aside
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE_SPRING }}
                  className="w-[300px] h-full bg-[#18181B] border-l border-[#27272A] p-5 flex flex-col gap-6 z-20 shrink-0 shadow-2xl"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#D96B43] font-mono text-[14px]">Knobs</span>
                      <span className="text-[13px] text-[#A1A1AA]">/ Typography</span>
                    </div>
                    <button onClick={() => setIsKnobsPanelOpen(false)} className="text-[#A1A1AA] hover:text-white p-1">
                      ✕
                    </button>
                  </div>

                  {/* Heading Size Slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#E4E4E7]">Font Size</span>
                      <span className="font-mono text-[#D96B43]">{headingFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="56"
                      value={headingFontSize}
                      onChange={(e) => setHeadingFontSize(parseInt(e.target.value, 10))}
                      className="w-full accent-[#D96B43] cursor-pointer"
                    />
                  </div>

                  {/* Weight Segmented */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] text-[#E4E4E7]">Font Family</span>
                    <div className="text-[13px] text-[#A1A1AA] bg-[#27272A] p-2 rounded-lg font-serif">
                      Canela / Georgia Serif
                    </div>
                  </div>

                  {/* Photo Toggle */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-[#27272A]">
                    <span className="text-[13px] text-[#E4E4E7]">Active Media Asset</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPhotoType("forest")}
                        className={`flex-1 py-1.5 text-[12px] rounded-lg border ${
                          photoType === "forest" ? "bg-[#27272A] border-[#D96B43] text-white" : "border-[#3F3F46] text-[#A1A1AA]"
                        }`}
                      >
                        Forest
                      </button>
                      <button
                        onClick={() => setPhotoType("coastline")}
                        className={`flex-1 py-1.5 text-[12px] rounded-lg border ${
                          photoType === "coastline" ? "bg-[#27272A] border-[#D96B43] text-white" : "border-[#3F3F46] text-[#A1A1AA]"
                        }`}
                      >
                        Coastline
                      </button>
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: SLIDE REPORT - BAR TO LINE GRAPH MORPHING */}
        {/* ======================================================== */}
        {activeProject === 2 && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[#0A0A0C]">
            <div className="w-full max-w-[680px] bg-[#18181B] border border-[#27272A] rounded-2xl p-8 shadow-2xl relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[11px] font-mono text-[#D96B43] uppercase tracking-wider">
                    Report Slide • Metric Growth
                  </span>
                  <h3 className="text-[20px] font-semibold text-white">Monthly Active Exchanges</h3>
                </div>

                <button
                  onClick={() => setShowChartComment(!showChartComment)}
                  className="px-3 py-1.5 bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] rounded-full text-[12px] text-white flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-[#D96B43]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Comment on Chart</span>
                </button>
              </div>

              {/* Chart Comment Popup */}
              <AnimatePresence>
                {showChartComment && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-20 right-8 z-30 w-80 bg-[#27272A] border border-[#3F3F46] rounded-xl p-3.5 shadow-2xl"
                  >
                    <span className="text-[12px] font-medium text-white block mb-1">Canvas Comment</span>
                    <p className="text-[12px] text-[#A1A1AA] bg-[#18181B] p-2 rounded font-mono mb-2">
                      &quot;Make this a line graph instead?&quot;
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setChartType(chartType === "bar" ? "line" : "bar");
                          setShowChartComment(false);
                        }}
                        className="px-3 py-1 bg-[#D96B43] hover:bg-[#c2410c] text-white text-[11px] font-medium rounded-lg cursor-pointer"
                      >
                        Morph to {chartType === "bar" ? "Line Graph" : "Bar Chart"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SVG Animated Chart (Smooth interpolation between Bar and Line) */}
              <div className="h-64 w-full flex items-end justify-between px-6 pt-8 pb-4 relative">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-x-6 top-8 bottom-8 flex flex-col justify-between pointer-events-none opacity-15">
                  <div className="border-b border-[#F4F4F5] w-full" />
                  <div className="border-b border-[#F4F4F5] w-full" />
                  <div className="border-b border-[#F4F4F5] w-full" />
                </div>

                {/* SVG Spline overlay for Line Graph */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none px-6 pb-8 pt-8 overflow-visible">
                  <motion.path
                    d={`M 35 ${200 - chartData[0].val * 1.8} L 155 ${200 - chartData[1].val * 1.8} L 275 ${200 - chartData[2].val * 1.8} L 395 ${200 - chartData[3].val * 1.8} L 515 ${200 - chartData[4].val * 1.8}`}
                    fill="none"
                    stroke="#D96B43"
                    strokeWidth="3.5"
                    initial={false}
                    animate={{
                      opacity: chartType === "line" ? 1 : 0,
                      pathLength: chartType === "line" ? 1 : 0,
                    }}
                    transition={{ duration: 0.6, ease: EASE_SPRING }}
                  />
                </svg>

                {/* Bars / Node points morph */}
                {chartData.map((item, idx) => {
                  const barHeight = item.val * 1.8;
                  return (
                    <div key={item.label} className="flex flex-col items-center gap-2 z-10 w-16">
                      <div className="h-48 w-full flex items-end justify-center">
                        <motion.div
                          layout
                          animate={{
                            height: chartType === "bar" ? barHeight : 10,
                            width: chartType === "bar" ? 40 : 10,
                            borderRadius: chartType === "bar" ? 8 : 9999,
                            backgroundColor: chartType === "bar" ? "#34D399" : "#D96B43",
                            translateY: chartType === "line" ? -(barHeight - 10) : 0,
                          }}
                          transition={{ duration: 0.5, ease: EASE_SPRING }}
                          className="shadow-lg"
                        />
                      </div>
                      <span className="text-[12px] font-mono text-[#A1A1AA]">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Type indicator pills */}
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-[#27272A]">
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-3 py-1 rounded-md text-[12px] transition-colors cursor-pointer ${
                    chartType === "bar" ? "bg-[#34D399] text-[#022c22] font-semibold" : "text-[#A1A1AA]"
                  }`}
                >
                  Bar Chart
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={`px-3 py-1 rounded-md text-[12px] transition-colors cursor-pointer ${
                    chartType === "line" ? "bg-[#D96B43] text-white font-semibold" : "text-[#A1A1AA]"
                  }`}
                >
                  Line Graph
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
