import { useMemo } from 'react';

export const useFloatingParticles = () => {
  // Partículas principales grises
  const mainParticles = useMemo(() =>
    Array.from({ length: 20 }).map(() => {
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 100}%`;
      return {
        left,
        top,
        animate: {
          y: [0, -60, 0],
          x: [0, Math.random() * 50 - 25, 0],
          opacity: [0.2, 1, 0.2],
          scale: [0.3, 2, 0.3],
        },
        transition: {
          duration: 6 + Math.random() * 4,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: Math.random() * 5,
        },
      };
    }),
    []
  );

  // Partículas de brillo doradas
  const sparkleParticles = useMemo(() =>
    Array.from({ length: 15 }).map(() => {
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 100}%`;
      return {
        left,
        top,
        animate: {
          y: [0, -30, 0],
          opacity: [0, 1, 0],
          scale: [0, 4, 0],
        },
        transition: {
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: Math.random() * 4,
        },
      };
    }),
    []
  );

  // Partículas especiales de azul oscuro
  const blueParticles = useMemo(() =>
    Array.from({ length: 8 }).map(() => {
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 100}%`;
      return {
        left,
        top,
        animate: {
          y: [0, -40, 0],
          rotate: [0, 360],
          opacity: [0.4, 0.9, 0.4],
          scale: [0.5, 1.3, 0.5],
        },
        transition: {
          duration: 7 + Math.random() * 3,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: Math.random() * 6,
        },
      };
    }),
    []
  );

  return { mainParticles, sparkleParticles, blueParticles };
}; 