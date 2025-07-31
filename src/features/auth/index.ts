import React from 'react';

// Barrel export para el feature de autenticación
export { useAuth, AuthProvider } from './hooks/useAuth';
export { authApi } from '@/shared/services';
export type { User, UserRole, AuthContextType, LoginFormData, AuthResponse, AuthError } from './types';

// Re-export lazy de la página de login
export const LoginPage = React.lazy(() => import('./pages/Login')); 
 