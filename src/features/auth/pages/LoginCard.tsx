import React from 'react';

interface LoginCardProps {
  children: React.ReactNode;
}

const LoginCard: React.FC<LoginCardProps> = ({ children }) => (
  <div className="w-full max-w-sm sm:max-w-md shadow-2xl border-0 bg-white/15 backdrop-blur-xl z-10 relative overflow-hidden border border-white/20 mx-2">
    {children}
  </div>
);

export default LoginCard; 