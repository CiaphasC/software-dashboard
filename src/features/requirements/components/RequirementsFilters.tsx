import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  XCircle, 
  Sparkles, 
  Gem, 
  Star, 
  ArrowRight,
  Zap,
  Target,
  Shield,
  ChevronDown
} from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { FilterOption } from '@/shared/components/ui/FilterBar';

interface RequirementsFiltersProps {
  filters: FilterOption[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  onSearch: (query: string) => void;
  searchPlaceholder?: string;
}

// Componente de dropdown usando select nativo (misma solución que incidencias)
const CustomDropdown: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}> = ({ options, value, onChange, placeholder, label }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <motion.div 
          className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {label}
      </label>
      <div className="relative group">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none pl-4 pr-10 py-3 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-0 focus:border-gray-200/50 focus:outline-none text-sm font-medium transition-all duration-300 cursor-pointer hover:bg-white/70 hover:border-emerald-300/50 group-hover:shadow-md"
          style={{
            outline: 'none',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            boxShadow: 'none'
          }}
        >
          <option value="" className="text-gray-500">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-700">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="w-2 h-2 border-2 border-gray-400 border-t-transparent border-l-transparent rotate-45 group-hover:border-emerald-500 transition-colors duration-300"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * RequirementsFilters Component
 * 
 * Componente moderno de filtros y búsqueda avanzada para requerimientos
 * con diseño actualizado y funcionalidades AI-powered.
 */
export const RequirementsFilters: React.FC<RequirementsFiltersProps> = ({
  filters,
  values,
  onChange,
  onClear,
  onSearch,
  searchPlaceholder = "Buscar requerimientos por título, descripción o área..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleClearAll = () => {
    setSearchQuery('');
    onClear();
  };

  const hasActiveFilters = Object.values(values).some(value => value !== '') || searchQuery !== '';

  return (
    <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl mb-8 relative group p-6">
      {/* Efecto de brillo en el borde */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-600" />
      
      {/* Efecto de borde animado */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-400/30 via-green-400/30 to-emerald-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      
      {/* Header con título e indicador AI */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <motion.div 
          className="p-2.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg"
          whileHover={{ rotate: 8, scale: 1.15 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Filter className="w-5 h-5 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900">Filtros y Búsqueda Avanzada</h3>
        <div className="ml-auto flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Gem className="w-3 h-3 text-green-500" />
          </motion.div>
        </div>
      </div>
      
      {/* Barra de búsqueda principal */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-14 pr-24 py-4 bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
          {searchQuery && (
            <motion.button
              onClick={() => handleSearch('')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
              whileHover={{ rotate: 90 }}
            >
              <XCircle className="h-4 w-4 text-gray-400" />
            </motion.button>
          )}
          <motion.button 
            className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-110"
            whileHover={{ rotate: 180 }}
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Panel de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filters.map((filter, index) => (
          <motion.div 
            key={filter.key}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <CustomDropdown
              options={[
                { value: '', label: `Todos los ${filter.label.toLowerCase()}s` },
                ...(filter.options || [])
              ]}
              value={values[filter.key] || ''}
              onChange={(value) => onChange(filter.key, value)}
              placeholder={`Todos los ${filter.label.toLowerCase()}s`}
              label={filter.label}
            />
          </motion.div>
        ))}
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mt-6 flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50/95 to-green-50/95 rounded-2xl border border-emerald-200/50 shadow-sm"
        >
          <span className="text-sm font-bold text-emerald-700 flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-emerald-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <Star className="w-4 h-4" />
            Filtros activos aplicados
          </span>
          <motion.button
            onClick={handleClearAll}
            className="text-sm text-emerald-600 hover:text-emerald-800 font-bold transition-colors duration-200 hover:scale-105 flex items-center gap-1"
            whileHover={{ x: 8 }}
          >
            Limpiar todo
            <ArrowRight className="w-3 h-3" />
          </motion.button>
        </motion.div>
      )}

      {/* Indicadores de funcionalidades avanzadas */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-emerald-500" />
          <span>Búsqueda Inteligente</span>
        </div>
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3 text-green-500" />
          <span>Filtros Avanzados</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-teal-500" />
          <span>Resultados Seguros</span>
        </div>
      </div>
    </Card>
  );
};

export default RequirementsFilters; 