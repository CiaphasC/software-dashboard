// =============================================================================
// USERS MANAGEMENT PANEL - Panel principal de gestión de usuarios
// Arquitectura de Software Profesional - Componente Ensamblador
// =============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  UserPlus
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { UsersList } from './UsersList';
import { PendingUsersList } from './PendingUsersList';
import { UserStatsCards } from './UserStatsCards';
import { ViewToggle } from './ViewToggle';
import { User as UserType, PendingUser } from '@/shared/types/common.types';
import { Search } from 'lucide-react';

// =============================================================================
// TYPES - Tipos para el componente
// =============================================================================

interface UsersManagementPanelProps {
  users: UserType[];
  pendingUsers: PendingUser[];
  loading: boolean;
  error?: string;
  onEdit: (user: UserType) => void;
  onDelete: (userId: string) => void;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onNewUser?: () => void;
  isAdmin: boolean;
}

type ViewMode = 'active' | 'pending';

// =============================================================================
// USERS MANAGEMENT PANEL - Componente principal
// =============================================================================

export const UsersManagementPanel: React.FC<UsersManagementPanelProps> = ({
  users,
  pendingUsers,
  loading,
  error,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onNewUser,
  isAdmin
}) => {
  // =============================================================================
  // STATE - Estado local del componente
  // =============================================================================

  const [currentView, setCurrentView] = useState<ViewMode>('active');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // =============================================================================
  // HANDLERS - Manejadores de eventos
  // =============================================================================

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  // =============================================================================
  // RENDER - Renderizado del componente
  // =============================================================================

     return (
     <div className="space-y-8">
             {/* Estadísticas de usuarios */}
       <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         className="mb-8"
       >
         <UserStatsCards />
       </motion.div>

      {/* Controles de navegación */}
      <motion.div 
        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Usuarios Activos */}
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => handleViewChange('active')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`p-2 rounded-lg transition-colors duration-200 ${
                currentView === 'active' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className={`text-sm font-medium transition-colors duration-200 ${
                  currentView === 'active' ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  Usuarios Activos
                </span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {users.length}
                  </Badge>
                </div>
              </div>
            </motion.div>
            
            {/* Solicitudes Pendientes */}
            {isAdmin && (
              <motion.div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => handleViewChange('pending')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentView === 'pending' 
                    ? 'bg-yellow-100 text-yellow-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className={`text-sm font-medium transition-colors duration-200 ${
                    currentView === 'pending' ? 'text-yellow-700' : 'text-gray-700'
                  }`}>
                    Solicitudes Pendientes
                  </span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                      {pendingUsers.length}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Card principal */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
                 {/* Header del card */}
         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 lg:p-6 border-b border-gray-100">
           {/* Título y contador - Responsivo */}
           <div className="flex items-center space-x-3">
             <div className={`p-2 lg:p-3 rounded-xl shadow-lg ${
               currentView === 'active' 
                 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
                 : 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
             }`}>
               {currentView === 'active' ? (
                 <Users className="h-5 w-5 lg:h-6 lg:w-6" />
               ) : (
                 <Clock className="h-5 w-5 lg:h-6 lg:w-6" />
               )}
             </div>
                           <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
                  {currentView === 'active' ? 'Usuarios Activos' : 'Usuarios Pendientes'}
                </h2>
              </div>
           </div>
           
           {/* Controles - Responsivo */}
           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
             {/* Controles de búsqueda y filtros - Solo para vista activa */}
             {currentView === 'active' && (
               <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-1.5 shadow-lg gap-1.5">
                 {/* Búsqueda */}
                 <div className="relative flex-1 sm:flex-none">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                   <Input
                     placeholder="Buscar usuarios..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full sm:w-40 lg:w-48 pl-10 pr-3 py-2 border-0 bg-transparent focus:ring-0 focus:border-0 text-sm font-medium text-white placeholder-white/70"
                   />
                 </div>
                 
                 {/* Filtro de rol */}
                 <div className="relative flex-1 sm:flex-none">
                   <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                   </svg>
                   <select
                     value={roleFilter}
                     onChange={(e) => setRoleFilter(e.target.value)}
                     className="w-full pl-10 pr-8 py-2 border-0 bg-transparent text-sm font-medium focus:outline-none focus:ring-0 text-white cursor-pointer appearance-none"
                   >
                     <option value="all" className="text-gray-800">Todos los roles</option>
                     <option value="admin" className="text-gray-800">Administradores</option>
                     <option value="technician" className="text-gray-800">Técnicos</option>
                     <option value="requester" className="text-gray-800">Solicitantes</option>
                   </select>
                   <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>
               </div>
             )}
             
             {/* ViewToggle - Solo para vista activa */}
             {currentView === 'active' && (
               <div className="flex-1 sm:flex-none">
                 <ViewToggle
                   viewMode={viewMode}
                   onViewModeChange={setViewMode}
                 />
               </div>
             )}
             
             {/* Botón Nuevo Usuario - Solo para admins y vista activa */}
             {isAdmin && currentView === 'active' && onNewUser && (
               <Button
                 onClick={onNewUser}
                 className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
               >
                 <UserPlus className="h-4 w-4" />
                 <span className="hidden sm:inline">Nuevo Usuario</span>
                 <span className="sm:hidden">Nuevo</span>
               </Button>
             )}
           </div>
         </div>

        {/* Contenido */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {currentView === 'active' ? (
              <motion.div
                key="active-users"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            ) : (
              <motion.div
                key="pending-users"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <PendingUsersList
                  pendingUsers={pendingUsers}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}; 