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
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut",
        scale: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }}
      className="group"
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-gray-50">
        {/* Top Bar con gradiente */}
        <div className={`h-1 sm:h-2 ${config.topBarColor}`} />
        
        <CardContent className="p-4 sm:p-6">
          {/* Header con avatar y información principal */}
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Avatar con gradiente */}
              <div className="relative">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 ${config.color} rounded-full flex items-center justify-center shadow-lg relative overflow-hidden`}>
                  <span className="text-white font-bold text-lg sm:text-xl relative z-10">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {/* Efecto de brillo sutil */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-60"></div>
                </div>
                {/* Icono de rol superpuesto */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <RoleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" />
                </div>
              </div>
              
              {/* Información del usuario */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{user.name}</h3>
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                </div>
                <div className="flex items-center space-x-1 text-gray-500 mb-2">
                  <Mail className="w-3 h-3 sm:w-3 sm:h-3 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{user.email}</span>
                </div>
                <Badge className={`${config.badgeColor} text-white border-0 px-2 sm:px-3 py-1 text-xs font-medium`}>
                  {getRoleText(user.role)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Detalles del usuario */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            {/* Departamento */}
            <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl border border-gray-200/50">
              <div className={`p-1.5 sm:p-2 rounded-lg ${config.bgColor}`}>
                <MapPin className={`w-3 h-3 sm:w-4 sm:h-4 ${config.textColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Departamento</span>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{user.department}</p>
              </div>
            </div>

            {/* Estado de sesión */}
            <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl border border-gray-200/50">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gray-200">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Estado de Sesión</span>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={getSessionStatusColor(getUserSessionStatus(user))} className="text-xs">
                    {getSessionStatusText(getUserSessionStatus(user))}
                  </Badge>
                  <span className="text-xs text-gray-500 truncate">
                    {formatLastLoginTime(user.lastLoginAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Fecha de registro */}
            <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl border border-gray-200/50">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gray-200">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Registrado</span>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-2 sm:space-x-3">
            <Button
              onClick={() => onView(user)}
              variant="outline"
              size="sm"
              className="flex-1 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Ver Detalles</span>
              <span className="sm:hidden">Ver</span>
            </Button>
            <Button
              onClick={() => onEdit(user)}
              variant="outline"
              size="sm"
              className="flex-1 bg-white hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300 text-emerald-700 hover:text-emerald-800 transition-all duration-200 font-medium text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Editar</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 