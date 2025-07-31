import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './Button';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DatePickerProps {
  /** Valor seleccionado */
  value?: string;
  /** Callback cuando cambia la fecha */
  onChange?: (date: string) => void;
  /** Placeholder del input */
  placeholder?: string;
  /** Si el componente está deshabilitado */
  disabled?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Label del campo */
  label?: string;
  /** Si mostrar el label */
  showLabel?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (dateString: string): Date => {
  // Si es una cadena vacía, devolver la fecha actual
  if (!dateString || dateString.trim() === '') {
    return new Date();
  }
  
  // Intentar parsear como ISO string
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }
  
  // Intentar parsear formato dd/mm/yyyy
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Los meses van de 0-11
    const year = parseInt(parts[2], 10);
    
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  
  // Si no se puede parsear, devolver la fecha actual
  console.warn('Invalid date format:', dateString);
  return new Date();
};

const getMonthName = (month: number): string => {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return months[month];
};

const getDayName = (day: number): string => {
  const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  return days[day];
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * DatePicker Component
 * 
 * Componente de selección de fecha con calendario visual personalizado.
 * 
 * @example
 * ```tsx
 * <DatePicker
 *   value="2025-07-29"
 *   onChange={(date) => console.log(date)}
 *   label="Fecha de entrega"
 * />
 * ```
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value = '',
  onChange,
  placeholder = 'dd/mm/aaaa',
  disabled = false,
  className = '',
  label,
  showLabel = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    return value && value.trim() !== '' ? parseDate(value) : new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value && value.trim() !== '' ? parseDate(value) : null
  );
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Actualizar fecha actual cuando cambia el valor
  useEffect(() => {
    if (value && value.trim() !== '') {
      try {
        const parsedDate = parseDate(value);
        setCurrentDate(parsedDate);
        setSelectedDate(parsedDate);
      } catch (error) {
        console.warn('Invalid date format:', value);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    const formattedDate = formatDate(date);
    onChange?.(formattedDate);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    handleDateSelect(today);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange?.('');
    setIsOpen(false);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Días del mes anterior
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isSelected: selectedDate && formatDate(selectedDate) === formatDate(new Date(year, month - 1, day)),
        isToday: formatDate(new Date()) === formatDate(new Date(year, month - 1, day))
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isSelected: selectedDate && formatDate(selectedDate) === formatDate(date),
        isToday: formatDate(new Date()) === formatDate(date)
      });
    }
    
    // Días del mes siguiente
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isSelected: selectedDate && formatDate(selectedDate) === formatDate(date),
        isToday: formatDate(new Date()) === formatDate(date)
      });
    }
    
    return days;
  };

  const displayValue = selectedDate 
    ? selectedDate.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    : '';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {showLabel && label && (
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1 sm:mb-2">
          <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" />
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-all duration-300 hover:bg-white/90 hover:border-emerald-300/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200/60 backdrop-blur-sm overflow-hidden"
          >
            {/* Header del calendario */}
            <div className="bg-gradient-to-r from-emerald-50 via-green-50/80 to-emerald-50/90 p-4 border-b border-emerald-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePreviousMonth}
                    className="p-2 hover:bg-white/60 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {getMonthName(currentDate.getMonth())} de {currentDate.getFullYear()}
                  </h3>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-white/60 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 p-4 pb-2">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="text-center text-xs font-semibold text-gray-500 py-2">
                  {getDayName(i)}
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7 gap-1 px-4 pb-4">
              {generateCalendarDays().map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day.date)}
                  className={`
                    relative p-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${day.isCurrentMonth 
                      ? 'text-gray-900 hover:bg-emerald-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                    }
                    ${day.isSelected 
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg' 
                      : ''
                    }
                    ${day.isToday && !day.isSelected 
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' 
                      : ''
                    }
                  `}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>

            {/* Footer con botones */}
            <div className="flex items-center justify-between p-4 pt-2 border-t border-gray-100">
              <button
                onClick={handleClear}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Borrar
              </button>
              <button
                onClick={handleToday}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Hoy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker; 