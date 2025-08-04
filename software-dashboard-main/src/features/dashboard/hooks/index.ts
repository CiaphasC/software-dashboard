/**
 * Índice principal de hooks del dashboard
 * 
 * Este archivo centraliza todas las exportaciones de hooks del dashboard,
 * organizados por categoría para facilitar las importaciones.
 * 
 * Estructura:
 * - pages/: Hooks utilizados por las páginas del dashboard
 * - components/: Hooks utilizados por los componentes del dashboard
 */

// Hooks para páginas
export * from './pages';

// Hooks para componentes
export * from './components';

// Hooks principales (movidos desde components para evitar duplicación)
export { useDashboardMetrics } from './useDashboardMetrics';
// export { useRecentActivitiesDashboard } from './useRecentActivitiesDashboard'; 