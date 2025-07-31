import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, User, Lock, Mail, Building, UserCheck, ArrowLeft, Sparkles, Zap } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardFooter } from '@/shared/components/ui/Card';
import { Select } from '@/shared/components/ui/Select';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { UserRole } from '@/features/auth/types';
import toast from 'react-hot-toast';

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

const roleOptions = [
  { value: UserRole.REQUESTER, label: 'Solicitante' },
];

const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  
  // Refs para GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const gsapRef = useRef<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      requestedRole: UserRole.REQUESTER
    }
  });

  // Animaciones GSAP profesionales
  useEffect(() => {
    let ctx: any;
    (async () => {
      const { gsap } = await import('gsap');
      gsapRef.current = gsap;
      ctx = gsap.context(() => {
        // Timeline principal
        const masterTl = gsap.timeline();

        // 1. Animación del logo con efecto 3D
        if (logoRef.current) {
          gsap.set(logoRef.current, {
            rotationY: -90,
            rotationX: 45,
            scale: 0,
            transformPerspective: 800
          });

          masterTl.to(logoRef.current, {
            rotationY: 0,
            rotationX: 0,
            scale: 1,
            duration: 1.5,
            ease: "back.out(1.7)",
            delay: 0.3
          });

          // Efecto de brillo 3D continuo
          gsap.to(logoRef.current.querySelector('.shine-3d'), {
            x: "200%",
            duration: 3,
            repeat: -1,
            ease: "power2.inOut",
            delay: 2
          });
        }

        // 2. Animación del formulario con efecto 3D
        if (formRef.current) {
          const formElements = gsap.utils.toArray(formRef.current.children);
          
          gsap.set(formElements, { 
            opacity: 0, 
            y: 50,
            rotationX: -15,
            transformPerspective: 600
          });

          masterTl.to(formElements, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
          }, "-=1");
        }

        // 3. Efecto de profundidad en el card
        if (cardRef.current) {
          gsap.set(cardRef.current, {
            transformPerspective: 1000,
            transformOrigin: "center center"
          });

          // Efecto de hover 3D suave
          cardRef.current.addEventListener('mousemove', (e) => {
            const rect = cardRef.current!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;
            
            gsap.to(cardRef.current, {
              rotationX: rotateX,
              rotationY: rotateY,
              duration: 0.5,
              ease: "power2.out"
            });
          });

          cardRef.current.addEventListener('mouseleave', () => {
            gsap.to(cardRef.current, {
              rotationX: 0,
              rotationY: 0,
              duration: 0.8,
              ease: "power2.out"
            });
          });
        }

      }, containerRef);
    })();

    return () => ctx && ctx.revert();
  }, []);

  const onSubmit = useCallback(async (data: RegisterFormData) => {
    setIsLoading(true);
    
    // Animación de carga con efecto 3D
    gsapRef.current?.to(cardRef.current, {
      scale: 0.95,
      rotationY: 5,
      duration: 0.2,
      ease: "power2.out"
    });

    try {
      await registerUser(data);
      
      // Animación de éxito con efecto 3D
      gsapRef.current?.to(cardRef.current, {
        scale: 1.05,
        rotationY: -5,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          gsapRef.current?.to(cardRef.current, {
            scale: 1,
            rotationY: 0,
            duration: 0.2,
            ease: "power2.out"
          });
        }
      });

      toast.success('¡Registro exitoso! Tu solicitud será revisada por un administrador.');
      onBackToLogin();
    } catch (error: any) {
      // Animación de error con shake 3D
      gsapRef.current?.to(cardRef.current, {
        rotationY: [-10, 10, -10, 10, 0] as any,
        rotationX: [-5, 5, -5, 5, 0] as any,
        duration: 0.6,
        ease: "power2.out"
      });
      
      toast.error(error.message || 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
  }, [registerUser, onBackToLogin]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2 sm:p-4 relative overflow-hidden"
    >
      {/* Fondo con efecto 3D */}
      <div className="absolute inset-0">
        {/* Gradientes dinámicos */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.4),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(245,158,11,0.2),transparent_50%)]"></div>
        
        {/* Ondas animadas */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="wave-effect absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
          <div className="wave-effect absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
          <div className="wave-effect absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
        </div>
      </div>

      {/* Contenedor principal con glassmorphism 3D */}
      <Card 
        ref={cardRef}
        className="w-full max-w-md sm:max-w-lg shadow-2xl border-0 bg-white/10 backdrop-blur-xl z-10 relative overflow-hidden border border-white/20 mx-2"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Efecto de brillo superior */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
        
        <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            {/* Logo con efecto 3D */}
            <div ref={logoRef} className="relative" style={{ transformStyle: 'preserve-3d' }}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 via-blue-500 to-emerald-600 flex items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="shine-3d absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10 drop-shadow-lg" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                Registro de Usuario
              </h1>
              <p className="text-gray-300/80 text-xs sm:text-sm mt-1 sm:mt-2 font-medium">
                Completa tus datos para solicitar acceso
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-8">
          <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Input
                label="Nombre Completo"
                type="text"
                placeholder="Tu nombre completo"
                icon={<User className="w-4 h-4 text-gray-300" />}
                error={errors.name?.message}
                className="bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur-sm text-sm sm:text-base"
                {...register('name')}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="usuario@empresa.com"
                icon={<Mail className="w-4 h-4 text-gray-300" />}
                error={errors.email?.message}
                className="bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur-sm text-sm sm:text-base"
                {...register('email')}
              />
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4 text-gray-300" />}
                  error={errors.password?.message}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur-sm text-sm sm:text-base"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-emerald-300 transition-colors duration-200 p-1.5 sm:p-1 rounded-md hover:bg-emerald-500/20 touch-manipulation"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
                        <EyeOff className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Input
                  label="Confirmar Contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4 text-gray-300" />}
                  error={errors.confirmPassword?.message}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur-sm text-sm sm:text-base"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-emerald-300 transition-colors duration-200 p-1.5 sm:p-1 rounded-md hover:bg-emerald-500/20 touch-manipulation"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
                        <EyeOff className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Select
                label="Departamento"
                placeholder="Selecciona tu departamento"
                icon={<Building className="w-4 h-4 text-gray-300" />}
                error={errors.department?.message}
                className="bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur-sm text-sm sm:text-base"
                {...register('department')}
              >
                {departmentOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="space-y-2">
              <Select
                label="Rol Solicitado"
                placeholder="Selecciona el rol que solicitas"
                icon={<ShieldCheck className="w-4 h-4 text-gray-300" />}
                error={errors.requestedRole?.message}
                className="bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-emerald-400 focus:ring-emerald-400/30 backdrop-blur-sm text-sm sm:text-base"
                {...register('requestedRole')}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                    {option.label}
                  </option>
                ))}
              </Select>
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
        </CardContent>

        <CardFooter className="px-4 sm:px-8 pb-4 sm:pb-6">
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
        </CardFooter>

        {/* Footer */}
        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center z-20 px-2">
          <p className="text-xs text-gray-400/60 font-medium leading-relaxed">
            © {new Date().getFullYear()} Sistema de Gestión. Todos los derechos reservados.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register; 