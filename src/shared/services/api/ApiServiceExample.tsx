// =============================================================================
// API SERVICE EXAMPLE - Ejemplo de uso del servicio API
// Arquitectura de Software Profesional - Demostración de Reactividad
// =============================================================================

import React, { useEffect } from 'react';
import { useApiService, useAutoRefreshApi, useFormApi } from '../../hooks/useApiService';

// =============================================================================
// EXAMPLE COMPONENT - Componente de ejemplo
// =============================================================================

/**
 * Componente de ejemplo que demuestra el uso del ApiService
 * con reactividad y actualización automática
 */
export const ApiServiceExample: React.FC = () => {
  // =============================================================================
  // HOOKS - Uso de hooks especializados
  // =============================================================================

  // Hook básico para peticiones manuales
  const basicApi = useApiService({
    onSuccess: (data) => console.log('Datos cargados:', data),
    onError: (error) => console.error('Error en API:', error),
    onConnectionChange: (status) => console.log('Estado de conexión:', status)
  });

  // Hook para datos que se actualizan automáticamente
  const autoRefreshApi = useAutoRefreshApi('/dashboard/metrics', {
    refreshInterval: 10000, // Actualizar cada 10 segundos
    onSuccess: (data) => console.log('Métricas actualizadas:', data)
  });

  // Hook especializado para formularios
  const formApi = useFormApi({
    onSuccess: (data) => {
      console.log('Formulario enviado exitosamente:', data);
      // Aquí podrías mostrar una notificación de éxito
    },
    onError: (error) => {
      console.error('Error al enviar formulario:', error);
      // Aquí podrías mostrar una notificación de error
    }
  });

  // =============================================================================
  // EFFECTS - Efectos para demostrar funcionalidad
  // =============================================================================

  useEffect(() => {
    // Ejemplo de petición GET manual
    const loadData = async () => {
      try {
        const response = await basicApi.get('/users');
        console.log('Usuarios cargados:', response.data);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    };

    loadData();
  }, [basicApi]);

  // =============================================================================
  // HANDLERS - Manejadores de eventos
  // =============================================================================

  const handleCreateUser = async () => {
    const userData = {
      name: 'Usuario Ejemplo',
      email: 'ejemplo@test.com',
      role: 'user'
    };

    try {
      const response = await basicApi.post('/users', userData);
      console.log('Usuario creado:', response.data);
      
      // Invalidar caché para forzar actualización
      basicApi.invalidateEndpoint('/users');
    } catch (error) {
      console.error('Error al crear usuario:', error);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    const updateData = {
      name: 'Usuario Actualizado',
      email: 'actualizado@test.com'
    };

    try {
      const response = await basicApi.put(`/users/${userId}`, updateData);
      console.log('Usuario actualizado:', response.data);
      
      // Invalidar caché específico
      basicApi.invalidateEndpoint('/users');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await basicApi.delete(`/users/${userId}`);
      console.log('Usuario eliminado:', response.data);
      
      // Invalidar caché
      basicApi.invalidateEndpoint('/users');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    await formApi.submitForm('/users', formData);
  };

  // =============================================================================
  // RENDER - Renderizado del componente
  // =============================================================================

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Ejemplo de ApiService con Reactividad
      </h2>

      {/* Estado de conexión */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Estado de Conexión</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            basicApi.connectionStatus === 'connected' ? 'bg-green-500' :
            basicApi.connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="capitalize">{basicApi.connectionStatus}</span>
        </div>
      </div>

      {/* Estado de carga */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Estado de Carga</h3>
        <div className="flex items-center space-x-2">
          {basicApi.loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          )}
          <span>{basicApi.loading ? 'Cargando...' : 'Listo'}</span>
        </div>
      </div>

      {/* Errores */}
      {basicApi.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{basicApi.error.message}</p>
        </div>
      )}

      {/* Datos */}
      {basicApi.data && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Datos Cargados</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(basicApi.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Botones de ejemplo */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Acciones de Ejemplo</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Crear Usuario
          </button>
          
          <button
            onClick={() => handleUpdateUser('123')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Actualizar Usuario
          </button>
          
          <button
            onClick={() => handleDeleteUser('123')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Eliminar Usuario
          </button>
          
          <button
            onClick={() => basicApi.invalidateCache()}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            Limpiar Caché
          </button>
        </div>
      </div>

      {/* Auto-refresh status */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Auto-Refresh (Métricas)</h3>
        <div className="space-y-2">
          <p>Estado: {autoRefreshApi.loading ? 'Actualizando...' : 'Actualizado'}</p>
          <p>Última actualización: {autoRefreshApi.data ? new Date().toLocaleTimeString() : 'Nunca'}</p>
          {autoRefreshApi.data && (
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(autoRefreshApi.data, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* Form status */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Estado del Formulario</h3>
        <div className="space-y-2">
          <p>Enviando: {formApi.isSubmitting ? 'Sí' : 'No'}</p>
          <p>Éxito: {formApi.submitSuccess ? 'Sí' : 'No'}</p>
          {formApi.submitError && (
            <p className="text-red-600">Error: {formApi.submitError.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// EXPORT - Exportación del componente
// =============================================================================

export default ApiServiceExample; 