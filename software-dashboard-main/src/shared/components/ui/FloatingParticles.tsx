import React from 'react';
import { motion } from 'framer-motion';

// =============================================================================
// FLOATING PARTICLES - Componente reutilizable para efectos de partículas
// Arquitectura de Software Profesional - Componente Centralizado
// =============================================================================

export interface FloatingParticlesProps {
  /** Número de partículas principales */
  mainCount?: number;
  /** Número de partículas de brillo */
  sparkleCount?: number;
  /** Número de partículas especiales */
  specialCount?: number;
  /** Colores de las partículas principales */
  mainColors?: [string, string];
  /** Colores de las partículas de brillo */
  sparkleColor?: string;
  /** Colores de las partículas especiales */
  specialColors?: [string, string];
  /** Tamaño de las partículas principales */
  mainSize?: string;
  /** Tamaño de las partículas de brillo */
  sparkleSize?: string;
  /** Tamaño de las partículas especiales */
  specialSize?: string;
  /** Clase CSS adicional */
  className?: string;
  /** Si las partículas deben estar habilitadas */
  enabled?: boolean;
}

// =============================================================================
// PRESETS - Configuraciones predefinidas para diferentes páginas
// =============================================================================

const PRESETS = {
  incidents: {
    mainCount: 12,
    mainColors: ['orange-400/30', 'red-400/30'] as [string, string],
    sparkleCount: 0,
    specialCount: 0,
  },
  requirements: {
    mainCount: 18,
    mainColors: ['emerald-400/50', 'green-400/50'] as [string, string],
    sparkleCount: 12,
    sparkleColor: 'yellow-300/70',
    specialCount: 6,
    specialColors: ['emerald-300/60', 'teal-300/60'] as [string, string],
  },
  users: {
    mainCount: 20,
    mainColors: ['blue-400/50', 'sky-400/50'] as [string, string],
    sparkleCount: 15,
    sparkleColor: 'yellow-300/80',
    specialCount: 8,
    specialColors: ['sky-300/70', 'blue-600/70'] as [string, string],
  },
  reports: {
    mainCount: 20,
    mainColors: ['gray-400/60', 'slate-500/60'] as [string, string],
    sparkleCount: 15,
    sparkleColor: 'yellow-300/80',
    specialCount: 8,
    specialColors: ['slate-600/70', 'blue-800/70'] as [string, string],
  },
} as const;

// =============================================================================
// FLOATING PARTICLES COMPONENT - Componente principal
// =============================================================================

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  mainCount = 20,
  sparkleCount = 15,
  specialCount = 8,
  mainColors = ['blue-400/50', 'sky-400/50'],
  sparkleColor = 'yellow-300/80',
  specialColors = ['sky-300/70', 'blue-600/70'],
  mainSize = 'w-1 h-1',
  sparkleSize = 'w-0.5 h-0.5',
  specialSize = 'w-2 h-2',
  className = '',
  enabled = true,
}) => {
  // Si no está habilitado, no renderizar nada
  if (!enabled) return null;

  // Generar partículas principales
  const mainParticles = Array.from({ length: mainCount }).map((_, i) => ({
    key: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
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
  }));

  // Generar partículas de brillo
  const sparkleParticles = Array.from({ length: sparkleCount }).map((_, i) => ({
    key: `sparkle-${i}`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
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
  }));

  // Generar partículas especiales
  const specialParticles = Array.from({ length: specialCount }).map((_, i) => ({
    key: `special-${i}`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
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
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Partículas principales */}
      {mainParticles.map((particle) => (
        <motion.div
          key={particle.key}
          className={`absolute ${mainSize} bg-gradient-to-r from-${mainColors[0]} to-${mainColors[1]} rounded-full`}
          style={{ left: particle.left, top: particle.top }}
          animate={particle.animate}
          transition={particle.transition}
        />
      ))}
      
      {/* Partículas de brillo */}
      {sparkleParticles.map((particle) => (
        <motion.div
          key={particle.key}
          className={`absolute ${sparkleSize} bg-${sparkleColor} rounded-full`}
          style={{ left: particle.left, top: particle.top }}
          animate={particle.animate}
          transition={particle.transition}
        />
      ))}
      
      {/* Partículas especiales */}
      {specialParticles.map((particle) => (
        <motion.div
          key={particle.key}
          className={`absolute ${specialSize} bg-gradient-to-r from-${specialColors[0]} to-${specialColors[1]} rounded-full`}
          style={{ left: particle.left, top: particle.top }}
          animate={particle.animate}
          transition={particle.transition}
        />
      ))}
    </div>
  );
};

// =============================================================================
// PRESET COMPONENTS - Componentes con configuraciones predefinidas
// =============================================================================

export const IncidentsFloatingParticles: React.FC<{ className?: string; enabled?: boolean }> = ({ 
  className, 
  enabled = true 
}) => (
  <FloatingParticles
    {...PRESETS.incidents}
    className={className}
    enabled={enabled}
  />
);

export const RequirementsFloatingParticles: React.FC<{ className?: string; enabled?: boolean }> = ({ 
  className, 
  enabled = true 
}) => (
  <FloatingParticles
    {...PRESETS.requirements}
    className={className}
    enabled={enabled}
  />
);

export const UsersFloatingParticles: React.FC<{ className?: string; enabled?: boolean }> = ({ 
  className, 
  enabled = true 
}) => (
  <FloatingParticles
    {...PRESETS.users}
    className={className}
    enabled={enabled}
  />
);

export const ReportsFloatingParticles: React.FC<{ className?: string; enabled?: boolean }> = ({ 
  className, 
  enabled = true 
}) => (
  <FloatingParticles
    {...PRESETS.reports}
    className={className}
    enabled={enabled}
  />
); 