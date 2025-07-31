import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface LoginHeaderProps {
  buttonShineAnimation: any;
  sparkleAnimation: any;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ buttonShineAnimation, sparkleAnimation }) => (
  <div className="flex flex-col items-center gap-3 sm:gap-4">
    {/* Logo moderno con efectos */}
    <div className="relative">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          {...buttonShineAnimation}
        />
        <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10 drop-shadow-lg" />
      </div>
      <motion.div
        className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
        {...sparkleAnimation}
      >
        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
      </motion.div>
    </div>
    <div className="text-center">
      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
        Sistema de Gestión
      </h1>
      <p className="text-gray-300/80 text-xs sm:text-sm mt-1 sm:mt-2 font-medium">
        Inicia sesión para continuar
      </p>
    </div>
  </div>
);

export default LoginHeader; 