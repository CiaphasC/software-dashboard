import React, { useState } from 'react';
import { FixedSizeList as VirtualList } from 'react-window';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal, Eye, Edit, Trash2, Download, Filter,
  Calendar, User, ArrowRight, Share2, Sparkles, Gem,
  TrendingUp, Activity, Layers, Target, Clock, Settings
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { DateOrString } from '@/shared/types/common.types';
import { formatDate } from '@/shared/utils/dateUtils';

// Helper function para formatear fechas de manera segura
const safeFormatDate = (date: DateOrString): string => {
  if (!date) return 'Sin fecha';
  if (date instanceof Date) return formatDate(date);
  if (typeof date === 'string') return formatDate(date);
  return 'Sin fecha';
};

// Helper function para formatear fechas estimadas de manera segura
const safeFormatEstimatedDate = (date: DateOrString): string => {
  if (!date) return 'Sin fecha estimada';
  if (typeof date === 'string') return formatDate(date);
  if (date instanceof Date) return formatDate(date);
  return 'Sin fecha estimada';
};

// Tipos genéricos para el componente
export interface TableItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  createdAt: DateOrString;
  [key: string]: string | number | boolean | DateOrString | undefined; // Para propiedades adicionales específicas
}

export interface TableConfig<T extends TableItem> {
  // Configuración de tema
  theme: {
    primaryColor: string;
    secondaryColor: string;
    gradientFrom: string;
    gradientTo: string;
    borderColor: string;
    hoverColor: string;
  };
  
  // Configuración de columnas
  columns: {
    key: keyof T;
    label: string;
    icon: React.ReactNode;
    render?: (item: T) => React.ReactNode;
    mobile?: boolean;
  }[];
  
  // Virtualización opcional para tablas grandes (sólo vista 'table')
  virtualization?: {
    enabled?: boolean;
    threshold?: number; // Número de items a partir del cual activar
    height?: number;    // Alto del viewport virtualizado
    rowHeight?: number; // Alto de cada fila
  };
  
  // Configuración de acciones
  actions: {
    onItemClick: (item: T) => void;
    onEdit: (item: T) => void;
    onDelete: (item: T) => void;
    onView: (item: T) => void;
  };
  
  // Configuración de estado y prioridad
  statusConfig: {
    getColor: (status: string) => 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    getText: (status: string) => string;
  };
  
  priorityConfig: {
    getColor: (priority: string) => 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    getText: (priority: string) => string;
    getIcon: (priority: string) => React.ReactNode;
  };
  
  // Configuración de tipo
  typeConfig: {
    getIcon: (type: string) => React.ReactNode;
  };
  
  // Configuración de campos adicionales
  additionalFields?: {
    key: keyof T;
    label: string;
    icon: React.ReactNode;
    render?: (item: T) => React.ReactNode;
  }[];
  
  // Configuración de fechas estimadas
  estimatedDateField?: keyof T;
  
  // Configuración de texto
  texts: {
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyIcon: React.ReactNode;
    createButton: string;
    createIcon: React.ReactNode;
    exportButton: string;
    shareButton: string;
    viewDetails: string;
    tableView: string;
    cardsView: string;
  };
}

interface GenericTableProps<T extends TableItem> {
  items: T[];
  loading: boolean;
  config: TableConfig<T>;
}

// Componente de tarjeta genérico
const GenericCard = <T extends TableItem>({ 
  item, 
  config 
}: { 
  item: T; 
  config: TableConfig<T>; 
}) => {
  const [showActions, setShowActions] = useState(false);
  const { theme, actions, statusConfig, priorityConfig, typeConfig, additionalFields, estimatedDateField, texts } = config;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      className={`group relative bg-gradient-to-br from-white via-${theme.primaryColor}-50/30 to-white rounded-3xl shadow-lg border border-${theme.borderColor} overflow-hidden backdrop-blur-sm hover:border-${theme.hoverColor} transition-all duration-500`}
    >
      {/* Efecto de brillo superior */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-${theme.primaryColor}-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Header de la tarjeta */}
      <div className={`relative p-6 border-b border-${theme.borderColor} bg-gradient-to-r from-${theme.primaryColor}-50/50 to-${theme.secondaryColor}-50/30`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <motion.div 
                className={`p-3 rounded-2xl bg-gradient-to-br from-${theme.primaryColor}-100 to-${theme.secondaryColor}-100 shadow-lg border border-${theme.borderColor}`}
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`text-${theme.primaryColor}-600`}>
                  {typeConfig.getIcon(item.type)}
                </div>
              </motion.div>
              <div className="flex-1">
                {config.columns[0]?.render ? (
                  // Usar el render personalizado de la primera columna
                  config.columns[0].render(item)
                ) : (
                  // Fallback al renderizado por defecto
                  <>
                    <h3 className={`font-bold text-gray-900 group-hover:text-${theme.primaryColor}-700 transition-colors line-clamp-1 text-lg`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Botón de acciones */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className={`p-2 hover:bg-${theme.primaryColor}-100/80 rounded-xl transition-all duration-300`}
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </Button>
          </motion.div>
        </div>

        {/* Badges de estado y prioridad */}
        <div className="flex items-center gap-3 mt-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Badge 
              variant={statusConfig.getColor(item.status)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-${theme.borderColor}`}
            >
              {statusConfig.getText(item.status)}
            </Badge>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Badge 
              variant={priorityConfig.getColor(item.priority)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-${theme.borderColor} flex items-center gap-1.5`}
            >
              {priorityConfig.getIcon(item.priority)}
              {priorityConfig.getText(item.priority)}
            </Badge>
          </motion.div>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="relative p-6">
        <div className="space-y-4">
          {/* Campos adicionales */}
          {additionalFields?.map((field) => (
            <div key={String(field.key)} className={`flex items-center gap-3 p-3 bg-gradient-to-r from-${theme.primaryColor}-50/80 to-${theme.secondaryColor}-50/60 rounded-2xl border border-${theme.borderColor}`}>
              <div className={`p-2 rounded-xl bg-${theme.primaryColor}-100/80 text-${theme.primaryColor}-600`}>
                {field.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{field.label}</p>
                <p className="text-sm font-semibold text-gray-800">
                  {field.render ? field.render(item) : (item[field.key] instanceof Date ? formatDate(item[field.key]) : (item[field.key] ? String(item[field.key]) : 'Sin asignar'))}
                </p>
              </div>
            </div>
          ))}
          
          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50/80 to-pink-50/60 rounded-xl border border-purple-100/50">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs font-medium text-gray-500">Creado</p>
                <p className="text-xs font-semibold text-gray-800">{safeFormatDate(item.createdAt)}</p>
              </div>
            </div>
            {estimatedDateField && item[estimatedDateField] && (
              <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-orange-50/80 to-red-50/60 rounded-xl border border-orange-100/50">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Estimado</p>
                  <p className="text-xs font-semibold text-gray-800">{safeFormatEstimatedDate(item[estimatedDateField])}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-6 pt-4 border-t border-${theme.borderColor}`}
            >
              <div className="grid grid-cols-3 gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.onView(item)}
                    className={`w-full py-2.5 hover:bg-${theme.primaryColor}-50 hover:text-${theme.primaryColor}-600 transition-all duration-300 rounded-xl`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.onEdit(item)}
                    className="w-full py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 rounded-xl"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.onDelete(item)}
                    className="w-full py-2.5 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón principal de acción */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4"
        >
          <Button
            onClick={() => actions.onItemClick(item)}
            variant="ghost"
            className={`w-full py-3 hover:bg-gradient-to-r hover:from-${theme.primaryColor}-50 hover:to-${theme.secondaryColor}-50 transition-all duration-300 rounded-xl group`}
          >
            <span className={`text-sm font-semibold text-gray-700 group-hover:text-${theme.primaryColor}-700 transition-colors`}>
              {texts.viewDetails}
            </span>
            <ArrowRight className={`h-4 w-4 ml-2 text-gray-400 group-hover:text-${theme.primaryColor}-600 transition-colors`} />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Componente de tabla para desktop
const DesktopTable = <T extends TableItem>({ 
  items, 
  config 
}: { 
  items: T[]; 
  config: TableConfig<T>; 
}) => {
  const { theme, columns, actions, statusConfig, priorityConfig, typeConfig, additionalFields, estimatedDateField } = config;

  return (
    <div className={`overflow-hidden rounded-3xl border border-${theme.borderColor} bg-gradient-to-br from-white via-${theme.primaryColor}-50/20 to-white shadow-2xl backdrop-blur-sm`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`bg-gradient-to-r from-${theme.primaryColor}-50/80 via-${theme.secondaryColor}-50/60 to-${theme.primaryColor}-50/80`}>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    {column.icon}
                    {column.label}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Acciones
                </div>
              </th>
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-${theme.borderColor}`}>
            {items.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`hover:bg-gradient-to-r hover:from-${theme.primaryColor}-50/50 hover:to-${theme.secondaryColor}-50/30 transition-all duration-300 cursor-pointer group`}
                onClick={() => actions.onItemClick(item)}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-6 py-4">
                    {column.render ? column.render(item) : (
                      <div className="space-y-0.5">
                        <div className={`font-bold text-gray-900 group-hover:text-${theme.primaryColor}-700 transition-colors text-base`}>
                          {item[column.key] instanceof Date ? formatDate(item[column.key]) : (item[column.key] ? String(item[column.key]) : 'Sin datos')}
                        </div>
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-2.5 hover:bg-${theme.primaryColor}-50 hover:text-${theme.primaryColor}-600 transition-all duration-300 rounded-xl`}
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.onView(item);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2.5 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.onEdit(item);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2.5 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.onDelete(item);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Versión virtualizada para datasets muy grandes
const VirtualDesktopTable = <T extends TableItem>({
  items,
  config,
}: {
  items: T[];
  config: TableConfig<T>;
}) => {
  const { theme, columns, actions } = config;
  const height = config.virtualization?.height ?? 480;
  const rowHeight = config.virtualization?.rowHeight ?? 64;

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    return (
      <div style={style} className={`hover:bg-gradient-to-r hover:from-${theme.primaryColor}-50/50 hover:to-${theme.secondaryColor}-50/30 transition-all duration-300 cursor-pointer group`}
        onClick={() => actions.onItemClick(item)}
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] items-stretch px-6" style={{ height: rowHeight }}>
          {columns.map((column) => (
            <div key={String(column.key)} className="flex items-center">
              {column.render ? (
                <div className="w-full">{column.render(item)}</div>
              ) : (
                <div className={`font-bold text-gray-900 group-hover:text-${theme.primaryColor}-700 transition-colors text-base truncate`}>
                  {item[column.key] instanceof Date ? formatDate(item[column.key]) : (item[column.key] ? String(item[column.key]) : 'Sin datos')}
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 justify-start">
            <Button
              variant="ghost"
              size="sm"
              className={`p-2.5 hover:bg-${theme.primaryColor}-50 hover:text-${theme.primaryColor}-600 transition-all duration-300 rounded-xl`}
              onClick={(e) => { e.stopPropagation(); actions.onView(item); }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2.5 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 rounded-xl"
              onClick={(e) => { e.stopPropagation(); actions.onEdit(item); }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2.5 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-xl"
              onClick={(e) => { e.stopPropagation(); actions.onDelete(item); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`overflow-hidden rounded-3xl border border-${theme.borderColor} bg-gradient-to-br from-white via-${theme.primaryColor}-50/20 to-white shadow-2xl backdrop-blur-sm`}>
      {/* Encabezado */}
      <div className={`hidden xl:block bg-gradient-to-r from-${theme.primaryColor}-50/80 via-${theme.secondaryColor}-50/60 to-${theme.primaryColor}-50/80`}> 
        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-0 px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
          {columns.map((column) => (
            <div key={String(column.key)} className="flex items-center gap-2">
              {column.icon}
              {column.label}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Acciones
          </div>
        </div>
      </div>
      {/* Lista virtualizada */}
      <VirtualList
        height={height}
        width={"100%"}
        itemCount={items.length}
        itemSize={rowHeight}
      >
        {Row}
      </VirtualList>
    </div>
  );
};

// Componente principal genérico
export const GenericTable = <T extends TableItem>({ 
  items, 
  loading, 
  config 
}: GenericTableProps<T>) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const { theme, texts } = config;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <LoadingSpinner size="lg" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-gray-600 font-semibold text-lg"
          >
            {texts.loading}
          </motion.p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-${theme.primaryColor}-100 to-${theme.secondaryColor}-100 rounded-full mb-8 shadow-lg`}
        >
          {texts.emptyIcon}
        </motion.div>
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 mb-3"
        >
          {texts.emptyTitle}
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed"
        >
          {texts.emptyDescription}
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <Button variant="outline" className={`px-6 py-3 rounded-xl border-${theme.borderColor} hover:bg-${theme.primaryColor}-50`}>
            <Filter className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
          <Button className={`px-6 py-3 bg-gradient-to-r from-${theme.gradientFrom} to-${theme.gradientTo} hover:from-${theme.gradientFrom} hover:to-${theme.gradientTo} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}>
            {texts.createIcon}
            {texts.createButton}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header de la tabla */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-8 bg-gradient-to-br from-${theme.primaryColor}-50/80 via-${theme.secondaryColor}-50/60 to-${theme.primaryColor}-50/80 rounded-3xl border border-${theme.borderColor} shadow-xl backdrop-blur-sm`}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <motion.div 
              className={`w-4 h-4 bg-gradient-to-r from-${theme.gradientFrom} to-${theme.gradientTo} rounded-full shadow-lg`}
              animate={{ 
                scale: [1, 1.2, 1],
                boxShadow: [
                  `0 0 0 0 rgba(0, 0, 0, 0.4)`,
                  `0 0 0 10px rgba(0, 0, 0, 0)`,
                  `0 0 0 0 rgba(0, 0, 0, 0)`
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-lg font-bold text-gray-800">
              {loading ? 'Cargando...' : `${items.length} elementos encontrados`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className={`h-4 w-4 text-${theme.primaryColor}-500 animate-pulse`} />
            <Gem className={`h-4 w-4 text-${theme.secondaryColor}-500 animate-pulse`} />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Toggle de vista - Solo visible en pantallas xl y superiores */}
          <div className={`hidden xl:flex items-center bg-white/90 backdrop-blur-sm border border-${theme.borderColor} rounded-2xl p-1.5 shadow-lg`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('table')}
              className={`px-6 py-3 text-sm font-bold transition-all duration-300 focus-visible:ring-0 rounded-xl ${
                viewMode === 'table' 
                  ? `!bg-gradient-to-r !from-${theme.gradientFrom} !to-${theme.gradientTo} !text-white !shadow-lg` 
                  : `!bg-transparent hover:!bg-${theme.primaryColor}-50 !text-gray-600 hover:!text-${theme.primaryColor}-700`
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {texts.tableView}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('cards')}
              className={`px-6 py-3 text-sm font-bold transition-all duration-300 focus-visible:ring-0 rounded-xl ${
                viewMode === 'cards' 
                  ? `!bg-gradient-to-r !from-${theme.gradientFrom} !to-${theme.gradientTo} !text-white !shadow-lg` 
                  : `!bg-transparent hover:!bg-${theme.primaryColor}-50 !text-gray-600 hover:!text-${theme.primaryColor}-700`
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              {texts.cardsView}
            </Button>
          </div>

          {/* Acciones */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className={`px-6 py-3 text-sm font-bold bg-white/90 backdrop-blur-sm border-${theme.borderColor} hover:bg-${theme.primaryColor}-50 hover:border-${theme.hoverColor} transition-all duration-300 shadow-lg rounded-xl`}
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{texts.exportButton}</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className={`px-6 py-3 text-sm font-bold bg-white/90 backdrop-blur-sm border-${theme.borderColor} hover:bg-${theme.primaryColor}-50 hover:border-${theme.hoverColor} transition-all duration-300 shadow-lg rounded-xl`}
            >
              <Share2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{texts.shareButton}</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Contenido de la tabla */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className="hidden xl:block"
          >
            {config.virtualization?.enabled && items.length > (config.virtualization.threshold ?? 1500)
              ? <VirtualDesktopTable items={items} config={config} />
              : <DesktopTable items={items} config={config} />}
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {items.map((item) => (
              <GenericCard key={item.id} item={item} config={config} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vista móvil siempre en tarjetas */}
      <div className="xl:hidden">
        <div className="grid grid-cols-1 gap-6">
          {items.map((item) => (
            <GenericCard key={item.id} item={item} config={config} />
          ))}
        </div>
      </div>
    </div>
  );
}; 