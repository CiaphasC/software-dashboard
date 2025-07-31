import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  Download,
  Share2,
  Activity,
  Target,
  BarChart3,
  Database,
  Crown
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { useRequirementsPage } from '@/features/requirements/hooks';
import { Requirement, RequirementStatus, Priority } from '@/shared/types/common.types';
import RequirementForm from '@/features/requirements/components/RequirementForm';
import RequirementsFilters from '@/features/requirements/components/RequirementsFilters';
import RequirementsTable from '@/features/requirements/components/RequirementsTable';

// Componente de partículas flotantes mejorado con colores verdes
const FloatingParticles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Partículas principales verdes */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-emerald-400/50 to-green-400/50 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0.2, 1, 0.2],
            scale: [0.3, 1.8, 0.3],
          }}
          transition={{
            duration: 5 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4,
          }}
        />
      ))}
      
      {/* Partículas de brillo doradas */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-0.5 h-0.5 bg-yellow-300/70 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [0, 1, 0],
            scale: [0, 3, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        />
      ))}
      
      {/* Partículas especiales de esmeralda */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`emerald-${i}`}
          className="absolute w-2 h-2 bg-gradient-to-r from-emerald-300/60 to-teal-300/60 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
            opacity: [0.4, 0.9, 0.4],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 6 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

// Componente de estadísticas ultra moderno con colores verdes
const RequirementStats: React.FC<{ requirements: Requirement[] }> = ({ requirements }) => {
  const stats = {
    total: requirements.length,
    pending: requirements.filter(r => r.status === RequirementStatus.PENDING).length,
    inProgress: requirements.filter(r => r.status === RequirementStatus.IN_PROGRESS).length,
    delivered: requirements.filter(r => r.status === RequirementStatus.DELIVERED).length,
    urgent: requirements.filter(r => r.priority === Priority.URGENT).length,
    high: requirements.filter(r => r.priority === Priority.HIGH).length,
  };

  const statCards = [
    {
      title: 'Total Requerimientos',
      value: stats.total,
      icon: <Database className="h-5 w-5" />,
      color: 'from-emerald-500 to-green-500',
      trend: '+18%',
      trendColor: 'text-emerald-500',
      bgGradient: 'from-emerald-50/80 to-green-50/80'
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: <Clock className="h-5 w-5" />,
      color: 'from-amber-500 to-orange-500',
      trend: '+12%',
      trendColor: 'text-amber-500',
      bgGradient: 'from-amber-50/80 to-orange-50/80'
    },
    {
      title: 'En Proceso',
      value: stats.inProgress,
      icon: <Activity className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      trend: '-5%',
      trendColor: 'text-green-500',
      bgGradient: 'from-blue-50/80 to-cyan-50/80'
    },
    {
      title: 'Entregados',
      value: stats.delivered,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
      trend: '+15%',
      trendColor: 'text-green-500',
      bgGradient: 'from-green-50/80 to-emerald-50/80'
    },
    {
      title: 'Urgentes',
      value: stats.urgent,
      icon: <Zap className="h-5 w-5" />,
      color: 'from-red-500 to-rose-500',
      trend: '+8%',
      trendColor: 'text-red-500',
      bgGradient: 'from-red-50/80 to-rose-50/80'
    },
    {
      title: 'Alta Prioridad',
      value: stats.high,
      icon: <Crown className="h-5 w-5" />,
      color: 'from-purple-500 to-violet-500',
      trend: '+11%',
      trendColor: 'text-purple-500',
      bgGradient: 'from-purple-50/80 to-violet-50/80'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 40, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: index * 0.1, type: "spring", stiffness: 80 }}
          whileHover={{ y: -12, scale: 1.08, rotateY: 5 }}
        >
          <Card className="group hover:shadow-2xl transition-all duration-600 border-0 bg-white/95 backdrop-blur-xl relative overflow-hidden">
            {/* Fondo con gradiente sutil */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-600`} />
            
            {/* Efecto de brillo mejorado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
                delay: 0.8
              }}
            />
            
            {/* Efecto de borde brillante */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/20 via-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
            
            <CardContent className="p-3 sm:p-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1 truncate">{stat.title}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-bold ${stat.trendColor}`}>
                      {stat.trend}
                    </span>
                    <TrendingUp className="h-3 w-3 ml-1 text-gray-400" />
                  </div>
                </div>
                <motion.div 
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0`}
                  whileHover={{ rotate: 8, scale: 1.15 }}
                >
                  {stat.icon}
                </motion.div>
              </div>
              
              {/* Indicador de progreso sutil mejorado */}
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full shadow-sm`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stat.value / Math.max(stats.total, 1)) * 100, 100)}%` }}
                  transition={{ duration: 1.2, delay: index * 0.1 + 0.8, ease: "easeOut" }}
                />
              </div>
              
              {/* Indicador de pulso sutil */}
              <motion.div
                className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};



export const RequirementsPage: React.FC = () => {
  const {
    filters,
    requirements,
    loading,
    error,
    showForm,
    isSubmitting,
    handleFilterChange,
    handleClearFilters,
    handleCreateRequirement,
    openForm,
    closeForm,
    handleRequirementClick,
    handleEditRequirement,
    handleDeleteRequirement,
    handleViewRequirement,
    filterOptions,
  } = useRequirementsPage();



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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">
      {/* Partículas flotantes */}
      <FloatingParticles />
      
      {/* Fondo decorativo mejorado con colores verdes */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-emerald-200/40 to-green-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-green-200/40 to-emerald-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-green-200/25 to-teal-200/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        <motion.div
          className="space-y-6 sm:space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header Ultra Moderno Mejorado con colores verdes */}
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
                className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white shadow-2xl relative overflow-hidden"
                whileHover={{ rotate: 3, scale: 1.08 }}
                animate={{ 
                  boxShadow: [
                    "0 20px 40px rgba(16, 185, 129, 0.4)",
                    "0 20px 40px rgba(34, 197, 94, 0.5)",
                    "0 20px 40px rgba(20, 184, 166, 0.4)",
                    "0 20px 40px rgba(16, 185, 129, 0.4)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {/* Efecto de brillo mejorado */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 relative z-10" />
                
                {/* Partículas de brillo en el icono mejoradas */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white/80 rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${i * 45}deg) translateY(-25px)`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
                
                {/* Efecto de corona */}
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Crown className="h-6 w-6 text-yellow-300" />
                </motion.div>
              </motion.div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  Requerimientos
                </h1>
                <motion.div
                  className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    <span>Gestión Estratégica</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span>Análisis Avanzado</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-teal-500" />
                    <span>Control Total</span>
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
              Sistema integral de gestión y seguimiento de requerimientos con análisis avanzado y control estratégico
            </motion.p>
          </motion.div>

          {/* Estadísticas */}
          <RequirementStats requirements={requirements} />

          {/* Header con acciones mejorado */}
          <motion.div 
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-600">
                  {loading ? 'Cargando...' : `${requirements.length} requerimientos encontrados`}
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
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                Nuevo Requerimiento
              </Button>
            </div>
          </motion.div>

          {/* Filtros modernos */}
          <RequirementsFilters
            filters={filterOptions}
            values={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            onSearch={(query) => handleFilterChange('search', query)}
            searchPlaceholder="Buscar requerimientos por título, descripción o área..."
          />

          {/* Tabla de requerimientos moderna */}
          <AnimatePresence mode="wait">
            <motion.div
              key={loading ? 'loading' : 'loaded'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <RequirementsTable
                requirements={requirements}
                loading={loading}
                onRequirementClick={handleRequirementClick}
                onEditRequirement={handleEditRequirement}
                onDeleteRequirement={handleDeleteRequirement}
                onViewRequirement={handleViewRequirement}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal de Nuevo Requerimiento */}
      <RequirementForm
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleCreateRequirement}
        loading={isSubmitting}
      />
    </div>
  );
};

export default RequirementsPage; 