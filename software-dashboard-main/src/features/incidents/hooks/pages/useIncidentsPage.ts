import { useState, useEffect } from 'react';
import { log } from '@/shared/utils/logger';
import { useModal, useIncidentFilters, useFilterOptions } from '@/features/incidents/hooks';
import { useAuthStore } from '@/shared/store';
import { useIncidentsStore } from '@/shared/store/incidentsStore';
import { Incident } from '@/shared/types/common.types';
import { edgeFunctionsService, type CreateIncidentData } from '@/shared/services/supabase';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';

interface CreateIncidentFormData {
  title: string;
  description: string;
  type: string;
  priority: string;
  affectedArea: string;
  assignedTo?: string;
}

export const useIncidentsPage = () => {
  // Estado de envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NUEVOS ESTADOS PARA EDICIÓN
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Hook de autenticación
  const { user } = useAuthStore();

  // Hook del modal
  const { isOpen: showForm, open: openForm, close: closeForm } = useModal();

  // Hook de filtros
  const { filters, handleFilterChange, handleClearFilters } = useIncidentFilters();

  // Hook de opciones de filtros
  const filterOptions = useFilterOptions();

  // Store de incidencias
  const { 
    incidents, 
    loading, 
    error, 
    createIncident,
    updateIncident,
    deleteIncident,
    loadIncidents,
    // nuevos
    loadMoreIncidents,
    stats,
  } = useIncidentsStore();

  // Scroll infinito
  const { sentinelRef } = useInfiniteScroll(loadMoreIncidents);

  // Cargar incidencias cuando cambien los filtros
  useEffect(() => {
    loadIncidents(filters as any);
  }, [filters, loadIncidents]);

  // Manejador de crear incidencia usando Edge Function
  const handleCreateIncident = async (data: CreateIncidentData) => {
    setIsSubmitting(true);
    try {
      console.log('Creating incident with data:', data);
      
      // Usar el edge function directamente
              const result = await edgeFunctionsService.createIncident(data);
      console.log('Incident created successfully:', result);
      
      // Recargar incidencias para mostrar la nueva
      await loadIncidents(filters as any);
      closeForm();
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejador de editar incidencia
  const handleEditIncident = async (incident: Incident) => {
    setEditingIncident(incident);
    setShowEditForm(true);
    setIsReadOnly(false);
  };

  // Manejador de actualizar incidencia
  const handleUpdateIncident = async (data: CreateIncidentFormData) => {
    if (!editingIncident) return;
    
    setIsSubmitting(true);
    try {
      console.log('Updating incident with data:', data);
      
      // Convertir datos al formato del edge function
      const updateData = {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        affected_area_id: data.affectedArea,
        assigned_to: data.assignedTo || null,
      };
      
      // Usar el edge function para actualizar
              const result = await edgeFunctionsService.updateIncident(editingIncident.id, updateData);
      console.log('Incident updated successfully:', result);
      
      // Recargar incidencias
      await loadIncidents(filters as any);
      closeEditForm();
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cerrar formulario de edición
  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingIncident(null);
    setIsReadOnly(false);
  };

  // Manejador de clic en incidencia
  const handleIncidentClick = (incident: Incident) => {
    setEditingIncident(incident);
    setShowEditForm(true);
    setIsReadOnly(true);
  };

  // Manejador de eliminar incidencia
  const handleDeleteIncident = (incident: Incident) => {
    // Implementar lógica de eliminación
    console.log('Delete incident:', incident);
  };

  // Manejador de ver incidencia
  const handleViewIncident = (incident: Incident) => {
    setEditingIncident(incident);
    setShowEditForm(true);
    setIsReadOnly(true);
  };

  return {
    // Estado
    incidents,
    loading,
    error,
    isSubmitting,
    showForm,
    showEditForm,
    editingIncident,
    isReadOnly,
    filters,
    filterOptions,
    stats,
    sentinelRef,

    // Acciones
    openForm,
    closeForm,
    handleCreateIncident,
    handleEditIncident,
    handleUpdateIncident,
    closeEditForm,
    handleIncidentClick,
    handleDeleteIncident,
    handleViewIncident,
    handleFilterChange,
    handleClearFilters,
  };
}; 