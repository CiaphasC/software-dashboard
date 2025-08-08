import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { 
  User, 
  Crown, 
  Shield, 
  Target, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Calendar,
  Mail,
  Clock
} from 'lucide-react';
import { User as UserType, UserRole } from '@/shared/types/common.types';
import { 
  getUserSessionStatus, 
  getSessionStatusColor, 
  getSessionStatusText,
  formatLastLoginTime 
} from '@/shared/utils/sessionUtils';

interface UserCardProps {
  user: UserType;
  onView: (user: UserType) => void;
  onEdit: (user: UserType) => void;
  onDelete: (user: UserType) => void;
}

const getRoleConfig = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN:
      return {
        color: 'bg-gradient-to-r from-red-500 to-pink-500',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: Crown,
        badgeColor: 'bg-gradient-to-r from-red-500 to-pink-500',
        topBarColor: 'bg-gradient-to-r from-red-500 to-pink-500'
      };
    case UserRole.TECHNICIAN:
      return {
        color: 'bg-gradient-to-r from-indigo-500 to-blue-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: Shield,
        badgeColor: 'bg-gradient-to-r from-indigo-500 to-blue-500',
        topBarColor: 'bg-gradient-to-r from-indigo-500 to-blue-500'
      };
    case UserRole.REQUESTER:
      return {
        color: 'bg-gradient-to-r from-emerald-500 to-green-500',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        icon: Target,
        badgeColor: 'bg-gradient-to-r from-emerald-500 to-green-500',
        topBarColor: 'bg-gradient-to-r from-emerald-500 to-green-500'
      };
    default:
      return {
        color: 'bg-gradient-to-r from-blue-500 to-sky-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: User,
        badgeColor: 'bg-gradient-to-r from-blue-500 to-sky-500',
        topBarColor: 'bg-gradient-to-r from-blue-500 to-sky-500'
      };
  }
};

const getRoleText = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrador';
    case UserRole.TECHNICIAN:
      return 'Técnico';
    case UserRole.REQUESTER:
      return 'Solicitante';
    default:
      return 'Usuario';
  }
};

export const UserCard: React.FC<UserCardProps> = ({ user, onView, onEdit, onDelete }) => {
  const config = getRoleConfig(user.role);
  const RoleIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ 
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        scale: {
          type: "spring",
          stiffness: 400,
          damping: 25
        }
      }}
      className="group w-full h-full"
    >
      <div className="relative w-full h-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] transition-all duration-500 overflow-hidden border border-gray-100/50 backdrop-blur-sm">
        {/* Fondo con gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Header con avatar y información principal */}
        <div className="relative z-10 p-6 pb-4">
          <div className="flex items-start space-x-4">
            {/* Avatar moderno */}
            <div className="relative flex-shrink-0">
              <div className={`w-14 h-14 ${config.color} rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden`}>
                <span className="text-white font-bold text-lg relative z-10">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10"></div>
              </div>
              {/* Icono de rol */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                <RoleIcon className="w-2.5 h-2.5 text-gray-600" />
              </div>
              {/* Indicador de estado */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            
            {/* Información del usuario */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">{user.name}</h3>
              <div className="flex items-center space-x-2 text-gray-500 mb-3">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-sm truncate">{user.email}</span>
              </div>
              <Badge className={`${config.badgeColor} text-white border-0 px-2.5 py-1 text-xs font-medium shadow-sm rounded-lg`}>
                {getRoleText(user.role)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 px-6 pb-6 space-y-4">
          {/* Departamento */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50/60 rounded-xl border border-gray-100/50">
            <div className={`p-2 rounded-lg ${config.bgColor} shadow-sm`}>
              <MapPin className={`w-3.5 h-3.5 ${config.textColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Departamento</span>
              <p className="text-sm font-medium text-gray-900 truncate">{user.department}</p>
            </div>
          </div>

          {/* Estado de sesión */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50/60 rounded-xl border border-gray-100/50">
            <div className="p-2 rounded-lg bg-gray-200 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Estado</span>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getSessionStatusColor(getUserSessionStatus(user))} className="text-xs shadow-sm font-medium rounded-lg">
                  {getSessionStatusText(getUserSessionStatus(user))}
                </Badge>
              </div>
            </div>
          </div>

          {/* Fecha de registro */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50/60 rounded-xl border border-gray-100/50">
            <div className="p-2 rounded-lg bg-gray-200 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Registrado</span>
              <p className="text-sm font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="relative z-10 px-6 pb-6">
          <div className="flex space-x-3">
            <Button
              onClick={() => onView(user)}
              variant="outline"
              size="sm"
              className="flex-1 bg-white/80 hover:bg-blue-50/90 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md py-2.5 text-sm rounded-xl"
            >
              <Eye className="w-3.5 h-3.5 mr-2" />
              Ver
            </Button>
            <Button
              onClick={() => onEdit(user)}
              variant="outline"
              size="sm"
              className="flex-1 bg-white/80 hover:bg-emerald-50/90 border-gray-200 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md py-2.5 text-sm rounded-xl"
            >
              <Edit className="w-3.5 h-3.5 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 