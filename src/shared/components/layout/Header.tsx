import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  ChevronDown,
  LogOut,
  Settings
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <motion.header 
      className="relative bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-cyan-50/30 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl" />
      <div className="absolute top-0 right-1/4 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-2xl" />
      
      <div className="relative flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Left section */}
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden p-3 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-cyan-50/80 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 hover:scale-105"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </Button>
          
          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-lg">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-all duration-300 group-focus-within:scale-110" />
              <Input
                type="text"
                placeholder="Buscar incidencias, requerimientos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative pl-12 pr-4 py-2.5 bg-white/70 backdrop-blur-md border-slate-200/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100/50 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-blue-100/30 transition-all duration-300 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-3 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-cyan-50/80 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 hover:scale-105"
          >
            <Search className="h-5 w-5 text-slate-600" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative p-3 hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-red-50/80 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-100/50 hover:scale-105 group"
          >
            <Bell className="h-5 w-5 text-slate-600 group-hover:text-orange-500 transition-all duration-300 group-hover:scale-110" />
            <motion.span 
              className="absolute top-2 right-2 h-3 w-3 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 rounded-full shadow-lg shadow-red-200/50"
              animate={{ 
                scale: [1, 1.3, 1],
                boxShadow: [
                  "0 0 0 0 rgba(239, 68, 68, 0.4)",
                  "0 0 0 10px rgba(239, 68, 68, 0)",
                  "0 0 0 0 rgba(239, 68, 68, 0)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-3 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-cyan-50/80 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 hover:scale-105 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                <div className="relative h-11 w-11 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/50 group-hover:shadow-xl group-hover:shadow-blue-300/50 transition-all duration-300 group-hover:scale-110">
                  <span className="text-white font-bold text-sm drop-shadow-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors duration-300">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.role === 'admin' ? 'Administrador' : 
                   user?.role === 'technician' ? 'Técnico' : 'Solicitante'}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-all duration-300 ${showUserMenu ? 'rotate-180 text-blue-500' : ''}`} />
            </Button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute right-0 mt-4 w-72 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200/50 py-4 z-50"
                >
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-t-3xl" />
                  <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-60" />
                  
                  <div className="px-5 py-4 border-b border-slate-100/60 md:hidden">
                    <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-500">
                      {user?.role === 'admin' ? 'Administrador' : 
                       user?.role === 'technician' ? 'Técnico' : 'Solicitante'}
                    </p>
                  </div>
                  
                  <button className="w-full px-5 py-4 text-left text-sm text-slate-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-cyan-50/80 flex items-center space-x-4 transition-all duration-300 group">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl group-hover:from-blue-200 group-hover:to-cyan-200 transition-all duration-300 group-hover:scale-110">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-semibold">Mi Perfil</span>
                  </button>
                  
                  <button className="w-full px-5 py-4 text-left text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-blue-50/80 flex items-center space-x-4 transition-all duration-300 group">
                    <div className="p-2.5 bg-gradient-to-br from-slate-100 to-blue-100 rounded-xl group-hover:from-slate-200 group-hover:to-blue-200 transition-all duration-300 group-hover:scale-110">
                      <Settings className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="font-semibold">Configuración</span>
                  </button>
                  
                  <div className="border-t border-slate-100/60 my-3 mx-5"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full px-5 py-4 text-left text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50/80 hover:to-pink-50/80 flex items-center space-x-4 transition-all duration-300 group"
                  >
                    <div className="p-2.5 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl group-hover:from-red-200 group-hover:to-pink-200 transition-all duration-300 group-hover:scale-110">
                      <LogOut className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="font-semibold">Cerrar Sesión</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile search bar - shown when active */}
      <AnimatePresence>
        {false && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden px-4 pb-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar..."
                className="pl-12 pr-4 py-2.5 bg-white/70 backdrop-blur-md border-slate-200/60 rounded-2xl shadow-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}; 
