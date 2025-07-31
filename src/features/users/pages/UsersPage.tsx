import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Edit,
  Trash2,
  Eye,
  Shield,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Table, type Column } from '@/shared/components/ui/Table';
import { FilterBar, type FilterOption, type FilterValues } from '@/shared/components/ui/FilterBar';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { User, UserRole } from '@/shared/types/common.types';
import { useUsers } from '../hooks/useUsers';
import { 
  UserCard, 
  UserForm, 
  UserStatsCards,
  ViewToggle, 
  type ViewMode 
} from '../components';
import toast from 'react-hot-toast';

const roleOptions = [
  { value: UserRole.ADMIN, label: 'Administrador' },
  { value: UserRole.TECHNICIAN, label: 'Técnico' },
  { value: UserRole.REQUESTER, label: 'Solicitante' },
];

const departmentOptions = [
  { value: 'TI', label: 'Tecnología de la Información' },
  { value: 'RRHH', label: 'Recursos Humanos' },
  { value: 'Contabilidad', label: 'Contabilidad' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Ventas', label: 'Ventas' },
  { value: 'Operaciones', label: 'Operaciones' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Finanzas', label: 'Finanzas' },
];

// Componente de partículas flotantes con colores azul profesional
const FloatingParticles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Partículas principales azul */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/50 to-sky-400/50 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.2, 1, 0.2],
            scale: [0.3, 2, 0.3],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
      
      {/* Partículas de brillo doradas */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-0.5 h-0.5 bg-yellow-300/80 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0, 4, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4,
          }}
        />
      ))}
      
      {/* Partículas especiales de azul */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`blue-${i}`}
          className="absolute w-2 h-2 bg-gradient-to-r from-sky-300/70 to-blue-600/70 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            rotate: [0, 360],
            opacity: [0.4, 0.9, 0.4],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 7 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 6,
          }}
        />
      ))}
    </div>
  );
};

export const UsersPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    users, 
    filteredUsers, 
    loading, 
    error, 
    setFilters, 
    createUser, 
    updateUser, 
    deleteUser, 
    refreshUsers 
  } = useUsers();

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setFilters({ [key]: value });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ search: query });
  };

  const handleCreateUser = async (userData: any) => {
    try {
      await createUser(userData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!editingUser) return;
    
    try {
      await updateUser(editingUser.id, userData);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${user.name}?`)) {
      try {
        await deleteUser(user.id);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleViewUser = (user: User) => {
    toast.success(`Viendo detalles de ${user.name}`);
    // Aquí podrías abrir un modal con detalles completos
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'danger';
      case UserRole.TECHNICIAN:
        return 'primary';
      case UserRole.REQUESTER:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleText = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.TECHNICIAN:
        return 'Técnico';
      case UserRole.REQUESTER:
        return 'Solicitante';
      default:
        return role;
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'user',
      label: 'Usuario',
      sortable: true,
      mobile: true,
      render: (user) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      mobile: true,
      render: (user) => (
        <Badge variant={getRoleColor(user.role)}>
          {getRoleText(user.role)}
        </Badge>
      )
    },
    {
      key: 'department',
      label: 'Departamento',
      sortable: true,
      mobile: true,
      render: (user) => (
        <span className="text-sm text-gray-700">{user.department}</span>
      )
    },
    {
      key: 'createdAt',
      label: 'Fecha de Registro',
      sortable: true,
      mobile: false,
      render: (user) => (
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      mobile: true,
      render: (user) => (
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
            onClick={() => handleViewUser(user)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
            onClick={() => handleEditUser(user)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDeleteUser(user)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const filterOptions: FilterOption[] = [
    {
      key: 'role',
      label: 'Rol',
      type: 'select',
      options: roleOptions
    },
    {
      key: 'department',
      label: 'Departamento',
      type: 'select',
      options: departmentOptions
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <Shield className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar usuarios</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshUsers} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Reintentar</span>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatePresence>
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header con gradiente azul profesional */}
          <motion.div variants={itemVariants} className="relative">
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-500 text-white shadow-2xl relative overflow-hidden">
              <FloatingParticles />
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold mb-1">Gestión de Usuarios</h1>
                        <p className="text-blue-100 text-lg">Administra los usuarios del sistema</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
                    >
                      <UserPlus className="h-5 w-5" />
                      Nuevo Usuario
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants}>
            <UserStatsCards />
          </motion.div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FilterBar
                  filters={filterOptions}
                  values={filterValues}
                  onChange={handleFilterChange}
                  onSearch={handleSearch}
                  searchPlaceholder="Buscar usuarios por nombre, email o departamento..."
                  className="mb-6"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-gray-50/80 via-blue-50/60 to-gray-50/80 border-b border-gray-200/50 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <CardTitle className="flex items-center gap-3 text-gray-900">
                    <motion.div 
                      className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-sky-500 text-white shadow-lg"
                      animate={{ 
                        boxShadow: [
                          "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
                          "0 10px 15px -3px rgba(59, 130, 246, 0.4)",
                          "0 4px 6px -1px rgba(59, 130, 246, 0.3)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Users className="h-5 w-5" />
                    </motion.div>
                    <span className="text-xl font-bold">Lista de Usuarios</span>
                    {filteredUsers.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <Badge variant="default" className="bg-white/90 backdrop-blur-sm text-gray-700 border-gray-200/50 font-medium shadow-sm">
                          {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario' : 'usuarios'}
                        </Badge>
                      </motion.div>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <ViewToggle
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      onShowFilters={() => setShowFilters(!showFilters)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={refreshUsers}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium bg-white/90 backdrop-blur-sm border-gray-200/50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-sm rounded-lg hover:shadow-md"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Actualizar
                    </Button>
                  </div>
                </motion.div>
              </CardHeader>
              
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 mb-4">
                      <Users className="h-16 w-16 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No hay usuarios encontrados
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery || Object.keys(filterValues).length > 0
                        ? 'Intenta ajustar los filtros de búsqueda'
                        : 'Comienza creando el primer usuario del sistema'
                      }
                    </p>
                    {!searchQuery && Object.keys(filterValues).length === 0 && (
                      <Button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600"
                      >
                        <UserPlus className="h-4 w-4" />
                        Crear Primer Usuario
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Contenido de la tabla */}
                    <AnimatePresence mode="wait">
                      {viewMode === 'table' ? (
                        <motion.div
                          key="table"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.4 }}
                          className="hidden xl:block"
                        >
                          <Table
                            data={filteredUsers}
                            columns={columns}
                            className="w-full"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="cards"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.4 }}
                          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 p-8"
                        >
                          {filteredUsers.map((user, index) => (
                            <motion.div
                              key={user.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ 
                                duration: 0.4, 
                                delay: index * 0.1,
                                ease: "easeOut"
                              }}
                            >
                              <UserCard
                                user={user}
                                onView={handleViewUser}
                                onEdit={handleEditUser}
                                onDelete={handleDeleteUser}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Vista móvil siempre en tarjetas */}
                    <div className="xl:hidden p-8">
                      <div className="grid grid-cols-1 gap-6">
                        {filteredUsers.map((user, index) => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.4, 
                              delay: index * 0.1,
                              ease: "easeOut"
                            }}
                          >
                            <UserCard
                              user={user}
                              onView={handleViewUser}
                              onEdit={handleEditUser}
                              onDelete={handleDeleteUser}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <UserForm
        isOpen={showCreateModal}
        onSubmit={handleCreateUser}
        onCancel={() => setShowCreateModal(false)}
      />

      <UserForm
        user={editingUser}
        isOpen={!!editingUser}
        onSubmit={handleUpdateUser}
        onCancel={() => setEditingUser(null)}
      />
    </div>
  );
};

export default UsersPage; 
