import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  X, 
  RefreshCw,
  Filter
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { FilterOption } from '@/shared/components/ui/FilterBar';

interface IncidentsFiltersProps {
  filters: FilterOption[];
  values: any;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  onSearch: (query: string) => void;
  searchPlaceholder: string;
}

export const IncidentsFilters: React.FC<IncidentsFiltersProps> = ({
  filters,
  values,
  onChange,
  onClear,
  onSearch,
  searchPlaceholder
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleClearAll = () => {
    onClear();
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl">
          <div className="flex items-center p-1">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-orange-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch(e.target.value);
                }}
                className="w-full pl-12 pr-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
              />
            </div>
            <div className="flex items-center gap-2 p-2">
              <Button
                onClick={handleClearAll}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-300"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de filtros siempre visible */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                {filter.label}
              </label>
              <div className="relative group">
                <select
                  value={values[filter.key] || ''}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-3 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-0 focus:border-gray-200/50 focus:outline-none text-sm font-medium transition-all duration-300 cursor-pointer hover:bg-white/70 hover:border-orange-300/50 group-hover:shadow-md"
                  style={{
                    outline: 'none',
                    border: '1px solid rgba(229, 231, 235, 0.5)',
                    boxShadow: 'none'
                  }}
                >
                  <option value="" className="text-gray-500">Seleccionar {filter.label.toLowerCase()}</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value} className="text-gray-700">
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <div className="w-2 h-2 border-2 border-gray-400 border-t-transparent border-l-transparent rotate-45 group-hover:border-orange-500 transition-colors duration-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Acciones de filtros */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/50">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span>Filtros activos</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
              className="px-4 py-2 text-sm border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar todo
            </Button>
            <Button
              size="sm"
              className="px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300"
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Indicador de filtros activos */}
      {Object.values(values).some(value => value !== '') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-gray-600"
        >
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-orange-500" />
            <span>Filtros aplicados:</span>
          </div>
          <div className="flex items-center gap-2">
            {Object.entries(values)
              .filter(([_, value]) => value)
              .map(([key, value]) => {
                const filter = filters.find(f => f.key === key);
                const option = filter?.options?.find(o => o.value === value);
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-2 py-1 text-xs bg-orange-50 border border-orange-200 text-orange-700 rounded-full"
                  >
                    {option?.label || String(value)}
                  </span>
                );
              })}
          </div>
        </motion.div>
      )}
    </div>
  );
}; 