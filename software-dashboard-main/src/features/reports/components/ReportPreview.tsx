import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { 
  AlertTriangle, 
  Building2, 
  Eye, 
  FileText, 
  Star, 
  Users, 
  RefreshCw,
  Activity
} from 'lucide-react';
import { useReportPreview } from '@/features/reports/hooks/components/useReportPreview';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';

export const ReportPreview: React.FC = () => {
  const {
    reportData,
    isLoading,
    error,
    summaryStats,
    recentIncidents,
    recentRequirements,
    refreshData
  } = useReportPreview();

  // Estado de carga
  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Cargando vista previa...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar datos</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sin datos
  if (!reportData) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay datos disponibles</h3>
            <p className="text-gray-600 mb-4">No se encontraron datos para mostrar en la vista previa</p>
            <button
              onClick={refreshData}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <CardTitle className="flex items-center justify-between text-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-600 rounded-lg text-white">
              <Eye className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-800">
              Vista Previa del Reporte
            </span>
          </div>
          
          <button
            onClick={refreshData}
            className="p-2 text-gray-600 hover:text-slate-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumen */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500 rounded-lg text-white">
                <Star className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Resumen</h3>
            </div>
            
            <div className="space-y-4">
              {/* Total Incidencias */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-500 rounded-lg text-white">
                      <Activity className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Total Incidencias</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-700">
                    {summaryStats.totalIncidents}
                  </span>
                </div>
              </div>

              {/* Incidencias Abiertas */}
              <div className="p-5 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 rounded-lg text-white">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Incidencias Abiertas</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">
                    {summaryStats.openIncidents}
                  </span>
                </div>
              </div>

              {/* Requerimientos */}
              <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg text-white">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Requerimientos</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {summaryStats.pendingRequirements}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Incidencias Recientes */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Incidencias Recientes</h3>
            </div>
            
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {recentIncidents.map((incident) => (
                <div 
                  key={incident.id} 
                  className="p-4 bg-white rounded-xl border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                        {incident.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        <span className="font-medium">{incident.type}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-medium">{incident.priority}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${incident.statusColor}`}>
                      {incident.statusText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requerimientos */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg text-white">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Requerimientos</h3>
            </div>
            
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {recentRequirements.map((req) => (
                <div 
                  key={req.id} 
                  className="p-4 bg-white rounded-xl border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                        {req.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">{req.type}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-medium">{req.requestingArea}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${req.statusColor}`}>
                      {req.statusText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 