import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, User, Lock, Zap } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { loginSchema, type LoginFormData } from '@/shared/utils/schemas';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  loading: boolean;
  loadingAnimation: any;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading, loadingAnimation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
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
            <EyeOff className="w-4 h-4" style={{ display: showPassword ? 'block' : 'none' }} />
            <Eye className="w-4 h-4" style={{ display: !showPassword ? 'block' : 'none' }} />
          </button>
        </div>
      </div>
      <div className="pt-3 sm:pt-4">
        <Button
          type="submit"
          className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 relative overflow-hidden group touch-manipulation"
          loading={loading}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <span className="inline-block"><Zap className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /></span>
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
  );
};

export default LoginForm; 