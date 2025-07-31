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
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Toggle de vista - Solo visible en pantallas xl y superiores */}
      <div className="hidden xl:flex items-center bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-1.5 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('table')}
          className={`px-6 py-3 text-sm font-bold transition-all duration-300 focus-visible:ring-0 rounded-xl ${
            viewMode === 'table' 
              ? '!bg-gradient-to-r !from-blue-500 !to-sky-600 !text-white !shadow-lg !shadow-blue-500/25' 
              : '!bg-transparent hover:!bg-blue-50 !text-gray-600 hover:!text-blue-700'
          }`}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Tabla
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('cards')}
          className={`px-6 py-3 text-sm font-bold transition-all duration-300 focus-visible:ring-0 rounded-xl ${
            viewMode === 'cards' 
              ? '!bg-gradient-to-r !from-blue-500 !to-sky-600 !text-white !shadow-lg !shadow-blue-500/25' 
              : '!bg-transparent hover:!bg-blue-50 !text-gray-600 hover:!text-blue-700'
          }`}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Tarjetas
        </Button>
      </div>
    </div>
  );
}; 