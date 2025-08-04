import React from 'react';
import { Clock, Zap, CheckCircle } from 'lucide-react';
import { formatDuration } from '@/shared/utils/utils';

interface TimeMetricsProps {
  responseTimeHours?: number | null;
  reviewTimeHours?: number | null;
  resolutionTimeHours?: number | null;
  reviewStartedAt?: string | null;
  resolvedAt?: string | null;
  compact?: boolean;
}

export const TimeMetrics: React.FC<TimeMetricsProps> = ({
  responseTimeHours,
  reviewTimeHours,
  resolutionTimeHours,
  reviewStartedAt,
  resolvedAt,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs">
        {responseTimeHours !== null && responseTimeHours !== undefined && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md border border-orange-200">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(responseTimeHours)}</span>
          </div>
        )}
        {reviewTimeHours !== null && reviewTimeHours !== undefined && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
            <Zap className="h-3 w-3" />
            <span>{formatDuration(reviewTimeHours)}</span>
          </div>
        )}
        {resolutionTimeHours !== null && resolutionTimeHours !== undefined && (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-200">
            <CheckCircle className="h-3 w-3" />
            <span>{formatDuration(resolutionTimeHours)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Tiempo de Respuesta */}
      {responseTimeHours !== null && responseTimeHours !== undefined && (
        <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Tiempo de Respuesta</span>
          </div>
          <span className="text-sm font-semibold text-orange-700">
            {formatDuration(responseTimeHours)}
          </span>
        </div>
      )}

      {/* Tiempo de Revisión */}
      {reviewTimeHours !== null && reviewTimeHours !== undefined && (
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Tiempo de Revisión</span>
          </div>
          <span className="text-sm font-semibold text-blue-700">
            {formatDuration(reviewTimeHours)}
          </span>
        </div>
      )}

      {/* Tiempo Total */}
      {resolutionTimeHours !== null && resolutionTimeHours !== undefined && (
        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Tiempo Total</span>
          </div>
          <span className="text-sm font-semibold text-green-700">
            {formatDuration(resolutionTimeHours)}
          </span>
        </div>
      )}

      {/* Fechas Detalladas */}
      <div className="text-xs text-gray-500 space-y-1 mt-3 p-2 bg-gray-50 rounded-lg">
        {reviewStartedAt && (
          <p><strong>Inicio de Revisión:</strong> {new Date(reviewStartedAt).toLocaleString()}</p>
        )}
        {resolvedAt && (
          <p><strong>Resolución:</strong> {new Date(resolvedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}; 