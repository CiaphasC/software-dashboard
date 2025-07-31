import { useEffect, useRef } from 'react';
import { cleanupActivities } from './useRecentActivities';
import { log } from '@/shared/utils/logger';

export const useCleanup = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Limpiar actividades antiguas cada 24 horas
    const cleanupInterval = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    
    const performCleanup = () => {
      log('Ejecutando limpieza automática de actividades...');
      cleanupActivities();
    };

    // Ejecutar limpieza inicial
    performCleanup();

    // Configurar limpieza periódica
    intervalRef.current = setInterval(performCleanup, cleanupInterval);

    // Cleanup al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return null;
}; 
