// =============================================================================
// USERS PAGE - Página de gestión de usuarios
// Arquitectura de Software Profesional - Gestión de Usuarios Optimizada
// =============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/shared/store';
import { UsersManagementPanel } from '@/features/users/components/UsersManagementPanel';
import { UserForm } from '@/features/users/components/UserForm';
import { useUsersPage } from '@/features/users/hooks';
import { LoadingScreen } from '@/shared/components/ui/LoadingSpinner';

// =============================================================================
// USERS PAGE - Componente principal
// =============================================================================

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';

  const { 
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
  } = useUsersPage();

  // Skeleton de cabecera para primera carga
  const HeaderSkeleton = (
    <div className="mb-4">
      <div className="h-8 w-56 bg-gray-200 rounded-md animate-pulse" />
      <div className="mt-2 h-4 w-80 bg-gray-100 rounded-md animate-pulse" />
    </div>
  );



  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="h-16 w-16 text-red-500 mx-auto mb-4">❌</div>
          <p className="text-red-600 text-lg font-medium">Error: {error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-indigo-200/40 to-blue-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        <motion.div
          className="space-y-6 sm:space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header (con skeleton) */}
          {loading ? (
            HeaderSkeleton
          ) : (
            <motion.div
            className="text-center py-4 sm:py-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
                    <motion.div 
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
                        <motion.div 
                className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 text-white shadow-2xl relative overflow-hidden"
                whileHover={{ rotate: 3, scale: 1.08 }}
                          animate={{ 
                            boxShadow: [
                    "0 20px 40px rgba(59, 130, 246, 0.4)",
                    "0 20px 40px rgba(99, 102, 241, 0.5)",
                    "0 20px 40px rgba(37, 99, 235, 0.4)",
                    "0 20px 40px rgba(59, 130, 246, 0.4)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Users className="h-8 w-8 sm:h-12 sm:w-12" />
                    </motion.div>
              
              <div className="text-center sm:text-left">
                <motion.h1 
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Gestión de Usuarios
                </motion.h1>
                <motion.p 
                  className="text-lg sm:text-xl text-gray-600"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Administra usuarios del sistema y solicitudes de registro
                </motion.p>
              </div>
            </motion.div>
          )}
        </motion.div>

          {/* Panel de gestión de usuarios */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <UsersManagementPanel
              users={users}
              pendingUsers={pendingUsers}
              loading={loading}
              error={error || undefined}
              onEdit={setEditingUser}
              onDelete={handleDeleteUser}
              onApprove={handleApproveUser}
              onReject={handleRejectUser}
              onNewUser={openForm}
              onRefresh={() => {
                // Fuerza recarga sin bloquear la UI
                import('@/shared/store').then(({ useUsersStore }) => {
                  useUsersStore.getState().setCurrentPage(1);
                  useUsersStore.getState().loadUsers();
                });
              }}
              isAdmin={isAdmin}
            />
          </motion.div>

          {/* Formulario de usuario */}
          <UserForm
            isOpen={showForm}
            user={editingUser || undefined}
            onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
            onCancel={closeForm}
          />
        </motion.div>
          </div>
    </div>
  );
};

export default UsersPage; 
