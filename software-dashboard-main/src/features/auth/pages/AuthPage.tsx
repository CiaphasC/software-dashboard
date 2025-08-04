import React, { useState, useCallback } from 'react';
import { Login, Register, AuthBackground } from '@/features/auth/components';

/**
 * Página principal de autenticación
 * Maneja el estado entre login y registro
 * Renderiza el fondo animado y los componentes correspondientes
 */
const LoginPage: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);

  const handleShowRegister = useCallback(() => {
    setShowRegister(true);
  }, []);

  const handleBackToLogin = useCallback(() => {
    setShowRegister(false);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2 sm:p-4 relative overflow-hidden">
      {/* Fondo animado */}
      <AuthBackground />
      
      {/* Contenido principal */}
      {showRegister ? (
        <Register onBackToLogin={handleBackToLogin} />
      ) : (
        <Login onShowRegister={handleShowRegister} />
      )}
    </div>
  );
};

export default LoginPage; 