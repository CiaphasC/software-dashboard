// =============================================================================
// PENDING USERS LIST - Componente de lista de usuarios pendientes
// Arquitectura de Software Profesional - Gestión de Usuarios
// =============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  UserPlus, 
  Check, 
  X, 
  AlertTriangle,
  Calendar,
  Mail,
  Building,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Modal, ModalContent, ModalHeader, ModalFooter } from '@/shared/components/ui/Modal';
import { Textarea } from '@/shared/components/ui/Textarea';
import { ViewToggle } from '@/features/users/components/ViewToggle';
import { PendingUser } from '@/shared/types/common.types';

// =============================================================================
// TYPES - Tipos para el componente
// =============================================================================

interface PendingUsersListProps {
  pendingUsers: PendingUser[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
}

// =============================================================================
// UTILITY FUNCTIONS - Funciones de utilidad
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
// PENDING USERS LIST - Componente principal
// =============================================================================

export const PendingUsersList: React.FC<PendingUsersListProps> = ({
  pendingUsers,
  onApprove,
  onReject
}) => {
  // =============================================================================
  // STATE - Estado local del componente
  // =============================================================================

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [rejectModal, setRejectModal] = useState<{ open: boolean; requestId: string | null; reason: string }>({
    open: false,
    requestId: null,
    reason: ''
  });

  // =============================================================================
  // HANDLERS - Manejadores de eventos
  // =============================================================================

  const handleReject = (requestId: string) => {
    setRejectModal({ open: true, requestId, reason: '' });
  };

  const handleConfirmReject = () => {
    if (rejectModal.requestId && rejectModal.reason.trim()) {
      onReject(rejectModal.requestId, rejectModal.reason);
      setRejectModal({ open: false, requestId: null, reason: '' });
    }
  };

  const handleCancelReject = () => {
    setRejectModal({ open: false, requestId: null, reason: '' });
  };

  // =============================================================================
  // RENDER - Renderizado del componente
  // =============================================================================

  if (pendingUsers.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Controles de vista */}
        <div className="flex items-center justify-end">
          <ViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Contenido */}
        <AnimatePresence mode="wait">
          {viewMode === 'cards' ? (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {pendingUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <UserPlus className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {user.name}
                            </CardTitle>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <Badge className={getRoleColor(user.requestedRole)}>
                          {getRoleText(user.requestedRole)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        <span>{user.department}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Solicitado: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Shield className="h-4 w-4" />
                        <span>Estado: {user.status}</span>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                        <Button
                          size="sm"
                          onClick={() => onApprove(user.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Usuario</th>
                      <th className="px-6 py-3">Rol Solicitado</th>
                      <th className="px-6 py-3">Departamento</th>
                      <th className="px-6 py-3">Fecha de Solicitud</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-semibold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getRoleColor(user.requestedRole)}>
                            {getRoleText(user.requestedRole)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">{user.department}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => onApprove(user.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de rechazo */}
      <Modal isOpen={rejectModal.open} onClose={handleCancelReject}>
        <ModalContent>
          <ModalHeader title="Rechazar Solicitud" />
          
          <div className="p-6">
            <Textarea
              placeholder="Escribe la razón del rechazo..."
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full"
              rows={4}
            />
          </div>
          
          <ModalFooter>
            <Button variant="outline" onClick={handleCancelReject}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmReject}
              disabled={!rejectModal.reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Rechazar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}; 