import { useState, useEffect } from 'react';
import { log, logger } from '@/shared/utils/logger';
import { DashboardService } from '@/features/dashboard/services';
import { DashboardMetrics } from '@/shared/types/common.types';

// Función para formatear el tiempo de resolución
const formatResolutionTime = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  } else if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours > 0) {
      return `${days}d ${remainingHours.toFixed(1)}h`;
    } else {
      return `${days}d`;
    }
  }
};

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        log('Fetching dashboard metrics...');
        const response = await DashboardService.getDashboardMetrics();
        
        if (response.success && response.data) {
          log('Dashboard metrics received:', response.data);
          setMetrics(response.data);
        } else {
          logger.error('useDashboardMetrics: Error fetching dashboard metrics', new Error(response.error || 'Unknown error'));
          setError(response.error || 'Error al cargar las métricas del dashboard');
        }
      } catch (err) {
        logger.error('useDashboardMetrics: Error fetching dashboard metrics', err as Error);
        setError('Error al cargar las métricas del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const refetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DashboardService.refreshDashboardMetrics();
      
      if (response.success && response.data) {
        setMetrics(response.data);
      } else {
        setError(response.error || 'Error al recargar las métricas del dashboard');
      }
    } catch (err) {
      logger.error('useDashboardMetrics: Error refetching dashboard metrics', err as Error);
      setError('Error al recargar las métricas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estados básicos
    metrics,
    loading,
    error,
    
    // Funciones
    refetchMetrics,
    
    // Función de utilidad
    formatResolutionTime
  };
}; 