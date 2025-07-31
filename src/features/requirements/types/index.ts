// Tipos específicos para el feature de requerimientos
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
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface RequirementFilters {
  status?: RequirementStatus;
  priority?: Priority;
  type?: RequirementType;
  assignedTo?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
} 
