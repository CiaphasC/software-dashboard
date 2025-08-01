import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  MapPin, 
  X,
  Save,
  UserPlus,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { UserRole } from '@/shared/types/common.types';
import { userFormSchema, type UserFormData, type UserFormProps } from '../types';

const roleOptions = [
  { value: UserRole.ADMIN, label: 'Administrador' },
  { value: UserRole.TECHNICIAN, label: 'Técnico' },
];

const departmentOptions = [
  { value: 'TI', label: 'Tecnología de la Información' },
  { value: 'RRHH', label: 'Recursos Humanos' },
  { value: 'Contabilidad', label: 'Contabilidad' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Ventas', label: 'Ventas' },
  { value: 'Operaciones', label: 'Operaciones' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Finanzas', label: 'Finanzas' },
];

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isOpen
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      password: '',
      confirmPassword: '',
    } : {
      name: '',
      email: '',
      role: UserRole.TECHNICIAN,
      department: '',
      avatar: '',
      isActive: true,
      isEmailVerified: false,
      password: '',
      confirmPassword: '',
    }
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('role', user.role);
      setValue('department', user.department);
      setValue('avatar', user.avatar || '');
      setValue('isActive', user.isActive);
      setValue('isEmailVerified', user.isEmailVerified);
    } else {
      reset({
        name: '',
        email: '',
        role: UserRole.TECHNICIAN,
        department: '',
        avatar: '',
        isActive: true,
        isEmailVerified: false
      });
    }
  }, [user, setValue, reset]);

  const watchedRole = watch('role');
  const watchedPassword = watch('password');

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'text-red-600 bg-red-50 border-red-200';
      case UserRole.TECHNICIAN:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case UserRole.REQUESTER:
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      // Preparar los datos para enviar
      const userData = {
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        avatar: data.avatar,
        isActive: data.isActive,
        isEmailVerified: data.isEmailVerified,
        ...(data.password && data.password.length > 0 && {
          password: data.password
        })
      };

      await onSubmit(userData);
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-sky-600 rounded-full flex items-center justify-center">
                  {user ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <UserPlus className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    {user ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {user ? 'Modifica la información del usuario' : 'Crea un nuevo usuario en el sistema'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Nombre Completo</span>
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="Ingresa el nombre completo"
                    className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="usuario@empresa.com"
                    className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Contraseña {user ? '(Opcional)' : '*'}</span>
                  </label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={user ? 'Deja vacío para mantener la actual' : '••••••••'}
                      className={`pr-10 ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <AnimatePresence mode="wait">
                        {showPassword ? (
                          <motion.div
                            key="eye-off"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <EyeOff className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="eye"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Eye className="h-4 w-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                  {!user && (
                    <p className="text-xs text-gray-500">
                      Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Confirmar Contraseña {user ? '(Opcional)' : '*'}</span>
                  </label>
                  <div className="relative">
                    <Input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={user ? 'Deja vacío para mantener la actual' : '••••••••'}
                      className={`pr-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <AnimatePresence mode="wait">
                        {showConfirmPassword ? (
                          <motion.div
                            key="eye-off"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <EyeOff className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="eye"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Eye className="h-4 w-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Role and Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Rol</span>
                  </label>
                  <Select
                    {...register('role')}
                    options={roleOptions}
                    className={errors.role ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {errors.role && (
                    <p className="text-sm text-red-600">{errors.role.message}</p>
                  )}
                  
                  {/* Role Description */}
                  <div className={`mt-2 p-3 rounded-lg border ${getRoleColor(watchedRole)}`}>
                    <p className="text-xs font-medium">
                      {watchedRole === UserRole.ADMIN && 'Acceso completo al sistema y gestión de usuarios'}
                      {watchedRole === UserRole.TECHNICIAN && 'Puede resolver incidencias y gestionar requerimientos'}
                      {watchedRole === UserRole.REQUESTER && 'Puede crear incidencias y solicitar requerimientos'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Departamento</span>
                  </label>
                  <Select
                    {...register('department')}
                    options={departmentOptions}
                    className={errors.department ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {errors.department && (
                    <p className="text-sm text-red-600">{errors.department.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                      <input
                        type="checkbox"
                        {...register('isActive')}
                        className="w-4 h-4 text-emerald-600 bg-white/10 border-white/20 rounded focus:ring-emerald-400 focus:ring-2"
                      />
                      <span>Usuario Activo</span>
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                      <input
                        type="checkbox"
                        {...register('isEmailVerified')}
                        className="w-4 h-4 text-emerald-600 bg-white/10 border-white/20 rounded focus:ring-emerald-400 focus:ring-2"
                      />
                      <span>Email Verificado</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Avatar URL (Optional) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  URL del Avatar (Opcional)
                </label>
                <Input
                  {...register('avatar')}
                  placeholder="https://ejemplo.com/avatar.jpg"
                  className="text-sm"
                />
                <p className="text-xs text-gray-500">
                  Puedes proporcionar una URL de imagen para el avatar del usuario
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>{user ? 'Actualizar' : 'Crear'} Usuario</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}; 