import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { usePrefetchOnHover } from '@/shared/hooks/usePrefetchOnHover';
import { useAuthStore } from '@/shared/store';
import { Button } from '@/shared/components/ui/Button';

import navigation from '@/shared/data/navigation'

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  // const { config } = useSettingsStore();

  // Eliminar variable no usada para evitar warning
  // const colorScheme = config.appearance.colorScheme;

  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role as 'admin' | 'technician' | 'requester')
  );

  // Prefetch de bundles por ruta en hover
  const prefetchBundle = (path: string) => {
    switch (path) {
      case '/dashboard':
        import('@/features/dashboard/pages/Dashboard');
        break;
      case '/incidents':
        import('@/features/incidents/pages/IncidentsPage');
        break;
      case '/requirements':
        import('@/features/requirements/pages/RequirementsPage');
        break;
      case '/activities':
        import('@/features/activities/pages/ActivitiesPage');
        break;
      case '/reportes':
        import('@/features/reports/pages/ReportsPage');
        break;
      case '/usuarios':
        import('@/features/users/pages/UsersPage');
        break;
      case '/configuracion':
        import('@/features/settings/pages/SettingsPage');
        break;
    }
  }

  const containerVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as any,
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, x: -15 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as any
      }
    }
  };

  return (
    <motion.div 
      className="relative flex h-full w-64 flex-col bg-gradient-to-b from-white via-slate-50/30 to-white border-r border-slate-200/60 shadow-[4px_0_25px_rgba(0,0,0,0.08)] backdrop-blur-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 via-transparent to-cyan-50/20 pointer-events-none" />
      <div className="absolute top-20 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/8 to-cyan-400/8 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400/8 to-blue-400/8 rounded-full blur-xl" />

      {/* Header with close button for mobile */}
      <div className="relative flex h-16 items-center justify-between px-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl blur-lg opacity-60" />
            <div className="relative h-10 w-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
              <span className="text-white font-bold text-lg drop-shadow-sm">S</span>
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-slate-800">Sistema</span>
            <p className="text-xs text-slate-500">Gestión Integral</p>
          </div>
        </div>
        
        {/* Close button for mobile */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="xl:hidden p-2 hover:bg-gradient-to-r hover:from-red-50/80 hover:to-pink-50/80 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
          >
            <X className="h-5 w-5 text-slate-600" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-2 px-4 py-6 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
            Navegación
          </h3>
        </div>
        
        {filteredNavigation.map((item) => {
          // Prefetch por intención según sección
          const prefetchIntention = item.name === 'Incidencias'
            ? 'incidents:firstPage'
            : item.name === 'Requerimientos'
            ? 'requirements:firstPage'
            : item.name === 'Usuarios'
            ? 'users:firstPage'
            : null
          const prefetchHandlers = prefetchIntention ? usePrefetchOnHover(prefetchIntention as any) : undefined
          const isActive = location.pathname === item.href;
          return (
            <motion.div
              key={item.name}
              variants={itemVariants}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={item.href}
                onClick={onClose} // Close sidebar on mobile when clicking a link
                onPointerEnter={() => { prefetchBundle(item.href); prefetchHandlers?.onPointerEnter && prefetchHandlers.onPointerEnter(); }}
                onPointerLeave={() => { prefetchHandlers?.onPointerLeave && prefetchHandlers.onPointerLeave(); }}
                onFocus={() => { prefetchBundle(item.href); prefetchHandlers?.onFocus && prefetchHandlers.onFocus(); }}
                onBlur={() => { prefetchHandlers?.onBlur && prefetchHandlers.onBlur(); }}
                className={cn(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-2xl transition-all duration-300 relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-blue-50/90 to-cyan-50/90 text-blue-700 shadow-lg shadow-blue-100/50 border border-blue-200/50'
                    : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-blue-50/80 hover:text-slate-900 hover:shadow-md hover:shadow-slate-100/50'
                )}
              >
                {/* Active background glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-sm" />
                )}
                
                <div className="relative flex items-center w-full">
                  <div className={cn(
                    'p-2 rounded-xl mr-3 transition-all duration-300',
                    isActive 
                      ? 'bg-gradient-to-br from-blue-100 to-cyan-100 shadow-sm' 
                      : 'bg-slate-100/50 group-hover:bg-slate-200/80 group-hover:scale-110'
                  )}>
                    <item.icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0 transition-all duration-300',
                        isActive 
                          ? 'text-blue-600' 
                          : 'text-slate-500 group-hover:text-slate-700 group-hover:scale-110'
                      )}
                    />
                  </div>
                  <span className="font-semibold transition-all duration-300">{item.name}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute right-3 h-2.5 w-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-sm shadow-blue-200/50"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                    />
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="relative border-t border-slate-200/60 p-4 bg-gradient-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-sm">
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl blur-lg opacity-60" />
            <div className="relative h-12 w-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
              <span className="text-white font-bold text-lg drop-shadow-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.role === 'admin' ? 'Administrador' : 
               user?.role === 'technician' ? 'Técnico' : 'Solicitante'}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}; 
