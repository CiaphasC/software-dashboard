// API de notificaciones - Extraída del api.ts monolítico
import { Notification } from '@/shared/types/common.types';

// Simulación de base de datos en memoria
let notifications: Notification[] = [];

// Generar notificaciones de ejemplo
const generateMockNotifications = (): Notification[] => [
  {
    id: '1',
    userId: 'admin',
    title: 'Nueva incidencia reportada',
    message: 'Se ha reportado una nueva incidencia en el sistema de facturación',
    type: 'incident',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
    priority: 'high'
  },
  {
    id: '2',
    userId: 'admin',
    title: 'Requerimiento completado',
    message: 'El requerimiento #REQ-2024-001 ha sido marcado como completado',
    type: 'requirement',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
    priority: 'medium'
  },
  {
    id: '3',
    userId: 'tecnico',
    title: 'Asignación de incidencia',
    message: 'Se te ha asignado la incidencia #INC-2024-015',
    type: 'assignment',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 horas atrás
    priority: 'high'
  },
  {
    id: '4',
    userId: 'solicitante',
    title: 'Actualización de sistema',
    message: 'El sistema será actualizado mañana a las 2:00 AM',
    type: 'system',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 horas atrás
    priority: 'low'
  },
  {
    id: '5',
    userId: 'admin',
    title: 'Reporte semanal disponible',
    message: 'El reporte semanal de incidencias está listo para revisión',
    type: 'report',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
    priority: 'medium'
  }
];

// Inicializar notificaciones
export const initializeNotifications = () => {
  if (notifications.length === 0) {
    notifications = generateMockNotifications();
  }
};

export const notificationsApi = {
  // Obtener notificaciones de un usuario
  async getNotifications(userId: string): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (notifications.length === 0) {
      initializeNotifications();
    }
    
    return notifications.filter(n => n.userId === userId);
  },

  // Obtener notificaciones no leídas
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const userNotifications = await this.getNotifications(userId);
    return userNotifications.filter(n => !n.isRead);
  },

  // Marcar notificación como leída
  async markAsRead(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    notifications.forEach(n => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
      }
    });
  },

  // Crear nueva notificación
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const newNotification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    
    notifications.unshift(newNotification);
    
    return newNotification;
  },

  // Eliminar notificación
  async deleteNotification(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.splice(index, 1);
    }
  },

  // Obtener contador de notificaciones no leídas
  async getUnreadCount(userId: string): Promise<number> {
    const unreadNotifications = await this.getUnreadNotifications(userId);
    return unreadNotifications.length;
  },

  // Obtener notificaciones por tipo
  async getNotificationsByType(userId: string, type: string): Promise<Notification[]> {
    const userNotifications = await this.getNotifications(userId);
    return userNotifications.filter(n => n.type === type);
  },

  // Obtener notificaciones por prioridad
  async getNotificationsByPriority(userId: string, priority: string): Promise<Notification[]> {
    const userNotifications = await this.getNotifications(userId);
    return userNotifications.filter(n => n.priority === priority);
  },

  // Limpiar notificaciones antiguas (más de 30 días)
  async cleanupOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    notifications = notifications.filter(n => n.createdAt > thirtyDaysAgo);
  }
}; 