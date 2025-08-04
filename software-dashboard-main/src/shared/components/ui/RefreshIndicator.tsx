// =============================================================================
// REFRESH INDICATOR - Componente indicador de estado de refresh
// Arquitectura de Software Profesional - Componente de UI
// =============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';

// =============================================================================
// REFRESH INDICATOR PROPS - Props del componente
// =============================================================================

interface RefreshIndicatorProps {
  isEnabled: boolean;
  lastRefresh: Date;
  refreshType: string;
  onManualRefresh?: () => void;
  className?: string;
}

// =============================================================================
// REFRESH INDICATOR - Componente principal
// =============================================================================

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  isEnabled,
  lastRefresh,
  refreshType,
  onManualRefresh,
  className = ''
}) => {
  // =============================================================================
  // TIME CALCULATION - Cálculo de tiempo transcurrido
  // =============================================================================

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    }
  };

  // =============================================================================
  // STATUS DETERMINATION - Determinación del estado
  // =============================================================================

  const getStatusInfo = () => {
    const timeAgo = getTimeAgo(lastRefresh);
    
    if (!isEnabled) {
      return {
        icon: AlertCircle,
        color: 'text-gray-400',
        bgColor: 'bg-gray-100',
        text: 'Auto-refresh deshabilitado',
        badgeVariant: 'outline' as const
      };
    }
    
    if (timeAgo.includes('s') && parseInt(timeAgo) < 10) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: `Actualizado hace ${timeAgo}`,
        badgeVariant: 'success' as const
      };
    }
    
    return {
      icon: RefreshCw,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      text: `Actualizado hace ${timeAgo}`,
      badgeVariant: 'default' as const
    };
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  // =============================================================================
  // ANIMATION VARIANTS - Variantes de animación
  // =============================================================================

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // =============================================================================
  // RENDER - Renderizado del componente
  // =============================================================================

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Indicador de estado */}
      <motion.div
        className={`p-1.5 rounded-full ${statusInfo.bgColor}`}
        variants={isEnabled ? pulseVariants : {}}
        animate={isEnabled ? "pulse" : "initial"}
      >
        <IconComponent className={`w-3 h-3 ${statusInfo.color}`} />
      </motion.div>
      
      {/* Información de estado */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {statusInfo.text}
        </span>
        
        <Badge variant={statusInfo.badgeVariant} className="text-xs">
          {refreshType}
        </Badge>
      </div>
      
      {/* Botón de refresh manual */}
      {onManualRefresh && (
        <button
          onClick={onManualRefresh}
          disabled={!isEnabled}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Actualizar manualmente"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}; 