import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FileText, 
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  Zap,
  Shield,
  Save,
  Plus,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { 
  Modal, 
  ModalHeader, 
  ModalContent, 
  ModalFooter,
  ModalContainer,
  DatePicker
} from '@/shared/components/ui';
import { RequirementType, RequirementStatus, Priority } from '@/shared/types/common.types';
import { dataService } from '@/shared/services/supabase';
import type { Department } from '@/shared/services/supabase';

// ============================================================================
// SCHEMA & TYPES
// ============================================================================

const requirementSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  requestingArea: z.string().min(2, 'El área solicitante es requerida'),
  type: z.nativeEnum(RequirementType),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(RequirementStatus),
  estimatedDeliveryDate: z.string().min(1, 'La fecha estimada es requerida'),
  assignedTo: z.string().optional(),
});

type RequirementFormData = z.infer<typeof requirementSchema>;

interface RequirementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RequirementFormData) => void;
  loading?: boolean;
}

// Alias para compatibilidad
type Area = Department;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case Priority.LOW: return 'text-blue-600 bg-blue-50/80 border-blue-200/60';
    case Priority.MEDIUM: return 'text-amber-600 bg-amber-50/80 border-amber-200/60';
    case Priority.HIGH: return 'text-orange-600 bg-orange-50/80 border-orange-200/60';
    case Priority.URGENT: return 'text-red-600 bg-red-50/80 border-red-200/60';
    default: return 'text-gray-600 bg-gray-50/80 border-gray-200/60';
  }
};

const getTypeIcon = (type: RequirementType) => {
  switch (type) {
    case RequirementType.DOCUMENT: return <FileText className="h-4 w-4" />;
    case RequirementType.EQUIPMENT: return <Shield className="h-4 w-4" />;
    case RequirementType.SERVICE: return <CheckCircle className="h-4 w-4" />;
    case RequirementType.OTHER: return <AlertCircle className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * RequirementForm Component
 * 
 * Formulario modal para crear nuevos requerimientos usando la arquitectura
 * modular de modales reutilizables.
 */
export const RequirementForm: React.FC<RequirementFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isAreasLoading, setIsAreasLoading] = useState(false);
  const [isAreasDropdownOpen, setIsAreasDropdownOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<RequirementFormData>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      title: '',
      description: '',
      requestingArea: '',
      type: RequirementType.DOCUMENT,
      priority: Priority.MEDIUM,
      status: RequirementStatus.PENDING,
      estimatedDeliveryDate: '',
      assignedTo: '',
    }
  });

  const watchedPriority = watch('priority');
  const watchedType = watch('type');
  const watchedDate = watch('estimatedDeliveryDate');
  const watchedArea = watch('requestingArea');

  // Cargar áreas al abrir el modal
  useEffect(() => {
    if (isOpen && areas.length === 0) {
      loadAreas();
    }
  }, [isOpen]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.areas-dropdown-container')) {
        setIsAreasDropdownOpen(false);
      }
    };

    if (isAreasDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAreasDropdownOpen]);

  const loadAreas = async () => {
    setIsAreasLoading(true);
    try {
      const areasData = await dataService.getDepartments();
      setAreas(areasData);
    } catch (error) {
      console.error('Error loading areas:', error);
    } finally {
      setIsAreasLoading(false);
    }
  };

  const handleAreaSelect = (area: Area) => {
    setValue('requestingArea', area.value);
    setIsAreasDropdownOpen(false);
  };

  const getSelectedAreaLabel = () => {
    if (!watchedArea) return '';
    const selectedArea = areas.find(area => area.value === watchedArea);
    return selectedArea ? selectedArea.label : watchedArea;
  };

  const handleFormSubmit = async (data: RequirementFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting requirement:', error);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="2xl"
      animation="scale"
    >
      <ModalContainer showGlowEffect glowColor="emerald">
        <ModalHeader
          title="Nuevo Requerimiento"
          subtitle="Completa la información para crear un nuevo requerimiento"
          icon={<Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
          onClose={onClose}
        />

        <ModalContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
            {/* Información Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Columna Izquierda - Información Principal */}
              <div className="space-y-3 sm:space-y-4">
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-emerald-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" />
                    Título del Requerimiento
                  </label>
                  <Input
                    {...register('title')}
                    placeholder="Ingresa el título del requerimiento"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-all duration-300 hover:bg-white/90 hover:border-emerald-300/40"
                  />
                  {errors.title && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.title.message}
                    </motion.p>
                  )}
                </div>

                <div className="group relative areas-dropdown-container">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-emerald-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" />
                    Área Solicitante
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsAreasDropdownOpen(!isAreasDropdownOpen)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-all duration-300 hover:bg-white/90 hover:border-emerald-300/40 flex items-center justify-between"
                    >
                      <span className={getSelectedAreaLabel() ? 'text-gray-900' : 'text-gray-500'}>
                        {getSelectedAreaLabel() || 'Selecciona un área'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isAreasDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <input
                      {...register('requestingArea')}
                      type="hidden"
                    />
                    
                    {isAreasDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200/60 backdrop-blur-sm overflow-hidden max-h-60 overflow-y-auto"
                      >
                        {isAreasLoading ? (
                          <div className="p-4 text-center text-gray-500">
                            <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2"></div>
                            Cargando áreas...
                          </div>
                        ) : (
                          <div className="py-2">
                            {areas.map((area) => (
                              <button
                                key={area.value}
                                type="button"
                                onClick={() => handleAreaSelect(area)}
                                className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors ${
                                  watchedArea === area.value ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700'
                                }`}
                              >
                                <div className="font-medium">{area.label}</div>
                                <div className="text-sm text-gray-500">{area.value}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                  {errors.requestingArea && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.requestingArea.message}
                    </motion.p>
                  )}
                </div>

                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-emerald-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" />
                    Asignado a
                  </label>
                  <Input
                    {...register('assignedTo')}
                    placeholder="Nombre del responsable"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-all duration-300 hover:bg-white/90 hover:border-emerald-300/40"
                  />
                </div>
              </div>

              {/* Columna Derecha - Información Adicional */}
              <div className="space-y-3 sm:space-y-4">
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-emerald-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" />
                    Tipo de Requerimiento
                  </label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-all duration-300 hover:bg-white/90 hover:border-emerald-300/40 cursor-pointer"
                  >
                    <option value={RequirementType.DOCUMENT}>Documento</option>
                    <option value={RequirementType.EQUIPMENT}>Equipo</option>
                    <option value={RequirementType.SERVICE}>Servicio</option>
                    <option value={RequirementType.OTHER}>Otro</option>
                  </select>
                  {errors.type && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.type.message}
                    </motion.p>
                  )}
                </div>

                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-emerald-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" />
                    Prioridad
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-all duration-300 hover:bg-white/90 hover:border-emerald-300/40 cursor-pointer"
                  >
                    <option value={Priority.LOW}>Baja</option>
                    <option value={Priority.MEDIUM}>Media</option>
                    <option value={Priority.HIGH}>Alta</option>
                    <option value={Priority.URGENT}>Urgente</option>
                  </select>
                  {errors.priority && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.priority.message}
                    </motion.p>
                  )}
                </div>

                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-emerald-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" />
                    Fecha Estimada de Entrega
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register('estimatedDeliveryDate')}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-all duration-300 hover:bg-white/90 hover:border-emerald-300/40 pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                  {errors.estimatedDeliveryDate && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.estimatedDeliveryDate.message}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="group">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-emerald-700 transition-colors">
                <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" />
                Descripción Detallada
              </label>
              <Textarea
                {...register('description')}
                placeholder="Describe detalladamente el requerimiento..."
                rows={3}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-all duration-300 hover:bg-white/90 hover:border-emerald-300/40 resize-none"
              />
              {errors.description && (
                <motion.p 
                  className="text-red-500 text-sm mt-1 flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors.description.message}
                </motion.p>
              )}
            </div>

            {/* Indicadores Visuales */}
            <div className="flex flex-col sm:flex-row gap-3 p-3 sm:p-4 bg-gradient-to-r from-emerald-50/60 via-green-50/40 to-emerald-50/60 rounded-xl border border-emerald-100/40 backdrop-blur-sm">
              <motion.div 
                className="flex items-center gap-2 p-2 sm:p-3 bg-white/60 rounded-lg border border-emerald-200/30 backdrop-blur-sm flex-1"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`p-1.5 sm:p-2 rounded-md border ${getPriorityColor(watchedPriority)}`}>
                  {watchedPriority === Priority.URGENT ? (
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : watchedPriority === Priority.HIGH ? (
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : watchedPriority === Priority.MEDIUM ? (
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">Prioridad</p>
                  <p className="text-xs text-gray-500 capitalize">{watchedPriority.toLowerCase()}</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-2 p-2 sm:p-3 bg-white/60 rounded-lg border border-emerald-200/30 backdrop-blur-sm flex-1"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-100/80 to-green-100/80 rounded-md border border-emerald-200/60">
                  {getTypeIcon(watchedType)}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">Tipo</p>
                  <p className="text-xs text-gray-500 capitalize">{watchedType.toLowerCase().replace('_', ' ')}</p>
                </div>
              </motion.div>
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
              className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Crear Requerimiento</span>
                </div>
              )}
            </Button>
          </motion.div>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};

export default RequirementForm; 
