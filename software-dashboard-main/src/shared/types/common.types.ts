// =============================================================================
// COMMON TYPES - Tipos unificados para la aplicación
// Arquitectura de Software Profesional - Tipos compatibles con Supabase
// =============================================================================

// =============================================================================
// DATE TYPES - Tipos para manejo seguro de fechas
// =============================================================================

export type DateOrString = Date | string | null | undefined;

export interface DateRange {
  start: DateOrString;
  end: DateOrString;
}

// =============================================================================
// UTILITY TYPES - Tipos de utilidad
// =============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// =============================================================================
// ENUMS - Enumeraciones del sistema
// =============================================================================

export enum UserRole {
  ADMIN = 'admin',
  TECHNICIAN = 'technician',
  REQUESTER = 'requester'
}

export enum IncidentType {
  TECHNICAL = 'technical',
  SOFTWARE = 'software',
  HARDWARE = 'hardware',
  NETWORK = 'network',
  OTHER = 'other'
}

export enum IncidentStatus {
  OPEN = 'open',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELIVERED = 'delivered',
  CLOSED = 'closed'
}

export enum RequirementType {
  DOCUMENT = 'document',
  EQUIPMENT = 'equipment',
  ACCESS = 'access',
  TRAINING = 'training',
  SERVICE = 'service',
  OTHER = 'other'
}

export enum RequirementStatus {
  OPEN = 'open',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELIVERED = 'delivered',
  CLOSED = 'closed'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum PendingUserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// =============================================================================
// USER TYPES - Tipos de usuario compatibles con Supabase
// =============================================================================

// Tipo base de usuario que coincide con la estructura de Supabase
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}

// Tipo para usuarios pendientes que coincide con registration_requests
export interface PendingUser {
  id: string;
  name: string;
  email: string;
  password: string;
  department: string;
  requestedRole: UserRole;
  status: PendingUserStatus;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

// =============================================================================
// INCIDENT TYPES - Tipos de incidencias compatibles con Supabase
// =============================================================================

// Eliminado: La interfaz Incident se unifica al dominio `IncidentDomain` en `shared/domain/incident`.
// Mantener solo enums y tipos compartidos relacionados fuera de este bloque si existieran.

// =============================================================================
// REQUIREMENT TYPES - Tipos de requerimientos compatibles con Supabase
// =============================================================================

export interface Requirement {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  priority: Priority;
  status: RequirementStatus;
  requestingArea: string;
  requestedBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: DateOrString;
  estimatedDeliveryDate?: DateOrString;
  comments?: string;
}

// =============================================================================
// ACTIVITY TYPES - Tipos de actividades
// =============================================================================

export interface Activity {
  id: string;
  type: 'incident' | 'requirement';
  action: 'created' | 'updated' | 'resolved' | 'closed' | 'delivered';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  itemId: string;
}

// =============================================================================
// DASHBOARD TYPES - Tipos del dashboard
// =============================================================================

export interface DashboardMetrics {
  totalIncidents: number;
  openIncidents: number;
  inProgressIncidents: number;
  resolvedIncidents: number;
  closedIncidents: number;
  totalRequirements: number;
  pendingRequirements: number;
  deliveredRequirements: number;
  pendingRegistrations: number;
  totalUsers: number;
  averageResolutionTime: number;
  topDepartments: Array<{ department: string; count: number }>;
  incidentsByMonth?: Array<{ month: string; count: number }>;
  incidentTrend?: number | { value: number; direction: 'up' | 'down' };
  openIncidentTrend?: number | { value: number; direction: 'up' | 'down' };
  requirementTrend?: number | { value: number; direction: 'up' | 'down' };
  userActivity: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  incidents: number;
  requirements: number;
}

// =============================================================================
// FILTER TYPES - Tipos para filtros
// =============================================================================

export interface FilterValues {
  [key: string]: string | number | Date | undefined;
  status?: IncidentStatus | RequirementStatus;
  priority?: Priority;
  type?: IncidentType | RequirementType;
  department?: string;
  assignedTo?: string;
  dateRange?: DateRange;
  search?: string;
  role?: string;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

// =============================================================================
// REPORT TYPES - Tipos para reportes
// =============================================================================

export interface ReportConfig {
  title: string;
  type: 'incidents' | 'requirements' | 'performance' | 'custom';
  dateRange: DateRange;
  format: 'pdf' | 'excel' | 'csv';
  filters?: FilterValues;
}

export interface ReportData {
  incidents?: Incident[];
  requirements?: Requirement[];
  metrics?: DashboardMetrics;
  generatedAt: Date;
  generatedBy: string;
}

// =============================================================================
// API TYPES - Tipos para API
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =============================================================================
// NOTIFICATION TYPES - Tipos para notificaciones
// =============================================================================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// =============================================================================
// SETTINGS TYPES - Tipos para configuración
// =============================================================================

export interface SystemConfig {
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    colorScheme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    dataView?: 'grid' | 'list' | 'table';
    sidebarCollapsed?: boolean;
    compactMode?: boolean;
    animations?: boolean;
  };
  general: {
    language: 'es' | 'en';
    timezone: string;
    dateFormat: string;
    currency: string;
    companyName?: string;
    address?: string;
    phone?: string;
    website?: string;
    email?: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    incidentAlerts?: boolean;
    requirementUpdates?: boolean;
    weeklyReports?: boolean;
    dailyDigest?: boolean;
  };
  dashboard: {
    autoRefresh: boolean;
    refreshInterval: number;
    showCharts: boolean;
    showMetrics: boolean;
  };
  security: {
    sessionTimeout: number;
    requireMFA: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    passwordExpiry?: number;
    maxLoginAttempts?: number;
    twoFactorAuth?: boolean;
    requireSpecialChars?: boolean;
    autoLogout?: boolean;
  };
  system?: {
    version?: string;
    maintenanceMode?: boolean;
    lastUpdate?: Date;
    databaseSize?: string;
    backupFrequency?: string;
  };
}

// =============================================================================
// AREA TYPES - Tipos para áreas/departamentos
// =============================================================================

export interface Area {
  id: string;
  name: string;
  code: string;
  description?: string;
  manager?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// TYPE MAPPING FUNCTIONS - Funciones para mapear entre tipos
// =============================================================================

// Función para convertir ProfileWithRole de Supabase a User de la aplicación
export function mapProfileToUser(profile: any): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role_name as UserRole,
    department: profile.department_short_name || profile.department_name || 'Sin departamento',
    avatar: profile.avatar_url || undefined,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at),
    isActive: profile.is_active,
    isEmailVerified: profile.is_email_verified,
    lastLoginAt: profile.last_login_at ? new Date(profile.last_login_at) : undefined
  };
}

// Función para convertir RegistrationRequestWithAdmin de Supabase a PendingUser de la aplicación
export function mapRegistrationRequestToPendingUser(request: any): PendingUser {
  return {
    id: request.id,
    name: request.name,
    email: request.email,
    password: '', // No incluimos la contraseña por seguridad
    department: request.department_name || 'Sin departamento',
    requestedRole: request.requested_role as UserRole,
    status: request.status as PendingUserStatus,
    createdAt: new Date(request.created_at),
    approvedBy: request.approved_by || undefined,
    approvedAt: request.approved_at ? new Date(request.approved_at) : undefined,
    rejectionReason: request.rejection_reason || undefined
  };
}

// =============================================================================
// TYPE EXPORTS - Exportaciones de tipos
// =============================================================================

// Los tipos ya están exportados individualmente arriba
