import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Settings, 
  Monitor, 
  HardDrive, 
  Wifi, 
  Bug, 
  ChevronDown, 
  AlertCircle, 
  User,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react';

import { Modal, ModalHeader, ModalContent } from '@/shared/components/ui/Modal';
import { ModalContainer } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useAuthStore } from '@/shared/store';
import { dataService, edgeFunctionsService, type CreateIncidentData } from '@/shared/services/supabase';
import type { Department } from '@/shared/services/supabase/types';

// =============================================================================
// SCHEMA & TYPES
// =============================================================================

const incidentSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  affectedArea: z.string().min(1, 'El área afectada es requerida'),
  type: z.string().refine((val) => ['technical', 'software', 'hardware', 'network', 'other'].includes(val), {
    message: 'Tipo de incidencia inválido'
  }),
  priority: z.string().refine((val) => ['low', 'medium', 'high', 'urgent'].includes(val), {
    message: 'Prioridad inválida'
  }),
  status: z.string().refine((val) => ['open', 'in_progress', 'resolved', 'closed'].includes(val), {
    message: 'Estado inválido'
  }),
  assignedTo: z.string().optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface IncidentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIncidentData) => void;
  loading?: boolean;
  initialData?: IncidentFormData;
  isEdit?: boolean;
  userRole?: 'admin' | 'technician' | 'requester';
  incidentStatus?: string;
  isReadOnly?: boolean;
  allowedFields?: string[];
  canEditStatus?: boolean;
  canEditArea?: boolean;
  canEditContent?: boolean;
}

type Area = Department;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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

// =============================================================================
// INCIDENT FORM COMPONENT
// =============================================================================

export const IncidentForm: React.FC<IncidentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialData,
  isEdit = false,
  userRole = 'requester',
  incidentStatus = 'open',
  isReadOnly = false,
  allowedFields = ['title', 'description', 'affectedArea', 'type', 'priority', 'assignedTo'],
  canEditStatus = false,
  canEditArea = true,
  canEditContent = true
}) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role_name: string }>>([]);
  const [isAreasLoading, setIsAreasLoading] = useState(false);
  const [isAreasDropdownOpen, setIsAreasDropdownOpen] = useState(false);
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();

  // Lógica de permisos
  const isReadOnlyMode = isReadOnly || !canEditContent;
  const canShowStatusField = canEditStatus && allowedFields.includes('status');
  const canShowAreaField = canEditArea && allowedFields.includes('affectedArea');
  const canShowTitleField = allowedFields.includes('title');
  const canShowDescriptionField = allowedFields.includes('description');
  const canShowTypeField = allowedFields.includes('type');
  const canShowPriorityField = allowedFields.includes('priority');
  const canShowAssignedField = allowedFields.includes('assignedTo');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
    reset,
    watch,
    setValue,
    getValues,
    trigger
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      type: 'technical',
      priority: 'medium',
      status: 'open',
      affectedArea: '',
      assignedTo: user?.id || '',
    },
    mode: 'onChange'
  });

  const watchedPriority = watch('priority');
  const watchedType = watch('type');
  const watchedArea = watch('affectedArea');

  // Cargar áreas y usuarios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      if (areas.length === 0) {
        loadAreas();
      }
      if (users.length === 0) {
        loadUsers();
      }
    }
  }, [isOpen]);



  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.areas-dropdown-container')) {
        setIsAreasDropdownOpen(false);
      }
      if (!target.closest('.users-dropdown-container')) {
        setIsUsersDropdownOpen(false);
      }
      if (!target.closest('.type-dropdown-container')) {
        setIsTypeDropdownOpen(false);
      }
      if (!target.closest('.priority-dropdown-container')) {
        setIsPriorityDropdownOpen(false);
      }
    };

    if (isAreasDropdownOpen || isUsersDropdownOpen || isTypeDropdownOpen || isPriorityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAreasDropdownOpen, isUsersDropdownOpen, isTypeDropdownOpen, isPriorityDropdownOpen]);

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

  const loadUsers = async () => {
    try {
      const usersData = await edgeFunctionsService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAreaSelect = (area: Area) => {
    console.log('🔍 handleAreaSelect - Area seleccionada:', area);
    const areaId = area.id.toString();
    
    setValue('affectedArea', areaId, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true 
    });
    
    trigger('affectedArea');
    setIsAreasDropdownOpen(false);
  };

  const getSelectedAreaLabel = () => {
    if (!watchedArea) return '';
    const selectedArea = areas.find(area => area.id.toString() === watchedArea);
    return selectedArea ? selectedArea.name : watchedArea;
  };

  const handleUserSelect = (userId: string) => {
    setValue('assignedTo', userId);
    setIsUsersDropdownOpen(false);
  };

  const getSelectedUserLabel = () => {
    const selectedUser = users.find(user => user.id === watch('assignedTo'));
    return selectedUser ? `${selectedUser.name} (${selectedUser.role_name})` : '';
  };

  const handleTypeSelect = (type: string) => {
    setValue('type', type);
    setIsTypeDropdownOpen(false);
  };

  const getSelectedTypeLabel = () => {
    const type = watch('type');
    const typeLabels: Record<string, string> = {
      'technical': 'Técnico',
      'software': 'Software',
      'hardware': 'Hardware',
      'network': 'Red',
      'other': 'Otro'
    };
    return typeLabels[type] || '';
  };

  const handlePrioritySelect = (priority: string) => {
    setValue('priority', priority);
    setIsPriorityDropdownOpen(false);
  };

  const getSelectedPriorityLabel = () => {
    const priority = watch('priority');
    const priorityLabels: Record<string, string> = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return priorityLabels[priority] || '';
  };

  const handleFormSubmit = async (data: IncidentFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      console.log('=== FORM SUBMIT STARTED ===');
      console.log('Form data:', data);
      
      // Validar que affectedArea no esté vacío
      if (!data.affectedArea || data.affectedArea.trim() === '') {
        throw new Error('El área afectada es requerida');
      }
      
      // Convertir datos al formato del edge function
      const edgeFunctionData: CreateIncidentData = {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        affected_area_id: data.affectedArea,
        assigned_to: data.assignedTo && data.assignedTo !== user?.name ? data.assignedTo : null,
      };
      
      console.log('Edge function data:', edgeFunctionData);
      
      // Llamar onSubmit que manejará la creación
      await onSubmit(edgeFunctionData);
      
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting incident:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="full"
      animation="scale"
    >
      <ModalContainer showGlowEffect glowColor="red">
        <ModalHeader
          title={isEdit ? "Editar Incidencia" : "Nueva Incidencia"}
          subtitle={isReadOnlyMode ? "Vista de solo lectura" : "Completa la información para reportar una nueva incidencia"}
          icon={<AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" />}
          onClose={onClose}
          iconBgColor="bg-gradient-to-br from-red-400 to-pink-500 shadow-lg shadow-red-500/50"
          headerBgColor="bg-gradient-to-r from-red-50 via-pink-50/80 to-red-50/90"
          headerBorderColor="border-red-100/50"
        />

        <ModalContent className="max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-2 sm:space-y-3">
            {/* Información Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Columna Izquierda - Información Principal */}
              <div className="space-y-1.5 sm:space-y-2">
                {/* Título */}
                {canShowTitleField && (
                <div className="group">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1 group-hover:text-red-700 transition-colors">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                    Título de la Incidencia
                  </label>
                  <Input
                    {...register('title')}
                    placeholder="Ingresa el título de la incidencia"
                    disabled={isReadOnlyMode}
                    className={`w-full px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40 ${
                      isReadOnlyMode ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
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
                )}

                {/* Área Afectada */}
                {canShowAreaField && (
                <div className="group relative areas-dropdown-container">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1 group-hover:text-red-700 transition-colors">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                    Área Afectada
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsAreasDropdownOpen(!isAreasDropdownOpen)}
                      disabled={isReadOnlyMode}
                      className={`w-full px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40 flex items-center justify-between ${
                        isReadOnlyMode ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className={getSelectedAreaLabel() ? 'text-gray-900' : 'text-gray-500'}>
                        {getSelectedAreaLabel() || 'Selecciona un área'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isAreasDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <input
                      {...register('affectedArea', { 
                        required: 'El área afectada es requerida'
                      })}
                      type="hidden"
                      value={watchedArea || ''}
                    />
                    
                    {isAreasDropdownOpen && !isReadOnlyMode && (
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
                )}

                {/* Asignado a */}
                {canShowAssignedField && (
                <div className="group relative users-dropdown-container">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1 group-hover:text-red-700 transition-colors">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                    Asignado a
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsUsersDropdownOpen(!isUsersDropdownOpen)}
                      disabled={isReadOnlyMode}
                      className={`w-full px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40 flex items-center justify-between ${
                        isReadOnlyMode ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className={getSelectedUserLabel() ? 'text-gray-900' : 'text-gray-500'}>
                        {getSelectedUserLabel() || 'Selecciona un usuario'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isUsersDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <input
                      {...register('assignedTo')}
                      type="hidden"
                      value={watch('assignedTo') || ''}
                    />
                    
                    {isUsersDropdownOpen && !isReadOnlyMode && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200/60 backdrop-blur-sm overflow-hidden max-h-60 overflow-y-auto"
                      >
                        <div className="py-2">
                          <button
                            type="button"
                            onClick={() => handleUserSelect('')}
                            className={`w-full px-4 py-3 text-left hover:bg-red-50 transition-colors ${
                              !watch('assignedTo') ? 'bg-red-100 text-red-700' : 'text-gray-700'
                            }`}
                          >
                            <div className="font-medium">Sin asignar</div>
                          </button>
                          {users.map((userOption) => (
                            <button
                              key={userOption.id}
                              type="button"
                              onClick={() => handleUserSelect(userOption.id)}
                              className={`w-full px-4 py-3 text-left hover:bg-red-50 transition-colors ${
                                watch('assignedTo') === userOption.id ? 'bg-red-100 text-red-700' : 'text-gray-700'
                              }`}
                            >
                              <div className="font-medium">{userOption.name}</div>
                              <div className="text-sm text-gray-500">{userOption.role_name}</div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  {user?.name && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <span>👤 Usuario actual:</span>
                      <span className="font-medium text-gray-700">{user.name}</span>
                    </p>
                  )}
                </div>
                )}
              </div>

              {/* Columna Derecha - Información Adicional */}
              <div className="space-y-1.5 sm:space-y-2">
                {/* Tipo de Incidencia */}
                {canShowTypeField && (
                <div className="group relative type-dropdown-container">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1 group-hover:text-red-700 transition-colors">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                    Tipo de Incidencia
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      disabled={isReadOnlyMode}
                      className={`w-full px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40 flex items-center justify-between ${
                        isReadOnlyMode ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className={getSelectedTypeLabel() ? 'text-gray-900' : 'text-gray-500'}>
                        {getSelectedTypeLabel() || 'Selecciona un tipo'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <input
                      {...register('type')}
                      type="hidden"
                      value={watch('type') || ''}
                    />
                    
                    {isTypeDropdownOpen && !isReadOnlyMode && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200/60 backdrop-blur-sm overflow-hidden"
                      >
                        <div className="py-2">
                          {[
                            { value: 'technical', label: 'Técnico' },
                            { value: 'software', label: 'Software' },
                            { value: 'hardware', label: 'Hardware' },
                            { value: 'network', label: 'Red' },
                            { value: 'other', label: 'Otro' }
                          ].map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => handleTypeSelect(type.value)}
                              className={`w-full px-4 py-3 text-left hover:bg-red-50 transition-colors ${
                                watch('type') === type.value ? 'bg-red-100 text-red-700' : 'text-gray-700'
                              }`}
                            >
                              <div className="font-medium">{type.label}</div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
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
                )}

                {/* Prioridad */}
                {canShowPriorityField && (
                <div className="group relative priority-dropdown-container">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1 group-hover:text-red-700 transition-colors">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                    Prioridad
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                      disabled={isReadOnlyMode}
                      className={`w-full px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40 flex items-center justify-between ${
                        isReadOnlyMode ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className={getSelectedPriorityLabel() ? 'text-gray-900' : 'text-gray-500'}>
                        {getSelectedPriorityLabel() || 'Selecciona una prioridad'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isPriorityDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <input
                      {...register('priority')}
                      type="hidden"
                      value={watch('priority') || ''}
                    />
                    
                    {isPriorityDropdownOpen && !isReadOnlyMode && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200/60 backdrop-blur-sm overflow-hidden"
                      >
                        <div className="py-2">
                          {[
                            { value: 'low', label: 'Baja' },
                            { value: 'medium', label: 'Media' },
                            { value: 'high', label: 'Alta' },
                            { value: 'urgent', label: 'Urgente' }
                          ].map((priority) => (
                            <button
                              key={priority.value}
                              type="button"
                              onClick={() => handlePrioritySelect(priority.value)}
                              className={`w-full px-4 py-3 text-left hover:bg-red-50 transition-colors ${
                                watch('priority') === priority.value ? 'bg-red-100 text-red-700' : 'text-gray-700'
                              }`}
                            >
                              <div className="font-medium">{priority.label}</div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
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
                )}
              </div>
            </div>

            {/* Descripción */}
            {canShowDescriptionField && (
            <div className="group">
                                <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1 group-hover:text-red-700 transition-colors">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full" />
                    Descripción
                  </label>
              <textarea
                {...register('description')}
                placeholder="Describe detalladamente la incidencia..."
                disabled={isReadOnlyMode}
                rows={4}
                className={`w-full px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/60 transition-all duration-300 hover:bg-white/90 hover:border-red-300/40 resize-none ${
                  isReadOnlyMode ? 'opacity-60 cursor-not-allowed' : ''
                }`}
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
            )}

            {/* Indicadores Visuales */}
            <div className="flex flex-col sm:flex-row gap-2 p-2 sm:p-3 bg-gradient-to-r from-red-50/60 via-pink-50/40 to-red-50/60 rounded-xl border border-red-100/40 backdrop-blur-sm">
              <motion.div 
                className="flex items-center gap-1.5 p-1.5 sm:p-2 bg-white/60 rounded-lg border border-red-200/30 backdrop-blur-sm flex-1"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`p-1 sm:p-1.5 rounded-md border ${getPriorityColor(watchedPriority)}`}>
                  {watchedPriority === 'urgent' ? (
                    <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  ) : watchedPriority === 'high' ? (
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  ) : watchedPriority === 'medium' ? (
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  ) : (
                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Prioridad</p>
                  <p className="text-xs text-gray-500 capitalize">{watchedPriority}</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-1.5 p-1.5 sm:p-2 bg-white/60 rounded-lg border border-red-200/30 backdrop-blur-sm flex-1"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="p-1 sm:p-1.5 bg-gradient-to-r from-red-100/80 to-pink-100/80 rounded-md border border-red-200/60">
                  {getTypeIcon(watchedType)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Tipo</p>
                  <p className="text-xs text-gray-500 capitalize">{watchedType.replace('_', ' ')}</p>
                </div>
              </motion.div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-3">
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="button" variant="outline" onClick={onClose} className="w-full py-1.5 sm:py-2">
                  {isReadOnlyMode ? 'Cerrar' : 'Cancelar'}
                </Button>
              </motion.div>
              
              {!isReadOnlyMode && (
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting || formIsSubmitting || loading}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting || formIsSubmitting ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {isEdit ? 'Actualizando...' : 'Creando...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                        {isEdit ? 'Actualizar Incidencia' : 'Crear Incidencia'}
                      </div>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </form>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
}; 
