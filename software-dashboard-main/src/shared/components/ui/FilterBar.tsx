import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: string | number | Date | undefined;
}

interface FilterBarProps {
  filters: FilterOption[];
  values: FilterValues;
  onChange: (key: string, value: string) => void;
  onClear?: () => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  values,
  onChange,
  onClear,
  onSearch,
  searchPlaceholder = "Buscar...",
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const hasActiveFilters = Object.values(values).some(value => value && value !== '');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleClear = () => {
    onClear?.();
    setSearchQuery('');
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary-600" />
            Filtros
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden"
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search bar */}
        {onSearch && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <AnimatePresence>
          {(isExpanded || window.innerWidth >= 768) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filters.map((filter) => (
                  <div key={filter.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {filter.label}
                    </label>
                    
                    {filter.type === 'text' && (
                      <Input
                        type="text"
                        placeholder={filter.placeholder}
                        value={values[filter.key] as string || ''}
                        onChange={(e) => onChange(filter.key, e.target.value)}
                      />
                    )}
                    
                    {filter.type === 'select' && filter.options && (
                      <Select
                        options={[
                          { value: '', label: `Todos los ${filter.label.toLowerCase()}` },
                          ...filter.options
                        ]}
                        value={values[filter.key] as string || ''}
                        onChange={(e) => onChange(filter.key, e.target.value)}
                      />
                    )}
                    
                    {filter.type === 'date' && (
                      <Input
                        type="date"
                        value={values[filter.key] as string || ''}
                        onChange={(e) => onChange(filter.key, e.target.value)}
                      />
                    )}
                    
                    {filter.type === 'dateRange' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          placeholder="Desde"
                          value={values[`${filter.key}Start`] as string || ''}
                          onChange={(e) => onChange(`${filter.key}Start`, e.target.value)}
                        />
                        <Input
                          type="date"
                          placeholder="Hasta"
                          value={values[`${filter.key}End`] as string || ''}
                          onChange={(e) => onChange(`${filter.key}End`, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="flex flex-wrap gap-2">
              {Object.entries(values).map(([key, value]) => {
                if (!value || value === '') return null;
                const filter = filters.find(f => f.key === key);
                if (!filter) return null;
                
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {filter.label}: {value}
                    <button
                      onClick={() => onChange(key, '')}
                      className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}; 
