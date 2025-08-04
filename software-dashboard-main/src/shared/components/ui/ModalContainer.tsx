import React, { ReactNode } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ModalContainerProps {
  /** Contenido del modal */
  children: ReactNode;
  /** Clases CSS adicionales */
  className?: string;
  /** Si mostrar el efecto de brillo */
  showGlowEffect?: boolean;
  /** Color del efecto de brillo */
  glowColor?: 'emerald' | 'blue' | 'purple' | 'orange' | 'red';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const GLOW_COLORS = {
  emerald: 'from-emerald-500/5 via-transparent to-green-500/5',
  blue: 'from-blue-500/5 via-transparent to-cyan-500/5',
  purple: 'from-purple-500/5 via-transparent to-pink-500/5',
  orange: 'from-orange-500/5 via-transparent to-yellow-500/5',
  red: 'from-red-500/5 via-transparent to-pink-500/5'
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Modal Container Component
 * 
 * Contenedor que proporciona el estilo visual base para todos los modales,
 * incluyendo el fondo, bordes y efectos visuales.
 * 
 * @example
 * ```tsx
 * <ModalContainer showGlowEffect glowColor="emerald">
 *   <ModalHeader title="Mi Modal" />
 *   <ModalContent>Contenido...</ModalContent>
 * </ModalContainer>
 * ```
 */
export const ModalContainer: React.FC<ModalContainerProps> = ({
  children,
  className = '',
  showGlowEffect = true,
  glowColor = 'emerald'
}) => {
  return (
    <div className={`bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden relative ${className}`}>
      {/* Efecto de brillo sutil */}
      {showGlowEffect && (
        <div className={`absolute inset-0 bg-gradient-to-br ${GLOW_COLORS[glowColor]}`} />
      )}
      
      {/* Contenido del modal */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ModalContainer; 