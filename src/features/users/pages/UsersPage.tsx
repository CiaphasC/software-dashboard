import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Edit,
  Trash2,
  Eye,
  Shield,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  UserX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Table, type Column } from '@/shared/components/ui/Table';
import { FilterBar, type FilterOption, type FilterValues } from '@/shared/components/ui/FilterBar';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { User, UserRole, PendingUser, PendingUserStatus } from '@/shared/types/common.types';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authApi } from '@/shared/services';
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
  const [activeTab, setActiveTab] = useState<'users' | 'pending'>('users');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPendingUser, setSelectedPendingUser] = useState<PendingUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const { user: currentUser } = useAuth();
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

  // Verificar si el usuario actual es administrador
  const isAdmin = currentUser?.role === 'admin';

  // Cargar usuarios pendientes
  useEffect(() => {
    if (isAdmin) {
      loadPendingUsers();
    }
  }, [isAdmin]);

  const loadPendingUsers = async () => {
    setLoadingPending(true);
    try {
      const pending = await authApi.getPendingUsers();
      setPendingUsers(pending);
    } catch (error) {
      console.error('Error loading pending users:', error);
      toast.error('Error al cargar usuarios pendientes');
    } finally {
      setLoadingPending(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setFilters({ [key]: value });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ search: query });
  };

  const handleCreateUser = async (userData: any) => {
    if (!isAdmin) {
      toast.error('Solo los administradores pueden crear usuarios');
      return;
    }

    try {
      // Extraer contraseña del formulario
      const { password, confirmPassword, ...userInfo } = userData;
      
      if (!password) {
        toast.error('La contraseña es requerida para crear un usuario');
        return;
      }

      await createUser({
        ...userInfo,
        password
      });
      setShowCreateModal(false);
      toast.success('Usuario creado exitosamente');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!editingUser) return;
    
    if (!isAdmin) {
      toast.error('Solo los administradores pueden editar usuarios');
      return;
    }
    
    try {
      // Extraer contraseña del formulario
      const { password, confirmPassword, ...userInfo } = userData;
      
      // Solo incluir contraseña si se proporcionó una nueva
      const updateData = password ? { ...userInfo, password } : userInfo;
      
      await updateUser(editingUser.id, updateData);
      setEditingUser(null);
      toast.success('Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!isAdmin) {
      toast.error('Solo los administradores pueden eliminar usuarios');
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${user.name}?`)) {
      try {
        await deleteUser(user.id);
        toast.success('Usuario eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Error al eliminar usuario');
      }
    }
  };

  const handleViewUser = (user: User) => {
    toast.success(`Viendo detalles de ${user.name}`);
    // Aquí podrías abrir un modal con detalles completos
  };

  const handleEditUser = (user: User) => {
    if (!isAdmin) {
      toast.error('Solo los administradores pueden editar usuarios');
      return;
    }
    setEditingUser(user);
  };

  const handleApprovePendingUser = async (pendingUser: PendingUser) => {
    if (!isAdmin) {
      toast.error('Solo los administradores pueden aprobar usuarios');
      return;
    }

    try {
      await authApi.approvePendingUser(pendingUser.id, currentUser!.id);
      await loadPendingUsers();
      await refreshUsers();
      toast.success(`Usuario ${pendingUser.name} aprobado exitosamente`);
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Error al aprobar usuario');
    }
  };

  const handleRejectPendingUser = async (pendingUser: PendingUser) => {
    if (!isAdmin) {
      toast.error('Solo los administradores pueden rechazar usuarios');
      return;
    }

    setSelectedPendingUser(pendingUser);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedPendingUser || !rejectionReason.trim()) {
      toast.error('Debe proporcionar una razón para el rechazo');
      return;
    }

    try {
      await authApi.rejectPendingUser(selectedPendingUser.id, currentUser!.id, rejectionReason);
      await loadPendingUsers();
      setShowRejectModal(false);
      setSelectedPendingUser(null);
      setRejectionReason('');
      toast.success(`Usuario ${selectedPendingUser.name} rechazado`);
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Error al rechazar usuario');
    }
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

  const getStatusColor = (status: PendingUserStatus) => {
    switch (status) {
      case PendingUserStatus.PENDING:
        return 'warning';
      case PendingUserStatus.APPROVED:
        return 'success';
      case PendingUserStatus.REJECTED:
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: PendingUserStatus) => {
    switch (status) {
      case PendingUserStatus.PENDING:
        return 'Pendiente';
      case PendingUserStatus.APPROVED:
        return 'Aprobado';
      case PendingUserStatus.REJECTED:
        return 'Rechazado';
      default:
        return status;
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
      key: 'status',
      label: 'Estado',
      sortable: true,
      mobile: true,
      render: (user) => (
        <div className="flex items-center space-x-2">
          <Badge variant={user.isActive ? 'success' : 'danger'}>
            {user.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
          {!user.isEmailVerified && (
            <Badge variant="warning" className="text-xs">
              Email no verificado
            </Badge>
          )}
        </div>
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
          {isAdmin && (
            <>
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
            </>
          )}
        </div>
      )
    }
  ];

  const pendingColumns: Column<PendingUser>[] = [
    {
      key: 'user',
      label: 'Solicitante',
      sortable: true,
      mobile: true,
      render: (pendingUser) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-sm">
              {pendingUser.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{pendingUser.name}</div>
            <div className="text-sm text-gray-500">{pendingUser.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'requestedRole',
      label: 'Rol Solicitado',
      sortable: true,
      mobile: true,
      render: (pendingUser) => (
        <Badge variant={getRoleColor(pendingUser.requestedRole)}>
          {getRoleText(pendingUser.requestedRole)}
        </Badge>
      )
    },
    {
      key: 'department',
      label: 'Departamento',
      sortable: true,
      mobile: true,
      render: (pendingUser) => (
        <span className="text-sm text-gray-700">{pendingUser.department}</span>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      mobile: true,
      render: (pendingUser) => (
        <Badge variant={getStatusColor(pendingUser.status)}>
          {getStatusText(pendingUser.status)}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Fecha de Solicitud',
      sortable: true,
      mobile: false,
      render: (pendingUser) => (
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date(pendingUser.createdAt).toLocaleDateString('es-ES')}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      mobile: true,
      render: (pendingUser) => (
        <div className="flex items-center space-x-2">
          {pendingUser.status === PendingUserStatus.PENDING && isAdmin ? (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                onClick={() => handleApprovePendingUser(pendingUser)}
                title="Aprobar usuario"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleRejectPendingUser(pendingUser)}
                title="Rechazar usuario"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="text-sm text-gray-500">
              {pendingUser.status === PendingUserStatus.APPROVED ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <UserCheck className="h-4 w-4" />
                  <span>Aprobado</span>
                </div>
              ) : pendingUser.status === PendingUserStatus.REJECTED ? (
                <div className="flex items-center space-x-1 text-red-600">
                  <UserX className="h-4 w-4" />
                  <span>Rechazado</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-amber-600">
                  <Clock className="h-4 w-4" />
                  <span>Pendiente</span>
                </div>
              )}
            </div>
          )}
        </div>
      )
    }
  ];

  const filterOptions: FilterOption[] = [
    {
      key: 'role',
      label: 'Rol',
      type: 'select',
      options: [
        { value: '', label: 'Todos los roles' },
        { value: UserRole.ADMIN, label: 'Administrador' },
        { value: UserRole.TECHNICIAN, label: 'Técnico' },
      ]
    },
    {
      key: 'department',
      label: 'Departamento',
      type: 'select',
      options: [
        { value: '', label: 'Todos los departamentos' },
        { value: 'TI', label: 'Tecnología de la Información' },
        { value: 'RRHH', label: 'Recursos Humanos' },
        { value: 'Contabilidad', label: 'Contabilidad' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Ventas', label: 'Ventas' },
        { value: 'Operaciones', label: 'Operaciones' },
        { value: 'Legal', label: 'Legal' },
        { value: 'Finanzas', label: 'Finanzas' },
      ]
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: '', label: 'Todos los estados' },
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
      ]
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
                    {isAdmin && (
                      <Button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
                      >
                        <UserPlus className="h-5 w-5" />
                        Nuevo Usuario
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants}>
            <UserStatsCards />
          </motion.div>

          {/* Tabs */}
          {isAdmin && (
            <motion.div variants={itemVariants}>
              <div className="relative bg-gradient-to-r from-gray-50 via-blue-50/30 to-gray-50 p-2 rounded-2xl shadow-lg border border-gray-200/50 backdrop-blur-sm">
                {/* Fondo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-emerald-500/5 to-blue-500/5 rounded-2xl"></div>
                
                <div className="relative flex space-x-2">
                  <motion.button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
                      activeTab === 'users'
                        ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg shadow-blue-500/30 transform scale-105'
                        : 'bg-white/80 text-gray-700 hover:bg-white hover:text-blue-600 hover:shadow-md border border-gray-200/50'
                    }`}
                    whileHover={{ scale: activeTab === 'users' ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Efecto de brillo para pestaña activa */}
                    {activeTab === 'users' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    )}
                    
                    <div className="relative flex items-center justify-center space-x-3">
                      <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                        activeTab === 'users' 
                          ? 'bg-white/20 text-white' 
                          : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                      }`}>
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="font-medium">Usuarios Activos</span>
                      <Badge 
                        variant={activeTab === 'users' ? 'default' : 'primary'} 
                        className={`text-xs font-bold transition-all duration-300 ${
                          activeTab === 'users' 
                            ? 'bg-white/20 text-white border-white/30' 
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {users.length}
                      </Badge>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
                      activeTab === 'pending'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 transform scale-105'
                        : 'bg-white/80 text-gray-700 hover:bg-white hover:text-amber-600 hover:shadow-md border border-gray-200/50'
                    }`}
                    whileHover={{ scale: activeTab === 'pending' ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Efecto de brillo para pestaña activa */}
                    {activeTab === 'pending' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    )}
                    
                    <div className="relative flex items-center justify-center space-x-3">
                      <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                        activeTab === 'pending' 
                          ? 'bg-white/20 text-white' 
                          : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'
                      }`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <span className="font-medium">Solicitudes Pendientes</span>
                      <Badge 
                        variant={activeTab === 'pending' ? 'default' : 'warning'} 
                        className={`text-xs font-bold transition-all duration-300 ${
                          activeTab === 'pending' 
                            ? 'bg-white/20 text-white border-white/30' 
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                      >
                        {pendingUsers.filter(u => u.status === PendingUserStatus.PENDING).length}
                      </Badge>
                    </div>
                  </motion.button>
                </div>
                
                {/* Indicador de pestaña activa */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full"
                  initial={false}
                  animate={{
                    x: activeTab === 'users' ? '8px' : 'calc(50% + 8px)',
                    width: 'calc(50% - 16px)'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </motion.div>
          )}

          {/* Content based on active tab */}
          {activeTab === 'users' ? (
            <>
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

              {/* Users Content */}
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
                        <span className="text-xl font-bold">Usuarios Activos</span>
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
                        {!searchQuery && Object.keys(filterValues).length === 0 && isAdmin && (
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
            </>
          ) : (
            /* Pending Users Content */
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-amber-50/80 border-b border-amber-200/50 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <CardTitle className="flex items-center gap-3 text-gray-900">
                      <motion.div 
                        className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg"
                        animate={{ 
                          boxShadow: [
                            "0 4px 6px -1px rgba(245, 158, 11, 0.3)",
                            "0 10px 15px -3px rgba(245, 158, 11, 0.4)",
                            "0 4px 6px -1px rgba(245, 158, 11, 0.3)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Clock className="h-5 w-5" />
                      </motion.div>
                      <span className="text-xl font-bold">Solicitudes de Registro</span>
                      {pendingUsers.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                          <Badge variant="warning" className="bg-white/90 backdrop-blur-sm text-amber-700 border-amber-200/50 font-medium shadow-sm">
                            {pendingUsers.length} solicitud{pendingUsers.length !== 1 ? 'es' : ''}
                          </Badge>
                        </motion.div>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={loadPendingUsers}
                        disabled={loadingPending}
                        className="px-4 py-2 text-sm font-medium bg-white/90 backdrop-blur-sm border-amber-200/50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all duration-200 shadow-sm rounded-lg hover:shadow-md"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loadingPending ? 'animate-spin' : ''}`} />
                        Actualizar
                      </Button>
                    </div>
                  </motion.div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {loadingPending ? (
                    <div className="flex items-center justify-center h-64">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : pendingUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="p-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay solicitudes pendientes
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Todas las solicitudes han sido procesadas
                      </p>
                    </div>
                  ) : (
                    <div className="p-8">
                      <Table
                        data={pendingUsers}
                        columns={pendingColumns}
                        className="w-full"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
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

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedPendingUser(null);
          setRejectionReason('');
        }}
        title="Rechazar Solicitud"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                ¿Estás seguro de que quieres rechazar la solicitud de {selectedPendingUser?.name}?
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón del rechazo *
            </label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Proporciona una razón para el rechazo..."
              rows={3}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedPendingUser(null);
                setRejectionReason('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar Solicitud
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage; 
