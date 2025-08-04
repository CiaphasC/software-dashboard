import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES - Tipos genéricos para tabla
// =============================================================================

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  mobile?: boolean; // Show on mobile
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// =============================================================================
// UTILITY TYPES - Tipos de utilidad para acceso seguro a propiedades
// =============================================================================

type SafePropertyAccess<T, K extends keyof T> = T[K];

// =============================================================================
// TABLE COMPONENT - Componente de tabla genérico y tipado
// =============================================================================

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T extends { id?: string | number }>({
  data,
  columns,
  sortConfig,
  onSort,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  className,
  onRowClick
}: TableProps<T>) {
  
  // =============================================================================
  // HANDLERS - Manejadores de eventos
  // =============================================================================

  const handleSort = (key: string) => {
    onSort?.(key);
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return null;
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  // =============================================================================
  // SAFE PROPERTY ACCESS - Acceso seguro a propiedades
  // =============================================================================

  const getPropertyValue = (item: T, key: keyof T): React.ReactNode => {
    const value = item[key];
    
    // Manejar diferentes tipos de valores
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    // Para objetos complejos, intentar convertirlos a string
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  // =============================================================================
  // RENDER - Renderizado del componente
  // =============================================================================

  if (loading) {
    return (
      <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200 p-8", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden", className)}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.sortable && "cursor-pointer hover:bg-gray-100",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(String(column.key))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <motion.tr
                  key={item.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "hover:bg-gray-50 transition-colors duration-150",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn("px-6 py-4 whitespace-nowrap text-sm text-gray-900", column.className)}
                    >
                      {column.render ? column.render(item) : getPropertyValue(item, column.key)}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {data.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-4 hover:bg-gray-50 transition-colors duration-150",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns
                  .filter(column => column.mobile !== false)
                  .map((column) => (
                    <div key={String(column.key)} className="flex justify-between items-center py-1">
                      <span className="text-sm font-medium text-gray-500">{column.label}:</span>
                      <span className="text-sm text-gray-900">
                        {column.render ? column.render(item) : getPropertyValue(item, column.key)}
                      </span>
                    </div>
                  ))}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
