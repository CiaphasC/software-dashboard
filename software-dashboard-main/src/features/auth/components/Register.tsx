import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Building, UserCheck, ArrowLeft, Zap } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { useAuthStore } from '@/shared/store';
import { UserRole } from '@/features/auth/types';
import toast from 'react-hot-toast';
import AuthCard from '@/features/auth/components/ui/AuthCard';
import PasswordInput from '@/features/auth/components/ui/PasswordInput';
import { dataService } from '@/shared/services/supabase';

// Schema de validación para el registro
const registerSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  email: z.string()
    .email('Email inválido')
    .min(1, 'El email es requerido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z.string()
    .min(1, 'Confirma tu contraseña'),
  department: z.string()
    .min(1, 'Selecciona un departamento'),
  requestedRole: z.nativeEnum(UserRole)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterProps {
  onBackToLogin: () => void;
}

// Opciones por defecto (fallback)
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

const defaultRoleOptions = [
  { value: UserRole.REQUESTER, label: 'Solicitante' },
];

/**
 * Componente de formulario de registro
 * Maneja la creación de nuevas cuentas de usuario
 */
const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState(defaultDepartmentOptions);
  const [roleOptions, setRoleOptions] = useState(defaultRoleOptions);
  const { register: registerUser } = useAuthStore();
  
  // Refs para GSAP
  const formRef = useRef<HTMLFormElement>(null);
  const gsapRef = useRef<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      requestedRole: UserRole.REQUESTER
    }
  });

  // Cargar catálogos desde la base de datos
  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    setIsLoadingCatalogs(true);
    try {
      // Cargar departamentos desde la BD
      const departmentsData = await dataService.getDepartments();
      const departmentOptions = departmentsData.map(dept => ({
        value: dept.short_name,
        label: dept.name
      }));
      setDepartmentOptions(departmentOptions);

      // Cargar roles desde la BD (solo roles permitidos para registro)
      const rolesData = await dataService.getRoles();
      const roleOptions = rolesData
        .filter(role => role.name === 'requester') // Solo permitir rol de solicitante
        .map(role => ({
          value: role.name as UserRole,
          label: role.description || role.name
        }));
      setRoleOptions(roleOptions);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
      // Usar opciones por defecto si falla la carga
      setDepartmentOptions(defaultDepartmentOptions);
      setRoleOptions(defaultRoleOptions);
    } finally {
      setIsLoadingCatalogs(false);
    }
  };

  // Animaciones GSAP para el formulario
  useEffect(() => {
    let ctx: any;
    (async () => {
      const { gsap } = await import('gsap');
      gsapRef.current = gsap;
      ctx = gsap.context(() => {
        // Animación del formulario muy sutil
        if (formRef.current) {
          const formElements = gsap.utils.toArray(formRef.current.children);
          
          gsap.set(formElements, { 
            opacity: 0, 
            y: 20, // Reducido de 50 a 20
            rotationX: -5, // Reducido de -15 a -5
            transformPerspective: 600
          });

          gsap.to(formElements, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.4, // Reducido de 0.8 a 0.4
            stagger: 0.1, // Reducido de 0.15 a 0.1
            ease: "power2.out"
          });
        }
      }, formRef);
    })();

    return () => ctx && ctx.revert();
  }, []);

  const onSubmit = useCallback(async (data: RegisterFormData) => {
    setIsLoading(true);
    
    // Animación de carga muy sutil
    gsapRef.current?.to(formRef.current, {
      scale: 0.98, // Reducido de 0.95 a 0.98
      duration: 0.1, // Reducido de 0.2 a 0.1
      ease: "power2.out"
    });

    try {
      await registerUser(data);
      
      // Animación de éxito muy sutil
      gsapRef.current?.to(formRef.current, {
        scale: 1.02, // Reducido de 1.05 a 1.02
        duration: 0.2, // Reducido de 0.3 a 0.2
        ease: "power2.out",
        onComplete: () => {
          gsapRef.current?.to(formRef.current, {
            scale: 1,
            duration: 0.1, // Reducido de 0.2 a 0.1
            ease: "power2.out"
          });
        }
      });

      toast.success('¡Registro exitoso! Tu solicitud será revisada por un administrador.');
      onBackToLogin();
    } catch (error: any) {
      // Animación de error muy sutil
      gsapRef.current?.to(formRef.current, {
        rotationY: [-2, 2, -2, 2, 0] as any, // Reducido de [-10, 10, -10, 10, 0] a [-2, 2, -2, 2, 0]
        rotationX: [-1, 1, -1, 1, 0] as any, // Reducido de [-5, 5, -5, 5, 0] a [-1, 1, -1, 1, 0]
        duration: 0.3, // Reducido de 0.6 a 0.3
        ease: "power2.out"
      });
      
      toast.error(error.message || 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
  }, [registerUser, onBackToLogin]);

  const footer = (
    <div className="w-full text-center space-y-3">
      <p className="text-xs sm:text-sm text-gray-300/80">
        Tu solicitud será revisada por un administrador
      </p>
      <Button
        variant="ghost"
        onClick={onBackToLogin}
        className="text-emerald-300 hover:text-emerald-200 font-medium underline decoration-emerald-300/50 hover:decoration-emerald-200 transition-all duration-200 touch-manipulation flex items-center gap-2 mx-auto"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Login
      </Button>
    </div>
  );

  return (
    <AuthCard
      title="Registro de Usuario"
      subtitle="Completa tus datos para solicitar acceso"
      icon={<UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />}
      iconBgColor="bg-gradient-to-br from-emerald-500 via-blue-500 to-emerald-600"
      footer={footer}
      className="max-w-md sm:max-w-lg"
    >
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <div className="space-y-2">
          <Input
            label="Nombre Completo"
            type="text"
            placeholder="Tu nombre completo"
            icon={<User className="w-4 h-4" />}
            error={errors.name?.message}
            variant="glassmorphism"
            {...register('name')}
          />
        </div>
        
        <div className="space-y-2">
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="usuario@empresa.com"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            variant="glassmorphism"
            {...register('email')}
          />
        </div>
        
        <PasswordInput
          label="Contraseña"
          error={errors.password?.message}
          {...register('password')}
        />
        
        <PasswordInput
          label="Confirmar Contraseña"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        
        <div className="space-y-2">
          <Select
            label="Departamento"
            options={departmentOptions}
            error={errors.department?.message}
            variant="glassmorphism"
            loading={isLoadingCatalogs}
            {...register('department')}
          />
        </div>
        
        <div className="space-y-2">
          <Select
            label="Rol Solicitado"
            options={roleOptions}
            error={errors.requestedRole?.message}
            variant="glassmorphism"
            loading={isLoadingCatalogs}
            {...register('requestedRole')}
          />
        </div>
        
        <div className="pt-3 sm:pt-4">
          <Button
            type="submit"
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-600 hover:from-emerald-600 hover:via-blue-600 hover:to-emerald-700 text-white shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 relative overflow-hidden group touch-manipulation"
            loading={isLoading}
          >
            <div className="shine-3d absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear", repeatDelay: 0 }}
                    style={{ transformOrigin: "center" }}
                  >
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                  <span className="text-sm sm:text-base">Registrando...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Solicitar Registro</span>
                </>
              )}
            </span>
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};

export default Register; 