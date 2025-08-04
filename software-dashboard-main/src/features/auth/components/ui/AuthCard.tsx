import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/shared/components/ui/Card';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Componente de tarjeta de autenticación reutilizable
 * Proporciona una estructura consistente para formularios de login y registro
 */
const AuthCard: React.FC<AuthCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  iconBgColor,
  footer,
  className = ""
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Animaciones GSAP para el card
  useEffect(() => {
    let ctx: any;
    (async () => {
      const { gsap } = await import('gsap');
      ctx = gsap.context(() => {
        // Timeline principal
        const masterTl = gsap.timeline();

        // Animación del logo muy sutil
        if (logoRef.current) {
          gsap.set(logoRef.current, {
            rotationY: -30, // Reducido de -90 a -30
            rotationX: 15, // Reducido de 45 a 15
            scale: 0.8, // Cambiado de 0 a 0.8
            transformPerspective: 800
          });

          masterTl.to(logoRef.current, {
            rotationY: 0,
            rotationX: 0,
            scale: 1,
            duration: 0.8, // Reducido de 1.5 a 0.8
            ease: "power2.out", // Cambiado de "back.out(1.7)" a "power2.out"
            delay: 0.2 // Reducido de 0.3 a 0.2
          });

          // Efecto de brillo 3D continuo muy sutil
          gsap.to(logoRef.current.querySelector('.shine-3d'), {
            x: "200%",
            duration: 4, // Aumentado de 3 a 4 para que sea más lento
            repeat: -1,
            ease: "power2.inOut",
            delay: 1.5 // Reducido de 2 a 1.5
          });
        }

        // Efecto de profundidad en el card
        if (cardRef.current) {
          gsap.set(cardRef.current, {
            transformPerspective: 1000,
            transformOrigin: "center center"
          });

          // Efecto de hover 3D muy sutil (reducido significativamente)
          cardRef.current.addEventListener('mousemove', (e) => {
            const rect = cardRef.current!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Reducir la sensibilidad drásticamente para movimiento mínimo
            const rotateX = (y - centerY) / 100; // Cambiado de 25 a 100
            const rotateY = (centerX - x) / 100; // Cambiado de 25 a 100
            
            gsap.to(cardRef.current, {
              rotationX: rotateX,
              rotationY: rotateY,
              duration: 0.3, // Reducido de 0.5 a 0.3
              ease: "power2.out"
            });
          });

          cardRef.current.addEventListener('mouseleave', () => {
            gsap.to(cardRef.current, {
              rotationX: 0,
              rotationY: 0,
              duration: 0.5, // Reducido de 0.8 a 0.5
              ease: "power2.out"
            });
          });
        }

      }, cardRef);
    })();

    return () => ctx && ctx.revert();
  }, []);

  return (
    <Card 
      ref={cardRef}
      className={`w-full max-w-sm sm:max-w-md shadow-2xl border-0 bg-white/10 backdrop-blur-xl z-10 relative overflow-hidden border border-white/20 mx-2 ${className}`}
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
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl ${iconBgColor} flex items-center justify-center shadow-2xl relative overflow-hidden`}>
              <div className="shine-3d absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="relative z-10 drop-shadow-lg">
                {icon}
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
              {title}
            </h1>
            <p className="text-gray-300/80 text-xs sm:text-sm mt-1 sm:mt-2 font-medium">
              {subtitle}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-8">
        {children}
      </CardContent>

      {footer && (
        <CardFooter className="px-4 sm:px-8 pb-4 sm:pb-6">
          {footer}
        </CardFooter>
      )}

      {/* Footer */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center z-20 px-2">
        <p className="text-xs text-gray-400/60 font-medium leading-relaxed">
          © {new Date().getFullYear()} Sistema de Gestión. Todos los derechos reservados.
        </p>
      </div>
    </Card>
  );
};

export default AuthCard; 