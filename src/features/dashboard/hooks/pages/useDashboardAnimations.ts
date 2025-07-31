import { motion } from 'framer-motion';

/**
 * Hook personalizado para manejar todas las animaciones del Dashboard
 * 
 * Este hook centraliza toda la lógica de animaciones del dashboard, proporcionando:
 * - Variantes de animación reutilizables
 * - Configuraciones de transición optimizadas
 * - Efectos visuales consistentes
 * - Mejor mantenibilidad del código
 * 
 * @returns Objeto con todas las animaciones y configuraciones del dashboard
 */
export const useDashboardAnimations = () => {
  
  // =============================================================================
  // ANIMACIONES DE CARGA Y ESTADOS
  // =============================================================================
  
  /**
   * Animación para el estado de carga del dashboard
   * Proporciona una transición suave desde un estado invisible hasta visible
   * con un efecto de escala que simula la "aparición" del contenido
   */
  const loadingAnimation = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  };

  /**
   * Animación para el texto de carga con efecto pulsante
   * Crea un efecto de "respiración" en el texto para indicar actividad
   */
  const loadingTextAnimation = {
    animate: { opacity: [0.5, 1, 0.5] },
    transition: { duration: 2, repeat: Infinity }
  };

  /**
   * Animación para estados de error
   * Transición suave desde abajo hacia arriba con efecto de desvanecimiento
   */
  const errorAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  // =============================================================================
  // ANIMACIONES DEL CONTENEDOR PRINCIPAL
  // =============================================================================
  
  /**
   * Animación del contenedor principal del dashboard
   * Fade-in gradual para toda la interfaz
   */
  const containerAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8 }
  };

  // =============================================================================
  // ANIMACIONES DEL HEADER
  // =============================================================================
  
  /**
   * Animación del header principal del dashboard
   * Entrada desde arriba con efecto de desvanecimiento
   * Delay de 0.2s para crear secuencia visual
   */
  const headerAnimation = {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.2 }
  };

  /**
   * Animación del icono principal del dashboard
   * Efecto hover con rotación y escala
   * Animación continua de sombra para efecto "vivo"
   */
  const headerIconAnimation = {
    whileHover: { rotate: 5, scale: 1.1 },
    animate: { 
      boxShadow: [
        "0 20px 40px rgba(59, 130, 246, 0.3)",
        "0 20px 40px rgba(6, 182, 212, 0.4)",
        "0 20px 40px rgba(20, 184, 166, 0.3)",
        "0 20px 40px rgba(59, 130, 246, 0.3)"
      ]
    },
    transition: { duration: 4, repeat: Infinity }
  };

  /**
   * Animación del contenedor del icono principal
   * Efecto hover con escala y transición suave
   */
  const headerIconContainerAnimation = {
    whileHover: { scale: 1.05 },
    transition: { type: "spring" as const, stiffness: 300 }
  };

  /**
   * Animación del texto de estado del sistema
   * Aparece con delay para crear secuencia visual
   */
  const statusTextAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay: 0.6 }
  };

  /**
   * Animación de la descripción del dashboard
   * Entrada desde abajo con delay para secuencia
   */
  const descriptionAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.4 }
  };

  // =============================================================================
  // ANIMACIONES DE EFECTOS VISUALES
  // =============================================================================
  
  /**
   * Animación del efecto de brillo en el icono principal
   * Movimiento horizontal continuo para simular reflejo
   */
  const shimmerAnimation = {
    animate: {
      x: ['-100%', '100%'],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear" as const
    }
  };

  // =============================================================================
  // ANIMACIONES DE SECCIONES
  // =============================================================================
  
  /**
   * Animación para las métricas del dashboard
   * Entrada con delay para crear secuencia visual
   */
  const metricsAnimation = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.6 }
  };

  /**
   * Animación para la sección de actividades recientes
   * Entrada final en la secuencia visual
   */
  const activitiesAnimation = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.8 }
  };

  // =============================================================================
  // CONFIGURACIONES DE TRANSICIÓN REUTILIZABLES
  // =============================================================================
  
  /**
   * Configuración de transición suave para elementos interactivos
   * Usada para hover effects y cambios de estado
   */
  const smoothTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 20
  };

  /**
   * Configuración de transición rápida para feedback inmediato
   * Usada para clicks y acciones del usuario
   */
  const quickTransition = {
    duration: 0.2,
    ease: "easeOut" as const
  };

  /**
   * Configuración de transición para efectos de escala
   * Usada para elementos que crecen o se reducen
   */
  const scaleTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: 15
  };

  // =============================================================================
  // ANIMACIONES DE FONDO DECORATIVO
  // =============================================================================
  
  /**
   * Configuración para los elementos de fondo decorativo
   * Efecto pulsante continuo para crear ambiente dinámico
   */
  const backgroundElementStyle = {
    animationDelay: '2s'
  };

  // =============================================================================
  // RETORNO DE TODAS LAS ANIMACIONES
  // =============================================================================
  
  return {
    // Animaciones de estado
    loadingAnimation,
    loadingTextAnimation,
    errorAnimation,
    
    // Animaciones de contenedor
    containerAnimation,
    
    // Animaciones de header
    headerAnimation,
    headerIconAnimation,
    headerIconContainerAnimation,
    statusTextAnimation,
    descriptionAnimation,
    
    // Animaciones de efectos
    shimmerAnimation,
    
    // Animaciones de secciones
    metricsAnimation,
    activitiesAnimation,
    
    // Configuraciones de transición
    smoothTransition,
    quickTransition,
    scaleTransition,
    
    // Estilos de fondo
    backgroundElementStyle
  };
}; 