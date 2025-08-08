import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ModalProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Callback cuando se cierra el modal */
  onClose: () => void;
  /** Contenido del modal */
  children: ReactNode;
  /** Tamaño del modal */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Si el modal se puede cerrar haciendo clic fuera */
  closeOnOverlayClick?: boolean;
  /** Si mostrar el botón de cerrar */
  showCloseButton?: boolean;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
  /** Clases CSS adicionales para el contenido */
  contentClassName?: string;
  /** Z-index personalizado */
  zIndex?: number;
  /** Animación personalizada */
  animation?: 'fade' | 'slide' | 'scale' | 'none';
  /** Duración de la animación en ms */
  animationDuration?: number;
}

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

const MODAL_SIZES = {
  sm: 'max-w-sm mx-2 sm:mx-4',
  md: 'max-w-md mx-2 sm:mx-4',
  lg: 'max-w-lg mx-2 sm:mx-4',
  xl: 'max-w-xl mx-2 sm:mx-4',
  '2xl': 'max-w-3xl mx-2 sm:mx-4',
  full: 'max-w-4xl mx-2 sm:mx-4 md:mx-auto'
} as const;

const MODAL_ANIMATIONS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  none: {
    initial: {},
    animate: {},
    exit: {}
  }
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Modal Base Component
 * 
 * Un componente modal reutilizable y altamente configurable que sigue
 * principios de accesibilidad y UX modernos.
 * 
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={handleClose} size="lg">
 *   <div>Contenido del modal</div>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'lg',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
  contentClassName = '',
  zIndex = 9999,
  animation = 'scale',
  animationDuration = 300
}) => {
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
        onKeyDown={handleKeyDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: animationDuration / 1000 }}
        style={{ zIndex: 9999 }}
      >
        <motion.div
          className={`w-full ${MODAL_SIZES[size]} overflow-hidden ${contentClassName}`}
          variants={MODAL_ANIMATIONS[animation]}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: animationDuration / 1000 }}
        >
          <div className={`relative ${className}`}>
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

/**
 * Modal Header Component
 */
export interface ModalHeaderProps {
  /** Título del modal */
  title: string;
  /** Subtítulo opcional */
  subtitle?: string;
  /** Icono opcional */
  icon?: ReactNode;
  /** Callback para cerrar el modal */
  onClose?: () => void;
  /** Si mostrar el botón de cerrar */
  showCloseButton?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Color del fondo del ícono */
  iconBgColor?: string;
  /** Color del fondo del header */
  headerBgColor?: string;
  /** Color del borde del header */
  headerBorderColor?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  showCloseButton = true,
  className = '',
  iconBgColor = 'bg-gradient-to-br from-emerald-500 to-green-600',
  headerBgColor = 'bg-gradient-to-r from-emerald-50 via-green-50/80 to-emerald-50/90',
  headerBorderColor = 'border-emerald-100/50'
}) => {
  return (
    <div className={`relative ${headerBgColor} p-4 sm:p-6 border-b ${headerBorderColor} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          {icon && (
            <motion.div 
              className={`p-2 sm:p-3 ${iconBgColor} rounded-xl sm:rounded-2xl shadow-lg shadow-black/20`}
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {icon}
            </motion.div>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600 mt-1 text-xs sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {showCloseButton && onClose && (
          <motion.button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-110 group"
            whileHover={{ rotate: 90 }}
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-gray-700" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

/**
 * Modal Content Component
 */
export interface ModalContentProps {
  /** Contenido del modal */
  children: ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`p-4 sm:p-6 relative overflow-y-auto max-h-[calc(85vh-200px)] sm:max-h-[calc(90vh-200px)] ${className}`}>
      {children}
    </div>
  );
};

/**
 * Modal Footer Component
 */
export interface ModalFooterProps {
  /** Contenido del footer */
  children: ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`p-4 sm:p-6 pt-4 border-t border-gray-200/50 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Modal; 