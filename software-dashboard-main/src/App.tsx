import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from '@/app/routes';
import { StoreProvider } from '@/shared/store';
import { useCleanup } from '@/shared/hooks/useCleanup';
// import { resetInitialization } from '@/shared/hooks/useRecentActivities';

// Componente principal de la aplicación
const AppContent: React.FC = () => {
  // Inicializar limpieza automática
  useCleanup();

  useEffect(() => {
    // Limpiar el stream de actividades al cargar la aplicación
    // resetInitialization();
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppRoutes />
    </Router>
  );
};

// Componente raíz de la aplicación
const App: React.FC = () => {
  return (
    <StoreProvider>
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
    </StoreProvider>
  );
};

export default App; 
