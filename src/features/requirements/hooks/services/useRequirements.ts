import { useState, useEffect, useCallback } from 'react';
import { Requirement, FilterOptions } from '@/shared/types/common.types';
import { requirementsApi } from '@/shared/services';

export const useRequirements = (filters?: FilterOptions) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await requirementsApi.getRequirements(filters);
      setRequirements(data);
    } catch (err) {
      setError('Error al cargar los requerimientos');
      console.error('Error fetching requirements:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createRequirement = useCallback(async (requirement: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRequirement = await requirementsApi.createRequirement(requirement);
      setRequirements(prev => [newRequirement, ...prev]);
      return newRequirement;
    } catch (err) {
      setError('Error al crear el requerimiento');
      throw err;
    }
  }, []);

  const updateRequirement = useCallback(async (id: string, updates: Partial<Requirement>) => {
    try {
      const updatedRequirement = await requirementsApi.updateRequirement(id, updates);
      setRequirements(prev => prev.map(req => req.id === id ? updatedRequirement : req));
      return updatedRequirement;
    } catch (err) {
      setError('Error al actualizar el requerimiento');
      throw err;
    }
  }, []);

  const deleteRequirement = useCallback(async (id: string) => {
    try {
      await requirementsApi.deleteRequirement(id);
      setRequirements(prev => prev.filter(req => req.id !== id));
    } catch (err) {
      setError('Error al eliminar el requerimiento');
      throw err;
    }
  }, []);

  // Inicializar datos mock al cargar el hook (solo una vez)
  useEffect(() => {
    if (typeof requirementsApi.initializeRequirements === 'function') {
      requirementsApi.initializeRequirements();
    }
  }, []);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  return {
    requirements,
    loading,
    error,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    refetch: fetchRequirements,
  };
}; 