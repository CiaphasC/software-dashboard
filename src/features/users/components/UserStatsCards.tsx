import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { 
  Users, 
  Crown, 
  Shield, 
  Target, 
  Activity, 
  Database 
} from 'lucide-react';
import { usersService } from '@/shared/services/usersService';
import { useObservable } from '@/shared/reactive/hooks/useReactiveState';

/**
 * COMPONENTE DE ESTADÍSTICAS REACTIVAS
 * 
 * Este componente utiliza el servicio reactivo centralizado para mostrar
 * estadísticas en tiempo real sin causar bucles infinitos.
 * 
 * CARACTERÍSTICAS:
 * - Usa observables memoizados del servicio centralizado
 * - Estadísticas calculadas automáticamente
 * - Actualización en tiempo real
 * - Performance optimizada
 */
export const UserStatsCards: React.FC = () => {
  // Usar observables reactivos del servicio centralizado
  const users = useObservable(usersService.users$, []);
  const stats = useObservable(usersService.stats$, {
    total: 0,
    admin: 0,
    technician: 0,
    requester: 0,
    active: 0,
    departments: 0,
  });

  // Asegurar que stats no sea undefined
  const safeStats = stats || {
    total: 0,
    admin: 0,
    technician: 0,
    requester: 0,
    active: 0,
    departments: 0,
  };

  const statCards = [
    {
      title: 'Total Usuarios',
      value: safeStats.total,
      icon: <Users className="h-5 w-5" />,
      color: 'from-blue-500 to-sky-500',
      trend: '+15%',
      trendColor: 'text-green-500',
      subtitle: `${safeStats.active} activos`
    },
    {
      title: 'Administradores',
      value: safeStats.admin,
      icon: <Crown className="h-5 w-5" />,
      color: 'from-red-500 to-pink-500',
      trend: '+3%',
      trendColor: 'text-red-500',
      subtitle: `${safeStats.total > 0 ? Math.round((safeStats.admin / safeStats.total) * 100) : 0}% del total`
    },
    {
      title: 'Técnicos',
      value: safeStats.technician,
      icon: <Shield className="h-5 w-5" />,
      color: 'from-indigo-500 to-blue-500',
      trend: '+8%',
      trendColor: 'text-blue-500',
      subtitle: `${safeStats.total > 0 ? Math.round((safeStats.technician / safeStats.total) * 100) : 0}% del total`
    },
    {
      title: 'Solicitantes',
      value: safeStats.requester,
      icon: <Target className="h-5 w-5" />,
      color: 'from-emerald-500 to-green-500',
      trend: '+12%',
      trendColor: 'text-emerald-500',
      subtitle: `${safeStats.total > 0 ? Math.round((safeStats.requester / safeStats.total) * 100) : 0}% del total`
    },
    {
      title: 'Departamentos',
      value: safeStats.departments,
      icon: <Database className="h-5 w-5" />,
      color: 'from-amber-500 to-orange-500',
      trend: '+2',
      trendColor: 'text-amber-500',
      subtitle: 'Activos en el sistema'
    },
    {
      title: 'Usuarios Activos',
      value: safeStats.active,
      icon: <Activity className="h-5 w-5" />,
      color: 'from-sky-500 to-blue-500',
      trend: '+18%',
      trendColor: 'text-sky-500',
      subtitle: `${safeStats.total > 0 ? Math.round((safeStats.active / safeStats.total) * 100) : 0}% del total`
    }
  ];

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
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estadísticas de Usuarios</h2>
          <p className="text-gray-600">Resumen de la actividad y distribución de usuarios</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>Actualizado en tiempo real</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </h3>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </span>
                      <span className={`text-sm font-semibold ${stat.trendColor}`}>
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Insights */}
      {safeStats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {safeStats.total > 0 ? Math.round((safeStats.active / safeStats.total) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Usuarios Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {Math.round((safeStats.technician / safeStats.total) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Personal Técnico</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {Math.round((safeStats.requester / safeStats.total) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Usuarios Finales</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}; 