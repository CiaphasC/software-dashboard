import React, { useState, useRef, useEffect, useCallback } from 'react';
import { log } from '@/shared/utils/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  Clock, 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  User, 
  Filter,
  Search,
  Calendar,
  ArrowLeft,

  Activity,
  Zap,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';

import { useAllActivities } from '@/shared/hooks/useRecentActivities';
import { formatDate } from '@/shared/utils/utils';
import { useNavigate } from 'react-router-dom';

const Activities: React.FC = () => {
  const navigate = useNavigate();
  const { activities, loading } = useAllActivities();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activitiesPerPage = 20;

  // Generar sugerencias de búsqueda
  const generateSearchSuggestions = () => {
    if (!searchTerm.trim()) return [];
    
    const suggestions = new Set<string>();
    const searchLower = searchTerm.toLowerCase();
    
    activities.forEach(activity => {
      // Buscar en título
      if (activity.title.toLowerCase().includes(searchLower)) {
        suggestions.add(activity.title);
      }
      
      // Buscar en descripción
      if (activity.description.toLowerCase().includes(searchLower)) {
        suggestions.add(activity.description);
      }
      
      // Buscar en usuario
      if (activity.user.toLowerCase().includes(searchLower)) {
        suggestions.add(activity.user);
      }
      
      // Buscar en tipo
      if (activity.type.toLowerCase().includes(searchLower)) {
        suggestions.add(activity.type === 'incident' ? 'Incidencias' : 'Requerimientos');
      }
      
      // Buscar en acción
      if (activity.action.toLowerCase().includes(searchLower)) {
        const actionLabels = {
          'created': 'Creado',
          'updated': 'Actualizado', 
          'resolved': 'Resuelto',
          'closed': 'Cerrado'
        };
        suggestions.add(actionLabels[activity.action as keyof typeof actionLabels] || activity.action);
      }
    });
    
    return Array.from(suggestions).slice(0, 8); // Máximo 8 sugerencias
  };

  const searchSuggestions = generateSearchSuggestions();

  // Filtrar actividades
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesAction = filterAction === 'all' || activity.action === filterAction;
    
    return matchesSearch && matchesType && matchesAction;
  });

  // Paginación
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
  const startIndex = (currentPage - 1) * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  const getActivityIcon = (type: string, action: string) => {
    if (type === 'incident') {
      return <AlertTriangle className="h-7 w-7 text-yellow-500 drop-shadow-md" />;
    } else if (type === 'requirement') {
      if (action === 'resolved') {
        return <CheckCircle className="h-7 w-7 text-green-500 drop-shadow-md" />;
      }
      return <FileText className="h-7 w-7 text-blue-500 drop-shadow-md" />;
    }
    return <Clock className="h-7 w-7 text-gray-400 drop-shadow-md" />;
  };

  const getActivityColor = (type: string, action: string) => {
    if (type === 'incident') {
      return 'bg-yellow-100/80 border-yellow-200';
    } else if (type === 'requirement') {
      if (action === 'resolved') {
        return 'bg-green-100/80 border-green-200';
      }
      return 'bg-blue-100/80 border-blue-200';
    }
    return 'bg-gray-100/80 border-gray-200';
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Ahora mismo';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays}d`;
    } else {
      return formatDate(timestamp);
    }
  };

  // Manejar navegación del teclado en sugerencias
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchSuggestions.length === 0) return;

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
          setSearchTerm(searchSuggestions[selectedSuggestionIndex]);
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Seleccionar sugerencia
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(value.trim().length > 0);
    setSelectedSuggestionIndex(-1);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Actualizar posición del dropdown
  const updateDropdownPosition = useCallback(() => {
    if (searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      const newPosition = {
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      };
      log('Dropdown position:', newPosition, 'Input rect:', rect);
      setDropdownPosition(newPosition);
    }
  }, []);

  // Efecto para actualizar posición cuando se muestran las sugerencias
  useEffect(() => {
    if (showSuggestions) {
      // Pequeño delay para asegurar que el DOM esté actualizado
      setTimeout(() => updateDropdownPosition(), 0);
    }
  }, [showSuggestions, updateDropdownPosition]);

  // Efecto para actualizar posición cuando cambian las sugerencias
  useEffect(() => {
    if (showSuggestions && searchSuggestions.length > 0) {
      updateDropdownPosition();
    }
  }, [searchSuggestions, showSuggestions, updateDropdownPosition]);

  // Efecto para actualizar posición en scroll y resize
  useEffect(() => {
    if (showSuggestions) {
      const handleScroll = () => {
        // Usar requestAnimationFrame para optimizar el rendimiento
        requestAnimationFrame(() => updateDropdownPosition());
      };
      const handleResize = () => {
        requestAnimationFrame(() => updateDropdownPosition());
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [showSuggestions, updateDropdownPosition]);



  // Función para resaltar el texto buscado
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const searchLower = searchTerm.toLowerCase();
    const textLower = text.toLowerCase();
    
    if (!textLower.includes(searchLower)) {
      return text;
    }
    
    const startIndex = textLower.indexOf(searchLower);
    const endIndex = startIndex + searchTerm.length;
    
    return (
      <>
        {text.substring(0, startIndex)}
        <span className="bg-yellow-200 font-semibold text-yellow-800 px-1 rounded">
          {text.substring(startIndex, endIndex)}
        </span>
        {text.substring(endIndex)}
      </>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, rotateX: -10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20
      }
    }
  };

  const activityVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    exit: { opacity: 0, x: 20 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Elementos decorativos de fondo para loading */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-10"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-6"
            >
              <RefreshCw className="w-full h-full text-primary-600" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-10 h-10 bg-primary-200 rounded-full"
              />
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold gradient-text mb-2">Cargando actividades...</h2>
            <p className="text-gray-600 mb-6">Preparando el historial del sistema</p>
          </motion.div>
          
          {/* Loading skeleton */}
          <div className="space-y-4 max-w-md mx-auto">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
        {/* Partículas flotantes */}
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-30"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 relative z-10">
        <motion.div className="space-y-10" variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/10 rounded-2xl opacity-10"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Activity className="h-9 w-9 text-white" />
                </motion.div>
                <div className="flex-1 text-center sm:text-left">
                  <motion.h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent mb-2 tracking-tight" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    Actividades del Sistema
                  </motion.h1>
                  <motion.p className="text-gray-600 text-lg" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    Historial completo y detallado de todas las actividades
                  </motion.p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300">
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Dashboard
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
          {/* Filtros */}
          <motion.div variants={cardVariants}>
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
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      options={[
                        { value: 'all', label: 'Todos los tipos' },
                        { value: 'incident', label: 'Incidencias' },
                        { value: 'requirement', label: 'Requerimientos' }
                      ]}
                      className="bg-white/90 backdrop-blur border-blue-200 focus:border-blue-400 focus:ring-blue-200 transition-all duration-200 hover:bg-white h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Acción</label>
                    <Select
                      value={filterAction}
                      onChange={(e) => setFilterAction(e.target.value)}
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
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 opacity-0">Acción</label>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setFilterType('all');
                          setFilterAction('all');
                          setCurrentPage(1);
                        }}
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
          {/* Estadísticas */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Clock className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total Actividades</p>
                        <motion.p 
                          className="text-3xl font-bold text-blue-800"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                        >
                          {activities.length}
                        </motion.p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-sm text-orange-600 font-medium">Incidencias</p>
                        <motion.p 
                          className="text-3xl font-bold text-orange-800"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                        >
                          {activities.filter(a => a.type === 'incident').length}
                        </motion.p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <FileText className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-sm text-indigo-600 font-medium">Requerimientos</p>
                        <motion.p 
                          className="text-3xl font-bold text-indigo-800"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4, type: "spring" }}
                        >
                          {activities.filter(a => a.type === 'requirement').length}
                        </motion.p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <CheckCircle className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">Resueltos</p>
                        <motion.p 
                          className="text-3xl font-bold text-green-800"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                        >
                          {activities.filter(a => a.action === 'resolved').length}
                        </motion.p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
          {/* Lista de actividades */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-100 border-b border-blue-200">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </motion.div>
                    <span className="text-blue-800 font-semibold">Actividades ({filteredActivities.length})</span>
                  </div>
                  <div className="text-sm text-blue-500 bg-white/70 px-3 py-1 rounded-full">
                    Página {currentPage} de {totalPages}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {filteredActivities.length === 0 ? (
                  <motion.div className="text-center py-16" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                    <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <Clock className="h-12 w-12 text-blue-400" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">No se encontraron actividades</h3>
                    <p className="text-blue-500 mb-6">Intenta ajustar los filtros de búsqueda</p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterAction('all'); setCurrentPage(1); }} className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Limpiar filtros
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="wait">
                    <div className="space-y-4">
                      {paginatedActivities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          variants={activityVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          whileHover={{ scale: 1.03, y: -2, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
                          className="flex items-center gap-4 p-6 bg-gradient-to-r from-white/90 to-blue-50/80 backdrop-blur rounded-2xl border border-white/30 hover:border-blue-200 transition-all duration-300 cursor-pointer group hover-lift"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <motion.div className={`h-16 w-16 ${getActivityColor(activity.type, activity.action)} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`} whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }}>
                            {getActivityIcon(activity.type, activity.action)}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <motion.p className="text-lg font-semibold text-blue-900 truncate group-hover:text-blue-700 transition-colors duration-200" whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                                {activity.title}
                              </motion.p>
                              <div className="flex items-center gap-1 text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded-full">
                                <User className="h-3.5 w-3.5" />
                                <span className="font-medium">{activity.user}</span>
                              </div>
                            </div>
                            <p className="text-sm text-blue-700/80 line-clamp-2 group-hover:text-blue-900 transition-colors duration-200">
                              {activity.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <motion.div className="flex items-center gap-2 text-xs text-blue-500 bg-white/80 px-3 py-2 rounded-full border border-blue-100" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                              <Calendar className="h-3 w-3" />
                              <span className="font-medium">{formatTimeAgo(activity.timestamp)}</span>
                            </motion.div>
                            <motion.div className={`text-xs px-3 py-1 rounded-full font-medium ${activity.type === 'incident' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border border-yellow-200' : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200'}`} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                              {activity.type === 'incident' ? 'Incidencia' : 'Requerimiento'}
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}
                {/* Paginación */}
                {totalPages > 1 && (
                  <motion.div className="flex items-center justify-between mt-8 pt-6 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="text-sm text-blue-600 bg-white/70 px-4 py-2 rounded-full">
                      Mostrando <span className="font-semibold text-blue-700">{startIndex + 1}-{Math.min(endIndex, filteredActivities.length)}</span> de <span className="font-semibold text-blue-700">{filteredActivities.length}</span> actividades
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="bg-white/90 backdrop-blur border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-xl">
                          ← Anterior
                        </Button>
                      </motion.div>
                      <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full">
                        <span className="text-sm font-medium text-blue-700">
                          Página <span className="text-blue-700 font-bold">{currentPage}</span> de <span className="text-blue-700 font-bold">{totalPages}</span>
                        </span>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="bg-white/90 backdrop-blur border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-xl">
                          Siguiente →
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Activities; 
