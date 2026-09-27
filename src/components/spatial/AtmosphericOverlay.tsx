import React from 'react';
import { motion } from 'framer-motion';

export const AtmosphericOverlay: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {/* Slow atmospheric light clouds */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          x: [0, 15, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-emerald-100/40 via-green-50/20 to-transparent blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          x: [0, -20, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-sky-100/35 via-teal-50/15 to-transparent blur-3xl"
      />

      {/* Very faint background contour grid */}
      <div className="absolute inset-0 topo-grid opacity-60" />

      {/* Faint ambient micro-particles */}
      <div className="absolute inset-0">
        {[
          { id: 1, top: '20%', left: '15%', delay: 0 },
          { id: 2, top: '45%', left: '80%', delay: 2 },
          { id: 3, top: '75%', left: '30%', delay: 4 },
          { id: 4, top: '85%', left: '70%', delay: 1 },
        ].map((pt) => (
          <motion.div
            key={pt.id}
            animate={{
              y: [-12, 12, -12],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: pt.delay,
              ease: 'easeInOut',
            }}
            style={{ top: pt.top, left: pt.left }}
            className="absolute w-1 h-1 rounded-full bg-emerald-600/40 blur-[0.5px]"
          />
        ))}
      </div>
    </div>
  );
};
