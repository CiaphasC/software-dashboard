import React, { useRef, useEffect } from 'react';

/**
 * Componente de fondo animado para autenticación
 * Proporciona efectos visuales consistentes para login y registro
 */
const AuthBackground: React.FC = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Animaciones GSAP para el fondo
  useEffect(() => {
    let ctx: any;
    (async () => {
      const { gsap } = await import('gsap');
      const { MotionPathPlugin } = await import('gsap/MotionPathPlugin');
      gsap.registerPlugin(MotionPathPlugin);
      
      ctx = gsap.context(() => {
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

        // 3. Efecto de ondas en el fondo
        gsap.to(".wave-effect", {
          y: -20,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          stagger: 0.5
        });

      }, backgroundRef);
    })();

    return () => ctx && ctx.revert();
  }, []);

  return (
    <>
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
    </>
  );
};

export default AuthBackground; 