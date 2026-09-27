import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const AmbientPointerLight: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const springConfig = { damping: 30, stiffness: 120, mass: 0.8 };
  const lightX = useSpring(0, springConfig);
  const lightY = useSpring(0, springConfig);

  useEffect(() => {
    setMounted(true);
    const handlePointerMove = (e: PointerEvent) => {
      lightX.set(e.clientX);
      lightY.set(e.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [lightX, lightY]);

  if (!mounted) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        style={{
          x: lightX,
          y: lightY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-100/35 via-teal-50/20 to-transparent blur-3xl opacity-60"
      />
    </motion.div>
  );
};
