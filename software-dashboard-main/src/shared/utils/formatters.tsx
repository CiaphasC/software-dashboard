import React from 'react'
import { AlertTriangle, Shield, Monitor, Wifi, FileText, Settings, Clock, Zap } from 'lucide-react'
import { IncidentStatus, RequirementStatus, Priority, IncidentType, RequirementType } from '@/shared/types/common.types'

export type SemanticColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

export const getStatusColor = (status: IncidentStatus | RequirementStatus): SemanticColor => {
  switch (status) {
    case 'open':
    case 'pending':
      return 'warning'
    case 'in_progress':
      return 'primary'
    case 'completed':
    case 'delivered':
      return 'success'
    case 'closed':
      return 'danger'
    default:
      return 'secondary'
  }
}

export const getStatusText = (status: IncidentStatus | RequirementStatus): string => {
  switch (status) {
    case 'open': return 'Abierta'
    case 'pending': return 'Pendiente'
    case 'in_progress': return 'En Proceso'
    case 'completed': return 'Completada'
    case 'delivered': return 'Entregada'
    case 'closed': return 'Cerrada'
    default: return 'Desconocido'
  }
}

export const getPriorityColor = (priority: Priority): SemanticColor => {
  switch (priority) {
    case 'urgent': return 'primary'
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'secondary'
  }
}

export const getPriorityText = (priority: Priority): string => {
  switch (priority) {
    case 'urgent': return 'Urgente'
    case 'high': return 'Alta'
    case 'medium': return 'Media'
    case 'low': return 'Baja'
    default: return 'Desconocida'
  }
}

export const getPriorityIcon = (priority: Priority): JSX.Element => {
  switch (priority) {
    case 'urgent': return <Zap className="h-3 w-3" />
    case 'high': return <Shield className="h-3 w-3" />
    case 'medium': return <AlertTriangle className="h-3 w-3" />
    case 'low': return <Clock className="h-3 w-3" />
    default: return <Clock className="h-3 w-3" />
  }
}

export type AnyType = IncidentType | RequirementType | string

export const getTypeIcon = (type: AnyType): JSX.Element => {
  const map: Record<string, JSX.Element> = {
    technical: <Settings className="h-4 w-4" />,
    software: <Monitor className="h-4 w-4" />,
    hardware: <Shield className="h-4 w-4" />,
    network: <Wifi className="h-4 w-4" />,
    other: <FileText className="h-4 w-4" />,
  }
  return map[String(type)] || <FileText className="h-4 w-4" />
}

export const getTypeText = (type: AnyType): string => {
  switch (String(type)) {
    case 'technical': return 'Technical'
    case 'software': return 'Software'
    case 'hardware': return 'Hardware'
    case 'network': return 'Network'
    case 'other': return 'Other'
    default: return String(type)
  }
}

const formatters = {
  getStatusColor,
  getStatusText,
  getPriorityColor,
  getPriorityText,
  getPriorityIcon,
  getTypeIcon,
  getTypeText,
}

export default formatters