import React from 'react';
import { 
  FileText, Clock, CheckCircle, XCircle, AlertTriangle,
  Calendar, User, Building2, Zap, Shield, Settings
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { Requirement, RequirementStatus, Priority, RequirementType } from '@/shared/types/common.types';
import { getStatusColor, getPriorityColor, getStatusText, getPriorityText } from '@/shared/utils/utils';
import { formatDate } from '@/shared/utils/dateUtils';
import { GenericTable, type TableConfig } from '@/shared/components/ui/GenericTable';

interface RequirementsTableProps {
  requirements: Requirement[];
  loading: boolean;
  onRequirementClick: (requirement: Requirement) => void;
  onEditRequirement: (requirement: Requirement) => void;
  onDeleteRequirement: (requirement: Requirement) => void;
  onViewRequirement: (requirement: Requirement) => void;
}

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
  loading,
  onRequirementClick,
  onEditRequirement,
  onDeleteRequirement,
  onViewRequirement
}) => {
  // Configuración específica para requerimientos
  const config: TableConfig<Requirement> = {
    // Tema verde/esmeralda para requerimientos
    theme: {
      primaryColor: 'emerald',
      secondaryColor: 'green',
      gradientFrom: 'emerald-500',
      gradientTo: 'green-600',
      borderColor: 'emerald-100/50',
      hoverColor: 'emerald-200/70',
    },
    
    // Columnas específicas para requerimientos
    columns: [
      {
        key: 'title',
        label: 'Requerimiento',
        icon: <FileText className="h-4 w-4" />,
        render: (requirement) => (
                  <div className="space-y-2">
                                          <div className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-base">
                      {requirement.title}
                    </div>
                                          <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed max-w-sm">
                      {requirement.description}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5 p-1.5 bg-emerald-50/80 rounded-lg">
                        <Building2 className="h-3 w-3 text-emerald-600" />
                        <span className="font-medium">{requirement.requestingArea}</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-blue-50/80 rounded-lg">
                        <User className="h-3 w-3 text-blue-600" />
                        <span className="font-medium">{requirement.assignedTo || 'Sin asignar'}</span>
                      </div>
                    </div>
                  </div>
        ),
      },
      {
        key: 'status',
        label: 'Estado',
        icon: <CheckCircle className="h-4 w-4" />,
        render: (requirement) => (
                  <div className="flex flex-col gap-2">
                      <Badge 
                        variant={getStatusColor(requirement.status)}
                        className="w-fit text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-emerald-200/30"
                      >
                        {getStatusText(requirement.status)}
                      </Badge>
                    {requirement.estimatedDeliveryDate && (
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 p-2 bg-orange-50/80 rounded-lg">
                        <Calendar className="h-3 w-3 text-orange-600" />
                <span className="font-medium">{formatDate(requirement.estimatedDeliveryDate)}</span>
                      </div>
                    )}
                  </div>
        ),
      },
      {
        key: 'priority',
        label: 'Prioridad',
        icon: <Zap className="h-4 w-4" />,
        render: (requirement) => (
                  <div className="flex flex-col gap-2">
                      <Badge 
                        variant={getPriorityColor(requirement.priority)}
                        className="w-fit text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-emerald-200/30"
                      >
                        {getPriorityText(requirement.priority)}
                      </Badge>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 p-2 bg-purple-50/80 rounded-lg">
                      <Clock className="h-3 w-3 text-purple-600" />
              <span className="font-medium">{formatDate(requirement.createdAt)}</span>
                    </div>
                  </div>
        ),
      },
      {
        key: 'type',
        label: 'Tipo',
        icon: <Settings className="h-4 w-4" />,
        render: (requirement) => {
          const typeIcons = {
            [RequirementType.DOCUMENT]: <FileText className="h-4 w-4" />,
            [RequirementType.EQUIPMENT]: <Shield className="h-4 w-4" />,
            [RequirementType.SERVICE]: <CheckCircle className="h-4 w-4" />,
            [RequirementType.OTHER]: <AlertTriangle className="h-4 w-4" />,
          };
          
          return (
                  <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 shadow-lg border border-emerald-200/50">
                      <div className="text-emerald-600">
                        {typeIcons[requirement.type]}
                      </div>
              </div>
                    <span className="text-sm font-bold text-gray-700 capitalize">
                      {requirement.type.replace('_', ' ')}
                    </span>
                  </div>
          );
        },
      },
      {
        key: 'requestingArea',
        label: 'Área',
        icon: <Building2 className="h-4 w-4" />,
        render: (requirement) => (
                  <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 shadow-lg border border-emerald-200/50">
                      <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
                    <div>
                      <span className="text-sm font-bold text-gray-700">
                        {requirement.requestingArea}
                      </span>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        <span>{requirement.assignedTo || 'Sin asignar'}</span>
                      </div>
                    </div>
                  </div>
        ),
      },
      {
        key: 'createdAt',
        label: 'Fecha',
        icon: <Calendar className="h-4 w-4" />,
        render: (requirement) => (
                  <div className="text-sm text-gray-500 p-1.5 bg-gray-50/80 rounded-lg">
            {formatDate(requirement.createdAt)}
                  </div>
        ),
      },
    ],
    
    // Acciones
    actions: {
      onItemClick: onRequirementClick,
      onEdit: onEditRequirement,
      onDelete: onDeleteRequirement,
      onView: onViewRequirement,
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
          [RequirementType.DOCUMENT]: <FileText className="h-4 w-4" />,
          [RequirementType.EQUIPMENT]: <Shield className="h-4 w-4" />,
          [RequirementType.SERVICE]: <CheckCircle className="h-4 w-4" />,
          [RequirementType.OTHER]: <AlertTriangle className="h-4 w-4" />,
        };
        return typeIcons[type as RequirementType] || <FileText className="h-4 w-4" />;
      },
    },
    
    // Campos adicionales específicos para requerimientos
    additionalFields: [
      {
        key: 'requestingArea',
        label: 'Área Solicitante',
        icon: <Building2 className="h-4 w-4" />,
      },
      {
        key: 'assignedTo',
        label: 'Asignado a',
        icon: <User className="h-4 w-4" />,
        render: (requirement) => requirement.assignedTo || 'Sin asignar',
      },
    ],
    
    // Campo de fecha estimada
    estimatedDateField: 'estimatedDeliveryDate',
    
    // Textos específicos para requerimientos
    texts: {
      loading: 'Cargando requerimientos...',
      emptyTitle: 'No se encontraron requerimientos',
      emptyDescription: 'No hay requerimientos que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda o crear un nuevo requerimiento.',
      emptyIcon: <FileText className="h-12 w-12 text-emerald-600" />,
      createButton: 'Crear requerimiento',
      createIcon: <FileText className="h-4 w-4 mr-2" />,
      exportButton: 'Exportar',
      shareButton: 'Compartir',
      viewDetails: 'Ver detalles completos',
      tableView: 'Tabla',
      cardsView: 'Tarjetas',
    },
  };

  return (
    <GenericTable
      items={requirements}
      loading={loading}
      config={config}
    />
  );
};

export default RequirementsTable; 