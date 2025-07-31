import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { log } from '@/shared/utils/logger';
import { Subscription } from 'rxjs';
import { RecentActivity, activityStreamService } from '@/shared/hooks/useRecentActivities';

/**
 * HOOK PARA ACTIVIDADES RECIENTES DEL DASHBOARD
 * 
 * Este hook maneja toda la lógica específica para el componente de actividades recientes
 * en el dashboard. Se encarga de obtener, procesar y formatear las actividades
 * para su visualización en la interfaz.
 * 
 * Responsabilidades:
 * - Obtener actividades recientes del stream global
 * - Procesar y formatear datos para la UI
 * - Manejar estados de carga y errores
 * - Gestionar suscripciones y cleanup
 * - Proporcionar funciones de utilidad para el componente
 * 
 * Uso: Este hook es utilizado exclusivamente por el componente RecentActivities
 * del dashboard para mostrar las últimas 3 actividades de forma optimizada.
 */

export interface UseRecentActivitiesDashboardReturn {
  /** Lista de actividades recientes procesadas para la UI */
  activities: RecentActivity[];
  /** Estado de carga inicial */
  loading: boolean;
  /** Mensaje de error si existe */
  error: string | null;
  /** Función para refrescar las actividades */
  refreshActivities: () => void;
  /** Función para formatear fechas relativas */
  formatTimeAgo: (timestamp: Date) => string;
  /** Función para obtener el nombre del icono apropiado según el tipo de actividad */
  getActivityIconName: (type: string, action: string) => string;
  /** Función para obtener el color apropiado según el tipo de actividad */
  getActivityColor: (type: string, action: string) => string;
  /** Función para obtener el texto del badge según el tipo */
  getActivityBadgeText: (type: string) => string;
  /** Función para obtener el color del badge según el tipo */
  getActivityBadgeColor: (type: string) => string;
  /** Número total de actividades disponibles */
  totalActivities: number;
  /** Indica si hay actividades para mostrar */
  hasActivities: boolean;
}

/**
 * Hook principal para actividades recientes del dashboard
 * 
 * @returns {UseRecentActivitiesDashboardReturn} Objeto con todas las funciones y datos necesarios
 * 
 * @example
 * ```tsx
 * const {
 *   activities,
 *   loading,
 *   formatTimeAgo,
 *   getActivityIcon,
 *   getActivityColor
 * } = useRecentActivitiesDashboard();
 * 
 * if (loading) return <LoadingSpinner />;
 * 
 * return (
 *   <div>
 *     {activities.map(activity => (
 *       <ActivityCard
 *         key={activity.id}
 *         icon={getActivityIcon(activity.type, activity.action)}
 *         color={getActivityColor(activity.type, activity.action)}
 *         timeAgo={formatTimeAgo(activity.timestamp)}
 *         {...activity}
 *       />
 *     ))}
 *   </div>
 * );
 * ```
 */
export const useRecentActivitiesDashboard = (): UseRecentActivitiesDashboardReturn => {
  // Estados del hook
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalActivities, setTotalActivities] = useState(0);

  // Ref para manejar la suscripción
  const subscriptionRef = useRef<Subscription | null>(null);

  /**
   * Formatea una fecha en formato relativo (ej: "Hace 2h", "Hace 3d")
   * 
   * @param timestamp - Fecha a formatear
   * @returns {string} Texto formateado en formato relativo
   * 
   * @example
   * formatTimeAgo(new Date()) // "Ahora mismo"
   * formatTimeAgo(new Date(Date.now() - 3600000)) // "Hace 1h"
   * formatTimeAgo(new Date(Date.now() - 86400000)) // "Hace 1d"
   */
  const formatTimeAgo = useCallback((timestamp: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Ahora mismo';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays}d`;
    } else {
      // Para fechas más antiguas, usar formato DD/MM/YYYY
      return timestamp.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }, []);

  /**
   * Obtiene el nombre del icono apropiado según el tipo y acción de la actividad
   * 
   * @param type - Tipo de actividad ('incident' | 'requirement')
   * @param action - Acción realizada ('created' | 'updated' | 'resolved' | 'closed')
   * @returns {string} Nombre del icono
   * 
   * @example
   * getActivityIconName('incident', 'created') // "AlertTriangle"
   * getActivityIconName('requirement', 'resolved') // "CheckCircle"
   */
  const getActivityIconName = useCallback((type: string, action: string): string => {
    if (type === 'incident') {
      return 'AlertTriangle';
    } else if (type === 'requirement') {
      if (action === 'resolved') {
        return 'CheckCircle';
      }
      return 'FileText';
    }
    return 'Clock';
  }, []);

  /**
   * Obtiene las clases CSS para el color de fondo según el tipo y acción
   * 
   * @param type - Tipo de actividad
   * @param action - Acción realizada
   * @returns {string} Clases CSS para el color de fondo
   * 
   * @example
   * getActivityColor('incident', 'created') // "bg-yellow-100/80 border-yellow-200"
   * getActivityColor('requirement', 'resolved') // "bg-green-100/80 border-green-200"
   */
  const getActivityColor = useCallback((type: string, action: string): string => {
    if (type === 'incident') {
      return 'bg-yellow-100/80 border-yellow-200';
    } else if (type === 'requirement') {
      if (action === 'resolved') {
        return 'bg-green-100/80 border-green-200';
      }
      return 'bg-blue-100/80 border-blue-200';
    }
    return 'bg-gray-100/80 border-gray-200';
  }, []);

  /**
   * Obtiene el texto del badge según el tipo de actividad
   * 
   * @param type - Tipo de actividad
   * @returns {string} Texto del badge
   * 
   * @example
   * getActivityBadgeText('incident') // "Incidencia"
   * getActivityBadgeText('requirement') // "Requerimiento"
   */
  const getActivityBadgeText = useCallback((type: string): string => {
    return type === 'incident' ? 'Incidencia' : 'Requerimiento';
  }, []);

  /**
   * Obtiene las clases CSS para el color del badge según el tipo
   * 
   * @param type - Tipo de actividad
   * @returns {string} Clases CSS para el color del badge
   * 
   * @example
   * getActivityBadgeColor('incident') // "bg-yellow-100 text-yellow-700 border-yellow-200"
   * getActivityBadgeColor('requirement') // "bg-blue-100 text-blue-700 border-blue-200"
   */
  const getActivityBadgeColor = useCallback((type: string): string => {
    return type === 'incident'
      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
      : 'bg-blue-100 text-blue-700 border border-blue-200';
  }, []);

  /**
   * Refresca las actividades obteniendo los datos más recientes
   * Útil para actualizaciones manuales o después de acciones del usuario
   */
  const refreshActivities = useCallback(() => {
    log('Refrescando actividades recientes...');
    setLoading(true);
    setError(null);
    
    // Obtener actividades actuales del servicio
    const currentActivities = activityStreamService.getCurrentActivities();
    setActivities(currentActivities.slice(0, 3));
    setTotalActivities(currentActivities.length);
    setLoading(false);
  }, []);

  // Computed values
  const hasActivities = useMemo(() => activities.length > 0, [activities]);

  // Efecto principal para suscribirse al stream de actividades
  useEffect(() => {
    log('useRecentActivitiesDashboard: Iniciando suscripción...');
    
    // Suscribirse solo a las últimas 3 actividades para el dashboard
    subscriptionRef.current = activityStreamService.recentActivities$.subscribe({
      next: (recentActivities) => {
        log('useRecentActivitiesDashboard: Recibidas actividades:', recentActivities.length);
        setActivities(recentActivities);
        setLoading(false);
        setError(null);
      },
      error: (err) => {
        console.error('useRecentActivitiesDashboard: Error en stream:', err);
        setError('Error al cargar las actividades recientes');
        setLoading(false);
      }
    });

    // Cleanup al desmontar el componente
    return () => {
      log('useRecentActivitiesDashboard: Limpiando suscripción...');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  // Efecto para obtener el total de actividades
  useEffect(() => {
    const allActivities = activityStreamService.getCurrentActivities();
    setTotalActivities(allActivities.length);
  }, [activities]);

  return {
    activities,
    loading,
    error,
    refreshActivities,
    formatTimeAgo,
    getActivityIconName,
    getActivityColor,
    getActivityBadgeText,
    getActivityBadgeColor,
    totalActivities,
    hasActivities
  };
};

export default useRecentActivitiesDashboard; 