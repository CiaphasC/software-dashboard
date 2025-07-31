import { useState, useEffect, useMemo } from 'react';
import { log } from '@/shared/utils/logger';
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

// Configuraciones de gráficos
const chartConfigs = {
  area: {
    margin: { top: 20, right: 30, left: 20, bottom: 80 },
    xAxis: {
      fontSize: 11,
      angle: -45,
      textAnchor: "end",
      height: 80
    },
    yAxis: {
      fontSize: 12
    },
    dataKey: "incidencias",
    stroke: "#6366f1",
    strokeWidth: 3,
    gradientId: "colorIncidencias",
    gradientColors: ["#6366f1", "#6366f1"]
  },
  bar: {
    margin: { top: 20, right: 30, left: 20, bottom: 60 },
    xAxis: {
      fontSize: 11,
      angle: -45,
      textAnchor: "end",
      height: 60
    },
    yAxis: {
      fontSize: 12
    },
    dataKey: "incidencias",
    fill: "url(#colorIncidencias)",
    radius: [8, 8, 0, 0]
  },
  pie: {
    cx: "50%",
    cy: "50%",
    outerRadius: 100,
    dataKey: "value"
  },
  line: {
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    xAxis: {
      fontSize: 12
    },
    yAxis: {
      fontSize: 12
    },
    dataKey: "tiempo",
    stroke: "#06b6d4",
    strokeWidth: 3,
    gradientId: "colorTiempo",
    gradientColors: ["#06b6d4", "#06b6d4"]
  }
};

// Configuración de tooltip
const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)'
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
          console.error('Error fetching dashboard metrics:', response.error);
          setError(response.error || 'Error al cargar las métricas del dashboard');
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
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
      console.error('Error refetching dashboard metrics:', err);
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