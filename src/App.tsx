import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/features/auth';
// import { Layout } from '@/shared/components/layout/Layout';
import { AppRoutes } from '@/app/routes';
import { ConfigProvider } from '@/shared/context/ConfigContext';
import { useCleanup } from '@/shared/hooks/useCleanup';
import { resetInitialization } from '@/shared/hooks/useRecentActivities';
// import { ReactiveProvider } from '@/shared/reactive';

// Componente principal de la aplicación
const AppContent: React.FC = () => {
  // Inicializar limpieza automática
  useCleanup();

  useEffect(() => {
    // Limpiar el stream de actividades al cargar la aplicación
    resetInitialization();
  }, []);

  return (
    <Router>
        <AppRoutes />
    </Router>
  );
};

// Componente raíz de la aplicación
const App: React.FC = () => {
  return (
    <ConfigProvider>
      <AuthProvider>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App; 
