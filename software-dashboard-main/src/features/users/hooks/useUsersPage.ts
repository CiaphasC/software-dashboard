// =============================================================================
// USE USERS PAGE HOOK - Hook para la página de usuarios
// Arquitectura de Software Profesional - Gestión de Estado de Usuarios
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore, useUsersStore } from '@/shared/store';
import { authService } from '@/shared/services/supabase';
import { User, PendingUser } from '@/shared/types/common.types';
import { useComponentRefresh } from '@/shared/hooks/useCentralizedRefresh.tsx';

// =============================================================================
// USE USERS PAGE - Hook principal
// =============================================================================

export const useUsersPage = () => {
  // =============================================================================
  // STORES - Stores de la aplicación
  // =============================================================================

  const { user: currentUser, updatePendingUsersCount } = useAuthStore();
  const { 
    users, 
    loading, 
    error, 
    loadUsers, 
    createUser, 
    updateUser, 
    deleteUser 
  } = useUsersStore();

  // =============================================================================
  // LOCAL STATE - Estado local del componente
  // =============================================================================

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

  // =============================================================================
  // EFFECTS - Efectos para manejo de formulario
  // =============================================================================

  // Abrir formulario automáticamente cuando se establece un usuario para editar
  useEffect(() => {
    if (editingUser) {
      setShowForm(true);
    }
  }, [editingUser]);

  // =============================================================================
  // REFRESH - Sistema de refresh optimizado
  // =============================================================================

  const { manualRefresh } = useComponentRefresh({
    type: 'users-list',
    enabled: true,
    interval: 30000 // 30 segundos
  });

  // =============================================================================
  // EFFECTS - Efectos para carga de datos
  // =============================================================================

  useEffect(() => {
    // Cargar usuarios para todos los usuarios autenticados
    loadUsers();
    
    // Solo cargar usuarios pendientes si es admin
    if (currentUser?.role === 'admin') {
      loadPendingUsers();
    }
  }, [currentUser, loadUsers]);

  // =============================================================================
  // FUNCTIONS - Funciones de manejo de datos
  // =============================================================================

  const loadPendingUsers = useCallback(async () => {
    try {
      const requests = await authService.getPendingRegistrationRequests();
      const pendingUsers = requests.map(request => ({
        id: request.id,
        name: request.name,
        email: request.email,
        requestedRole: request.requested_role,
        department: request.department_name,
        status: request.status,
        createdAt: request.created_at,
        adminName: request.admin_name
      }));
      setPendingUsers(pendingUsers);
    } catch (error) {
      console.error('Error cargando usuarios pendientes:', error);
    }
  }, []);

  // =============================================================================
  // FORM HANDLERS - Manejadores del formulario
  // =============================================================================

  const openForm = useCallback(() => {
    setEditingUser(null);
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingUser(null);
  }, []);

  // =============================================================================
  // USER HANDLERS - Manejadores de usuarios
  // =============================================================================

  const handleCreateUser = useCallback(async (userData: any) => {
    try {
      await createUser(userData);
      toast.success('Usuario creado exitosamente');
      closeForm();
      manualRefresh();
    } catch (error) {
      console.error('Error creando usuario:', error);
      toast.error('Error creando usuario');
    }
  }, [createUser, closeForm, manualRefresh]);

  const handleUpdateUser = useCallback(async (userData: any) => {
    if (!editingUser) return;
    
    try {
      await updateUser(editingUser.id, userData);
      toast.success('Usuario actualizado exitosamente');
      closeForm();
      manualRefresh();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      toast.error('Error actualizando usuario');
    }
  }, [editingUser, updateUser, closeForm, manualRefresh]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success('Usuario eliminado exitosamente');
      manualRefresh();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      toast.error('Error eliminando usuario');
    }
  }, [deleteUser, manualRefresh]);

  // =============================================================================
  // PENDING USERS HANDLERS - Manejadores de usuarios pendientes
  // =============================================================================

  const handleApproveUser = useCallback(async (requestId: string) => {
    if (!currentUser) return;
    
    try {
      await authService.approveRegistrationRequest(requestId, currentUser.id);
      toast.success('Usuario aprobado exitosamente');
      loadPendingUsers();
      updatePendingUsersCount();
      manualRefresh();
    } catch (error) {
      console.error('Error aprobando usuario:', error);
      toast.error('Error aprobando usuario');
    }
  }, [currentUser, loadPendingUsers, updatePendingUsersCount, manualRefresh]);

  const handleRejectUser = useCallback(async (requestId: string, reason: string) => {
    if (!currentUser) return;
    
    try {
      await authService.rejectRegistrationRequest(requestId, currentUser.id, reason);
      toast.success('Solicitud rechazada exitosamente');
      loadPendingUsers();
      updatePendingUsersCount();
      manualRefresh();
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      toast.error('Error rechazando solicitud');
    }
  }, [currentUser, loadPendingUsers, updatePendingUsersCount, manualRefresh]);

  // =============================================================================
  // RETURN VALUES - Valores retornados por el hook
  // =============================================================================

  return {
    users,
    pendingUsers,
    loading,
    error,
    showForm,
    editingUser,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleApproveUser,
    handleRejectUser,
    openForm,
    closeForm,
    setEditingUser
  };
}; 