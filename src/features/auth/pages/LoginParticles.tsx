import React from 'react';
import { motion } from 'framer-motion';

export interface ParticleData {
  x: number;
  y: number;
  duration: number;
  delay: number;
  moveX: number;
  moveY: number;
}

interface LoginParticlesProps {
  particles: ParticleData[];
}

const LoginParticles: React.FC<LoginParticlesProps> = ({ particles }) => (
  <div className="absolute inset-0 pointer-events-none z-0">
    {particles.map((particle, i) => (
      <motion.div
        key={i}
        className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400/30"
        style={{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          filter: 'blur(1px)',
        }}
        animate={{
          y: [0, particle.moveY, 0],
          x: [0, particle.moveX, 0],
          opacity: [0.2, 0.8, 0.2],
          scale: [0.8, 1.4, 0.8],
        }}
        transition={{
          duration: particle.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: particle.delay,
          repeatDelay: 0,
        }}
      />
    ))}
  </div>
);

export default LoginParticles; 