import { useState } from 'react';
import { log } from '@/shared/utils/logger';
import { useIncidents, useModal, useIncidentFilters, useFilterOptions } from '@/features/incidents/hooks';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Incident, IncidentStatus } from '@/shared/types/common.types';

export const useIncidentsPage = () => {
  // Estado de envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook de autenticación
  const { user } = useAuth();

  // Hook del modal
  const { isOpen: showForm, open: openForm, close: closeForm } = useModal();

  // Hook de filtros
  const { filters, handleFilterChange, handleClearFilters } = useIncidentFilters();

  // Hook de opciones de filtros
  const filterOptions = useFilterOptions();

  // Hook de incidencias
  const { incidents, loading, error, createIncident } = useIncidents(filters);

  // Manejador de crear incidencia
  const handleCreateIncident = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createIncident({
        ...data,
        createdBy: typeof user?.id === 'string' ? user.id : '',
        attachments: [],
        comments: [],
        status: IncidentStatus.OPEN,
        estimatedResolutionDate: data.estimatedResolutionDate ? new Date(data.estimatedResolutionDate) : undefined,
      });
      closeForm();
    } catch (error) {
      console.error('Error creating incident:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejadores de acciones de incidencias
  const handleIncidentClick = (incident: Incident) => {
    log('Incident clicked:', incident);
    // Aquí puedes implementar la lógica de clic en incidencia
  };

  const handleEditIncident = (incident: Incident) => {
    log('Edit incident:', incident);
    // Aquí puedes implementar la lógica de edición
  };

  const handleDeleteIncident = (incident: Incident) => {
    log('Delete incident:', incident);
    // Aquí puedes implementar la lógica de eliminación
  };

  const handleViewIncident = (incident: Incident) => {
    log('View incident:', incident);
    // Aquí puedes implementar la lógica de visualización
  };

  return {
    // Estado
    user,
    filters,
    incidents,
    loading,
    error,
    showForm,
    isSubmitting,
    
    // Funciones
    handleFilterChange,
    handleClearFilters,
    handleCreateIncident,
    openForm,
    closeForm,
    handleIncidentClick,
    handleEditIncident,
    handleDeleteIncident,
    handleViewIncident,
    
    // Datos
    filterOptions,
  };
}; 