import { useMemo } from 'react';
import { 
  Settings, 
  Monitor, 
  HardDrive, 
  Wifi, 
  Bug, 
  AlertTriangle,
  FileText,
  Shield,
  CheckCircle,
  Zap,
  Clock
} from 'lucide-react';

// =============================================================================
// USE VISUAL INDICATORS HOOK - Hook reutilizable para indicadores visuales
// Arquitectura de Software Profesional - Gestión de Indicadores
// =============================================================================

interface VisualIndicatorConfig {
  priority: string;
  type: string;
  priorityLabel?: string;
  typeLabel?: string;
}

export const useVisualIndicators = ({ 
  priority, 
  type, 
  priorityLabel, 
  typeLabel 
}: VisualIndicatorConfig) => {
  
  // Configuración de prioridades
  const priorityConfig = useMemo(() => ({
    low: {
      color: 'text-blue-600 bg-blue-50/80 border-blue-200/60',
      icon: <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Baja'
    },
    medium: {
      color: 'text-amber-600 bg-amber-50/80 border-amber-200/60',
      icon: <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Media'
    },
    high: {
      color: 'text-orange-600 bg-orange-50/80 border-orange-200/60',
      icon: <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Alta'
    },
    urgent: {
      color: 'text-red-600 bg-red-50/80 border-red-200/60',
      icon: <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Urgente'
    }
  }), []);

  // Configuración de tipos para incidencias
  const incidentTypeConfig = useMemo(() => ({
    technical: {
      icon: <Settings className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Técnico'
    },
    software: {
      icon: <Monitor className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Software'
    },
    hardware: {
      icon: <HardDrive className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Hardware'
    },
    network: {
      icon: <Wifi className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Red'
    },
    other: {
      icon: <Bug className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Otro'
    }
  }), []);

  // Configuración de tipos para requerimientos
  const requirementTypeConfig = useMemo(() => ({
    document: {
      icon: <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Documento'
    },
    equipment: {
      icon: <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Equipo'
    },
    service: {
      icon: <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Servicio'
    },
    other: {
      icon: <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: 'Otro'
    }
  }), []);

  // Obtener configuración de prioridad
  const priorityInfo = useMemo(() => {
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return {
      color: config?.color || 'text-gray-600 bg-gray-50/80 border-gray-200/60',
      icon: config?.icon || <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: priorityLabel || config?.label || priority
    };
  }, [priority, priorityLabel, priorityConfig]);

  // Obtener configuración de tipo
  const typeInfo = useMemo(() => {
    // Determinar si es configuración de incidencias o requerimientos
    const isIncidentType = Object.keys(incidentTypeConfig).includes(type);
    const config = isIncidentType 
      ? incidentTypeConfig[type as keyof typeof incidentTypeConfig]
      : requirementTypeConfig[type as keyof typeof requirementTypeConfig];
    
    return {
      icon: config?.icon || <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
      label: typeLabel || config?.label || type.replace('_', ' ')
    };
  }, [type, typeLabel, incidentTypeConfig, requirementTypeConfig]);

  return {
    priority: priorityInfo,
    type: typeInfo
  };
};

// =============================================================================
// HOOK ESPECÍFICO PARA INDICADORES DE INCIDENCIAS
// =============================================================================

interface IncidentVisualIndicatorsProps {
  priority: string;
  type: string;
}

export const useIncidentVisualIndicators = ({ priority, type }: IncidentVisualIndicatorsProps) => {
  return useVisualIndicators({
    priority,
    type,
    priorityLabel: undefined, // Usar labels por defecto
    typeLabel: undefined
  });
};

// =============================================================================
// HOOK ESPECÍFICO PARA INDICADORES DE REQUERIMIENTOS
// =============================================================================

interface RequirementVisualIndicatorsProps {
  priority: string;
  type: string;
}

export const useRequirementVisualIndicators = ({ priority, type }: RequirementVisualIndicatorsProps) => {
  return useVisualIndicators({
    priority,
    type,
    priorityLabel: undefined, // Usar labels por defecto
    typeLabel: undefined
  });
}; 