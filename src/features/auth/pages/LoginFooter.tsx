import React from 'react';
import { motion } from 'framer-motion';

const LoginFooter: React.FC = () => (
  <>
    <motion.div
      className="w-full text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <p className="text-xs sm:text-sm text-gray-300/80">
        ¿Problemas para acceder?{' '}
        <a
          href="#"
          className="text-blue-300 hover:text-blue-200 font-medium underline decoration-blue-300/50 hover:decoration-blue-200 transition-all duration-200 touch-manipulation"
        >
          Contacta al administrador
        </a>
      </p>
    </motion.div>
    <motion.div
      className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center z-20 px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
    >
      <p className="text-xs text-gray-400/60 font-medium leading-relaxed">
        © {new Date().getFullYear()} Sistema de Gestión. Todos los derechos reservados.
      </p>
    </motion.div>
  </>
);

export default LoginFooter; 