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
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { UserRole } from '@/shared/types/common.types';
import { userFormSchema, type UserFormData, type UserFormProps } from '@/features/users/types';
import { dataService } from '@/shared/services/supabase';

// Opciones por defecto (fallback)
const defaultRoleOptions = [
  { value: UserRole.ADMIN, label: 'Administrador' },
  { value: UserRole.TECHNICIAN, label: 'Técnico' },
  { value: UserRole.REQUESTER, label: 'Solicitante' },
];

const defaultDepartmentOptions = [
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
  isOpen,
  departments = defaultDepartmentOptions,
  roles = defaultRoleOptions
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dynamicRoles, setDynamicRoles] = useState(roles);
  const [dynamicDepartments, setDynamicDepartments] = useState(departments);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false);
  
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

  // Cargar catálogos desde la base de datos
  useEffect(() => {
    if (isOpen) {
      loadCatalogs();
    }
  }, [isOpen]);

  const loadCatalogs = async () => {
    setIsLoadingCatalogs(true);
    try {
      // Cargar departamentos desde la BD
      const departmentsData = await dataService.getDepartments();
      const departmentOptions = departmentsData.map(dept => ({
        value: dept.short_name,
        label: dept.name
      }));
      setDynamicDepartments(departmentOptions);

      // Cargar roles desde la BD
      const rolesData = await dataService.getRoles();
      const roleOptions = rolesData.map(role => ({
        value: role.name as UserRole,
        label: role.description || role.name
      }));
      setDynamicRoles(roleOptions);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
      // Usar opciones por defecto si falla la carga
      setDynamicDepartments(defaultDepartmentOptions);
      setDynamicRoles(defaultRoleOptions);
    } finally {
      setIsLoadingCatalogs(false);
    }
  };

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
        return 'border-red-200 bg-red-50 text-red-700';
      case UserRole.TECHNICIAN:
        return 'border-blue-200 bg-blue-50 text-blue-700';
      case UserRole.REQUESTER:
        return 'border-indigo-200 bg-indigo-50 text-indigo-700';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700';
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onCancel}
      data-modal="open"
      data-form="user-form"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-sky-400 px-6 py-4 relative overflow-hidden">
            {/* Efecto de brillo sutil */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {user ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {user ? 'Modifica la información del usuario' : 'Completa la información para crear un nuevo usuario'}
                  </p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 border border-white/30"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white/80 backdrop-blur-sm">
            <form 
              onSubmit={handleSubmit(handleFormSubmit)} 
              className="space-y-6"
              data-loading={isSubmitting ? "true" : "false"}
            >
              {/* Basic Information - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 group-hover:text-blue-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"></div>
                    <span>Nombre Completo</span>
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="Ingresa el nombre completo"
                    className={`w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-300 hover:bg-white/90 hover:border-blue-300/40 ${errors.name ? 'border-red-300/60 focus:border-red-500/60 focus:ring-red-500/30' : ''}`}
                  />
                  {errors.name && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.name.message}
                    </motion.p>
                  )}
                </div>

                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 group-hover:text-blue-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"></div>
                    <span>Email</span>
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="usuario@empresa.com"
                    className={`w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-300 hover:bg-white/90 hover:border-blue-300/40 ${errors.email ? 'border-red-300/60 focus:border-red-500/60 focus:ring-red-500/30' : ''}`}
                  />
                  {errors.email && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Password Fields - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 group-hover:text-blue-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"></div>
                    <span>Contraseña {user ? '(Opcional)' : '*'}</span>
                  </label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={user ? 'Deja vacío para mantener la actual' : '••••••••'}
                      className={`w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-300 hover:bg-white/90 hover:border-blue-300/40 pr-10 ${errors.password ? 'border-red-300/60 focus:border-red-500/60 focus:ring-red-500/30' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.password.message}
                    </motion.p>
                  )}
                  {!user && (
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                    </p>
                  )}
                </div>

                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 group-hover:text-blue-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"></div>
                    <span>Confirmar Contraseña {user ? '(Opcional)' : '*'}</span>
                  </label>
                  <div className="relative">
                    <Input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={user ? 'Deja vacío para mantener la actual' : '••••••••'}
                      className={`w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-300 hover:bg-white/90 hover:border-blue-300/40 pr-10 ${errors.confirmPassword ? 'border-red-300/60 focus:border-red-500/60 focus:ring-red-500/30' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Role and Department - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 group-hover:text-blue-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"></div>
                    <span>Rol</span>
                  </label>
                  <Select
                    {...register('role')}
                    options={dynamicRoles}
                    className={`w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-300 hover:bg-white/90 hover:border-blue-300/40 ${errors.role ? 'border-red-300/60 focus:border-red-500/60 focus:ring-red-500/30' : ''}`}
                  />
                  {errors.role && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.role.message}
                    </motion.p>
                  )}
                </div>

                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 group-hover:text-blue-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"></div>
                    <span>Departamento</span>
                  </label>
                  <Select
                    {...register('department')}
                    options={dynamicDepartments}
                    className={`w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-300 hover:bg-white/90 hover:border-blue-300/40 ${errors.department ? 'border-red-300/60 focus:border-red-500/60 focus:ring-red-500/30' : ''}`}
                  />
                  {errors.department && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1 flex items-center gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.department.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Role Description Card */}
              <div className={`p-4 rounded-xl border-2 ${getRoleColor(watchedRole)} bg-opacity-10 backdrop-blur-sm`}>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {watchedRole === UserRole.ADMIN && 'Administrador'}
                      {watchedRole === UserRole.TECHNICIAN && 'Técnico'}
                      {watchedRole === UserRole.REQUESTER && 'Solicitante'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {watchedRole === UserRole.ADMIN && 'Acceso completo al sistema y gestión de usuarios'}
                      {watchedRole === UserRole.TECHNICIAN && 'Puede resolver incidencias y gestionar requerimientos'}
                      {watchedRole === UserRole.REQUESTER && 'Puede crear incidencias y solicitar requerimientos'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Checkboxes - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 group-hover:text-blue-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"></div>
                    <span>Estado del Usuario</span>
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg border border-blue-200/30 backdrop-blur-sm">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register('isActive')}
                        className="w-4 h-4 text-blue-600 bg-white/80 border-gray-300/60 rounded focus:ring-blue-500/30 focus:ring-2 transition-all duration-300"
                      />
                      <span className="text-sm text-gray-700">Usuario Activo</span>
                    </label>
                  </div>
                </div>
                
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 group-hover:text-blue-700 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"></div>
                    <span>Verificación</span>
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg border border-blue-200/30 backdrop-blur-sm">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register('isEmailVerified')}
                        className="w-4 h-4 text-blue-600 bg-white/80 border-gray-300/60 rounded focus:ring-blue-500/30 focus:ring-2 transition-all duration-300"
                      />
                      <span className="text-sm text-gray-700">Email Verificado</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Avatar URL - Full Width */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2 group-hover:text-blue-700 transition-colors">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"></div>
                  <span>URL del Avatar (Opcional)</span>
                </label>
                <Input
                  {...register('avatar')}
                  placeholder="https://ejemplo.com/avatar.jpg"
                  className="w-full px-3 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-300 hover:bg-white/90 hover:border-blue-300/40"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puedes proporcionar una URL de imagen para el avatar del usuario
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200/60">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="px-6 py-3 border-gray-200/60 hover:bg-gray-50/80 transition-all duration-300 text-gray-700 font-medium rounded-lg hover:border-gray-300/60"
                  >
                    Cancelar
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Guardando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        <span>{user ? 'Actualizar' : 'Crear'} Usuario</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 