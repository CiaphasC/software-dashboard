import React from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiWifi, FiWifiOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useReactive } from '../core/ReactiveProvider';
import { useObservable } from '../hooks/useReactiveData';

interface ReactiveIndicatorProps {
  showStatus?: boolean;
  showLastUpdated?: boolean;
  className?: string;
}

export const ReactiveIndicator: React.FC<ReactiveIndicatorProps> = ({
  showStatus = true,
  showLastUpdated = true,
  className = ''
}) => {
  const { globalState$, refresh } = useReactive();
  const globalState = useObservable(globalState$);

  if (!globalState) return null;

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)}h`;
    return `Hace ${Math.floor(minutes / 1440)}d`;
  };

  return (
    <motion.div
      className={`flex items-center gap-2 text-xs ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Connection Status */}
      {showStatus && (
        <div className="flex items-center gap-1">
          {globalState.isConnected ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FiWifi className="h-3 w-3 text-green-500" />
            </motion.div>
          ) : (
            <FiWifiOff className="h-3 w-3 text-red-500" />
          )}
          <span className={globalState.isConnected ? 'text-green-600' : 'text-red-600'}>
            {globalState.isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      )}

      {/* Loading Indicator */}
      {globalState.isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-blue-500"
        >
          <FiRefreshCw className="h-3 w-3" />
        </motion.div>
      )}

      {/* Error Indicator */}
      {globalState.error && (
        <div className="flex items-center gap-1 text-red-500">
          <FiAlertCircle className="h-3 w-3" />
          <span>Error</span>
        </div>
      )}

      {/* Success Indicator */}
      {!globalState.error && !globalState.isLoading && globalState.lastUpdated && (
        <div className="flex items-center gap-1 text-green-500">
          <FiCheckCircle className="h-3 w-3" />
        </div>
      )}

      {/* Last Updated */}
      {showLastUpdated && globalState.lastUpdated && (
        <span className="text-gray-500">
          {formatLastUpdated(globalState.lastUpdated)}
        </span>
      )}

      {/* Refresh Button */}
      <motion.button
        onClick={refresh}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        title="Actualizar datos"
      >
        <FiRefreshCw className="h-3 w-3 text-gray-500" />
      </motion.button>
    </motion.div>
  );
}; 