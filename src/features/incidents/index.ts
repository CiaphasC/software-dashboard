import React from 'react';

// Barrel export para el feature de incidencias
export { useIncidents } from './hooks/useIncidents';
export { IncidentForm } from './components/IncidentForm';
export type { 
  Incident, 
  IncidentType, 
  IncidentStatus, 
  Priority, 
  IncidentFormData, 
  IncidentFilters,
  Attachment,
  Comment 
} from './types';

// Re-export lazy de la página de incidencias
export const IncidentsPage = React.lazy(() => import('./pages/IncidentsPage')); 
