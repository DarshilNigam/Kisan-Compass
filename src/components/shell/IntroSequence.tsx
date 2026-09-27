import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass } from 'lucide-react';

interface IntroSequenceProps {
  onComplete: () => void;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 600);
    const t2 = setTimeout(() => setStage(2), 1600);
    const t3 = setTimeout(() => onComplete(), 2800);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
        className="fixed inset-0 z-[100] bg-[#0A160E] text-white flex flex-col items-center justify-center p-6 select-none"
      >
        {/* Ambient subtle light in dark container */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-emerald-900/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
          {stage === 0 && (
            <motion.div
              key="stage-0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="text-lg md:text-xl font-mono tracking-widest text-emerald-200/80 uppercase"
            >
              THE FUTURE ISN'T CERTAIN.
            </motion.div>
          )}

          {stage === 1 && (
            <motion.div
              key="stage-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="text-lg md:text-xl font-mono tracking-widest text-emerald-100 uppercase font-semibold"
            >
              YOUR DECISION CAN STILL BE INFORMED.
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="stage-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-800/80 border border-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                <Compass className="w-6 h-6 text-emerald-300" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider font-mono text-white">
                KISAN COMPASS
              </h1>
              <p className="text-xs font-mono tracking-widest text-emerald-300/80 uppercase">
                Farm Decision Intelligence
              </p>
            </motion.div>
          )}
        </div>

        {/* Skip button */}
        <button
          onClick={onComplete}
          className="absolute bottom-8 px-4 py-1.5 rounded-full glass-dark text-xs font-mono text-zinc-400 hover:text-white transition-colors border border-white/10"
        >
          Skip intro [ESC]
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
