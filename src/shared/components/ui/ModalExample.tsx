import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Settings, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  User,
  FileText,
  Trash2
} from 'lucide-react';
import { Button } from './Button';
import { 
  Modal, 
  ModalHeader, 
  ModalContent, 
  ModalFooter,
  ModalContainer 
} from './Modal';

// ============================================================================
// EXAMPLE COMPONENTS
// ============================================================================

/**
 * Ejemplo de Modal de Confirmación
 */
export const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning'
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="h-6 w-6 text-white" />,
          glowColor: 'red' as const,
          buttonClass: 'bg-red-500 hover:bg-red-600'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-white" />,
          glowColor: 'orange' as const,
          buttonClass: 'bg-orange-500 hover:bg-orange-600'
        };
      case 'info':
        return {
          icon: <Info className="h-6 w-6 text-white" />,
          glowColor: 'blue' as const,
          buttonClass: 'bg-blue-500 hover:bg-blue-600'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6 text-white" />,
          glowColor: 'emerald' as const,
          buttonClass: 'bg-emerald-500 hover:bg-emerald-600'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" animation="scale">
      <ModalContainer showGlowEffect glowColor={config.glowColor}>
        <ModalHeader
          title={title}
          icon={config.icon}
          onClose={onClose}
        />
        
        <ModalContent>
          <p className="text-gray-600 text-center">{message}</p>
        </ModalContent>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 text-white ${config.buttonClass}`}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};

/**
 * Ejemplo de Modal de Información
 */
export const InfoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" animation="fade">
      <ModalContainer showGlowEffect glowColor="blue">
        <ModalHeader
          title={title}
          icon={<Info className="h-6 w-6 text-white" />}
          onClose={onClose}
        />
        
        <ModalContent>
          {children}
        </ModalContent>

        <ModalFooter>
          <Button onClick={onClose} className="w-full">
            Entendido
          </Button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};

/**
 * Ejemplo de Modal de Formulario Simple
 */
export const SimpleFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'textarea';
    placeholder?: string;
    required?: boolean;
  }>;
}> = ({ isOpen, onClose, onSubmit, title, fields }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" animation="slide">
      <ModalContainer showGlowEffect glowColor="emerald">
        <ModalHeader
          title={title}
          icon={<User className="h-6 w-6 text-white" />}
          onClose={onClose}
        />
        
        <ModalContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                )}
              </div>
            ))}
          </form>
        </ModalContent>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Guardar
          </Button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};

/**
 * Ejemplo de Modal de Configuración
 */
export const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" animation="scale">
      <ModalContainer showGlowEffect glowColor="purple">
        <ModalHeader
          title="Configuración"
          subtitle="Personaliza tu experiencia"
          icon={<Settings className="h-6 w-6 text-white" />}
          onClose={onClose}
        />
        
        <ModalContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias Generales</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Notificaciones por email
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Modo oscuro
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Autoguardado
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacidad</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Compartir datos de uso
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Cookies analíticas
                  </label>
                </div>
              </div>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onClose} className="flex-1">
            Guardar Cambios
          </Button>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};

// ============================================================================
// DEMO COMPONENT
// ============================================================================

/**
 * Componente de demostración que muestra todos los tipos de modales
 */
export const ModalDemo: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalType: string) => setActiveModal(modalType);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Demo de Modales</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button onClick={() => openModal('confirmation')} className="w-full">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Confirmación
        </Button>
        
        <Button onClick={() => openModal('info')} className="w-full">
          <Info className="h-4 w-4 mr-2" />
          Información
        </Button>
        
        <Button onClick={() => openModal('form')} className="w-full">
          <User className="h-4 w-4 mr-2" />
          Formulario
        </Button>
        
        <Button onClick={() => openModal('settings')} className="w-full">
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </Button>
      </div>

      {/* Modales */}
      <ConfirmationModal
        isOpen={activeModal === 'confirmation'}
        onClose={closeModal}
        onConfirm={() => {
          alert('Acción confirmada!');
          closeModal();
        }}
        title="Confirmar Acción"
        message="¿Estás seguro de que quieres realizar esta acción? Esta operación no se puede deshacer."
        type="danger"
        confirmText="Eliminar"
      />

      <InfoModal
        isOpen={activeModal === 'info'}
        onClose={closeModal}
        title="Información Importante"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Este es un ejemplo de modal de información que puede contener cualquier contenido.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tip:</strong> Los modales son completamente reutilizables y personalizables.
            </p>
          </div>
        </div>
      </InfoModal>

      <SimpleFormModal
        isOpen={activeModal === 'form'}
        onClose={closeModal}
        onSubmit={(data) => {
          console.log('Form data:', data);
          alert('Formulario enviado!');
        }}
        title="Nuevo Usuario"
        fields={[
          { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Ingresa tu nombre', required: true },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com', required: true },
          { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Notas adicionales...' }
        ]}
      />

      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={closeModal}
      />
    </div>
  );
};

export default ModalDemo; 