import React from 'react';
import { cn } from '@/shared/utils/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'glassmorphism';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, variant = 'default', ...props }, ref) => {
    const isGlassmorphism = variant === 'glassmorphism';
    
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
          {icon && (
            <div className={cn(
              "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-200",
              isGlassmorphism 
                ? "text-white/80 group-focus-within:text-white" 
                : "text-gray-400"
            )}>
              {icon}
            </div>
          )}
          <input
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
                icon && 'pl-10',
              ],
              
              // Variante glassmorphism
              isGlassmorphism && [
                'glassmorphism-input', // Clase CSS personalizada para autocomplete
                'bg-blue-500/20 backdrop-blur-md',
                'border border-white/30',
                'text-white placeholder-gray-300/70',
                'focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/30',
                'hover:bg-blue-500/30 hover:border-white/40',
                'shadow-lg shadow-blue-500/10',
                icon && 'pl-10',
                error && 'border-red-400/60 focus:ring-red-400/30',
                
                // Estilos específicos para autocomplete - Sobrescribir estilos del navegador
                '[&:-webkit-autofill]:!bg-blue-500/30',
                '[&:-webkit-autofill]:!text-white',
                '[&:-webkit-autofill]:!shadow-[0_0_0_30px_rgba(59,130,246,0.3)_inset]',
                '[&:-webkit-autofill]:!border-white/40',
                '[&:-webkit-autofill]:!-webkit-text-fill-color-white',
                '[&:-webkit-autofill]:!caret-color-white',
                
                // Estilos para Firefox autocomplete
                '[&:-moz-autofill]:!bg-blue-500/30',
                '[&:-moz-autofill]:!text-white',
                '[&:-moz-autofill]:!border-white/40',
                
                // Estilos para Edge autocomplete
                '[&:-ms-autofill]:!bg-blue-500/30',
                '[&:-ms-autofill]:!text-white',
                '[&:-ms-autofill]:!border-white/40',
                
                // Estilos para autofill en general
                '[&:autofill]:!bg-blue-500/30',
                '[&:autofill]:!text-white',
                '[&:autofill]:!border-white/40',
                
                // Estilos para placeholder autofill
                '[&::placeholder]:text-gray-300/70',
                '[&::-webkit-input-placeholder]:text-gray-300/70',
                '[&::-moz-placeholder]:text-gray-300/70',
                '[&:-ms-input-placeholder]:text-gray-300/70',
                
                // Estilos para texto seleccionado
                '[&::selection]:bg-blue-400/50',
                '[&::-moz-selection]:bg-blue-400/50',
                
                // Estilos para cursor
                'caret-white',
                
                // Estilos para listas de autocompletado
                '[&::-webkit-calendar-picker-indicator]:filter-invert',
                '[&::-webkit-calendar-picker-indicator]:opacity-70',
                '[&::-webkit-calendar-picker-indicator]:hover:opacity-100',
              ],
              
              className
            )}
            {...props}
          />
          
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

Input.displayName = 'Input';

export { Input }; 
