import { useState, useEffect, useRef } from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { Incident, Requirement } from '@/shared/types/common.types';

export interface RecentActivity {
  id: string;
  type: 'incident' | 'requirement';
  action: 'created' | 'updated' | 'resolved' | 'closed';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  itemId: string;
}

// Singleton para el stream de actividades usando RxJS
class ActivityStreamService {
  private activitiesSubject = new BehaviorSubject<RecentActivity[]>([]);
  private activities: RecentActivity[] = [];
  private maxActivities = 50; // Límite para evitar memory leaks

  // Observable público para suscribirse a cambios
  public activities$ = this.activitiesSubject.asObservable().pipe(
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    debounceTime(100) // Evitar demasiadas actualizaciones
  );

  // Observable para las últimas 3 actividades (dashboard)
  public recentActivities$ = this.activities$.pipe(
    map(activities => activities.slice(0, 3))
  );

  // Observable para todas las actividades (vista completa)
  public allActivities$ = this.activities$.pipe(
    map(activities => activities)
  );

  public addActivity(activity: RecentActivity) {
    // Verificar si ya existe una actividad con el mismo ID
    const existingActivity = this.activities.find(a => a.id === activity.id);
    if (existingActivity) {
      console.log('Actividad duplicada detectada, saltando:', activity.id);
      return;
    }
    
    console.log('Agregando actividad:', activity);
    this.activities.unshift(activity);
    
    // Mantener solo las últimas maxActivities para evitar memory leaks
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(0, this.maxActivities);
    }
    
    console.log('Total actividades en stream:', this.activities.length);
    // Emitir nueva lista
    this.activitiesSubject.next([...this.activities]);
  }

  // Métodos para agregar actividades específicas
  incidentCreated(incident: Incident, user: string) {
    this.addActivity({
      id: `incident-created-${incident.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'incident',
      action: 'created',
      title: 'Nueva incidencia reportada',
      description: incident.title,
      timestamp: incident.createdAt,
      user,
      itemId: incident.id,
    });
  }

  incidentUpdated(incident: Incident, user: string) {
    this.addActivity({
      id: `incident-updated-${incident.id}-${Date.now()}`,
      type: 'incident',
      action: 'updated',
      title: 'Incidencia actualizada',
      description: incident.title,
      timestamp: incident.updatedAt,
      user,
      itemId: incident.id,
    });
  }

  incidentResolved(incident: Incident, user: string) {
    this.addActivity({
      id: `incident-resolved-${incident.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'incident',
      action: 'resolved',
      title: 'Incidencia resuelta',
      description: incident.title,
      timestamp: incident.resolvedAt || incident.updatedAt,
      user,
      itemId: incident.id,
    });
  }

  requirementCreated(requirement: Requirement, user: string) {
    this.addActivity({
      id: `requirement-created-${requirement.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'requirement',
      action: 'created',
      title: 'Nuevo requerimiento solicitado',
      description: requirement.title,
      timestamp: requirement.createdAt,
      user,
      itemId: requirement.id,
    });
  }

  requirementDelivered(requirement: Requirement, user: string) {
    this.addActivity({
      id: `requirement-delivered-${requirement.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'requirement',
      action: 'resolved',
      title: 'Requerimiento entregado',
      description: requirement.title,
      timestamp: requirement.deliveredAt || requirement.updatedAt,
      user,
      itemId: requirement.id,
    });
  }

  // Método para limpiar actividades antiguas (evitar memory leaks)
  cleanupOldActivities(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    this.activities = this.activities.filter(
      activity => activity.timestamp > cutoffDate
    );
    
    this.activitiesSubject.next([...this.activities]);
  }

  // Método para obtener el estado actual
  getCurrentActivities(): RecentActivity[] {
    return [...this.activities];
  }

  // Método para destruir el servicio (cleanup)
  destroy() {
    this.activitiesSubject.complete();
    this.activities = [];
  }
}

// Instancia global del servicio
export const activityStreamService = new ActivityStreamService();

// Hook para actividades recientes (dashboard - solo 3)
export const useRecentActivities = () => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    // Suscribirse solo a las últimas 3 actividades
    subscriptionRef.current = activityStreamService.recentActivities$.subscribe({
      next: (recentActivities) => {
        setActivities(recentActivities);
      },
      error: (error) => {
        console.error('Error en stream de actividades recientes:', error);
      }
    });

    // Cleanup al desmontar
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  return activities;
};

// Hook para todas las actividades (vista completa)
export const useAllActivities = () => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    console.log('useAllActivities: Suscribiéndose al stream...');
    // Suscribirse a todas las actividades
    subscriptionRef.current = activityStreamService.allActivities$.subscribe({
      next: (allActivities) => {
        console.log('useAllActivities: Recibidas actividades:', allActivities.length);
        setActivities(allActivities);
        setLoading(false);
      },
      error: (error) => {
        console.error('Error en stream de todas las actividades:', error);
        setLoading(false);
      }
    });

    // Cleanup al desmontar
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  return { activities, loading };
};

// Variable para evitar generar actividades duplicadas
let hasInitialized = false;

// Función para generar actividades iniciales basadas en datos existentes
export const generateInitialActivities = (
  incidents: Incident[], 
  requirements: Requirement[]
) => {
  // Evitar generar actividades duplicadas
  if (hasInitialized) {
    console.log('Actividades ya inicializadas, saltando...');
    return [];
  }
  
  console.log('Generando actividades iniciales...');
  console.log('Incidencias recibidas:', incidents.length);
  console.log('Requerimientos recibidos:', requirements.length);
  
  const activities: RecentActivity[] = [];

  // Agregar actividades de incidencias
  incidents.forEach((incident, index) => {
    activities.push({
      id: `incident-created-${incident.id}-${incident.createdAt.getTime()}-${index}`,
      type: 'incident',
      action: 'created',
      title: 'Nueva incidencia reportada',
      description: incident.title,
      timestamp: incident.createdAt,
      user: 'Usuario',
      itemId: incident.id,
    });

    if (incident.status === 'resolved' && incident.resolvedAt) {
      activities.push({
        id: `incident-resolved-${incident.id}-${incident.resolvedAt.getTime()}-${index}`,
        type: 'incident',
        action: 'resolved',
        title: 'Incidencia resuelta',
        description: incident.title,
        timestamp: incident.resolvedAt,
        user: 'Técnico',
        itemId: incident.id,
      });
    }
  });

  // Agregar actividades de requerimientos
  requirements.forEach((requirement, index) => {
    activities.push({
      id: `requirement-created-${requirement.id}-${requirement.createdAt.getTime()}-${index}`,
      type: 'requirement',
      action: 'created',
      title: 'Nuevo requerimiento solicitado',
      description: requirement.title,
      timestamp: requirement.createdAt,
      user: 'Usuario',
      itemId: requirement.id,
    });

    if (requirement.status === 'delivered' && requirement.deliveredAt) {
      activities.push({
        id: `requirement-delivered-${requirement.id}-${requirement.deliveredAt.getTime()}-${index}`,
        type: 'requirement',
        action: 'resolved',
        title: 'Requerimiento entregado',
        description: requirement.title,
        timestamp: requirement.deliveredAt,
        user: 'Técnico',
        itemId: requirement.id,
      });
    }
  });

  // Ordenar por timestamp y agregar al stream
  const sortedActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 20); // Solo las 20 más recientes para inicialización

  console.log('Actividades generadas:', sortedActivities.length);
  console.log('Actividades:', sortedActivities);

  // Agregar al stream de manera optimizada
  sortedActivities.forEach(activity => {
    activityStreamService.addActivity(activity);
  });

  console.log('Actividades agregadas al stream');
  hasInitialized = true; // Marcar como inicializado
  return sortedActivities;
};

// Función para limpiar actividades antiguas (llamar periódicamente)
export const cleanupActivities = () => {
  activityStreamService.cleanupOldActivities(30); // Mantener solo 30 días
};

// Función para resetear el estado de inicialización (útil para testing)
export const resetInitialization = () => {
  hasInitialized = false;
  activityStreamService.destroy();
  // Recrear el servicio
  Object.assign(activityStreamService, new ActivityStreamService());
}; 
