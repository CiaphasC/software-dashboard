import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Header } from '@/shared/components/layout/Header';
import { useSettingsStore } from '@/shared/store';
import { prefetchManager } from '@/shared/prefetch/PrefetchManager';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { config } = useSettingsStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280); // Cambiar a xl breakpoint para más espacio
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prefetch on mount (idle): bundles y primera página de incidencias
  useEffect(() => {
    const cb = () => {
      // Prefetch de bundles principales (silenciar errores intermitentes de Vite)
      void import('@/features/dashboard/pages/Dashboard').catch(() => undefined);
      void import('@/features/incidents/pages/IncidentsPage').catch(() => undefined);
      void import('@/features/requirements/pages/RequirementsPage').catch(() => undefined);
      void import('@/features/users/pages/UsersPage').catch(() => undefined);
      void import('@/features/reports/pages/ReportsPage').catch(() => undefined);
      // Prefetch de datos primera página + métricas
      try {
        prefetchManager.prefetch('incidents:firstPage');
        prefetchManager.prefetch('incidents:metrics');
        prefetchManager.prefetch('requirements:firstPage');
        prefetchManager.prefetch('requirements:metrics');
        prefetchManager.prefetch('users:firstPage');
        prefetchManager.prefetch('users:metrics');
        prefetchManager.prefetch('reports:bundle');
        prefetchManager.prefetch('reports:initialData');
      } catch {}
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(cb, { timeout: 2000 });
    } else {
      setTimeout(cb, 500);
    }
  }, []);

  useEffect(() => {
    // Tema
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${config.appearance.theme}`);
    // Color scheme (puedes usar CSS variables si lo deseas)
    document.body.style.setProperty('--color-scheme', config.appearance.colorScheme);
    // Tamaño de fuente
    document.body.style.fontSize = config.appearance.fontSize === 'small' ? '14px' : config.appearance.fontSize === 'large' ? '18px' : '16px';
  }, [config.appearance.theme, config.appearance.colorScheme, config.appearance.fontSize]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out xl:translate-x-0 ${
        isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''
      }`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="xl:pl-64">
        {/* Header - Fixed on desktop */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        
        {/* Page content */}
        <main className="min-h-screen bg-gray-50">
          <div className="p-4 xl:p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}; 
