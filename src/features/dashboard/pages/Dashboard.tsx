import React, { useEffect } from 'react';
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
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { generateInitialActivities } from '@/shared/hooks/useRecentActivities';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    metrics, 
    loading, 
    error 
  } = useDashboardMetrics();

  useEffect(() => {
    if (metrics) {
      // Inicializar actividades recientes basadas en los datos
      console.log('Dashboard: Inicializando actividades...');
      console.log('Dashboard: Incidencias disponibles:', metrics.incidents?.length || 0);
      console.log('Dashboard: Requerimientos disponibles:', metrics.requirements?.length || 0);
      
      generateInitialActivities(
        metrics.incidents || [],
        metrics.requirements || []
      );
    }
  }, [metrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
        <LoadingSpinner size="lg" />
          <motion.p
            className="mt-4 text-gray-600 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Cargando dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-200/40 to-teal-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header Ultra Moderno */}
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center gap-6 mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="p-6 rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 text-white shadow-2xl relative overflow-hidden"
                whileHover={{ rotate: 5, scale: 1.1 }}
                animate={{ 
                  boxShadow: [
                    "0 20px 40px rgba(59, 130, 246, 0.3)",
                    "0 20px 40px rgba(6, 182, 212, 0.4)",
                    "0 20px 40px rgba(20, 184, 166, 0.3)",
                    "0 20px 40px rgba(59, 130, 246, 0.3)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {/* Efecto de brillo */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <FiBarChart2 className="h-12 w-12 relative z-10" />
              </motion.div>
              <div className="text-left">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  Dashboard
                </h1>
                <motion.div
                  className="flex items-center gap-4 text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Resumen general del sistema de gestión de incidencias y requerimientos con análisis en tiempo real
            </motion.p>
          </motion.div>

          {/* Dashboard Metrics and Charts */}
                  <DashboardMetrics 
          metrics={metrics} 
        />
                
          {/* Recent Activity Mejorado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <RecentActivities onViewAll={() => navigate('/activities')} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 
