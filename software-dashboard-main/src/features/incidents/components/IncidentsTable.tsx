import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Zap, 
  Shield, 
  Wifi, 
  Monitor, 
  Settings, 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  Eye, 
  Edit, 
  Trash2, 
  Building2
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { IncidentType, IncidentStatus, Priority } from '@/shared/types/common.types';
import { getStatusColor, getPriorityColor, getStatusText, getPriorityText } from '@/shared/utils/formatters';
import { formatDate, formatDateTime } from '@/shared/utils/dateUtils';
import { GenericTable, type TableConfig, type TableItem } from '@/shared/components/ui/GenericTable';
import type { IncidentDomain } from '@/shared/domain/incident';

// Extender TableItem para IncidentDomain
type IncidentTableItem = TableItem & IncidentDomain;

interface IncidentsTableProps {
  incidents: IncidentDomain[];
  loading: boolean;
  onIncidentClick: (incident: IncidentDomain) => void;
  onEditIncident: (incident: IncidentDomain) => void;
  onDeleteIncident: (incident: IncidentDomain) => void;
  onViewIncident: (incident: IncidentDomain) => void;
}

export const IncidentsTable: React.FC<IncidentsTableProps> = ({
  incidents,
  loading,
  onIncidentClick,
  onEditIncident,
  onDeleteIncident,
  onViewIncident
}) => {
  // Configuración específica para incidencias
  const config: TableConfig<IncidentTableItem> = {
    // Tema naranja/rojo para incidencias
    theme: {
      primaryColor: 'orange',
      secondaryColor: 'red',
      gradientFrom: 'orange-500',
      gradientTo: 'red-500',
      borderColor: 'orange-100/50',
      hoverColor: 'orange-200/70',
    },
    
    // Columnas específicas para incidencias
    columns: [
      {
        key: 'title',
        label: 'Incidencia',
        icon: <AlertTriangle className="h-4 w-4" />,
        render: (incident) => (
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-900 group-hover:text-orange-700 transition-colors text-sm max-w-[180px] truncate">
                      {incident.title}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-1 leading-tight max-w-[200px]">
                      {incident.description}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1 p-0.5 bg-orange-50/80 rounded max-w-[120px]">
                        <MapPin className="h-3 w-3 text-orange-600 flex-shrink-0" />
                        <span className="font-medium text-xs truncate">{incident.affectedAreaName || 'Sin asignar'}</span>
                      </div>
                      <div className="flex items-center gap-1 p-0.5 bg-blue-50/80 rounded max-w-[100px]">
                        <User className="h-3 w-3 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-xs truncate">{incident.creatorName || 'Sin asignar'}</span>
                      </div>
                    </div>
                  </div>
        ),
      },
      {
        key: 'status',
        label: 'Estado',
        icon: <Shield className="h-4 w-4" />,
        render: (incident) => (
                  <div className="flex flex-col gap-0.5">
                      <Badge
                        variant={getStatusColor(incident.status)}
                        className="w-fit text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-orange-200/30"
                      >
                        {getStatusText(incident.status)}
                      </Badge>
                    {incident.estimatedResolutionDate && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 p-1.5 bg-orange-50/80 rounded-lg">
                        <Calendar className="h-3 w-3 text-orange-600" />
                <span className="font-medium">{formatDate(incident.estimatedResolutionDate)}</span>
                      </div>
                    )}
                  </div>
        ),
      },
      {
        key: 'priority',
        label: 'Prioridad',
        icon: <Zap className="h-4 w-4" />,
        render: (incident) => (
                  <div className="flex flex-col gap-0.5">
                      <Badge
                        variant={getPriorityColor(incident.priority)}
                        className="w-fit text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-orange-200/30"
                      >
                        {getPriorityText(incident.priority)}
                      </Badge>
                    <div className="text-xs text-gray-500 flex items-center gap-1 p-1.5 bg-purple-50/80 rounded-lg">
                      <Clock className="h-3 w-3 text-purple-600" />
                      <span className="font-medium">{formatDateTime(incident.createdAt)}</span>
                    </div>
                  </div>
        ),
      },
      {
        key: 'type',
        label: 'Tipo',
        icon: <Settings className="h-4 w-4" />,
        render: (incident) => {
          const typeIcons = {
            [IncidentType.TECHNICAL]: <Settings className="h-4 w-4" />,
            [IncidentType.SOFTWARE]: <Monitor className="h-4 w-4" />,
            [IncidentType.HARDWARE]: <Shield className="h-4 w-4" />,
            [IncidentType.NETWORK]: <Wifi className="h-4 w-4" />,
            [IncidentType.OTHER]: <FileText className="h-4 w-4" />,
          };
          
          return (
                  <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 shadow-lg border border-orange-200/50">
                      <div className="text-orange-600">{typeIcons[incident.type]}</div>
              </div>
                    <span className="text-sm font-bold text-gray-700 capitalize">
                      {incident.type.replace('_', ' ')}
                    </span>
                  </div>
          );
        },
      },
      {
        key: 'affectedAreaName',
        label: 'Área Afectada',
        icon: <MapPin className="h-4 w-4" />,
        render: (incident) => (
                  <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 shadow-lg border border-orange-200/50">
                      <MapPin className="h-4 w-4 text-orange-600" />
            </div>
                    <div className="max-w-[120px]">
                      <span className="text-sm font-bold text-gray-700 truncate block">{incident.affectedAreaName || 'Sin asignar'}</span>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{incident.assigneeName || 'Sin asignar'}</span>
                      </div>
                    </div>
                  </div>
        ),
      },
      {
        key: 'createdAt',
        label: 'Fecha',
        icon: <Calendar className="h-4 w-4" />,
        render: (incident) => (
                  <div className="text-sm text-gray-500 p-1 bg-gray-50/80 rounded-lg">
            {formatDateTime(incident.createdAt)}
                  </div>
        ),
      },
    ],
    
    // Acciones
    actions: {
      onItemClick: onIncidentClick,
      onEdit: onEditIncident,
      onDelete: onDeleteIncident,
      onView: onViewIncident,
    },
    
    // Configuración de estado
    statusConfig: {
      getColor: getStatusColor,
      getText: getStatusText,
    },
    
    // Configuración de prioridad
    priorityConfig: {
      getColor: getPriorityColor,
      getText: getPriorityText,
      getIcon: (priority) => {
        const priorityIcons = {
          [Priority.LOW]: <Clock className="h-3 w-3" />,
          [Priority.MEDIUM]: <AlertTriangle className="h-3 w-3" />,
          [Priority.HIGH]: <Shield className="h-3 w-3" />,
          [Priority.URGENT]: <Zap className="h-3 w-3" />,
        };
        return priorityIcons[priority as Priority] || <Clock className="h-3 w-3" />;
      },
    },
    
    // Configuración de tipo
    typeConfig: {
      getIcon: (type) => {
        const typeIcons = {
          [IncidentType.TECHNICAL]: <Settings className="h-4 w-4" />,
          [IncidentType.SOFTWARE]: <Monitor className="h-4 w-4" />,
          [IncidentType.HARDWARE]: <Shield className="h-4 w-4" />,
          [IncidentType.NETWORK]: <Wifi className="h-4 w-4" />,
          [IncidentType.OTHER]: <FileText className="h-4 w-4" />,
        };
        return typeIcons[type as IncidentType] || <FileText className="h-4 w-4" />;
      },
    },
    
    // Campos adicionales específicos para incidencias
    additionalFields: [
      {
        key: 'affectedAreaName',
        label: 'Área Afectada',
        icon: <MapPin className="h-4 w-4" />,
      },
      {
        key: 'creatorName',
        label: 'Reportado por',
        icon: <User className="h-4 w-4" />,
      },
    ],
    
    // Campo de fecha estimada
    estimatedDateField: 'estimatedResolutionDate',
    
    // Textos específicos para incidencias
    texts: {
      loading: 'Cargando incidencias...',
      emptyTitle: 'No se encontraron incidencias',
      emptyDescription: 'No hay incidencias que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda o crear una nueva incidencia.',
      emptyIcon: <AlertTriangle className="h-12 w-12 text-orange-600" />,
      createButton: 'Crear incidencia',
      createIcon: <AlertTriangle className="h-4 w-4 mr-2" />,
      exportButton: 'Exportar',
      shareButton: 'Compartir',
      viewDetails: 'Ver detalles completos',
      tableView: 'Tabla',
      cardsView: 'Tarjetas',
    },
  };

  return (
    <GenericTable
      items={incidents as any}
      loading={loading}
      config={config as any}
    />
  );
}; 