import React, { useState } from "react";
import { ExpandingInput } from "./ExpandingInput";
import { InteractiveGlobeWorkspace } from "./InteractiveGlobeWorkspace";
import { motion, AnimatePresence } from "framer-motion";

export const CulturalExchangeApp: React.FC = () => {
  // 1 = Expanding Input (Light Mode Scene), 2 = Globe 3D Workspace (Dark Mode Scene)
  const [scene, setScene] = useState<1 | 2>(1);

  return (
    <div className="w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {scene === 1 ? (
          <motion.div
            key="scene-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="w-full h-full flex items-center justify-center bg-[#FAF9F5]"
          >
            <ExpandingInput onComplete={() => setScene(2)} autoPlay={false} />
          </motion.div>
        ) : (
          <motion.div
            key="scene-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6 } }}
            className="w-full h-full"
          >
            <InteractiveGlobeWorkspace />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CulturalExchangeApp;
