import React from 'react';
import { motion } from 'framer-motion';
import { useFloatingParticles } from '../hooks/components/useFloatingParticles';

export const FloatingParticles: React.FC = () => {
  const { mainParticles, sparkleParticles, blueParticles } = useFloatingParticles();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Partículas principales grises */}
      {mainParticles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-gray-400/60 to-slate-500/60 rounded-full"
          style={{ left: particle.left, top: particle.top }}
          animate={particle.animate}
          transition={particle.transition}
        />
      ))}
      
      {/* Partículas de brillo doradas */}
      {sparkleParticles.map((particle, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-0.5 h-0.5 bg-yellow-300/80 rounded-full"
          style={{ left: particle.left, top: particle.top }}
          animate={particle.animate}
          transition={particle.transition}
        />
      ))}
      
      {/* Partículas especiales de azul oscuro */}
      {blueParticles.map((particle, i) => (
        <motion.div
          key={`blue-${i}`}
          className="absolute w-2 h-2 bg-gradient-to-r from-slate-600/70 to-blue-800/70 rounded-full"
          style={{ left: particle.left, top: particle.top }}
          animate={particle.animate}
          transition={particle.transition}
        />
      ))}
    </div>
  );
}; 