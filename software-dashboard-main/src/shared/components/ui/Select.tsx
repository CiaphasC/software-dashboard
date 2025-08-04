import React from 'react';
import { cn } from '@/shared/utils/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  variant?: 'default' | 'glassmorphism';
  loading?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options = [], variant = 'default', loading, ...props }, ref) => {
    const isGlassmorphism = variant === 'glassmorphism';
    
    // Filtrar el prop loading para que no se pase al elemento select
    const { loading: _, ...selectProps } = props;
    
    return (
      <div className="w-full">
        {label && (
          <label className={cn(
            "block text-sm font-medium mb-1",
            isGlassmorphism 
              ? "text-gray-300/90" 
              : "text-gray-700"
          )}>
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={cn(
              // Estilos base
              'w-full px-3 py-2 rounded-lg shadow-sm focus:outline-none transition-all duration-200',
              'text-sm sm:text-base',
              
              // Variante por defecto
              !isGlassmorphism && [
                'border border-gray-300',
                'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
              ],
              
              // Variante glassmorphism
              isGlassmorphism && [
                'bg-blue-500/20 backdrop-blur-md',
                'border border-white/30',
                'text-white',
                'focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/30',
                'hover:bg-blue-500/30 hover:border-white/40',
                'shadow-lg shadow-blue-500/10',
                error && 'border-red-400/60 focus:ring-red-400/30',
                // Estilos para las opciones
                '[&>option]:bg-gray-800 [&>option]:text-white',
              ],
              
              // Estado de loading
              loading && 'opacity-50 cursor-not-allowed',
              
              className
            )}
            disabled={loading}
            {...selectProps}
          >
            {loading ? (
              <option value="">Cargando...</option>
            ) : (
              options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            )}
          </select>
          
          {/* Efecto de glow para glassmorphism */}
          {isGlassmorphism && (
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/10 via-transparent to-blue-400/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          )}
        </div>
        {error && (
          <p className={cn(
            "mt-1 text-sm",
            isGlassmorphism ? "text-red-300" : "text-red-600"
          )}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className={cn(
            "mt-1 text-sm",
            isGlassmorphism ? "text-gray-300/70" : "text-gray-500"
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select }; 
