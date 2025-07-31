import { useMemo } from 'react';
import { FilterOption } from '@/shared/components/ui/FilterBar';
import { IncidentStatus, Priority, IncidentType } from '@/shared/types/common.types';

export const useFilterOptions = () => {
  const filterOptions = useMemo((): FilterOption[] => [
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: IncidentStatus.OPEN, label: 'Abierta' },
        { value: IncidentStatus.IN_PROGRESS, label: 'En Proceso' },
        { value: IncidentStatus.RESOLVED, label: 'Resuelta' },
        { value: IncidentStatus.CLOSED, label: 'Cerrada' },
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
        { value: IncidentType.TECHNICAL, label: 'Técnica' },
        { value: IncidentType.SOFTWARE, label: 'Software' },
        { value: IncidentType.HARDWARE, label: 'Hardware' },
        { value: IncidentType.NETWORK, label: 'Red' },
        { value: IncidentType.OTHER, label: 'Otro' },
      ]
    }
  ], []);

  return filterOptions;
}; 