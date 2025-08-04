import { useState, useEffect } from 'react';
import { log } from '@/shared/utils/logger';
import { useModal, useIncidentFilters, useFilterOptions } from '@/features/incidents/hooks';
import { useAuthStore } from '@/shared/store';
import { useIncidentsStore } from '@/shared/store/incidentsStore';
import { Incident } from '@/shared/types/common.types';
import { transformFormDataForSupabase } from '@/shared/utils/utils';

interface CreateIncidentData {
  title: string;
  description: string;
  type: string;
  priority: string;
  affectedArea: string;
  estimatedResolutionDate?: string;
  assignedTo?: string;
}

export const useIncidentsPage = () => {
  // Estado de envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook de autenticación
  const { user } = useAuthStore();

  // Hook del modal
  const { isOpen: showForm, open: openForm, close: closeForm } = useModal();

  // Hook de filtros
  const { filters, handleFilterChange, handleClearFilters } = useIncidentFilters();

  // Hook de opciones de filtros
  const filterOptions = useFilterOptions();

  // Store de incidencias (reemplaza el hook duplicado)
  const { 
    incidents, 
    loading, 
    error, 
    createIncident,
    updateIncident,
    deleteIncident,
    loadIncidents
  } = useIncidentsStore();

  // Cargar incidencias cuando cambien los filtros
  useEffect(() => {
    loadIncidents(filters);
  }, [filters, loadIncidents]);

  // Manejador de crear incidencia
  const handleCreateIncident = async (data: CreateIncidentData) => {
    setIsSubmitting(true);
    try {
      // Convertir datos del formulario al formato de Supabase
      const supabaseData = transformFormDataForSupabase(data);
      
      // Agregar datos adicionales requeridos por Supabase
      const incidentData = {
        ...supabaseData,
        created_by: typeof user?.id === 'string' ? user.id : '',
        status: 'open', // Estado inicial
      };

      await createIncident(incidentData as any);
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