import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface ActivitiesHeaderProps {
  className?: string;
}

const ActivitiesHeader: React.FC<ActivitiesHeaderProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 15 
      }
    }
  };

  return (
    <motion.div 
      variants={itemVariants} 
      className={`relative ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/10 rounded-2xl opacity-10"></div>
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Icono */}
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }} 
            className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg"
          >
            <Activity className="h-9 w-9 text-white" />
          </motion.div>
          
          {/* Título y subtítulo */}
          <div className="flex-1 text-center sm:text-left">
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent mb-2 tracking-tight" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
            >
              Actividades del Sistema
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-lg" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.3 }}
            >
              Historial completo y detallado de todas las actividades
            </motion.p>
          </div>
          
          {/* Botón de navegación */}
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivitiesHeader; 