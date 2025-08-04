import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';

interface PasswordInputProps {
  label: string;
  placeholder?: string;
  error?: string;
  className?: string;
  [key: string]: any; // Para pasar props adicionales como register
}

/**
 * Componente de input de contraseña reutilizable
 * Incluye funcionalidad de mostrar/ocultar contraseña
 */
const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  placeholder = "••••••••",
  error,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          label={label}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          icon={<Lock className="w-4 h-4" />}
          error={error}
          variant="glassmorphism"
          autoComplete={showPassword ? 'off' : 'current-password'}
          className={className}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors duration-200 p-1.5 sm:p-1 rounded-md hover:bg-white/10 touch-manipulation"
          tabIndex={-1}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <AnimatePresence mode="wait">
            {showPassword ? (
              <motion.div
                key="eye-off"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <EyeOff className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div
                key="eye"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Eye className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
};

export default PasswordInput; 