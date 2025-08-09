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
import { FixedSizeList as VirtualList } from 'react-window';

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
    case 'admin': return 'bg-gradient-to-r from-red-500 to-rose-600 shadow-lg';
    case 'technician': return 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg';
    case 'requester': return 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg';
    case 'user': return 'bg-gradient-to-r from-slate-500 to-gray-600 shadow-lg';
    default: return 'bg-gradient-to-r from-gray-500 to-slate-600 shadow-lg';
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
      
      const matchesRole = roleFilter === '' || roleFilter === 'all' || user.role === roleFilter;
      
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

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const user = filteredUsers[index]
    return (
      <div style={style}>
        <div className="px-4">
          <div className="grid grid-cols-12 items-center py-3 border-b border-gray-100">
            <div className="col-span-4 flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-600">{user.email}</div>
              </div>
            </div>
            <div className="col-span-2">
              <Badge className={`${getRoleColor(user.role)} text-white border-0 px-2 py-0.5 text-xs font-medium rounded-lg`}>
                {getRoleText(user.role)}
              </Badge>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium text-gray-900">{user.department}</span>
            </div>
            <div className="col-span-2 flex items-center space-x-2">
              <Badge variant={getSessionStatusColor(getUserSessionStatus(user))} className="text-xs font-medium rounded-lg">
                {getSessionStatusText(getUserSessionStatus(user))}
              </Badge>
            </div>
            <div className="col-span-2 flex items-center justify-end space-x-2 pr-2">
              <Button onClick={() => onEdit(user)} variant="outline" size="sm" className="h-7 w-7 p-0 border-blue-300 text-blue-600 hover:bg-blue-50">
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button onClick={() => onDelete(user.id)} variant="outline" size="sm" className="h-7 w-7 p-0 border-red-300 text-red-600 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderUserTable = () => {
    // Si hay pocos usuarios, render normal sin virtualización ni scroll
    if (filteredUsers.length <= 20) {
      return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-700">Usuarios</div>
          <div className="w-full">
            {filteredUsers.map((_, index) => (
              <Row key={filteredUsers[index].id} index={index} style={{ height: 64 }} />
            ))}
          </div>
        </div>
      )
    }
    const computedHeight = Math.min(480, Math.max(64, filteredUsers.length * 64))
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-700">Usuarios</div>
        <VirtualList
          height={computedHeight}
          width={'100%'}
          itemCount={filteredUsers.length}
          itemSize={64}
        >
          {Row}
        </VirtualList>
      </div>
    )
  };

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
      <AnimatePresence mode="sync">
        {/* Vista de tabla - Solo visible en pantallas xl y superiores */}
        {viewMode === 'table' && filteredUsers.length > 0 && (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className="block"
          >
            {renderUserTable()}
          </motion.div>
        )}

        {/* Vista de tarjetas para pantallas grandes */}
        {viewMode === 'cards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="hidden xl:grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 p-6 w-full"
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="w-full h-full"
              >
                {renderUserCard(user)}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vista móvil siempre en tarjetas - Visible en pantallas menores a xl */}
      {filteredUsers.length > 0 && (
        <div className="xl:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 w-full">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="w-full h-full"
              >
                {renderUserCard(user)}
              </motion.div>
            ))}
          </div>
        </div>
      )}

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
            {searchQuery || (roleFilter !== '' && roleFilter !== 'all')
              ? 'Intenta ajustar los filtros de búsqueda para encontrar más resultados.'
              : 'No hay usuarios registrados en el sistema.'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}; 