// =============================================================================
// USERS LIST - Componente de lista de usuarios con modo tarjeta/tabla
// Arquitectura de Software Profesional - Gestión de Usuarios
// =============================================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit, 
  Trash2, 
  Eye,
  User as UserIcon,
  Mail,
  Building,
  Shield,
  Calendar,
  Clock,
  UserPlus
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { User as UserType, UserRole } from '@/shared/types/common.types';
import { ViewToggle, ViewMode } from '@/features/users/components/ViewToggle';
import { UserCard } from '@/features/users/components/UserCard';
import { 
  getUserSessionStatus,
  getSessionStatusColor,
  getSessionStatusText,
  formatLastLoginTime
} from '@/shared/utils/sessionUtils';

// =============================================================================
// TYPES - Tipos para el componente
// =============================================================================

interface UsersListProps {
  users: UserType[];
  loading: boolean;
  onEdit: (user: UserType) => void;
  onDelete: (userId: string) => void;
  isAdmin: boolean;
  onNewUser?: () => void; // Función para abrir formulario de nuevo usuario
  viewMode?: 'table' | 'cards';
  onViewModeChange?: (mode: 'table' | 'cards') => void;
  searchQuery?: string;
  roleFilter?: string;
}

// =============================================================================
// UTILITY FUNCTIONS - Funciones de utilidad para tabla
// =============================================================================

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800';
    case 'technician': return 'bg-blue-100 text-blue-800';
    case 'requester': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getRoleText = (role: string) => {
  switch (role) {
    case 'admin': return 'Administrador';
    case 'technician': return 'Técnico';
    case 'requester': return 'Solicitante';
    default: return role;
  }
};

// =============================================================================
// USERS LIST - Componente principal
// =============================================================================

export const UsersList: React.FC<UsersListProps> = ({
  users,
  loading,
  onEdit,
  onDelete,
  isAdmin,
  onNewUser,
  viewMode: externalViewMode,
  onViewModeChange: externalOnViewModeChange,
  searchQuery: externalSearchQuery,
  roleFilter: externalRoleFilter
}) => {
  // =============================================================================
  // STATE - Estado local del componente
  // =============================================================================

  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('cards');
  
  // Usar el viewMode externo si se proporciona, sino usar el interno
  const viewMode = externalViewMode || internalViewMode;
  const setViewMode = externalOnViewModeChange || setInternalViewMode;
  
  // Usar los filtros externos si se proporcionan, sino usar los internos
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalRoleFilter, setInternalRoleFilter] = useState<string>('all');
  
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const roleFilter = externalRoleFilter !== undefined ? externalRoleFilter : internalRoleFilter;

  // =============================================================================
  // FILTERED USERS - Usuarios filtrados
  // =============================================================================

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // =============================================================================
  // RENDER FUNCTIONS - Funciones de renderizado
  // =============================================================================

  const renderUserCard = (user: UserType) => (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <UserCard
        user={user}
        onView={() => {}} // Función vacía por ahora
        onEdit={onEdit}
        onDelete={(user) => onDelete(user.id)}
      />
    </motion.div>
  );

  const renderUserTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-3 sm:px-6 py-3 font-bold text-gray-900">Usuario</th>
            <th className="hidden sm:table-cell px-3 sm:px-6 py-3 font-bold text-gray-900">Rol</th>
            <th className="hidden md:table-cell px-3 sm:px-6 py-3 font-bold text-gray-900">Departamento</th>
            <th className="hidden lg:table-cell px-3 sm:px-6 py-3 font-bold text-gray-900">Estado</th>
            <th className="hidden xl:table-cell px-3 sm:px-6 py-3 font-bold text-gray-900">Último Login</th>
            {isAdmin && <th className="px-3 sm:px-6 py-3 font-bold text-gray-900">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
            >
              <td className="px-3 sm:px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 truncate">{user.name}</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
                    {/* Información adicional en móvil */}
                    <div className="sm:hidden mt-1">
                      <Badge className={`${getRoleColor(user.role)} px-2 py-1 rounded-full text-xs`}>
                        {getRoleText(user.role)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </td>
              <td className="hidden sm:table-cell px-3 sm:px-6 py-4">
                <Badge className={`${getRoleColor(user.role)} px-3 py-1 rounded-full font-medium`}>
                  {getRoleText(user.role)}
                </Badge>
              </td>
              <td className="hidden md:table-cell px-3 sm:px-6 py-4">
                <span className="font-medium text-gray-900">{user.department}</span>
              </td>
              <td className="hidden lg:table-cell px-3 sm:px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Badge variant={getSessionStatusColor(getUserSessionStatus(user))} className="text-xs px-2 py-1 rounded-full">
                    {getSessionStatusText(getUserSessionStatus(user))}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </td>
              <td className="hidden xl:table-cell px-3 sm:px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 font-medium">
                    {formatLastLoginTime(user.lastLoginAt)}
                  </span>
                </div>
              </td>
              {isAdmin && (
                <td className="px-3 sm:px-6 py-4">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(user)}
                      className="bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 p-1 sm:p-2"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(user.id)}
                      className="bg-white hover:bg-red-50 border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 transition-all duration-200 p-1 sm:p-2"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // =============================================================================
  // RENDER - Renderizado del componente
  // =============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* Contenido */}
      <AnimatePresence mode="wait">
        {viewMode === 'cards' ? (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 p-4"
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                {renderUserCard(user)}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {renderUserTable()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estado vacío */}
      {filteredUsers.length === 0 && (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery || roleFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda para encontrar más resultados.'
              : 'No hay usuarios registrados en el sistema.'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}; 