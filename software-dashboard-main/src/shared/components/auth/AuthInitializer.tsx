// =============================================================================
// AUTH INITIALIZER - Componente de inicialización de autenticación
// Arquitectura de Software Profesional - Gestión de Estado de Autenticación
// =============================================================================

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/shared/store';
import { LoadingScreen } from '@/shared/components/ui/LoadingSpinner';
import { logger } from '@/shared/utils/logger'

// =============================================================================
// AUTH INITIALIZER PROPS - Props del componente
// =============================================================================

interface AuthInitializerProps {
  children: React.ReactNode;
}

// =============================================================================
// AUTH INITIALIZER - Componente principal
// =============================================================================

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { verifySession } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // =============================================================================
  // INITIALIZATION EFFECT - Efecto de inicialización
  // =============================================================================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar sesión al cargar la aplicación
        // Si no hay sesión, esto es normal y no debe generar errores
        await verifySession();
      } catch (error) {
        // Solo loggear errores que no sean de "no autenticado"
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = (error as any).message;
          if (!errorMessage.includes('403') && !errorMessage.includes('Forbidden')) {
            logger.error('AuthInitializer: Error initializing auth', error as Error);
          }
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [verifySession]);

  // =============================================================================
  // RENDER - Renderizado condicional
  // =============================================================================

  // Mostrar loading mientras se inicializa
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Renderizar children una vez inicializado
  return <>{children}</>;
}; 