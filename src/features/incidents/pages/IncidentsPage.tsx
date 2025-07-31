import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  X, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  BarChart3,
  Download,
  Share2,
  Activity
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';

import { IncidentForm } from '@/features/incidents/components/IncidentForm';
import { useIncidentsPage } from '@/features/incidents/hooks';
import { Incident, IncidentType, IncidentStatus, Priority } from '@/shared/types/common.types';
import { IncidentsTable } from '@/features/incidents/components/IncidentsTable';
import { IncidentsFilters } from '@/features/incidents/components/IncidentsFilters';

// Componente de partículas flotantes
const FloatingParticles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-orange-400/30 to-red-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

// Componente de estadísticas moderno
const IncidentStats: React.FC<{ incidents: Incident[] }> = ({ incidents }) => {
  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === IncidentStatus.OPEN).length,
    inProgress: incidents.filter(i => i.status === IncidentStatus.IN_PROGRESS).length,
    resolved: incidents.filter(i => i.status === IncidentStatus.RESOLVED).length,
    urgent: incidents.filter(i => i.priority === Priority.URGENT).length,
    high: incidents.filter(i => i.priority === Priority.HIGH).length,
  };

  const statCards = [
    {
      title: 'Total Incidencias',
      value: stats.total,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      trend: '+12%',
      trendColor: 'text-green-500'
    },
    {
      title: 'Abiertas',
      value: stats.open,
      icon: <Clock className="h-5 w-5" />,
      color: 'from-orange-500 to-red-500',
      trend: '+5%',
      trendColor: 'text-orange-500'
    },
    {
      title: 'En Proceso',
      value: stats.inProgress,
      icon: <Activity className="h-5 w-5" />,
      color: 'from-yellow-500 to-orange-500',
      trend: '-2%',
      trendColor: 'text-green-500'
    },
    {
      title: 'Resueltas',
      value: stats.resolved,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
      trend: '+8%',
      trendColor: 'text-green-500'
    },
    {
      title: 'Urgentes',
      value: stats.urgent,
      icon: <Zap className="h-5 w-5" />,
      color: 'from-red-500 to-pink-500',
      trend: '+3%',
      trendColor: 'text-red-500'
    },
    {
      title: 'Alta Prioridad',
      value: stats.high,
      icon: <Shield className="h-5 w-5" />,
      color: 'from-purple-500 to-indigo-500',
      trend: '+7%',
      trendColor: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{stat.title}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-medium ${stat.trendColor}`}>
                      {stat.trend}
                    </span>
                    <TrendingUp className="h-3 w-3 ml-1 text-gray-400" />
                  </div>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};



export const Incidents: React.FC = () => {
  const {
    user,
    filters,
    incidents,
    loading,
    error,
    showForm,
    isSubmitting,
    handleFilterChange,
    handleClearFilters,
    handleCreateIncident,
    openForm,
    closeForm,
    handleIncidentClick,
    handleEditIncident,
    handleDeleteIncident,
    handleViewIncident,
    filterOptions,
  } = useIncidentsPage();



  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium">Error: {error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
      {/* Partículas flotantes */}
      <FloatingParticles />
      
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-red-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        <motion.div
          className="space-y-6 sm:space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header Ultra Moderno */}
          <motion.div 
            className="text-center py-4 sm:py-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl relative overflow-hidden"
                whileHover={{ rotate: 2, scale: 1.05 }}
                animate={{ 
                  boxShadow: [
                    "0 20px 40px rgba(249, 115, 22, 0.3)",
                    "0 20px 40px rgba(239, 68, 68, 0.4)",
                    "0 20px 40px rgba(236, 72, 153, 0.3)",
                    "0 20px 40px rgba(249, 115, 22, 0.3)"
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
                <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 relative z-10" />
              </motion.div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Incidencias
                </h1>
                <motion.div
                  className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                    <span>Gestión Activa</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    <span>Análisis en Tiempo Real</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500" />
                    <span>Monitoreo Continuo</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.p 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Sistema integral de gestión y seguimiento de incidencias técnicas con análisis avanzado y respuesta automatizada
            </motion.p>
          </motion.div>

          {/* Estadísticas */}
          <IncidentStats incidents={incidents} />

          {/* Header con acciones */}
          <motion.div 
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">
                  {loading ? 'Cargando...' : `${incidents.length} incidencias encontradas`}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-300 text-xs sm:text-sm"
                >
                  <Download className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-300 text-xs sm:text-sm"
                >
                  <Share2 className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Compartir</span>
                </Button>
              </div>
              <Button 
                onClick={openForm}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                Nueva Incidencia
              </Button>
            </div>
          </motion.div>

          {/* Filtros modernos */}
          <IncidentsFilters
            filters={filterOptions}
            values={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            onSearch={(query: string) => handleFilterChange('search', query)}
            searchPlaceholder="Buscar incidencias por título, descripción o área..."
          />

          {/* Tabla de incidencias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Lista de Incidencias
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <IncidentsTable
                  incidents={incidents}
                  loading={loading}
                  onIncidentClick={handleIncidentClick}
                  onEditIncident={handleEditIncident}
                  onDeleteIncident={handleDeleteIncident}
                  onViewIncident={handleViewIncident}
                />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal de Incidencias */}
      <IncidentForm
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleCreateIncident}
        loading={isSubmitting}
      />
    </div>
  );
};

export default Incidents; 
