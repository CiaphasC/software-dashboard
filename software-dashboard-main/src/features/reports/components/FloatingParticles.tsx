// =============================================================================
// FLOATING PARTICLES - Componente legacy para compatibilidad
// Arquitectura de Software Profesional - Migración a componente compartido
// =============================================================================

import React from 'react';
import { ReportsFloatingParticles } from '@/shared/components/ui';

/**
 * @deprecated Use ReportsFloatingParticles from @/shared/components/ui instead
 * This component is kept for backward compatibility
 */
export const FloatingParticles: React.FC = () => {
  return <ReportsFloatingParticles />;
}; 