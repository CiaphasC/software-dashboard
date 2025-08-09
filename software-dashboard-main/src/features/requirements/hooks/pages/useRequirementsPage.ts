import { useState, useEffect } from 'react';
import { log } from '@/shared/utils/logger';
import { useRequirementModal } from '@/features/requirements/hooks';
import { useRequirementsStore } from '@/shared/store/requirementsStore';
import { selectRequirements, selectRequirementsLoading } from '@/shared/store/selectors'
import { shallow } from 'zustand/shallow'
import { Requirement, RequirementType, RequirementStatus, Priority } from '@/shared/types/common.types';

// Tipo para las opciones de filtro
interface FilterOption {
  key: string;
  label: string;
  type: 'select';
  options: { value: string; label: string }[];
}

export const useRequirementsPage = () => {
  // Estado de filtros
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    type: '',
  });

  // Estado de envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook del modal
  const { isOpen: showForm, open: openForm, close: closeForm } = useRequirementModal();

  // Store de requerimientos (reemplaza el hook duplicado)
  const requirements = useRequirementsStore(selectRequirements)
  const loading = useRequirementsStore(selectRequirementsLoading)
  const { error, createRequirement, updateRequirement, deleteRequirement, loadRequirements } = useRequirementsStore(s => ({
    error: s.error,
    createRequirement: s.createRequirement,
    updateRequirement: s.updateRequirement,
    deleteRequirement: s.deleteRequirement,
    loadRequirements: s.loadRequirements,
  }), shallow)

  // Cargar requerimientos cuando cambien los filtros
  useEffect(() => {
    loadRequirements(filters);
  }, [filters, loadRequirements]);

  // Manejador de cambio de filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Manejador de limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      type: '',
    });
  };

  // Manejador de crear requerimiento
  const handleCreateRequirement = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createRequirement(data);
      closeForm();
    } catch (error) {
      console.error('Error creating requirement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opciones de filtros
  const filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: RequirementStatus.PENDING, label: 'Pendiente' },
        { value: RequirementStatus.IN_PROGRESS, label: 'En Proceso' },
        { value: RequirementStatus.DELIVERED, label: 'Entregado' },
        { value: RequirementStatus.CLOSED, label: 'Cerrado' },
      ]
    },
    {
      key: 'priority',
      label: 'Prioridad',
      type: 'select',
      options: [
        { value: Priority.LOW, label: 'Baja' },
        { value: Priority.MEDIUM, label: 'Media' },
        { value: Priority.HIGH, label: 'Alta' },
        { value: Priority.URGENT, label: 'Urgente' },
      ]
    },
    {
      key: 'type',
      label: 'Tipo',
      type: 'select',
      options: [
        { value: RequirementType.DOCUMENT, label: 'Documento' },
        { value: RequirementType.EQUIPMENT, label: 'Equipo' },
        { value: RequirementType.SERVICE, label: 'Servicio' },
        { value: RequirementType.OTHER, label: 'Otro' },
      ]
    }
  ];

  // Manejadores de acciones de requerimientos
  const handleRequirementClick = (requirement: Requirement) => {
    log('Requirement clicked:', requirement);
    // Aquí puedes implementar la lógica de clic en requerimiento
  };

  const handleEditRequirement = (requirement: Requirement) => {
    log('Edit requirement:', requirement);
    // Aquí puedes implementar la lógica de edición
  };

  const handleDeleteRequirement = (requirement: Requirement) => {
    log('Delete requirement:', requirement);
    // Aquí puedes implementar la lógica de eliminación
  };

  const handleViewRequirement = (requirement: Requirement) => {
    log('View requirement:', requirement);
    // Aquí puedes implementar la lógica de visualización
  };

  return {
    // Estado
    filters,
    requirements,
    loading,
    error,
    showForm,
    isSubmitting,
    
    // Funciones
    handleFilterChange,
    handleClearFilters,
    handleCreateRequirement,
    openForm,
    closeForm,
    handleRequirementClick,
    handleEditRequirement,
    handleDeleteRequirement,
    handleViewRequirement,
    
    // Datos
    filterOptions,
  };
}; 