import React, { useState } from 'react';
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
  Activity,
  Crown
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { IncidentsFloatingParticles } from '@/shared/components/ui';

import { IncidentForm, IncidentsHeader } from '@/features/incidents/components';
import { useIncidentsPage } from '@/features/incidents/hooks/pages/useIncidentsPage';
import { Incident } from '@/shared/types/common.types';
import { IncidentsTable } from '@/features/incidents/components/IncidentsTable';
import { IncidentsFilters } from '@/features/incidents/components/IncidentsFilters';
import { useAuthStore } from '@/shared/store';
import { transformIncidentForForm } from '@/shared/utils/utils';
import toast from 'react-hot-toast';

// Componente de partículas flotantes - Ahora usando el componente compartido

// Componente de estadísticas ultra moderno con colores rojo/naranja
const IncidentStats: React.FC<{ incidents: any[] }> = ({ incidents }) => {
  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    pending: incidents.filter(i => i.status === 'pending').length,
    inProgress: incidents.filter(i => i.status === 'in_progress').length,
    completed: incidents.filter(i => i.status === 'completed').length,
    delivered: incidents.filter(i => i.status === 'delivered').length,
    urgent: incidents.filter(i => i.priority === 'urgent').length,
    high: incidents.filter(i => i.priority === 'high').length,
  };

  const statCards = [
    {
      title: 'Total Incidencias',
      value: stats.total,
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'from-red-500 to-orange-500',
      trend: '+18%',
      trendColor: 'text-red-500',
      bgGradient: 'from-red-50/80 to-orange-50/80'
    },
    {
      title: 'Abiertas',
      value: stats.open,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'from-orange-500 to-red-500',
      trend: '+12%',
      trendColor: 'text-orange-500',
      bgGradient: 'from-orange-50/80 to-red-50/80'
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: <Clock className="h-5 w-5" />,
      color: 'from-amber-500 to-orange-500',
      trend: '+5%',
      trendColor: 'text-amber-500',
      bgGradient: 'from-amber-50/80 to-orange-50/80'
    },
    {
      title: 'En Proceso',
      value: stats.inProgress,
      icon: <Activity className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      trend: '-2%',
      trendColor: 'text-green-500',
      bgGradient: 'from-blue-50/80 to-cyan-50/80'
    },
    {
      title: 'Completadas',
      value: stats.completed,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
      trend: '+15%',
      trendColor: 'text-green-500',
      bgGradient: 'from-green-50/80 to-emerald-50/80'
    },
    {
      title: 'Entregadas',
      value: stats.delivered,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'from-emerald-500 to-teal-500',
      trend: '+6%',
      trendColor: 'text-emerald-500',
      bgGradient: 'from-emerald-50/80 to-teal-50/80'
    },
    {
      title: 'Urgentes',
      value: stats.urgent,
      icon: <Zap className="h-5 w-5" />,
      color: 'from-red-500 to-pink-500',
      trend: '+8%',
      trendColor: 'text-red-500',
      bgGradient: 'from-red-50/80 to-pink-50/80'
    },
    {
      title: 'Alta Prioridad',
      value: stats.high,
      icon: <Crown className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500',
      trend: '+11%',
      trendColor: 'text-purple-500',
      bgGradient: 'from-purple-50/80 to-pink-50/80'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 40, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: index * 0.1, type: "spring", stiffness: 80 }}
          whileHover={{ y: -12, scale: 1.08, rotateY: 5 }}
        >
          <Card className="group hover:shadow-2xl transition-all duration-600 border-0 bg-white/95 backdrop-blur-xl relative overflow-hidden h-full">
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
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400/20 via-orange-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
            
            <CardContent className="p-3 sm:p-4 relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between flex-1">
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
                className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100"
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

export const Incidents: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';

  const {
    filters,
    incidents,
    loading,
    error,
    showForm,
    isSubmitting,
    // NUEVOS ESTADOS
    editingIncident,
    showEditForm,
    isReadOnly,
    renderPermissions,
    handleFilterChange,
    handleClearFilters,
    handleCreateIncident,
    openForm,
    closeForm,
    handleIncidentClick,
    handleEditIncident,
    handleDeleteIncident,
    handleViewIncident,
    // NUEVAS FUNCIONES
    handleUpdateIncident,
    closeEditForm,
    filterOptions,
    sentinelRef,
  } = useIncidentsPage();

  // Manejadores simplificados
  const handleViewIncidentModal = (incident: Incident) => {
    handleViewIncident(incident);
  };

  // NUEVO: Manejador de edición que permite a técnicos y administradores
  const handleEditIncidentModal = async (incident: Incident) => {
    try {
      await handleEditIncident(incident);
    } catch (error) {
      toast.error('Error al abrir el modal de edición');
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Partículas flotantes */}
      <IncidentsFloatingParticles />
      
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-red-200/40 to-orange-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-red-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-red-200/30 to-orange-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        <motion.div
          className="space-y-6 sm:space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header Ultra Moderno Mejorado con colores rojo/naranja */}
          <IncidentsHeader />

          {/* Estadísticas */}
          <IncidentStats incidents={incidents} />

          {/* Header con acciones mejorado */}
          <motion.div 
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-600">
                  {loading ? 'Cargando...' : `${incidents.length} incidencias encontradas`}
                </span>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600">Modo Administrador</span>
                </div>
              )}
              {currentUser?.role === 'technician' && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">Modo Técnico</span>
                </div>
              )}
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
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                Nueva Incidencia
              </Button>
            </div>
          </motion.div>

          {/* Filtros */}
          <IncidentsFilters
            filters={filterOptions}
            values={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            onSearch={(query) => handleFilterChange('search', query)}
            searchPlaceholder="Buscar incidencias por título, descripción o área..."
          />

          {/* Tabla de incidencias */}
          <AnimatePresence mode="wait">
            <motion.div
              key={loading ? 'loading' : 'loaded'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <IncidentsTable
                incidents={incidents}
                loading={loading}
                onIncidentClick={handleIncidentClick}
                onEditIncident={handleEditIncidentModal}
                onDeleteIncident={handleDeleteIncident}
                onViewIncident={handleViewIncidentModal}
              />
              {/* Sentinel para scroll infinito */}
              <div ref={sentinelRef} className="h-8" />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal de Nueva Incidencia */}
      <IncidentForm
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleCreateIncident}
        loading={isSubmitting}
        userRole={currentUser?.role}
      />

      {/* NUEVO: Modal de Edición de Incidencia */}
      {editingIncident && renderPermissions && (
        <IncidentForm
          isOpen={showEditForm}
          onClose={closeEditForm}
          onSubmit={handleUpdateIncident}
          loading={isSubmitting}
          initialData={transformIncidentForForm(editingIncident)}
          isEdit={true}
          userRole={currentUser?.role}
          incidentStatus={editingIncident.status}
          isReadOnly={isReadOnly}
          // PROPS PARA RENDERIZADO CONTROLADO POR SERVIDOR
          allowedFields={renderPermissions.allowedFields}
          canEditStatus={renderPermissions.canEditStatus}
          canEditArea={renderPermissions.canEditArea}
          canEditContent={renderPermissions.canEditContent}
        />
      )}
    </div>
  );
};

export default Incidents; 
