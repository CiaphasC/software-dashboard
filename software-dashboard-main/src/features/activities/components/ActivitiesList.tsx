import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Clock, User, Calendar, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

interface Activity {
  id: string;
  type: 'incident' | 'requirement' | 'user' | 'system';
  action: 'created' | 'updated' | 'resolved' | 'deleted' | 'closed';
  title: string;
  description: string;
  user: string;
  timestamp: Date;
}

interface ActivitiesListProps {
  activities: Activity[];
  filteredActivities: Activity[];
  paginatedActivities: Activity[];
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  getActivityIcon: (type: string, action: string) => React.ReactNode;
  getActivityColor: (type: string, action: string) => string;
  formatTimeAgo: (timestamp: Date) => string;
  className?: string;
}

const ActivitiesList: React.FC<ActivitiesListProps> = ({
  activities,
  filteredActivities,
  paginatedActivities,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  onPageChange,
  onClearFilters,
  getActivityIcon,
  getActivityColor,
  formatTimeAgo,
  className = ''
}) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      rotateX: -15 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 15 
      }
    }
  };

  const activityVariants = {
    hidden: { 
      opacity: 0, 
      x: -50 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 15 
      }
    },
    exit: { 
      opacity: 0, 
      x: 50 
    }
  };

  return (
    <motion.div variants={cardVariants} className={className}>
      <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-100 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </motion.div>
              <span className="text-blue-800 font-semibold">Actividades ({filteredActivities.length})</span>
            </div>
            <div className="text-sm text-blue-500 bg-white/70 px-3 py-1 rounded-full">
              Página {currentPage} de {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {filteredActivities.length === 0 ? (
            <motion.div className="text-center py-16" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <Clock className="h-12 w-12 text-blue-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">No se encontraron actividades</h3>
              <p className="text-blue-500 mb-6">Intenta ajustar los filtros de búsqueda</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={onClearFilters} className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <div className="space-y-4">
                {paginatedActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    variants={activityVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ scale: 1.03, y: -2, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
                    className="flex items-center gap-4 p-6 bg-gradient-to-r from-white/90 to-blue-50/80 backdrop-blur rounded-2xl border border-white/30 hover:border-blue-200 transition-all duration-300 cursor-pointer group hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <motion.div className={`h-16 w-16 ${getActivityColor(activity.type, activity.action)} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`} whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }}>
                      {getActivityIcon(activity.type, activity.action)}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.p className="text-lg font-semibold text-blue-900 truncate group-hover:text-blue-700 transition-colors duration-200" whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                          {activity.title}
                        </motion.p>
                        <div className="flex items-center gap-1 text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded-full">
                          <User className="h-3.5 w-3.5" />
                          <span className="font-medium">{activity.user}</span>
                        </div>
                      </div>
                      <p className="text-sm text-blue-700/80 line-clamp-2 group-hover:text-blue-900 transition-colors duration-200">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <motion.div className="flex items-center gap-2 text-xs text-blue-500 bg-white/80 px-3 py-2 rounded-full border border-blue-100" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">{formatTimeAgo(activity.timestamp)}</span>
                      </motion.div>
                      <motion.div className={`text-xs px-3 py-1 rounded-full font-medium ${activity.type === 'incident' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border border-yellow-200' : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200'}`} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                        {activity.type === 'incident' ? 'Incidencia' : 'Requerimiento'}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
          {/* Paginación */}
          {totalPages > 1 && (
            <motion.div className="flex items-center justify-between mt-8 pt-6 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="text-sm text-blue-600 bg-white/70 px-4 py-2 rounded-full">
                Mostrando <span className="font-semibold text-blue-700">{startIndex + 1}-{Math.min(endIndex, filteredActivities.length)}</span> de <span className="font-semibold text-blue-700">{filteredActivities.length}</span> actividades
              </div>
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="bg-white/90 backdrop-blur border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-xl">
                    ← Anterior
                  </Button>
                </motion.div>
                <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full">
                  <span className="text-sm font-medium text-blue-700">
                    Página <span className="text-blue-700 font-bold">{currentPage}</span> de <span className="text-blue-700 font-bold">{totalPages}</span>
                  </span>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="bg-white/90 backdrop-blur border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-xl">
                    Siguiente →
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivitiesList; 