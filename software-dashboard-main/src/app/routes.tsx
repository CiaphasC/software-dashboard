import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner, LoadingScreen } from '@/shared/components/ui/LoadingSpinner';
import { useAuth } from '@/shared/hooks/useAuth';
import { Layout } from '@/shared/components/layout/Layout';

// Lazy loading de todas las páginas por feature
const LoginPage = React.lazy(() => import('@/features/auth/pages/AuthPage'));
const DashboardPage = React.lazy(() => import('@/features/dashboard/pages/Dashboard'));
const IncidentsPage = React.lazy(() => import('@/features/incidents/pages/IncidentsPage'));
const RequirementsPage = React.lazy(() => import('@/features/requirements/pages/RequirementsPage'));

// Páginas ya migradas a features
const ActivitiesPage = React.lazy(() => import('@/features/activities/pages/ActivitiesPage'));
const ReportsPage = React.lazy(() => import('@/features/reports/pages/ReportsPage'));
const UsersPage = React.lazy(() => import('@/features/users/pages/UsersPage'));
const SettingsPage = React.lazy(() => import('@/features/settings/pages/SettingsPage'));

// Componente de rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Wrapper con Suspense para lazy loading
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingScreen />}>
    {children}
  </Suspense>
);

export const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingScreen />;
  }

  // Si no hay usuario autenticado, mostrar rutas públicas
  if (!user) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><LoadingSpinner size="lg" /></div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Si hay usuario autenticado, mostrar rutas protegidas
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><LoadingSpinner size="lg" /></div>}>
      <Layout>
        <Routes>
          {/* Rutas principales */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* ...resto de rutas... */}
          <Route 
            path="/incidents" 
            element={
              <ProtectedRoute>
                <IncidentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/requirements" 
            element={
              <ProtectedRoute>
                <RequirementsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/activities" 
            element={
              <ProtectedRoute>
                <ActivitiesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reportes" 
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/usuarios" 
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/configuracion" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Suspense>
  );
}; 
