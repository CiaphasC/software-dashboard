import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { RefreshIndicator } from '@/shared/components/ui/RefreshIndicator';
import { useStore } from '@/shared/store/StoreProvider';
import { useComponentRefresh } from '@/shared/hooks/useComponentRefresh';
import { calculateSessionStats } from '@/shared/utils/sessionUtils';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus
} from 'lucide-react';

// =============================================================================
// USER STATS CARDS - Componente de estadísticas de usuarios
// Arquitectura de Software Profesional - Componente de Métricas
// =============================================================================

export const UserStatsCards: React.FC = () => {
  const { users, auth } = useStore();

  // =============================================================================
  // COMPONENT REFRESH - Refresh granular para estadísticas
  // =============================================================================

  const { manualRefresh, isEnabled, lastRefresh } = useComponentRefresh({
    type: 'users-stats',
    enabled: true,
    interval: 45000, // Refresh cada 45 segundos para estadísticas
    dependencies: ['users-stats']
  });

  // =============================================================================
  // STATS CALCULATION - Cálculo de estadísticas basado en estado de sesión
  // =============================================================================

  const stats = React.useMemo(() => {
    const sessionStats = calculateSessionStats(users.users);
    const pendingUsers = auth.pendingUsersCount || 0;

    return {
      total: sessionStats.total,
      active: sessionStats.active,
      inactive: sessionStats.inactive,
      pending: pendingUsers,
      activePercentage: sessionStats.activePercentage
    };
  }, [users.users, auth.pendingUsersCount]);

  // =============================================================================
  // ANIMATION VARIANTS - Variantes de animación
  // =============================================================================

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // =============================================================================
  // RENDER - Renderizado del componente
  // =============================================================================

  return (
    <div className="space-y-6">
      {/* Header con refresh manual */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Estadísticas de Usuarios
        </h2>
        <RefreshIndicator
          isEnabled={isEnabled}
          lastRefresh={lastRefresh}
          refreshType="users-stats"
          onManualRefresh={manualRefresh}
        />
      </div>

      {/* Cards de estadísticas */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Total de Usuarios */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Usuarios</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Usuarios Activos */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Con Sesión Activa</p>
                <p className="text-xs text-green-500 mb-1">Últimas 24 horas</p>
                <p className="text-3xl font-bold text-green-900">{stats.active}</p>
                <Badge variant="success" className="mt-1">
                  {stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(1)}%` : '0%'}
                </Badge>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Usuarios Inactivos */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Sin Sesión Activa</p>
                <p className="text-xs text-red-500 mb-1">Sin actividad reciente</p>
                <p className="text-3xl font-bold text-red-900">{stats.inactive}</p>
                <Badge variant="destructive" className="mt-1">
                  {stats.total > 0 ? `${((stats.inactive / stats.total) * 100).toFixed(1)}%` : '0%'}
                </Badge>
              </div>
              <div className="p-3 bg-red-500 rounded-full">
                <UserX className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Usuarios Pendientes */}
        <motion.div variants={cardVariants}>
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pendientes de Aprobación</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
                {stats.pending > 0 && (
                  <Badge variant="warning" className="mt-1">
                    Requiere atención
                  </Badge>
                )}
              </div>
              <div className="p-3 bg-yellow-500 rounded-full">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserStatsCards; 