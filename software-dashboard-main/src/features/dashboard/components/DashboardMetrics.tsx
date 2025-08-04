import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Users, 
  FileText, 
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { formatDuration } from '@/shared/utils/utils';

interface DashboardMetricsProps {
  metrics: {
    totalIncidents: number;
    openIncidents: number;
    pendingIncidents: number;
    inProgressIncidents: number;
    completedIncidents: number;
    deliveredIncidents: number;
    closedIncidents: number;
    totalRequirements: number;
    pendingRequirements: number;
    deliveredRequirements: number;
    pendingRegistrations: number;
    totalUsers: number;
    averageResponseTime: number;
    averageReviewTime: number;
    averageResolutionTime: number;
    averageDeliveryTime: number;
  };
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics }) => {
  const metricCards = [
    {
      title: 'Total Incidencias',
      value: metrics.totalIncidents,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      trend: '+12%',
      trendColor: 'text-green-500'
    },
    {
      title: 'Abiertas',
      value: metrics.openIncidents,
      icon: <Clock className="h-5 w-5" />,
      color: 'from-orange-500 to-red-500',
      trend: '+5%',
      trendColor: 'text-orange-500'
    },
    {
      title: 'Pendientes',
      value: metrics.pendingIncidents,
      icon: <Clock className="h-5 w-5" />,
      color: 'from-yellow-500 to-orange-500',
      trend: '+3%',
      trendColor: 'text-yellow-500'
    },
    {
      title: 'En Proceso',
      value: metrics.inProgressIncidents,
      icon: <Activity className="h-5 w-5" />,
      color: 'from-blue-500 to-indigo-500',
      trend: '-2%',
      trendColor: 'text-green-500'
    },
    {
      title: 'Completadas',
      value: metrics.completedIncidents,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
      trend: '+8%',
      trendColor: 'text-green-500'
    },
    {
      title: 'Entregadas',
      value: metrics.deliveredIncidents,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'from-emerald-500 to-teal-500',
      trend: '+6%',
      trendColor: 'text-green-500'
    },
    {
      title: 'Tiempo Respuesta Promedio',
      value: formatDuration(metrics.averageResponseTime),
      icon: <Clock className="h-5 w-5" />,
      color: 'from-orange-400 to-orange-600',
      trend: '-15%',
      trendColor: 'text-green-500',
      subtitle: 'Desde creación hasta revisión'
    },
    {
      title: 'Tiempo Revisión Promedio',
      value: formatDuration(metrics.averageReviewTime),
      icon: <Zap className="h-5 w-5" />,
      color: 'from-blue-400 to-blue-600',
      trend: '-8%',
      trendColor: 'text-green-500',
      subtitle: 'Desde revisión hasta resolución'
    },
    {
      title: 'Tiempo Resolución Promedio',
      value: formatDuration(metrics.averageResolutionTime),
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'from-green-400 to-green-600',
      trend: '-12%',
      trendColor: 'text-green-500',
      subtitle: 'Tiempo total de resolución'
    },
    {
      title: 'Total Requerimientos',
      value: metrics.totalRequirements,
      icon: <FileText className="h-5 w-5" />,
      color: 'from-purple-500 to-indigo-500',
      trend: '+4%',
      trendColor: 'text-purple-500'
    },
    {
      title: 'Tiempo Entrega Promedio',
      value: formatDuration(metrics.averageDeliveryTime),
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'from-emerald-400 to-emerald-600',
      trend: '-10%',
      trendColor: 'text-green-500',
      subtitle: 'Tiempo total de entrega'
    },
    {
      title: 'Usuarios Activos',
      value: metrics.totalUsers,
      icon: <Users className="h-5 w-5" />,
      color: 'from-indigo-500 to-purple-500',
      trend: '+2%',
      trendColor: 'text-indigo-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {metricCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:border-gray-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/10">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} shadow-lg`}>
                  <div className="text-white">
                    {card.icon}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${card.trendColor}`}>
                    {card.trend}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">
                    {card.subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardMetrics; 