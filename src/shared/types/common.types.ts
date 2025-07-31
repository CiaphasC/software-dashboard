// Tipos base del sistema
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  TECHNICIAN = 'technician',
  REQUESTER = 'requester'
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  priority: Priority;
  status: IncidentStatus;
  affectedArea: string;
  assignedTo?: string;
  createdBy: string;
  estimatedResolutionDate?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  attachments: Attachment[];
  comments: Comment[];
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
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  priority: Priority;
  status: RequirementStatus;
  requestingArea: string;
  assignedTo?: string;
  createdBy: string;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  attachments: Attachment[];
  comments: Comment[];
}

export enum RequirementType {
  DOCUMENT = 'document',
  EQUIPMENT = 'equipment',
  SERVICE = 'service',
  OTHER = 'other'
}

export enum RequirementStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  CLOSED = 'closed'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  isInternal: boolean;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  assignedTo?: string;
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DashboardMetrics {
  totalIncidents: number;
  openIncidents: number;
  inProgressIncidents: number;
  resolvedIncidents: number;
  closedIncidents: number;
  totalRequirements: number;
  pendingRequirements: number;
  deliveredRequirements: number;
  averageResolutionTime: number;
  incidentsByMonth: Array<{
    month: string;
    count: number;
  }>;
  requirementsByMonth: Array<{
    month: string;
    count: number;
  }>;
  topDepartments: Array<{
    department: string;
    count: number;
  }>;
  incidents: Incident[];
  requirements: Requirement[];
  incidentTrend: { value: number; isPositive: boolean };
  openIncidentTrend: { value: number; isPositive: boolean };
  requirementTrend: { value: number; isPositive: boolean };
  pendingRequirementTrend: { value: number; isPositive: boolean };
}

// Tipos para formularios
export interface IncidentFormData {
  title: string;
  description: string;
  type: IncidentType;
  priority: Priority;
  affectedArea: string;
  assignedTo?: string;
  estimatedResolutionDate?: Date;
}

export interface RequirementFormData {
  title: string;
  description: string;
  type: RequirementType;
  priority: Priority;
  requestingArea: string;
  assignedTo?: string;
  estimatedDeliveryDate?: Date;
}

// Tipos para actividades
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
