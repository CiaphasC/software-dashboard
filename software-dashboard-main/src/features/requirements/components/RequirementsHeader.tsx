import React from 'react';
import { motion } from 'framer-motion';
import { FileText, BarChart3, Database, Crown } from 'lucide-react';

interface RequirementsHeaderProps {
  className?: string;
}

export const RequirementsHeader: React.FC<RequirementsHeaderProps> = ({ className = '' }) => {
  return (
    <motion.div 
      className={`text-center py-4 sm:py-8 ${className}`}
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <motion.div
        className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-6"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div 
          className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white shadow-2xl relative overflow-hidden"
          whileHover={{ rotate: 3, scale: 1.08 }}
          animate={{ 
            boxShadow: [
              "0 20px 40px rgba(16, 185, 129, 0.4)",
              "0 20px 40px rgba(34, 197, 94, 0.5)",
              "0 20px 40px rgba(20, 184, 166, 0.4)",
              "0 20px 40px rgba(16, 185, 129, 0.4)"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          {/* Efecto de brillo mejorado */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <FileText className="h-8 w-8 sm:h-12 sm:w-12 relative z-10" />
          
          {/* Partículas de brillo en el icono mejoradas */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/80 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 45}deg) translateY(-25px)`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
          
          {/* Efecto de corona */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Crown className="h-6 w-6 text-yellow-300" />
          </motion.div>
        </motion.div>
        
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Gestión de Requerimientos
          </h1>
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
              <span>Gestión Profesional</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span>Análisis Detallado</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Database className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600" />
              <span>Control Estratégico</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 