import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Clock, CheckCircle, XCircle, AlertTriangle,
  MoreHorizontal, Eye, Edit, Trash2, Download, Filter,
  Calendar, User,
  Building2, Zap, Shield, ArrowRight, Settings, Share2,
  Sparkles, Gem, TrendingUp, Activity, Layers, Target
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Requirement, RequirementStatus, Priority, RequirementType } from '@/shared/types/common.types';
import { formatDate, getStatusColor, getPriorityColor, getStatusText, getPriorityText } from '@/shared/utils/utils';

// Helper function para formatear fechas de manera segura
const safeFormatDate = (date: any): string => {
  if (!date) return 'Sin fecha';
  if (date instanceof Date) return formatDate(date);
  if (typeof date === 'string') return formatDate(date);
  return 'Sin fecha';
};

// Helper function para formatear estimatedDeliveryDate de manera segura
const safeFormatEstimatedDate = (date: any): string => {
  if (!date) return 'Sin fecha estimada';
  if (typeof date === 'string') return date;
  if (date instanceof Date) return formatDate(date);
  return 'Sin fecha estimada';
};

interface RequirementsTableProps {
  requirements: Requirement[];
  loading: boolean;
  onRequirementClick: (requirement: Requirement) => void;
  onEditRequirement: (requirement: Requirement) => void;
  onDeleteRequirement: (requirement: Requirement) => void;
  onViewRequirement: (requirement: Requirement) => void;
}

// Componente de tarjeta de requerimiento para móvil (RequirementCard)
const RequirementCard: React.FC<{
  requirement: Requirement;
  onRequirementClick: (requirement: Requirement) => void;
  onEditRequirement: (requirement: Requirement) => void;
  onDeleteRequirement: (requirement: Requirement) => void;
  onViewRequirement: (requirement: Requirement) => void;
}> = ({ requirement, onRequirementClick, onEditRequirement, onDeleteRequirement, onViewRequirement }) => {
  const [showActions, setShowActions] = useState(false);

  const typeIcons = {
    [RequirementType.DOCUMENT]: <FileText className="h-4 w-4" />,
    [RequirementType.EQUIPMENT]: <Shield className="h-4 w-4" />,
    [RequirementType.SERVICE]: <CheckCircle className="h-4 w-4" />,
    [RequirementType.OTHER]: <AlertTriangle className="h-4 w-4" />,
  };

  const priorityIcons = {
    [Priority.LOW]: <Clock className="h-3 w-3" />,
    [Priority.MEDIUM]: <AlertTriangle className="h-3 w-3" />,
    [Priority.HIGH]: <Shield className="h-3 w-3" />,
    [Priority.URGENT]: <Zap className="h-3 w-3" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      className="group relative bg-gradient-to-br from-white via-emerald-50/30 to-white rounded-3xl shadow-lg border border-emerald-100/50 overflow-hidden backdrop-blur-sm hover:border-emerald-200/70 transition-all duration-500"
    >
      {/* Efecto de brillo superior */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Header de la tarjeta */}
      <div className="relative p-6 border-b border-emerald-100/50 bg-gradient-to-r from-emerald-50/50 to-green-50/30">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <motion.div 
                className="p-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 shadow-lg border border-emerald-200/50"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-emerald-600">
                  {typeIcons[requirement.type]}
                </div>
              </motion.div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1 text-lg">
                  {requirement.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                  {requirement.description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Botón de acciones */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-emerald-100/80 rounded-xl transition-all duration-300"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </Button>
          </motion.div>
        </div>

        {/* Badges de estado y prioridad */}
        <div className="flex items-center gap-3 mt-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Badge 
              variant={getStatusColor(requirement.status)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-emerald-200/30"
            >
              {getStatusText(requirement.status)}
            </Badge>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Badge 
              variant={getPriorityColor(requirement.priority)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-emerald-200/30 flex items-center gap-1.5"
            >
              {priorityIcons[requirement.priority]}
              {getPriorityText(requirement.priority)}
            </Badge>
          </motion.div>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="relative p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50/80 to-green-50/60 rounded-2xl border border-emerald-100/50">
            <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-600">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Área Solicitante</p>
              <p className="text-sm font-semibold text-gray-800">{requirement.requestingArea}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-2xl border border-blue-100/50">
            <div className="p-2 rounded-xl bg-blue-100/80 text-blue-600">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Asignado a</p>
              <p className="text-sm font-semibold text-gray-800">{requirement.assignedTo || 'Sin asignar'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50/80 to-pink-50/60 rounded-xl border border-purple-100/50">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs font-medium text-gray-500">Creado</p>
                <p className="text-xs font-semibold text-gray-800">{safeFormatDate(requirement.createdAt)}</p>
              </div>
            </div>
            {requirement.estimatedDeliveryDate && (
              <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-orange-50/80 to-red-50/60 rounded-xl border border-orange-100/50">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Entrega</p>
                  <p className="text-xs font-semibold text-gray-800">{safeFormatEstimatedDate(requirement.estimatedDeliveryDate)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-4 border-t border-emerald-100/50"
            >
              <div className="grid grid-cols-3 gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewRequirement(requirement)}
                    className="w-full py-2.5 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 rounded-xl"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditRequirement(requirement)}
                    className="w-full py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 rounded-xl"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteRequirement(requirement)}
                    className="w-full py-2.5 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón principal de acción */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4"
        >
          <Button
            onClick={() => onRequirementClick(requirement)}
            variant="ghost"
            className="w-full py-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-300 rounded-xl group"
          >
            <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors">
              Ver detalles completos
            </span>
            <ArrowRight className="h-4 w-4 ml-2 text-gray-400 group-hover:text-emerald-600 transition-colors" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Componente de tabla para desktop (DesktopTable)
const DesktopTable: React.FC<{
  requirements: Requirement[];
  onRequirementClick: (requirement: Requirement) => void;
  onEditRequirement: (requirement: Requirement) => void;
  onDeleteRequirement: (requirement: Requirement) => void;
  onViewRequirement: (requirement: Requirement) => void;
}> = ({ requirements, onRequirementClick, onEditRequirement, onDeleteRequirement, onViewRequirement }) => {
  const typeIcons = {
    [RequirementType.DOCUMENT]: <FileText className="h-4 w-4" />,
    [RequirementType.EQUIPMENT]: <Shield className="h-4 w-4" />,
    [RequirementType.SERVICE]: <CheckCircle className="h-4 w-4" />,
    [RequirementType.OTHER]: <AlertTriangle className="h-4 w-4" />,
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-100/50 bg-gradient-to-br from-white via-emerald-50/20 to-white shadow-2xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-emerald-50/80 via-green-50/60 to-emerald-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Requerimiento
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Estado
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Prioridad
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Tipo
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Área
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Acciones
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-emerald-100/50">
            {requirements.map((requirement, index) => (
              <motion.tr
                key={requirement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-green-50/30 transition-all duration-300 cursor-pointer group"
                onClick={() => onRequirementClick(requirement)}
              >
                <td className="px-6 py-4">
                  <div className="space-y-2">
                                          <div className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-base">
                      {requirement.title}
                    </div>
                                          <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed max-w-sm">
                      {requirement.description}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5 p-1.5 bg-emerald-50/80 rounded-lg">
                        <Building2 className="h-3 w-3 text-emerald-600" />
                        <span className="font-medium">{requirement.requestingArea}</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-blue-50/80 rounded-lg">
                        <User className="h-3 w-3 text-blue-600" />
                        <span className="font-medium">{requirement.assignedTo || 'Sin asignar'}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Badge 
                        variant={getStatusColor(requirement.status)}
                        className="w-fit text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-emerald-200/30"
                      >
                        {getStatusText(requirement.status)}
                      </Badge>
                    </motion.div>
                    {requirement.estimatedDeliveryDate && (
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 p-2 bg-orange-50/80 rounded-lg">
                        <Calendar className="h-3 w-3 text-orange-600" />
                        <span className="font-medium">{safeFormatEstimatedDate(requirement.estimatedDeliveryDate)}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Badge 
                        variant={getPriorityColor(requirement.priority)}
                        className="w-fit text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-emerald-200/30"
                      >
                        {getPriorityText(requirement.priority)}
                      </Badge>
                    </motion.div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 p-2 bg-purple-50/80 rounded-lg">
                      <Clock className="h-3 w-3 text-purple-600" />
                      <span className="font-medium">{safeFormatDate(requirement.createdAt)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 shadow-lg border border-emerald-200/50"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-emerald-600">
                        {typeIcons[requirement.type]}
                      </div>
                    </motion.div>
                    <span className="text-sm font-bold text-gray-700 capitalize">
                      {requirement.type.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 shadow-lg border border-emerald-200/50"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Building2 className="h-4 w-4 text-emerald-600" />
                    </motion.div>
                    <div>
                      <span className="text-sm font-bold text-gray-700">
                        {requirement.requestingArea}
                      </span>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        <span>{requirement.assignedTo || 'Sin asignar'}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 p-1.5 bg-gray-50/80 rounded-lg">
                    {safeFormatDate(requirement.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2.5 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRequirement(requirement);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2.5 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRequirement(requirement);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2.5 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRequirement(requirement);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
  loading,
  onRequirementClick,
  onEditRequirement,
  onDeleteRequirement,
  onViewRequirement
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <LoadingSpinner size="lg" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-gray-600 font-semibold text-lg"
          >
            Cargando requerimientos...
          </motion.p>
        </div>
      </div>
    );
  }

  if (requirements.length === 0) {
    return (
      <div className="text-center py-20">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full mb-8 shadow-lg"
        >
          <FileText className="h-12 w-12 text-emerald-600" />
        </motion.div>
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 mb-3"
        >
          No se encontraron requerimientos
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed"
        >
          No hay requerimientos que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda o crear un nuevo requerimiento.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <Button variant="outline" className="px-6 py-3 rounded-xl border-emerald-200 hover:bg-emerald-50">
            <Filter className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
          <Button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <FileText className="h-4 w-4 mr-2" />
            Crear requerimiento
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header de la tabla */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-8 bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-emerald-50/80 rounded-3xl border border-emerald-100/50 shadow-xl backdrop-blur-sm"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-lg"
              animate={{ 
                scale: [1, 1.2, 1],
                boxShadow: [
                  "0 0 0 0 rgba(16, 185, 129, 0.4)",
                  "0 0 0 10px rgba(16, 185, 129, 0)",
                  "0 0 0 0 rgba(16, 185, 129, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-lg font-bold text-gray-800">
              {loading ? 'Cargando...' : `${requirements.length} requerimientos encontrados`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
            <Gem className="h-4 w-4 text-green-500 animate-pulse" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Toggle de vista - Solo visible en pantallas xl y superiores */}
          <div className="hidden xl:flex items-center bg-white/90 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-1.5 shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('table')}
              className={`px-6 py-3 text-sm font-bold transition-all duration-300 focus-visible:ring-0 rounded-xl ${
                viewMode === 'table' 
                  ? '!bg-gradient-to-r !from-emerald-500 !to-green-600 !text-white !shadow-lg !shadow-emerald-500/25' 
                  : '!bg-transparent hover:!bg-emerald-50 !text-gray-600 hover:!text-emerald-700'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Tabla
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('cards')}
              className={`px-6 py-3 text-sm font-bold transition-all duration-300 focus-visible:ring-0 rounded-xl ${
                viewMode === 'cards' 
                  ? '!bg-gradient-to-r !from-emerald-500 !to-green-600 !text-white !shadow-lg !shadow-emerald-500/25' 
                  : '!bg-transparent hover:!bg-emerald-50 !text-gray-600 hover:!text-emerald-700'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Tarjetas
            </Button>
          </div>

          {/* Acciones */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="px-6 py-3 text-sm font-bold bg-white/90 backdrop-blur-sm border-emerald-200/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 shadow-lg rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="px-6 py-3 text-sm font-bold bg-white/90 backdrop-blur-sm border-emerald-200/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 shadow-lg rounded-xl"
            >
              <Share2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Compartir</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Contenido de la tabla */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className="hidden xl:block"
          >
            <DesktopTable
              requirements={requirements}
              onRequirementClick={onRequirementClick}
              onEditRequirement={onEditRequirement}
              onDeleteRequirement={onDeleteRequirement}
              onViewRequirement={onViewRequirement}
            />
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {requirements.map((requirement) => (
              <RequirementCard
                key={requirement.id}
                requirement={requirement}
                onRequirementClick={onRequirementClick}
                onEditRequirement={onEditRequirement}
                onDeleteRequirement={onDeleteRequirement}
                onViewRequirement={onViewRequirement}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vista móvil siempre en tarjetas */}
      <div className="xl:hidden">
        <div className="grid grid-cols-1 gap-6">
          {requirements.map((requirement) => (
            <RequirementCard
              key={requirement.id}
              requirement={requirement}
              onRequirementClick={onRequirementClick}
              onEditRequirement={onEditRequirement}
              onDeleteRequirement={onDeleteRequirement}
              onViewRequirement={onViewRequirement}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RequirementsTable; 