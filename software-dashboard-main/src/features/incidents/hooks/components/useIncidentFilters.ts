import { useState } from 'react';

interface IncidentFilters {
  search: string;
  status: string;
  priority: string;
  type: string;
}

const initialFilters: IncidentFilters = {
  search: '',
  status: '',
  priority: '',
  type: '',
};

export const useIncidentFilters = () => {
  const [filters, setFilters] = useState<IncidentFilters>(initialFilters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '');
  };

  return {
    filters,
    handleFilterChange,
    handleClearFilters,
    hasActiveFilters,
    setFilters
  };
}; 