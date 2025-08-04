import { useMemo } from 'react';
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

export const useDashboardCharts = (metrics: DashboardMetrics | null) => {
  // Datos procesados para los gráficos
  const chartData = useMemo(() => {
    if (!metrics) {
      // Devolver datos por defecto cuando metrics es null
      return {
        incidentsByMonth: [],
        incidentsByArea: [],
        statusDistribution: [
          { name: 'Abiertas', value: 0, color: '#f59e0b' },
          { name: 'En Proceso', value: 0, color: '#6366f1' },
          { name: 'Resueltas', value: 0, color: '#10b981' },
          { name: 'Cerradas', value: 0, color: '#6b7280' }
        ],
        resolutionTrend: [
          { mes: 'Ene', tiempo: 0 },
          { mes: 'Feb', tiempo: 0 },
          { mes: 'Mar', tiempo: 0 },
          { mes: 'Abr', tiempo: 0 },
          { mes: 'May', tiempo: 0 },
          { mes: 'Jun', tiempo: 0 }
        ]
      };
    }

    return {
      // Datos para el gráfico de incidencias por mes
      incidentsByMonth: (metrics.incidentsByMonth || []).map(item => ({
        name: item.month,
        incidencias: item.count
      })),

      // Datos para el gráfico de incidencias por área
      incidentsByArea: (metrics.topDepartments || []).map(item => ({
        name: item.department,
        incidencias: item.count
      })),

      // Datos para el gráfico de distribución por estado
      statusDistribution: [
        { name: 'Abiertas', value: metrics.openIncidents || 0, color: '#f59e0b' },
        { name: 'En Proceso', value: metrics.inProgressIncidents || 0, color: '#6366f1' },
        { name: 'Resueltas', value: metrics.resolvedIncidents || 0, color: '#10b981' },
        { name: 'Cerradas', value: metrics.closedIncidents || 0, color: '#6b7280' }
      ],

      // Datos para el gráfico de tendencia de resolución (mock data)
      resolutionTrend: [
        { mes: 'Ene', tiempo: 24 },
        { mes: 'Feb', tiempo: 22 },
        { mes: 'Mar', tiempo: 20 },
        { mes: 'Abr', tiempo: 18 },
        { mes: 'May', tiempo: 16 },
        { mes: 'Jun', tiempo: 14 }
      ]
    };
  }, [metrics]);

  // Datos procesados para las tarjetas de métricas
  const metricCards = useMemo(() => {
    if (!metrics) {
      // Devolver tarjetas por defecto cuando metrics es null
      return [
        {
          title: "Total Incidencias",
          value: 0,
          icon: "FiAlertTriangle",
          trend: 0,
          subtitle: "Todas las incidencias registradas",
          status: "danger" as const,
          color: "from-red-500 to-red-600"
        },
        {
          title: "Incidencias Abiertas",
          value: 0,
          icon: "FiClock",
          trend: 0,
          subtitle: "Pendientes de resolución",
          status: "warning" as const,
          color: "from-amber-500 to-orange-500"
        },
        {
          title: "Requerimientos Pendientes",
          value: 0,
          icon: "FiFileText",
          trend: 0,
          subtitle: "Solicitudes en espera",
          status: "info" as const,
          color: "from-blue-500 to-cyan-500"
        },
        {
          title: "Tiempo Promedio",
          value: "0h",
          icon: "FiTrendingUp",
          trend: 0,
          subtitle: "Basado en 0 incidencias",
          status: "success" as const,
          color: "from-emerald-500 to-green-500"
        }
      ];
    }

    return [
      {
        title: "Total Incidencias",
        value: metrics.totalIncidents || 0,
        icon: "FiAlertTriangle",
        trend: typeof metrics.incidentTrend === 'object' ? metrics.incidentTrend.value : (metrics.incidentTrend || 0),
        subtitle: "Todas las incidencias registradas",
        status: "danger" as const,
        color: "from-red-500 to-red-600"
      },
      {
        title: "Incidencias Abiertas",
        value: metrics.openIncidents || 0,
        icon: "FiClock",
        trend: typeof metrics.openIncidentTrend === 'object' ? metrics.openIncidentTrend.value : (metrics.openIncidentTrend || 0),
        subtitle: "Pendientes de resolución",
        status: "warning" as const,
        color: "from-amber-500 to-orange-500"
      },
      {
        title: "Requerimientos Pendientes",
        value: metrics.pendingRequirements || 0,
        icon: "FiFileText",
        trend: typeof metrics.requirementTrend === 'object' ? metrics.requirementTrend.value : (metrics.requirementTrend || 0),
        subtitle: "Solicitudes en espera",
        status: "info" as const,
        color: "from-blue-500 to-cyan-500"
      },
      {
        title: "Tiempo Promedio",
        value: formatResolutionTime(metrics.averageResolutionTime || 0),
        icon: "FiTrendingUp",
        trend: -5, // Valor fijo ya que no existe resolutionTimeTrend
        subtitle: `Basado en ${metrics.totalIncidents || 0} incidencias`,
        status: "success" as const,
        color: "from-emerald-500 to-green-500"
      }
    ];
  }, [metrics]);

  // Datos procesados para los gráficos con configuración completa
  const chartCards = useMemo(() => {
    if (!chartData) {
      // Devolver gráficos por defecto cuando chartData es null
      return [
        {
          title: "Incidencias por Mes",
          subtitle: "Tendencia de incidencias registradas",
          icon: "FiCalendar",
          variant: "gradient" as const,
          data: [],
          chartType: "area" as const,
          config: chartConfigs.area
        },
        {
          title: "Incidencias por Área",
          subtitle: "Distribución por área afectada",
          icon: "FiCrosshair",
          variant: "default" as const,
          data: [],
          chartType: "bar" as const,
          config: chartConfigs.bar
        },
        {
          title: "Distribución por Estado",
          subtitle: "Estado actual de incidencias",
          icon: "FiPieChart",
          variant: "glass" as const,
          data: [],
          chartType: "pie" as const,
          config: chartConfigs.pie
        },
        {
          title: "Tendencia de Resolución",
          subtitle: "Tiempo promedio de resolución",
          icon: "FiGift",
          variant: "gradient" as const,
          data: [],
          chartType: "line" as const,
          config: chartConfigs.line
        }
      ];
    }

    return [
      {
        title: "Incidencias por Mes",
        subtitle: "Tendencia de incidencias registradas",
        icon: "FiCalendar",
        variant: "gradient" as const,
        data: chartData.incidentsByMonth,
        chartType: "area" as const,
        config: chartConfigs.area
      },
      {
        title: "Incidencias por Área",
        subtitle: "Distribución por área afectada",
        icon: "FiCrosshair",
        variant: "default" as const,
        data: chartData.incidentsByArea,
        chartType: "bar" as const,
        config: chartConfigs.bar
      },
      {
        title: "Distribución por Estado",
        subtitle: "Estado actual de incidencias",
        icon: "FiPieChart",
        variant: "glass" as const,
        data: chartData.statusDistribution,
        chartType: "pie" as const,
        config: chartConfigs.pie
      },
      {
        title: "Tendencia de Resolución",
        subtitle: "Tiempo promedio de resolución",
        icon: "FiGift",
        variant: "gradient" as const,
        data: chartData.resolutionTrend,
        chartType: "line" as const,
        config: chartConfigs.line
      }
    ];
  }, [chartData]);

  // Función para obtener configuración de gráfico
  const getChartConfig = (chartType: string) => {
    return chartConfigs[chartType as keyof typeof chartConfigs] || {};
  };

  // Función para obtener configuración de tooltip
  const getTooltipStyle = () => tooltipStyle;

  return {
    // Datos procesados
    metricCards,
    chartCards,
    chartData,
    
    // Configuraciones
    getChartConfig,
    getTooltipStyle,
    
    // Función de utilidad
    formatResolutionTime
  };
}; 