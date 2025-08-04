import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Search,
  Users
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { useAuthStore } from '@/shared/store';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout, pendingUsersCount } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Sesión cerrada exitosamente');
  };

  const handleNavigateToUsers = () => {
    navigate('/users');
    setShowNotifications(false);
  };

  const handleNavigateToSettings = () => {
    navigate('/settings');
    setShowUserMenu(false);
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          
          <div className="hidden sm:flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">SG</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Sistema de Gestión</span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-lg mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications - Solo para administradores */}
          {user.role === 'admin' && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {pendingUsersCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">
                      {pendingUsersCount > 9 ? '9+' : pendingUsersCount}
                    </span>
                  </motion.div>
                )}
              </Button>

              {/* Notifications dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
                        <Badge variant="danger" className="text-xs">
                          {pendingUsersCount} nueva{pendingUsersCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      {pendingUsersCount > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-red-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                Usuarios pendientes de aprobación
                              </p>
                              <p className="text-sm text-gray-500">
                                {pendingUsersCount} solicitud{pendingUsersCount !== 1 ? 'es' : ''} de registro esperando revisión
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            onClick={handleNavigateToUsers}
                            className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Revisar Solicitudes
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-sm text-gray-500">No hay notificaciones nuevas</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>

            {/* User dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400 capitalize mt-1">{user.role} • {user.department}</div>
                    </div>
                    
                    <div className="py-1">
                      <Button
                        variant="ghost"
                        onClick={handleNavigateToSettings}
                        className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Configuración
                      </Button>
                      
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Cerrar Sesión
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
}; 
