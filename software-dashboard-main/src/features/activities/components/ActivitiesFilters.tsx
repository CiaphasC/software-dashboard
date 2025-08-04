import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Filter, Search, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';

interface ActivitiesFiltersProps {
  searchTerm: string;
  filterType: string;
  filterAction: string;
  onSearchChange: (value: string) => void;
  onFilterTypeChange: (value: string) => void;
  onFilterActionChange: (value: string) => void;
  onClearFilters: () => void;
  className?: string;
}

const ActivitiesFilters: React.FC<ActivitiesFiltersProps> = ({
  searchTerm,
  filterType,
  filterAction,
  onSearchChange,
  onFilterTypeChange,
  onFilterActionChange,
  onClearFilters,
  className = ''
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Sugerencias de búsqueda mock
  const searchSuggestions = [
    'incidencia servidor',
    'requerimiento acceso',
    'usuario registrado',
    'problema conectividad',
    'actualización sistema'
  ];

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      rotateX: -15 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 15 
      }
    }
  };

  const updateDropdownPosition = () => {
    if (searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 5,
        left: rect.left,
        width: rect.width
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && searchSuggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < searchSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : searchSuggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < searchSuggestions.length) {
            onSearchChange(searchSuggestions[selectedSuggestionIndex]);
            setShowSuggestions(false);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          break;
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
  };

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    if (value.trim().length > 0) {
      setShowSuggestions(true);
      setTimeout(() => updateDropdownPosition(), 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">{part}</span>
      ) : part
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      if (showSuggestions) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (showSuggestions) {
        updateDropdownPosition();
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [showSuggestions]);

  return (
    <motion.div variants={cardVariants} className={className}>
      <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-100 border-b border-blue-200">
          <CardTitle className="flex items-center gap-3 text-blue-800">
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
              <Filter className="h-6 w-6" />
            </motion.div>
            Filtros Avanzados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Campo de búsqueda */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Buscar</label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                <Input
                  ref={searchInputRef}
                  placeholder="Buscar actividades..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchTerm.trim().length > 0) {
                      setShowSuggestions(true);
                      setTimeout(() => updateDropdownPosition(), 0);
                    }
                  }}
                  onBlur={() => { setTimeout(() => setShowSuggestions(false), 150); }}
                  className="pl-10 bg-white/90 backdrop-blur border-blue-200 focus:border-blue-400 focus:ring-blue-200 transition-all duration-200 hover:bg-white h-10 rounded-xl"
                />
                {/* Dropdown de sugerencias */}
                {showSuggestions && searchSuggestions.length > 0 && createPortal(
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="fixed bg-white border border-blue-200 rounded-xl shadow-2xl z-[9999] max-h-64 overflow-y-auto"
                      style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                        maxWidth: '400px'
                      }}
                    >
                      {searchSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={suggestion}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-blue-50 border-b border-blue-100 last:border-b-0 ${index === selectedSuggestionIndex ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600'}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        >
                          <div className="flex items-center gap-3">
                            <Search className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">{highlightText(suggestion, searchTerm)}</span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>,
                  document.body
                )}
              </div>
            </div>

            {/* Filtro por tipo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <Select
                value={filterType}
                onChange={(e) => onFilterTypeChange(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos los tipos' },
                  { value: 'incident', label: 'Incidencias' },
                  { value: 'requirement', label: 'Requerimientos' }
                ]}
                className="bg-white/90 backdrop-blur border-blue-200 focus:border-blue-400 focus:ring-blue-200 transition-all duration-200 hover:bg-white h-10 rounded-xl"
              />
            </div>

            {/* Filtro por acción */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Acción</label>
              <Select
                value={filterAction}
                onChange={(e) => onFilterActionChange(e.target.value)}
                options={[
                  { value: 'all', label: 'Todas las acciones' },
                  { value: 'created', label: 'Creado' },
                  { value: 'updated', label: 'Actualizado' },
                  { value: 'resolved', label: 'Resuelto' },
                  { value: 'closed', label: 'Cerrado' }
                ]}
                className="bg-white/90 backdrop-blur border-blue-200 focus:border-blue-400 focus:ring-blue-200 transition-all duration-200 hover:bg-white h-10 rounded-xl"
              />
            </div>

            {/* Botón de limpiar filtros */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 opacity-0">Acción</label>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                  className="w-full bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700 hover:from-red-100 hover:to-red-200 hover:border-red-300 transition-all duration-300 font-medium h-10 rounded-xl"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivitiesFilters; 