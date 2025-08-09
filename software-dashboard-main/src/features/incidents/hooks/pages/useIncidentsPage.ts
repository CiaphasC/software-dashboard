import { useState, useEffect } from 'react';
import { useModal, useIncidentFilters, useFilterOptions } from '@/features/incidents/hooks';
import { useIncidentsStore } from '@/shared/store/incidentsStore';
import { selectIncidents, selectIncidentsLoading } from '@/shared/store/selectors'
import { shallow } from 'zustand/shallow'
import { edgeFunctionsService, type CreateIncidentData } from '@/shared/services/supabase';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import type { IncidentDomain } from '@/shared/domain/incident';

export const useIncidentsPage = () => {
  // Estado de envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NUEVOS ESTADOS PARA EDICIÓN
  const [editingIncident, setEditingIncident] = useState<IncidentDomain | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Hook del modal
  const { isOpen: showForm, open: openForm, close: closeForm } = useModal();

  // Hook de filtros
  const { filters, handleFilterChange, handleClearFilters } = useIncidentFilters();

  // Hook de opciones de filtros
  const filterOptions = useFilterOptions();

  // Store de incidencias
  const incidents = useIncidentsStore(selectIncidents)
  const loading = useIncidentsStore(selectIncidentsLoading)
  const { error, loadIncidents, loadMoreIncidents, stats } = useIncidentsStore(s => ({
    error: s.error,
    loadIncidents: s.loadIncidents,
    loadMoreIncidents: s.loadMoreIncidents,
    stats: s.stats,
  }), shallow)

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
      await edgeFunctionsService.createIncident(data);
      await loadIncidents(filters as any);
      closeForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    filters,
    filterOptions,
    incidents,
    loading,
    error,
    showForm,
    isSubmitting,
    editingIncident,
    showEditForm,
    isReadOnly,
    handleFilterChange,
    handleClearFilters,
    handleCreateIncident,
    openForm,
    closeForm,
    sentinelRef,
    stats,
    setEditingIncident,
    setShowEditForm,
    setIsReadOnly,
  };
} 