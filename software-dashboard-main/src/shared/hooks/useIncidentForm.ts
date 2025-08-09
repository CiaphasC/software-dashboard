import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useMemo } from 'react';
import { logger } from '@/shared/utils/logger';
import { useAuthStore } from '@/shared/store';
import { edgeFunctionsService, type CreateIncidentData } from '@/shared/services/supabase';
import {
  useIncidentFormData,
  useAreasDropdown,
  useUsersDropdown,
  useTypeDropdown,
  usePriorityDropdown,
  useIncidentVisualIndicators,
  incidentSchema,
  type IncidentFormData
} from './index';

// =============================================================================
// USE INCIDENT FORM HOOK - Hook específico para formulario de incidencias
// Arquitectura de Software Profesional - Gestión de Formularios
// =============================================================================

interface UseIncidentFormProps {
  initialData?: Partial<IncidentFormData>;
  isEdit?: boolean;
  isReadOnly?: boolean;
  onSuccess?: () => void;
}

export const useIncidentForm = ({
  initialData,
  isEdit = false,
  isReadOnly = false,
  onSuccess
}: UseIncidentFormProps) => {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del formulario
  const { areas, users, loading: dataLoading, error: dataError } = useIncidentFormData(user?.role_name);

  // Configurar formulario con react-hook-form
  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      affectedArea: initialData?.affectedArea || '',
      type: initialData?.type || 'technical',
      priority: initialData?.priority || 'medium',
      status: initialData?.status || 'open',
      assignedTo: initialData?.assignedTo || user?.id || ''
    }
  });

  const { watch, setValue, reset } = form;
  const watchedType = watch('type');
  const watchedPriority = watch('priority');

  // Configurar dropdowns
  const areasDropdown = useAreasDropdown({
    areas,
    initialValue: form.getValues('affectedArea'),
    onSelect: (area) => setValue('affectedArea', area.id.toString()),
    disabled: isReadOnly
  });

  const usersDropdown = useUsersDropdown({
    users,
    initialValue: form.getValues('assignedTo'),
    onSelect: (userId) => setValue('assignedTo', userId),
    disabled: isReadOnly
  });

  // Sincronizar dropdown de usuarios cuando se cargan los datos
  useEffect(() => {
    if (users.length > 0 && !dataLoading) {
      const currentAssignedTo = form.getValues('assignedTo');
      
      // Si no hay usuario asignado o el usuario asignado no está en la lista
      if (!currentAssignedTo || !users.find(u => u.id === currentAssignedTo)) {
        // Para técnicos, auto-seleccionar su usuario
        if (user?.role_name === 'technician' && users.length === 1) {
          const technicianUser = users[0];
          setValue('assignedTo', technicianUser.id);
          usersDropdown.handleSelect(technicianUser.id);
        }
        // Para otros roles, seleccionar el primer usuario disponible
        else if (users.length > 0) {
          const firstUser = users[0];
          setValue('assignedTo', firstUser.id);
          usersDropdown.handleSelect(firstUser.id);
        }
      }
    }
  }, [users, dataLoading, user?.role_name, setValue, usersDropdown.handleSelect]);

  // Memoizar arrays estáticos para evitar recreaciones
  const typeOptions = useMemo(() => [
    { value: 'technical', label: 'Técnico' },
    { value: 'software', label: 'Software' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'network', label: 'Red' },
    { value: 'other', label: 'Otro' }
  ], []);

  const priorityOptions = useMemo(() => [
    { value: 'low', label: 'Baja', color: 'text-blue-600' },
    { value: 'medium', label: 'Media', color: 'text-amber-600' },
    { value: 'high', label: 'Alta', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-600' }
  ], []);

  const typeDropdown = useTypeDropdown({
    types: typeOptions,
    initialValue: form.getValues('type'),
    onSelect: (type) => setValue('type', type),
    disabled: isReadOnly
  });

  const priorityDropdown = usePriorityDropdown({
    priorities: priorityOptions,
    initialValue: form.getValues('priority'),
    onSelect: (priority) => setValue('priority', priority),
    disabled: isReadOnly
  });

  // Configurar indicadores visuales
  const visualIndicators = useIncidentVisualIndicators({
    priority: watchedPriority,
    type: watchedType
  });

  // Manejar envío del formulario
  const handleSubmit = async (data: IncidentFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      logger.debug('=== FORM SUBMIT STARTED ===');
      logger.debug(`Form data: ${JSON.stringify(data)}`);
      
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
        assigned_to: data.assignedTo && data.assignedTo !== user?.id ? data.assignedTo : null,
      };
      
      logger.debug(`Edge function data: ${JSON.stringify(edgeFunctionData)}`);
      
      // Llamar al servicio correspondiente
      if (isEdit) {
        // TODO: Implementar actualización
        // await edgeFunctionsService.updateIncident(edgeFunctionData);
      } else {
        await edgeFunctionsService.createIncident(edgeFunctionData);
      }
      
      reset();
      onSuccess?.();
    } catch (error) {
      logger.error('Error submitting incident:', (error as Error).message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sincronizar valores de dropdowns con el formulario
  const syncDropdownValues = () => {
    const formValues = form.getValues();
    
    if (formValues.affectedArea !== areasDropdown.selectedValue) {
      areasDropdown.handleSelect(formValues.affectedArea);
    }
    
    if (formValues.assignedTo !== usersDropdown.selectedValue) {
      usersDropdown.handleSelect(formValues.assignedTo);
    }
    
    if (formValues.type !== typeDropdown.selectedValue) {
      typeDropdown.handleSelect(formValues.type);
    }
    
    if (formValues.priority !== priorityDropdown.selectedValue) {
      priorityDropdown.handleSelect(formValues.priority);
    }
  };

  return {
    // Estado del formulario
    form,
    isSubmitting,
    dataLoading,
    dataError,
    
    // Dropdowns
    areasDropdown,
    usersDropdown,
    typeDropdown,
    priorityDropdown,
    
    // Indicadores visuales
    visualIndicators,
    
    // Valores observados
    watchedType,
    watchedPriority,
    
    // Funciones
    handleSubmit,
    syncDropdownValues,
    reset
  };
}; 