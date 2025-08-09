// =============================================================================
// USERS MANAGEMENT PANEL - Panel principal de gestión de usuarios
// Diseño Ultra Moderno inspirado en KokonutUI - Glassmorphism & Gradientes Avanzados
// =============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  UserPlus,
  Search,
  Filter,
  Sparkles,
  Star,
  Zap
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Select } from '@/shared/components/ui/Select';
import { UsersList } from './UsersList';
import { PendingUsersList } from './PendingUsersList';
import { UserStatsCards } from './UserStatsCards';
import { ViewToggle } from './ViewToggle';
import { User as UserType, PendingUser } from '@/shared/types/common.types';

// =============================================================================
// USERS MANAGEMENT PANEL - Componente principal ultra modernizado
// =============================================================================

interface UsersManagementPanelProps {
  users: UserType[];
  pendingUsers: PendingUser[];
  loading: boolean;
  isAdmin: boolean;
  onEdit: (user: UserType) => void;
  onDelete: (userId: string) => void;
  onNewUser?: () => void;
  onApprove?: (userId: string) => void;
  onReject?: (userId: string) => void;
}

export const UsersManagementPanel: React.FC<UsersManagementPanelProps> = ({
  users,
  pendingUsers,
  loading,
  isAdmin,
  onEdit,
  onDelete,
  onNewUser,
  onApprove,
  onReject,
}) => {
  const [currentView, setCurrentView] = useState<'active' | 'pending'>('active');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const handleViewChange = (view: 'active' | 'pending') => {
    setCurrentView(view);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Skeleton ligero para estadísticas cuando loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/80 border border-gray-100 shadow-sm">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <UserStatsCards />
      </motion.div>
      )}

      {/* Panel principal con glassmorphism y gradientes avanzados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative"
      >
        {/* Efecto de fondo con gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/30 via-blue-50/20 to-indigo-50/30 rounded-xl sm:rounded-2xl blur-2xl"></div>
        
        <Card className="relative overflow-hidden border-0 bg-white/95 backdrop-blur-xl shadow-xl rounded-xl sm:rounded-2xl">
          {/* Efecto de brillo superior sutil */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-t-xl sm:rounded-t-2xl"></div>
          
          <CardHeader className="relative pb-0 bg-gradient-to-r from-slate-50/60 to-white/40 backdrop-blur-sm">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              {/* Título y contador con diseño moderno */}
              <div className="flex items-center space-x-3">
                <motion.div 
                  className={`relative p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-lg ${
                    currentView === 'active' 
                      ? 'bg-gradient-to-br from-slate-600 to-slate-800 text-white' 
                      : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Efecto de brillo interno sutil */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg sm:rounded-xl"></div>
                  {currentView === 'active' ? (
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
                  ) : (
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
                  )}
                </motion.div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                    {currentView === 'active' ? 'Usuarios Activos' : 'Usuarios Pendientes'}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                    {currentView === 'active' ? `${users.length} usuarios registrados` : `${pendingUsers.length} solicitudes pendientes`}
                  </p>
                </div>
              </div>
              
              {/* Botón Nuevo Usuario con diseño elegante */}
              {isAdmin && currentView === 'active' && onNewUser && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    onClick={onNewUser}
                    variant="primary"
                    size="lg"
                    className="relative bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden group w-full sm:w-auto"
                  >
                    {/* Efecto de brillo en hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 relative z-10" />
                    <span className="relative z-10 text-sm sm:text-base">Nuevo Usuario</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </CardHeader>

          <CardContent className="relative p-0">
            {/* Tabs de navegación con glassmorphism */}
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center bg-slate-100/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-1 shadow-sm border border-slate-200/50">
                <motion.button
                  onClick={() => handleViewChange('active')}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-medium transition-all duration-200 relative overflow-hidden flex-1 sm:flex-none ${
                    currentView === 'active'
                      ? 'bg-white text-slate-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {currentView === 'active' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                  )}
                  <Users className="h-4 w-4 relative z-10" />
                  <span className="relative z-10 text-sm sm:text-base">Usuarios Activos</span>
                </motion.button>
                
                {isAdmin && (
                  <motion.button
                    onClick={() => handleViewChange('pending')}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-medium transition-all duration-200 relative overflow-hidden flex-1 sm:flex-none ${
                      currentView === 'pending'
                        ? 'bg-white text-amber-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {currentView === 'pending' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                    )}
                    <Clock className="h-4 w-4 relative z-10" />
                    <span className="relative z-10 text-sm sm:text-base">Solicitudes Pendientes</span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Contenido de los tabs */}
            <div className="space-y-3 sm:space-y-4">
              {currentView === 'active' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Controles de búsqueda y filtros */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-4 sm:px-6 pb-4">
                    {/* Búsqueda */}
                    <div className="flex-1 min-w-0">
                      <Input
                        placeholder="Buscar usuario..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/90 backdrop-blur-sm border-gray-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    
                    {/* Filtro de roles */}
                    <div className="w-full sm:w-48">
                      <Select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        options={[
                          { value: '', label: 'Todos los roles' },
                          { value: 'admin', label: 'Administrador' },
                          { value: 'user', label: 'Usuario' },
                          { value: 'technician', label: 'Técnico' }
                        ]}
                        className="w-full bg-white/90 backdrop-blur-sm border-gray-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    
                    {/* Toggle de vista - Solo visible en pantallas xl y superiores */}
                    <div className="hidden xl:flex items-center bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-1.5 shadow-lg">
                      <ViewToggle
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                      />
                    </div>
                  </div>

                  {/* Lista de usuarios */}
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 w-full">
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="rounded-xl border border-gray-100 bg-white/80 p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
                              <div className="flex-1">
                                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                                <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                              </div>
                            </div>
                            <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <UsersList
                        users={users}
                        loading={loading}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isAdmin={isAdmin}
                        onNewUser={onNewUser}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        searchQuery={searchQuery}
                        roleFilter={roleFilter}
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {isAdmin && currentView === 'pending' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 sm:px-6 pb-4 sm:pb-6"
                >
                  <PendingUsersList
                    pendingUsers={pendingUsers}
                    onApprove={onApprove || ((requestId: string) => {})}
                    onReject={onReject || ((requestId: string, reason: string) => {})}
                  />
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}; 