import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Lock, Zap, UserPlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useAuthStore } from '@/shared/store';
import { loginSchema, type LoginFormData } from '@/shared/utils/schemas';
import AuthCard from '@/features/auth/components/ui/AuthCard';
import PasswordInput from '@/features/auth/components/ui/PasswordInput';

interface LoginProps {
  onShowRegister: () => void;
}

/**
 * Componente de formulario de login
 * Maneja la autenticación de usuarios existentes
 */
const Login: React.FC<LoginProps> = ({ onShowRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  
  // Refs para GSAP
  const formRef = useRef<HTMLFormElement>(null);
  const gsapRef = useRef<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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

  const onSubmit = useCallback(async (data: LoginFormData) => {
    setIsLoading(true);
    
    // Animación de carga muy sutil
    gsapRef.current?.to(formRef.current, {
      scale: 0.98, // Reducido de 0.95 a 0.98
      duration: 0.1, // Reducido de 0.2 a 0.1
      ease: "power2.out"
    });

    try {
      await login(data.email, data.password);
      
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

      toast.success('¡Bienvenido al sistema!');
      navigate('/dashboard');
    } catch (error) {
      // Animación de error muy sutil
      gsapRef.current?.to(formRef.current, {
        rotationY: [-2, 2, -2, 2, 0] as any, // Reducido de [-10, 10, -10, 10, 0] a [-2, 2, -2, 2, 0]
        rotationX: [-1, 1, -1, 1, 0] as any, // Reducido de [-5, 5, -5, 5, 0] a [-1, 1, -1, 1, 0]
        duration: 0.3, // Reducido de 0.6 a 0.3
        ease: "power2.out"
      });
      
      toast.error('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  }, [login, navigate]);

  const handleShowRegister = useCallback(() => {
    onShowRegister();
  }, [onShowRegister]);

  const footer = (
    <div className="w-full text-center space-y-4">
      <div className="flex items-center justify-center">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent"></div>
        <span className="px-4 text-xs text-gray-400/60 font-medium">O</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent"></div>
      </div>
      
      <Button
        variant="ghost"
        onClick={handleShowRegister}
        className="w-full text-emerald-300 hover:text-emerald-200 font-medium border border-emerald-300/30 hover:border-emerald-200/50 transition-all duration-200 touch-manipulation flex items-center justify-center gap-2"
      >
        <UserPlus className="w-4 h-4" />
        Crear Nueva Cuenta
      </Button>
      
      <p className="text-xs sm:text-sm text-gray-300/80">
        ¿Problemas para acceder?{' '}
        <a
          href="#"
          className="text-blue-300 hover:text-blue-200 font-medium underline decoration-blue-300/50 hover:decoration-blue-200 transition-all duration-200 touch-manipulation"
        >
          Contacta al administrador
        </a>
      </p>
    </div>
  );

  return (
    <AuthCard
      title="Sistema de Gestión"
      subtitle="Inicia sesión para continuar"
      icon={<User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />}
      iconBgColor="bg-gradient-to-br from-blue-500 via-emerald-500 to-blue-600"
      footer={footer}
    >
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="usuario@empresa.com"
            icon={<User className="w-4 h-4" />}
            error={errors.email?.message}
            variant="glassmorphism"
            autoComplete="email"
            {...register('email')}
          />
        </div>
        
        <PasswordInput
          label="Contraseña"
          error={errors.password?.message}
          {...register('password')}
        />
        
        <div className="pt-3 sm:pt-4">
          <Button
            type="submit"
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-600 hover:from-blue-600 hover:via-emerald-600 hover:to-blue-700 text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 relative overflow-hidden group touch-manipulation"
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
                  <span className="text-sm sm:text-base">Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Iniciar Sesión</span>
                </>
              )}
            </span>
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};

export default Login; 