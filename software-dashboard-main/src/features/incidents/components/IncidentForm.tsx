import React, { useState, useEffect } from 'react';
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
  Plus,
  ChevronDown,
  Bug,
  Monitor,
  HardDrive,
  Wifi,
  Settings,
  User
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
import { dataService } from '@/shared/services/supabase';
import type { Department } from '@/shared/services/supabase';
import { transformFormDataForSupabase, convertDepartmentToArea } from '@/shared/utils/utils';
import { useAuthStore } from '@/shared/store';
import { StatusChangeModal } from '@/features/incidents/components/StatusChangeModal';

// ============================================================================
// SCHEMA & TYPES
// ============================================================================

const incidentSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  affectedArea: z.string().min(2, 'El área afectada es requerida'),
  type: z.string().refine((val) => ['technical', 'software', 'hardware', 'network', 'other'].includes(val), {
    message: 'Tipo de incidencia inválido'
  }),
  priority: z.string().refine((val) => ['low', 'medium', 'high', 'urgent'].includes(val), {
    message: 'Prioridad inválida'
  }),
  status: z.string().refine((val) => ['open', 'in_progress', 'resolved', 'closed'].includes(val), {
    message: 'Estado inválido'
  }),
  estimatedResolutionDate: z.string().min(1, 'La fecha estimada es requerida'),
  assignedTo: z.string().optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface IncidentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IncidentFormData) => void;
  loading?: boolean;
  initialData?: IncidentFormData;
  isEdit?: boolean;
}

// Alias para compatibilidad
type Area = Department;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low': return 'text-blue-600 bg-blue-50/80 border-blue-200/60';
    case 'medium': return 'text-amber-600 bg-amber-50/80 border-amber-200/60';
    case 'high': return 'text-orange-600 bg-orange-50/80 border-orange-200/60';
    case 'urgent': return 'text-red-600 bg-red-50/80 border-red-200/60';
    default: return 'text-gray-600 bg-gray-50/80 border-gray-200/60';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'technical': return <Settings className="h-4 w-4" />;
    case 'software': return <Monitor className="h-4 w-4" />;
    case 'hardware': return <HardDrive className="h-4 w-4" />;
    case 'network': return <Wifi className="h-4 w-4" />;
    case 'other': return <Bug className="h-4 w-4" />;
    default: return <AlertTriangle className="h-4 w-4" />;
  }
};

export const IncidentForm: React.FC<IncidentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialData,
  isEdit = false
}) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isAreasLoading, setIsAreasLoading] = useState(false);
  const [isAreasDropdownOpen, setIsAreasDropdownOpen] = useState(false);

  // Obtener el usuario actual
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      type: 'technical',
      priority: 'medium',
      status: 'open', // Estado por defecto: abierto
      affectedArea: '',
      estimatedResolutionDate: '',
      assignedTo: user?.name || '', // Rellenar automáticamente con el nombre del usuario
    }
  });

  const watchedPriority = watch('priority');
  const watchedType = watch('type');
  const watchedDate = watch('estimatedResolutionDate');
  const watchedArea = watch('affectedArea');

  // Cargar áreas al abrir el modal
  useEffect(() => {
    if (isOpen && areas.length === 0) {
      loadAreas();
    }
  }, [isOpen]);

  // Actualizar el campo "Asignado a" cuando cambie el usuario
  useEffect(() => {
    if (user?.name && !isEdit) {
      setValue('assignedTo', user.name);
    }
  }, [user, setValue, isEdit]);

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
    setValue('affectedArea', area.id.toString());
    setIsAreasDropdownOpen(false);
  };

  const getSelectedAreaLabel = () => {
    if (!watchedArea) return '';
    const selectedArea = areas.find(area => area.id.toString() === watchedArea);
    return selectedArea ? selectedArea.name : watchedArea;
  };

  const handleFormSubmit = async (data: IncidentFormData) => {
    try {
      // Convertir datos del formulario al formato de Supabase
      const supabaseData = transformFormDataForSupabase(data);
      await onSubmit(supabaseData as any);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting incident:', error);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="2xl"
      animation="scale"
    >
      <ModalContainer showGlowEffect glowColor="red">
        <ModalHeader
          title={isEdit ? "Editar Incidencia" : "Nueva Incidencia"}
          subtitle="Completa la información para reportar una nueva incidencia"
          icon={<AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" />}
          onClose={onClose}
          iconBgColor="bg-gradient-to-br from-red-400 to-pink-500 shadow-lg shadow-red-500/50"
          headerBgColor="bg-gradient-to-r from-red-50 via-pink-50/80 to-red-50/90"
          headerBorderColor="border-red-100/50"
        />

        <ModalContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
            {/* Información Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Columna Izquierda - Información Principal */}
              <div className="space-y-3 sm:space-y-4">
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-red-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                    Título de la Incidencia
                  </label>
                  <Input
                    {...register('title')}
                    placeholder="Ingresa el título de la incidencia"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40"
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
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-red-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                    Área Afectada
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsAreasDropdownOpen(!isAreasDropdownOpen)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40 flex items-center justify-between"
                    >
                      <span className={getSelectedAreaLabel() ? 'text-gray-900' : 'text-gray-500'}>
                        {getSelectedAreaLabel() || 'Selecciona un área'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isAreasDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <input
                      {...register('affectedArea')}
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
                            <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-2"></div>
                            Cargando áreas...
                          </div>
                        ) : (
                          <div className="py-2">
                            {areas.map((area) => (
                              <button
                                key={area.id}
                                type="button"
                                onClick={() => handleAreaSelect(area)}
                                className={`w-full px-4 py-3 text-left hover:bg-red-50 transition-colors ${
                                  watchedArea === area.id.toString() ? 'bg-red-100 text-red-700' : 'text-gray-700'
                                }`}
                              >
                                <div className="font-medium">{area.name}</div>
                                <div className="text-sm text-gray-500">{area.short_name}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                  {errors.affectedArea && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.affectedArea.message}
                    </motion.p>
                  )}
                </div>

                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-red-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                    Asignado a
                  </label>
                  <div className="relative">
                    <Input
                      {...register('assignedTo')}
                      placeholder="Nombre del responsable"
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40 pr-10"
                    />
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                  {user?.name && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <span>👤 Usuario actual:</span>
                      <span className="font-medium text-gray-700">{user.name}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Columna Derecha - Información Adicional */}
              <div className="space-y-3 sm:space-y-4">
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-red-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                    Tipo de Incidencia
                  </label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40 cursor-pointer"
                  >
                    <option value="technical">Técnico</option>
                    <option value="software">Software</option>
                    <option value="hardware">Hardware</option>
                    <option value="network">Red</option>
                    <option value="other">Otro</option>
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
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-red-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                    Prioridad
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40 cursor-pointer"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
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
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-red-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                    Fecha Estimada de Resolución
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register('estimatedResolutionDate')}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40 pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                  {errors.estimatedResolutionDate && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.estimatedResolutionDate.message}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="group">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2 group-hover:text-red-700 transition-colors">
                <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                Descripción Detallada
              </label>
              <Textarea
                {...register('description')}
                placeholder="Describe detalladamente la incidencia..."
                rows={3}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40 resize-none"
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
            <div className="flex flex-col sm:flex-row gap-3 p-3 sm:p-4 bg-gradient-to-r from-red-50/60 via-pink-50/40 to-red-50/60 rounded-xl border border-red-100/40 backdrop-blur-sm">
              <motion.div 
                className="flex items-center gap-2 p-2 sm:p-3 bg-white/60 rounded-lg border border-red-200/30 backdrop-blur-sm flex-1"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`p-1.5 sm:p-2 rounded-md border ${getPriorityColor(watchedPriority)}`}>
                  {watchedPriority === 'urgent' ? (
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : watchedPriority === 'high' ? (
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : watchedPriority === 'medium' ? (
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">Prioridad</p>
                  <p className="text-xs text-gray-500 capitalize">{watchedPriority}</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-2 p-2 sm:p-3 bg-white/60 rounded-lg border border-red-200/30 backdrop-blur-sm flex-1"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-red-100/80 to-pink-100/80 rounded-md border border-red-200/60">
                  {getTypeIcon(watchedType)}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">Tipo</p>
                  <p className="text-xs text-gray-500 capitalize">{watchedType.replace('_', ' ')}</p>
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
              className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{isEdit ? 'Actualizar' : 'Crear'} Incidencia</span>
                </div>
              )}
            </Button>
          </motion.div>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
}; 
