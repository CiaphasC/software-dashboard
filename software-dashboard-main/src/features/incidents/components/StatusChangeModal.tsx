import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  AlertTriangle, 
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  Zap,
  Shield,
  Save,
  X,
  ChevronDown,
  User,
  FileText
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { 
  Modal, 
  ModalHeader, 
  ModalContent, 
  ModalFooter,
  ModalContainer
} from '@/shared/components/ui';
import { useAuthStore } from '@/shared/store';
import { formatDateTime } from '@/shared/utils/utils';

// ============================================================================
// SCHEMA & TYPES
// ============================================================================

const statusChangeSchema = z.object({
  newStatus: z.string().refine((val) => ['open', 'pending', 'in_progress', 'completed', 'delivered', 'closed'].includes(val), {
    message: 'Estado inválido'
  }),
  notes: z.string().optional(),
  completionDate: z.string().optional(),
});

type StatusChangeData = z.infer<typeof statusChangeSchema>;

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StatusChangeData) => void;
  loading?: boolean;
  currentStatus: string;
  itemType: 'incident' | 'requirement';
  itemTitle: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'text-orange-600 bg-orange-50/80 border-orange-200/60';
    case 'pending': return 'text-yellow-600 bg-yellow-50/80 border-yellow-200/60';
    case 'in_progress': return 'text-blue-600 bg-blue-50/80 border-blue-200/60';
    case 'completed': return 'text-green-600 bg-green-50/80 border-green-200/60';
    case 'delivered': return 'text-emerald-600 bg-emerald-50/80 border-emerald-200/60';
    case 'closed': return 'text-gray-600 bg-gray-50/80 border-gray-200/60';
    default: return 'text-gray-600 bg-gray-50/80 border-gray-200/60';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'open': return <AlertTriangle className="h-4 w-4" />;
    case 'pending': return <Clock className="h-4 w-4" />;
    case 'in_progress': return <Clock className="h-4 w-4" />;
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'delivered': return <CheckCircle className="h-4 w-4" />;
    case 'closed': return <X className="h-4 w-4" />;
    default: return <AlertTriangle className="h-4 w-4" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open': return 'Abierta';
    case 'pending': return 'Pendiente';
    case 'in_progress': return 'En Proceso';
    case 'completed': return 'Completada';
    case 'delivered': return 'Entregada';
    case 'closed': return 'Cerrada';
    default: return 'Desconocido';
  }
};

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  currentStatus,
  itemType,
  itemTitle
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isTechnician = user?.role === 'technician';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<StatusChangeData>({
    resolver: zodResolver(statusChangeSchema),
    defaultValues: {
      newStatus: currentStatus,
      notes: '',
      completionDate: '',
    }
  });

  const watchedStatus = watch('newStatus');

  // Estados disponibles según el rol
  const getAvailableStatuses = () => {
    const allStatuses = [
      { value: 'open', label: 'Abierta', adminOnly: false },
      { value: 'pending', label: 'Pendiente', adminOnly: true },
      { value: 'in_progress', label: 'En Proceso', adminOnly: true },
      { value: 'completed', label: 'Completada', adminOnly: true },
      { value: 'delivered', label: 'Entregada', adminOnly: true },
      { value: 'closed', label: 'Cerrada', adminOnly: true },
    ];

    if (isAdmin) {
      return allStatuses;
    } else if (isTechnician) {
      return allStatuses.filter(status => !status.adminOnly);
    } else {
      return allStatuses.filter(status => !status.adminOnly);
    }
  };

  const availableStatuses = getAvailableStatuses();

  const handleFormSubmit = async (data: StatusChangeData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg"
      animation="scale"
    >
      <ModalContainer showGlowEffect glowColor="blue">
        <ModalHeader
          title={`Cambiar Estado - ${itemType === 'incident' ? 'Incidencia' : 'Requerimiento'}`}
          subtitle={`${itemTitle}`}
          icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" />}
          onClose={onClose}
          iconBgColor="bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-500/50"
          headerBgColor="bg-gradient-to-r from-blue-50 via-indigo-50/80 to-blue-50/90"
          headerBorderColor="border-blue-100/50"
        />

        <ModalContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
            {/* Estado Actual */}
            <div className="group">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-blue-700 transition-colors">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
                Estado Actual
              </label>
              <div className={`flex items-center gap-2 p-3 sm:p-4 rounded-lg border ${getStatusColor(currentStatus)}`}>
                {getStatusIcon(currentStatus)}
                <span className="font-medium">{getStatusLabel(currentStatus)}</span>
              </div>
            </div>

            {/* Nuevo Estado */}
            <div className="group">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-blue-700 transition-colors">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
                Nuevo Estado
              </label>
              <select
                {...register('newStatus')}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-300 hover:bg-white/90 hover:border-blue-300/40 cursor-pointer"
              >
                {availableStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label} {status.adminOnly ? '(Solo Admin)' : ''}
                  </option>
                ))}
              </select>
              {errors.newStatus && (
                <motion.p 
                  className="text-red-500 text-sm mt-1 flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors.newStatus.message}
                </motion.p>
              )}
            </div>

            {/* Fecha de Completado/Entregado */}
            {(watchedStatus === 'completed' || watchedStatus === 'delivered') && (
              <div className="group">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-blue-700 transition-colors">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
                  Fecha de {watchedStatus === 'completed' ? 'Completado' : 'Entregado'}
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    {...register('completionDate')}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-300 hover:bg-white/90 hover:border-blue-300/40 pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Esta fecha se usará para calcular los tiempos de revisión y resolución total
                </p>
              </div>
            )}

            {/* Información de Tiempos */}
            <div className="flex items-center gap-2 p-3 sm:p-4 bg-gradient-to-r from-green-50/60 via-emerald-50/40 to-green-50/60 rounded-xl border border-green-100/40 backdrop-blur-sm">
              <div className="p-2 bg-gradient-to-r from-green-100/80 to-emerald-100/80 rounded-md border border-green-200/60">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">Rangos de Tiempo</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• <strong>Tiempo de Respuesta</strong>: Desde creación hasta inicio de revisión</p>
                  <p>• <strong>Tiempo de Revisión</strong>: Desde inicio de revisión hasta resolución</p>
                  <p>• <strong>Tiempo Total</strong>: Desde creación hasta resolución</p>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="group">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-blue-700 transition-colors">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
                Notas del Cambio
              </label>
              <Textarea
                {...register('notes')}
                placeholder="Agrega notas sobre el cambio de estado..."
                rows={3}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-300 hover:bg-white/90 hover:border-blue-300/40 resize-none"
              />
            </div>

            {/* Información del Usuario */}
            <div className="flex items-center gap-2 p-3 sm:p-4 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-blue-50/60 rounded-xl border border-blue-100/40 backdrop-blur-sm">
              <div className="p-2 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-md border border-blue-200/60">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">Usuario</p>
                <p className="text-xs text-gray-500">{user?.name} ({user?.role})</p>
                <p className="text-xs text-gray-400">{formatDateTime(new Date())}</p>
              </div>
            </div>

            {/* Indicador Visual del Nuevo Estado */}
            <div className="flex items-center gap-2 p-3 sm:p-4 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-blue-50/60 rounded-xl border border-blue-100/40 backdrop-blur-sm">
              <div className={`p-2 rounded-md border ${getStatusColor(watchedStatus)}`}>
                {getStatusIcon(watchedStatus)}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">Nuevo Estado</p>
                <p className="text-xs text-gray-500">{getStatusLabel(watchedStatus)}</p>
              </div>
            </div>
          </form>
        </ModalContent>

        <ModalFooter>
          <motion.div className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full px-4 py-2 sm:px-6 sm:py-3 border-gray-200/60 hover:bg-gray-50/80 transition-all duration-300 text-gray-700 font-medium rounded-lg hover:border-gray-300/60"
            >
              Cancelar
            </Button>
          </motion.div>
          <motion.div className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              onClick={handleSubmit(handleFormSubmit)}
              className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Actualizando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Cambiar Estado</span>
                </div>
              )}
            </Button>
          </motion.div>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
}; 