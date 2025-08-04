import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, ArrowRight, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
// import { useRecentActivitiesDashboard } from '@/features/dashboard/hooks';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';

interface Activity {
  id: string;
  type: 'incident' | 'requirement' | 'user' | 'system';
  action: 'created' | 'updated' | 'resolved' | 'deleted';
  title: string;
  description: string;
  user: string;
  timestamp: Date;
}

interface RecentActivitiesProps {
  onViewAll?: () => void;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ onViewAll }) => {
  // Datos mock temporales hasta implementar el store
  const activities: Activity[] = [
    {
      id: 'activity_1',
      type: 'incident',
      action: 'created',
      title: 'Nueva incidencia reportada',
      description: 'Problema con el servidor de correo electrónico',
      user: 'Juan Pérez',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
    },
    {
      id: 'activity_2',
      type: 'incident',
      action: 'resolved',
      title: 'Incidencia resuelta',
      description: 'Servidor de correo restaurado exitosamente',
      user: 'Carlos Rodríguez',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 horas atrás
    },
    {
      id: 'activity_3',
      type: 'requirement',
      action: 'created',
      title: 'Nuevo requerimiento solicitado',
      description: 'Solicitud de acceso a base de datos',
      user: 'Laura Sánchez',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 horas atrás
    },
    {
      id: 'activity_4',
      type: 'requirement',
      action: 'resolved',
      title: 'Requerimiento entregado',
      description: 'Acceso a base de datos configurado',
      user: 'Ana Martínez',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 horas atrás
    },
    {
      id: 'activity_5',
      type: 'user',
      action: 'created',
      title: 'Nuevo usuario registrado',
      description: 'María González se ha registrado en el sistema',
      user: 'María González',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 horas atrás
    }
  ];
  const loading = false;
  const error = null;
  const hasActivities = activities.length > 0;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'Ahora';
  };

  const getActivityIconName = (type: string, action: string) => {
    if (type === 'incident') return 'AlertTriangle';
    if (type === 'requirement') {
      if (action === 'resolved') return 'CheckCircle';
      return 'FileText';
    }
    return 'Clock';
  };

  const getActivityColor = (type: string) => {
    if (type === 'incident') return 'text-yellow-600';
    if (type === 'requirement') return 'text-blue-600';
    return 'text-gray-600';
  };

  const getActivityBadgeText = (type: string, action: string) => {
    if (type === 'incident') {
      if (action === 'created') return 'Nuevo';
      if (action === 'updated') return 'Actualizado';
      if (action === 'resolved') return 'Resuelto';
    }
    if (type === 'requirement') {
      if (action === 'created') return 'Nuevo';
      if (action === 'updated') return 'Actualizado';
      if (action === 'resolved') return 'Completado';
    }
    return action;
  };

  const getActivityBadgeColor = (type: string, action: string) => {
    if (action === 'resolved') return 'bg-green-100 text-green-800';
    if (action === 'created') return 'bg-blue-100 text-blue-800';
    if (action === 'updated') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Mapeo de iconos
  const iconMap = {
    AlertTriangle: AlertTriangle,
    FileText: FileText,
    CheckCircle: CheckCircle,
    Clock: Clock
  };

  // Función para obtener el icono con estilos
  const getActivityIcon = (type: string, action: string) => {
    const iconName = getActivityIconName(type, action);
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    
    if (type === 'incident') {
      return <IconComponent className="h-6 w-6 text-yellow-500 drop-shadow-md" />;
    } else if (type === 'requirement') {
      if (action === 'resolved') {
        return <IconComponent className="h-6 w-6 text-green-500 drop-shadow-md" />;
      }
      return <IconComponent className="h-6 w-6 text-blue-500 drop-shadow-md" />;
    }
    return <IconComponent className="h-6 w-6 text-gray-400 drop-shadow-md" />;
  };



  // Mostrar loading si está cargando
  if (loading) {
    return (
      <Card className="h-full min-h-[400px] bg-white/60 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50/80 to-cyan-100/80 border-b border-blue-200/60 rounded-t-3xl px-6 py-5">
          <CardTitle className="flex items-center gap-3 text-blue-900 text-xl font-bold tracking-tight">
            <Clock className="h-7 w-7 text-blue-500 animate-pulse" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <Card className="h-full min-h-[400px] bg-white/60 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50/80 to-cyan-100/80 border-b border-blue-200/60 rounded-t-3xl px-6 py-5">
          <CardTitle className="flex items-center gap-3 text-blue-900 text-xl font-bold tracking-tight">
            <Clock className="h-7 w-7 text-blue-500 animate-pulse" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center text-red-500 py-8">
            <p className="text-lg font-medium">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full min-h-[400px] bg-white/60 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50/80 to-cyan-100/80 border-b border-blue-200/60 rounded-t-3xl px-6 py-5">
        <CardTitle className="flex items-center gap-3 text-blue-900 text-xl font-bold tracking-tight">
          <Clock className="h-7 w-7 text-blue-500 animate-pulse" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <AnimatePresence>
            {!hasActivities ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500 py-12"
              >
                <Clock className="h-14 w-14 mx-auto mb-4 text-gray-300 animate-pulse" />
                <p className="text-lg font-medium">No hay actividades recientes</p>
              </motion.div>
            ) : (
              activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.07, type: 'spring', stiffness: 60 }}
                  className="flex items-center gap-4 p-4 bg-white/70 border border-gray-100/60 rounded-2xl shadow-sm hover:shadow-md hover:bg-white/90 transition-all cursor-pointer group"
                >
                                     <div className={`h-12 w-12 flex items-center justify-center rounded-full border-2 shadow-md ${getActivityColor(activity.type)} group-hover:scale-105 transition-transform`}>
                    {getActivityIcon(activity.type, activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium">{activity.user}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 min-w-[80px]">
                    <span className="text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full whitespace-nowrap font-semibold">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                                         <div className={`text-xs px-2 py-1 rounded-full font-bold tracking-wide shadow-sm ${getActivityBadgeColor(activity.type, activity.action)}`}>
                       {getActivityBadgeText(activity.type, activity.action)}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        <div className="mt-6 pt-4 border-t border-blue-100/60 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAll}
            className="w-full max-w-xs text-base font-semibold bg-gradient-to-r from-blue-500/90 to-cyan-500/90 text-white shadow-lg hover:from-blue-600 hover:to-cyan-600 hover:scale-[1.03] transition-all flex items-center justify-center gap-2 rounded-xl"
          >
            <span className="flex items-center gap-2">
              Ver todas las actividades
              <motion.span
                initial={{ x: 0 }}
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="inline-block"
              >
                <ArrowRight className="h-5 w-5" />
              </motion.span>
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 
