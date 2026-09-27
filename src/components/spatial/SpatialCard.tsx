import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface SpatialCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'clear' | 'dark';
  interactive?: boolean;
  onClick?: () => void;
}

export const SpatialCard: React.FC<SpatialCardProps> = ({
  children,
  className = '',
  variant = 'primary',
  interactive = true,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position relative to card (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth tilt
  const springConfig = { damping: 20, stiffness: 200, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [2.5, -2.5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2.5, 2.5]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'glass-primary text-zinc-900 shadow-glass-md';
      case 'secondary':
        return 'glass-secondary text-zinc-800 shadow-glass-sm';
      case 'clear':
        return 'glass-clear text-zinc-800';
      case 'dark':
        return 'glass-dark text-white';
      default:
        return 'glass-primary text-zinc-900';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX: interactive ? rotateX : 0,
        rotateY: interactive ? rotateY : 0,
        transformStyle: 'preserve-3d',
      }}
      whileHover={interactive ? { y: -2 } : {}}
      whileTap={interactive && onClick ? { scale: 0.99, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative rounded-2xl transition-shadow duration-300 ${getVariantClass()} ${
        interactive && onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Subtle dynamic sheen reflection on hover */}
      {interactive && isHovered && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-60 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${
              (mouseX.get() + 0.5) * 100
            }% ${(mouseY.get() + 0.5) * 100}%, rgba(255, 255, 255, 0.5), transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
