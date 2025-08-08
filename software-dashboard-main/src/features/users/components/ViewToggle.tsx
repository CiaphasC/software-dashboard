import React from 'react';
import { Button } from '@/shared/components/ui/Button';

export type ViewMode = 'table' | 'cards';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onShowFilters?: () => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ 
  viewMode, 
  onViewModeChange, 
  onShowFilters,
  className = "" 
}) => {
  return (
    <div className={`w-full lg:w-auto ${className}`}>
      {/* Toggle de vista - Diseño profesional inspirado en KokonutUI */}
      <div className="relative">
        {/* Contenedor principal con glassmorphism */}
        <div className="relative flex items-center bg-white/95 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-slate-200/50 w-full lg:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('table')}
            className={`flex-1 lg:flex-none px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-0 rounded-lg relative overflow-hidden ${
              viewMode === 'table' 
                ? '!bg-slate-900 !text-white !shadow-md transform scale-105' 
                : '!bg-transparent hover:!bg-slate-50 !text-slate-600 hover:!text-slate-800 hover:shadow-sm hover:scale-102'
            }`}
          >
            <svg className="w-4 h-4 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline relative z-10">Tabla</span>
            <span className="sm:hidden relative z-10">Tabla</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('cards')}
            className={`flex-1 lg:flex-none px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-0 rounded-lg relative overflow-hidden ${
              viewMode === 'cards' 
                ? '!bg-slate-900 !text-white !shadow-md transform scale-105' 
                : '!bg-transparent hover:!bg-slate-50 !text-slate-600 hover:!text-slate-800 hover:shadow-sm hover:scale-102'
            }`}
          >
            <svg className="w-4 h-4 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="hidden sm:inline relative z-10">Tarjetas</span>
            <span className="sm:hidden relative z-10">Cards</span>
          </Button>
        </div>
      </div>
    </div>
  );
}; 