import React from 'react';
import { useReactiveData, ReactiveIndicator } from '@/shared/reactive';
import { incidentsApi, requirementsApi } from '@/shared/services';

// Ejemplo 1: Vista de Incidencias con Reactividad
export const ReactiveIncidentsExample: React.FC = () => {
  const { data: incidents, loading, error } = useReactiveData(
    () => incidentsApi.getIncidents(),
    {
      autoRefresh: true,
      refreshInterval: 15000, // 15 segundos
      realTime: true,
      onSuccess: (data) => console.log('Incidencias actualizadas:', data),
      onError: (err) => console.error('Error en incidencias:', err)
    }
  );

  return (
    <div>
      <h2>Incidencias Reactivas</h2>
      <ReactiveIndicator showStatus={true} showLastUpdated={true} />
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {incidents && (
        <div>
          {incidents.map(incident => (
            <div key={incident.id}>{incident.title}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// Ejemplo 2: Vista de Requerimientos con Reactividad
export const ReactiveRequirementsExample: React.FC = () => {
  const { data: requirements, loading, error } = useReactiveData(
    () => requirementsApi.getRequirements(),
    {
      autoRefresh: false, // Sin auto-refresh
      realTime: false,
      onSuccess: (data) => console.log('Requerimientos cargados:', data)
    }
  );

  return (
    <div>
      <h2>Requerimientos</h2>
      <ReactiveIndicator showStatus={false} showLastUpdated={true} />
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {requirements && (
        <div>
          {requirements.map(req => (
            <div key={req.id}>{req.title}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// Ejemplo 3: Vista con múltiples streams reactivos
export const ReactiveMultiStreamExample: React.FC = () => {
  const incidentsStream = useReactiveData(
    () => incidentsApi.getIncidents(),
    { autoRefresh: true, refreshInterval: 10000 }
  );

  const requirementsStream = useReactiveData(
    () => requirementsApi.getRequirements(),
    { autoRefresh: true, refreshInterval: 20000 }
  );

  return (
    <div>
      <h2>Vista Multi-Stream</h2>
      <ReactiveIndicator showStatus={true} showLastUpdated={true} />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3>Incidencias ({incidentsStream.data?.length || 0})</h3>
          {incidentsStream.loading && <p>Cargando incidencias...</p>}
        </div>
        
        <div>
          <h3>Requerimientos ({requirementsStream.data?.length || 0})</h3>
          {requirementsStream.loading && <p>Cargando requerimientos...</p>}
        </div>
      </div>
    </div>
  );
};

// Ejemplo 4: Configuración personalizada de reactividad
export const ReactiveCustomConfigExample: React.FC = () => {
  const { data, loading, error } = useReactiveData(
    () => incidentsApi.getIncidents(),
    {
      autoRefresh: true,
      refreshInterval: 5000, // 5 segundos - muy frecuente
      realTime: true,
      onSuccess: (data) => {
        console.log('Datos actualizados cada 5 segundos:', data);
      },
      onError: (err) => {
        console.error('Error en stream rápido:', err);
      }
    }
  );

  return (
    <div>
      <h2>Stream Rápido (5s)</h2>
      <ReactiveIndicator 
        showStatus={true} 
        showLastUpdated={true}
        className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full"
      />
      {loading && <p>Actualizando...</p>}
      {error && <p>Error: {error}</p>}
      {data && <p>Total: {data.length} elementos</p>}
    </div>
  );
}; 