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
  Calendar,
  Zap,
  RefreshCw
} from 'lucide-react';
import { formatDate } from '@/shared/utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import { ActivitiesHeader, ActivitiesFilters, ActivitiesStats, ActivitiesList } from '@/features/activities/components';

interface Activity {
  id: string;
  type: 'incident' | 'requirement' | 'user' | 'system';
  action: 'created' | 'updated' | 'resolved' | 'deleted' | 'closed';
  title: string;
  description: string;
  user: string;
  timestamp: Date;
}

const Activities: React.FC = () => {
  const navigate = useNavigate();
  // Datos mock temporales hasta implementar el store
  const activities: Activity[] = [
    {
      id: 'activity_1',
      type: 'incident',
      action: 'created',
      title: 'Nueva incidencia reportada',
      description: 'Problema con el servidor de correo electrónico en el área de contabilidad',
      user: 'Juan Pérez',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
    },
    {
      id: 'activity_2',
      type: 'incident',
      action: 'resolved',
      title: 'Incidencia resuelta',
      description: 'Servidor de correo restaurado exitosamente después de 3 horas de trabajo',
      user: 'Carlos Rodríguez',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 horas atrás
    },
    {
      id: 'activity_3',
      type: 'requirement',
      action: 'created',
      title: 'Nuevo requerimiento solicitado',
      description: 'Solicitud de acceso a base de datos para el departamento de ventas',
      user: 'Laura Sánchez',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 horas atrás
    },
    {
      id: 'activity_4',
      type: 'requirement',
      action: 'resolved',
      title: 'Requerimiento entregado',
      description: 'Acceso a base de datos configurado y entregado al usuario solicitante',
      user: 'Ana Martínez',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 horas atrás
    },
    {
      id: 'activity_5',
      type: 'user',
      action: 'created',
      title: 'Nuevo usuario registrado',
      description: 'María González se ha registrado en el sistema como solicitante',
      user: 'María González',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 horas atrás
    },
    {
      id: 'activity_6',
      type: 'user',
      action: 'updated',
      title: 'Usuario actualizado',
      description: 'Información de contacto actualizada para Carlos Rodríguez',
      user: 'Administrador Principal',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 día atrás
    },
    {
      id: 'activity_7',
      type: 'incident',
      action: 'created',
      title: 'Problema de conectividad',
      description: 'Reporte de lentitud en la red del área de marketing',
      user: 'Roberto López',
      timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000) // 1.5 días atrás
    },
    {
      id: 'activity_8',
      type: 'incident',
      action: 'resolved',
      title: 'Conectividad restaurada',
      description: 'Problema de red resuelto en el área de marketing',
      user: 'Carlos Rodríguez',
      timestamp: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000) // 1.2 días atrás
    },
    {
      id: 'activity_9',
      type: 'requirement',
      action: 'created',
      title: 'Solicitud de software',
      description: 'Nueva solicitud para instalación de software de diseño gráfico',
      user: 'Laura Sánchez',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 días atrás
    },
    {
      id: 'activity_10',
      type: 'requirement',
      action: 'resolved',
      title: 'Software instalado',
      description: 'Software de diseño gráfico instalado y configurado exitosamente',
      user: 'Ana Martínez',
      timestamp: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000) // 1.8 días atrás
    },
    {
      id: 'activity_11',
      type: 'system',
      action: 'updated',
      title: 'Configuración del sistema',
      description: 'Parámetros de seguridad actualizados en el sistema',
      user: 'Administrador Principal',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 días atrás
    },
    {
      id: 'activity_12',
      type: 'user',
      action: 'created',
      title: 'Nuevo técnico agregado',
      description: 'Ana Martínez ha sido agregada al equipo de soporte técnico',
      user: 'Administrador Principal',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 días atrás
    },
    {
      id: 'activity_13',
      type: 'incident',
      action: 'created',
      title: 'Error en impresora',
      description: 'Impresora del área de recursos humanos no responde',
      user: 'María González',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 días atrás
    },
    {
      id: 'activity_14',
      type: 'incident',
      action: 'resolved',
      title: 'Impresora reparada',
      description: 'Problema de impresora resuelto en recursos humanos',
      user: 'Carlos Rodríguez',
      timestamp: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000) // 4.5 días atrás
    },
    {
      id: 'activity_15',
      type: 'requirement',
      action: 'created',
      title: 'Solicitud de equipos',
      description: 'Nueva solicitud de equipos informáticos para el departamento de finanzas',
      user: 'Roberto López',
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 días atrás
    },
    {
      id: 'activity_16',
      type: 'requirement',
      action: 'resolved',
      title: 'Equipos entregados',
      description: 'Equipos informáticos entregados al departamento de finanzas',
      user: 'Ana Martínez',
      timestamp: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000) // 5.5 días atrás
    },
    {
      id: 'activity_17',
      type: 'system',
      action: 'updated',
      title: 'Backup del sistema',
      description: 'Configuración de backup automático actualizada',
      user: 'Administrador Principal',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días atrás
    },
    {
      id: 'activity_18',
      type: 'user',
      action: 'updated',
      title: 'Permisos actualizados',
      description: 'Permisos de acceso actualizados para Juan Pérez',
      user: 'Administrador Principal',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 días atrás
    },
    {
      id: 'activity_19',
      type: 'incident',
      action: 'created',
      title: 'Problema de VPN',
      description: 'Usuarios no pueden conectarse a la VPN corporativa',
      user: 'Laura Sánchez',
      timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) // 9 días atrás
    },
    {
      id: 'activity_20',
      type: 'incident',
      action: 'resolved',
      title: 'VPN restaurada',
      description: 'Problema de conectividad VPN resuelto completamente',
      user: 'Carlos Rodríguez',
      timestamp: new Date(Date.now() - 8.5 * 24 * 60 * 60 * 1000) // 8.5 días atrás
    }
  ];
  const loading = false;
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
          <ActivitiesHeader />
          {/* Filtros */}
          <ActivitiesFilters
            searchTerm={searchTerm}
            filterType={filterType}
            filterAction={filterAction}
            onSearchChange={handleSearchChange}
            onFilterTypeChange={setFilterType}
            onFilterActionChange={setFilterAction}
            onClearFilters={() => {
                          setSearchTerm('');
                          setFilterType('all');
                          setFilterAction('all');
                          setCurrentPage(1);
                        }}
          />
          {/* Estadísticas */}
          <ActivitiesStats activities={activities} />
          {/* Lista de actividades */}
          <ActivitiesList
            activities={activities}
            filteredActivities={filteredActivities}
            paginatedActivities={paginatedActivities}
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
            onClearFilters={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterAction('all');
              setCurrentPage(1);
            }}
            getActivityIcon={getActivityIcon}
            getActivityColor={getActivityColor}
            formatTimeAgo={formatTimeAgo}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Activities; 
