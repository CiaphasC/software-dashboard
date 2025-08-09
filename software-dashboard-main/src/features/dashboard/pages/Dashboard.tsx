import React, { useEffect } from 'react';
import { log } from '@/shared/utils/logger';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiXCircle,
  FiActivity,
  FiBarChart2,
  FiShield,
  FiClock
} from 'react-icons/fi';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { RecentActivities } from '@/features/dashboard/components/RecentActivities';
import { DashboardMetrics } from '@/features/dashboard/components/DashboardMetrics';
import { useDashboardAnimations } from '@/features/dashboard/hooks/pages';
import { useDashboardMetrics } from '@/features/dashboard/hooks';
// import { generateInitialActivities } from '@/shared/hooks/useRecentActivities';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    metrics, 
    loading, 
    error 
  } = useDashboardMetrics();

  // Hook personalizado para todas las animaciones del dashboard
  const animations = useDashboardAnimations();

  // Skeleton de cabecera para primera carga
  const HeaderSkeleton = (
    <div className="py-12">
      <div className="inline-flex items-center gap-6 mb-6">
        <div className="p-6 rounded-3xl bg-gray-200 animate-pulse w-20 h-20" />
        <div>
          <div className="h-10 w-56 bg-gray-200 rounded-md animate-pulse mb-3" />
          <div className="h-4 w-80 bg-gray-100 rounded-md animate-pulse" />
        </div>
      </div>
      <div className="h-5 w-3/4 max-w-xl bg-gray-100 rounded-md animate-pulse" />
    </div>
  );

  useEffect(() => {
    if (metrics) {
      // Inicializar actividades recientes basadas en los datos
      log('Dashboard: Inicializando actividades...');
      log('Dashboard: Incidencias disponibles:', metrics.incidents?.length || 0);
      log('Dashboard: Requerimientos disponibles:', metrics.requirements?.length || 0);
      
      // generateInitialActivities(
      //   metrics.incidents || [],
      //   metrics.requirements || []
      // );
    }
  }, [metrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl animate-pulse" />
          <div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-200/40 to-teal-200/40 rounded-full blur-3xl animate-pulse" 
            style={animations.backgroundElementStyle} 
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-6">
          <motion.div className="space-y-8" {...animations.containerAnimation}>
            {HeaderSkeleton}
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <motion.div
          {...animations.errorAnimation}
          className="text-center"
        >
          <FiXCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium">{error || 'Error al cargar el dashboard'}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl animate-pulse" />
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-200/40 to-teal-200/40 rounded-full blur-3xl animate-pulse" 
          style={animations.backgroundElementStyle} 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <motion.div
          className="space-y-8"
          {...animations.containerAnimation}
        >
          {/* Header Ultra Moderno */}
          <motion.div 
            className="text-center py-12"
            {...animations.headerAnimation}
          >
            <motion.div
              className="inline-flex items-center gap-6 mb-8"
              {...animations.headerIconContainerAnimation}
            >
              <motion.div 
                className="p-6 rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 text-white shadow-2xl relative overflow-hidden"
                {...animations.headerIconAnimation}
              >
                {/* Efecto de brillo */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  {...animations.shimmerAnimation}
                />
                <FiBarChart2 className="h-12 w-12 relative z-10" />
              </motion.div>
              <div className="text-left">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  Dashboard
                </h1>
                <motion.div
                  className="flex items-center gap-4 text-sm text-gray-500"
                  {...animations.statusTextAnimation}
                >
                  <div className="flex items-center gap-2">
                    <FiActivity className="h-4 w-4 text-emerald-500" />
                    <span>Sistema Activo</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <FiClock className="h-4 w-4 text-blue-500" />
                    <span>Tiempo Real</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <FiShield className="h-4 w-4 text-green-500" />
                    <span>Seguro</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.p 
              className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
              {...animations.descriptionAnimation}
            >
              Resumen general del sistema de gestión de incidencias y requerimientos con análisis en tiempo real
            </motion.p>
          </motion.div>

          {/* Dashboard Metrics and Charts */}
          <motion.div {...animations.metricsAnimation}>
            <DashboardMetrics metrics={metrics} />
          </motion.div>
                
          {/* Recent Activity Mejorado */}
          <motion.div {...animations.activitiesAnimation}>
            <RecentActivities onViewAll={() => navigate('/activities')} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 
