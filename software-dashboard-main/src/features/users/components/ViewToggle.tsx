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
    <div className={`w-full sm:w-auto ${className}`}>
      {/* Toggle de vista - Responsivo */}
      <div className="flex items-center bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-xl p-1 shadow-lg w-full sm:w-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('table')}
          className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold transition-all duration-300 focus-visible:ring-0 rounded-lg sm:rounded-xl ${
            viewMode === 'table' 
              ? '!bg-gradient-to-r !from-blue-500 !to-sky-600 !text-white !shadow-lg !shadow-blue-500/25' 
              : '!bg-transparent hover:!bg-blue-50 !text-gray-600 hover:!text-blue-700'
          }`}
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="hidden sm:inline">Tabla</span>
          <span className="sm:hidden">Tabla</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('cards')}
          className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold transition-all duration-300 focus-visible:ring-0 rounded-lg sm:rounded-xl ${
            viewMode === 'cards' 
              ? '!bg-gradient-to-r !from-blue-500 !to-sky-600 !text-white !shadow-lg !shadow-blue-500/25' 
              : '!bg-transparent hover:!bg-blue-50 !text-gray-600 hover:!text-blue-700'
          }`}
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="hidden sm:inline">Tarjetas</span>
          <span className="sm:hidden">Cards</span>
        </Button>
      </div>
    </div>
  );
}; 