import { useState, useEffect, useCallback } from 'react';
import { Incident, FilterOptions } from '@/shared/types/common.types';
import { incidentsApi } from '@/shared/services';

export const useIncidents = (filters?: FilterOptions) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await incidentsApi.getIncidents(filters);
      setIncidents(data);
    } catch (err) {
      setError('Error al cargar las incidencias');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createIncident = useCallback(async (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newIncident = await incidentsApi.createIncident(incident);
      setIncidents(prev => [newIncident, ...prev]);
      return newIncident;
    } catch (err) {
      setError('Error al crear la incidencia');
      throw err;
    }
  }, []);

  const updateIncident = useCallback(async (id: string, updates: Partial<Incident>) => {
    try {
      const updatedIncident = await incidentsApi.updateIncident(id, updates);
      setIncidents(prev => prev.map(inc => inc.id === id ? updatedIncident : inc));
      return updatedIncident;
    } catch (err) {
      setError('Error al actualizar la incidencia');
      throw err;
    }
  }, []);

  const deleteIncident = useCallback(async (id: string) => {
    try {
      await incidentsApi.deleteIncident(id);
      setIncidents(prev => prev.filter(inc => inc.id !== id));
    } catch (err) {
      setError('Error al eliminar la incidencia');
      throw err;
    }
  }, []);

  // Inicializar datos mock al cargar el hook (solo una vez)
  useEffect(() => {
    if (typeof incidentsApi.initializeIncidents === 'function') {
      incidentsApi.initializeIncidents();
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    createIncident,
    updateIncident,
    deleteIncident,
    refetch: fetchIncidents,
  };
}; 