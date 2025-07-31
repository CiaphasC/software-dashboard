// Tipos específicos para el feature de incidencias
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
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentFormData {
  title: string;
  description: string;
  type: IncidentType;
  priority: Priority;
  affectedArea: string;
  assignedTo?: string;
}

export interface IncidentFilters {
  status?: IncidentStatus;
  priority?: Priority;
  type?: IncidentType;
  assignedTo?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
} 
