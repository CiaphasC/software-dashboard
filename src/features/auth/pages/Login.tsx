import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, User, Lock, Sparkles, Zap, Activity, BarChart3 } from 'lucide-react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardContent, CardHeader, CardFooter } from '@/shared/components/ui/Card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/shared/utils/schemas';

// Registrar plugins de GSAP
gsap.registerPlugin(MotionPathPlugin);

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Refs para GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Animaciones GSAP profesionales
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline principal
      const masterTl = gsap.timeline();

      // 1. Animación del fondo con efecto 3D
      gsap.set(backgroundRef.current, { 
        rotationY: 15, 
        rotationX: -5,
        transformPerspective: 1000,
        transformOrigin: "center center"
      });

      masterTl.to(backgroundRef.current, {
        rotationY: 0,
        rotationX: 0,
        duration: 2,
        ease: "power3.out"
      });

             // 2. Animación de partículas con MotionPath
       if (particlesRef.current) {
         const particles = gsap.utils.toArray(particlesRef.current.children);
         
         particles.forEach((particle: any, index) => {
           const path = `M${Math.random() * 100},${Math.random() * 100} Q${Math.random() * 100},${Math.random() * 100} ${Math.random() * 100},${Math.random() * 100}`;
           
           gsap.to(particle, {
             motionPath: {
               path: path,
               autoRotate: true,
               alignOrigin: [0.5, 0.5]
             },
             duration: 8 + Math.random() * 4,
             repeat: -1,
             ease: "none",
             delay: index * 0.2
           });
         });
       }

      // 3. Animación del logo con efecto 3D
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
          delay: 0.5
        }, "-=1");

        // Efecto de brillo 3D continuo
        gsap.to(logoRef.current.querySelector('.shine-3d'), {
          x: "200%",
          duration: 3,
          repeat: -1,
          ease: "power2.inOut",
          delay: 2
        });
      }

             // 4. Animación del título
       if (titleRef.current) {
         gsap.set(titleRef.current, { opacity: 0, y: -20 });
         masterTl.to(titleRef.current, {
           opacity: 1,
           y: 0,
           duration: 1,
           ease: "power2.out",
           delay: 1
         }, "-=0.5");
       }

      // 5. Animación del subtítulo
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
        masterTl.to(subtitleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        }, "-=0.3");
      }

      // 6. Animación del formulario con efecto 3D
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
        }, "-=0.5");
      }

      // 7. Efecto de ondas en el fondo
      gsap.to(".wave-effect", {
        y: -20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        stagger: 0.5
      });

      // 8. Efecto de profundidad en el card
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
          
          // Reducir la sensibilidad para movimiento más sutil
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

    return () => ctx.revert();
  }, []);

  const onSubmit = useCallback(async (data: LoginFormData) => {
    setIsLoading(true);
    
    // Animación de carga con efecto 3D
    gsap.to(cardRef.current, {
      scale: 0.95,
      rotationY: 5,
      duration: 0.2,
      ease: "power2.out"
    });

    try {
      await login(data.email, data.password);
      
      // Animación de éxito con efecto 3D
      gsap.to(cardRef.current, {
        scale: 1.05,
        rotationY: -5,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(cardRef.current, {
            scale: 1,
            rotationY: 0,
            duration: 0.2,
            ease: "power2.out"
          });
        }
      });

      toast.success('¡Bienvenido al sistema!');
      navigate('/dashboard');
    } catch (error) {
             // Animación de error con shake 3D
       gsap.to(cardRef.current, {
         rotationY: [-10, 10, -10, 10, 0] as any,
         rotationX: [-5, 5, -5, 5, 0] as any,
         duration: 0.6,
         ease: "power2.out"
       });
      
      toast.error('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  }, [login, navigate]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2 sm:p-4 relative overflow-hidden"
    >
      {/* Fondo con efecto 3D */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0"
      >
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
      
      {/* Partículas con MotionPath */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none z-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${['#3b82f6', '#10b981', '#f59e0b'][i % 3]}40, transparent)`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* Contenedor principal con glassmorphism 3D */}
      <Card 
        ref={cardRef}
        className="w-full max-w-sm sm:max-w-md shadow-2xl border-0 bg-white/10 backdrop-blur-xl z-10 relative overflow-hidden border border-white/20 mx-2"
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
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 via-emerald-500 to-blue-600 flex items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="shine-3d absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10 drop-shadow-lg" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            
            <div className="text-center">
              <h1 
                ref={titleRef}
                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight"
              >
                Sistema de Gestión
              </h1>
              <p 
                ref={subtitleRef}
                className="text-gray-300/80 text-xs sm:text-sm mt-1 sm:mt-2 font-medium"
              >
                Inicia sesión para continuar
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-8">
          <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="usuario@empresa.com"
                icon={<User className="w-4 h-4 text-gray-300" />}
                error={errors.email?.message}
                className="bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-blue-400 focus:ring-blue-400/30 backdrop-blur-sm text-sm sm:text-base"
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
                  className="bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-blue-400 focus:ring-blue-400/30 backdrop-blur-sm text-sm sm:text-base"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-blue-300 transition-colors duration-200 p-1.5 sm:p-1 rounded-md hover:bg-blue-500/20 touch-manipulation"
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
        </CardContent>

        <CardFooter className="px-4 sm:px-8 pb-4 sm:pb-6">
          <div className="w-full text-center">
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

export default Login; 
