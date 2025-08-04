import { useMemo } from 'react';
import { FilterOption } from '@/shared/components/ui/FilterBar';

export const useFilterOptions = () => {
  const filterOptions = useMemo((): FilterOption[] => [
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'open', label: 'Abierta' },
        { value: 'pending', label: 'Pendiente' },
        { value: 'in_progress', label: 'En Proceso' },
        { value: 'completed', label: 'Completada' },
        { value: 'delivered', label: 'Entregada' },
        { value: 'closed', label: 'Cerrada' },
      ]
    },
    {
      key: 'priority',
      label: 'Prioridad',
      type: 'select',
      options: [
        { value: 'low', label: 'Baja' },
        { value: 'medium', label: 'Media' },
        { value: 'high', label: 'Alta' },
        { value: 'urgent', label: 'Urgente' },
      ]
    },
    {
      key: 'type',
      label: 'Tipo',
      type: 'select',
      options: [
        { value: 'technical', label: 'Técnica' },
        { value: 'software', label: 'Software' },
        { value: 'hardware', label: 'Hardware' },
        { value: 'network', label: 'Red' },
        { value: 'other', label: 'Otro' },
      ]
    }
  ], []);

  return filterOptions;
}; 