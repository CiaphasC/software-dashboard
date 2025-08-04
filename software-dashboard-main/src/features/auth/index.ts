import React from 'react';

// Barrel export para el feature de autenticación
export { useAuthStore } from '@/shared/store';
export { authService } from '@/shared/services/supabase';
export type { User, UserRole, RegisterFormData } from './types';

// Re-export lazy de la página de login
export const LoginPage = React.lazy(() => import('./pages/AuthPage'));

// Exportar componentes
export * from './components'; 
 