import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText,
  BarChart3,
  ArrowLeft,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Database,
  Crown,
  Sparkles,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { useReportsPage } from '@/features/reports/hooks/pages/useReportsPage';
import { ReportsFloatingParticles } from '@/shared/components/ui';
import { ReportStats, ReportPreview, ReportConfig } from '@/features/reports/components';

interface ReportData {
  incidents: any[];
  requirements: any[];
  metrics: any;
}

interface ReportConfig {
  title: string;
  dateRange: { start: Date; end: Date };
  type: 'incidents' | 'requirements' | 'performance' | 'comprehensive';
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeTables: boolean;
  includeSummary: boolean;
}

// Componente de partículas flotantes - Ahora usando el componente compartido

export const Reports: React.FC = () => {
  const {
    reportData,
    loading,
    error,
    generating,
    reportConfig,
    updateReportConfig,
    generateReport,
    navigateToDashboard
  } = useReportsPage();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium">Error: {error}</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <LoadingSpinner size="lg" />
          <motion.p
            className="mt-4 text-gray-600 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Cargando datos del reporte...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Partículas flotantes */}
      <ReportsFloatingParticles />

      {/* Fondo decorativo mejorado con efectos luminiscentes */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-slate-200/40 to-blue-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-slate-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-gray-200/30 to-slate-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-slate-200/25 to-blue-200/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        <motion.div
          className="space-y-8 sm:space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header Ultra Moderno con colores neutrales - MANTENIDO EXACTAMENTE IGUAL */}
          <motion.div 
            className="text-center py-4 sm:py-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-600 via-gray-700 to-blue-900 text-white shadow-2xl relative overflow-hidden"
                whileHover={{ rotate: 3, scale: 1.08 }}
                animate={{ 
                  boxShadow: [
                    "0 20px 40px rgba(71, 85, 105, 0.4)",
                    "0 20px 40px rgba(55, 65, 81, 0.5)",
                    "0 20px 40px rgba(30, 58, 138, 0.4)",
                    "0 20px 40px rgba(71, 85, 105, 0.4)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {/* Efecto de brillo mejorado */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 relative z-10" />
                
                {/* Partículas de brillo en el icono mejoradas */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white/80 rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${i * 45}deg) translateY(-25px)`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
                
                {/* Efecto de corona */}
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Crown className="h-6 w-6 text-yellow-300" />
                </motion.div>
              </motion.div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-600 via-gray-600 to-blue-900 bg-clip-text text-transparent mb-2">
                  Generador de Reportes
                </h1>
                <motion.div
                  className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                    <span>Análisis Profesional</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                    <span>Reportes Detallados</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Database className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    <span>Datos Precisos</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.p 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Genera reportes detallados en PDF, Excel y CSV con análisis completos del sistema de gestión.
            </motion.p>
          </motion.div>

          {/* Estadísticas de reportes con mejor espaciado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {reportData && <ReportStats reportData={reportData} />}
          </motion.div>

          {/* Configuración del Reporte con mejor espaciado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <ReportConfig onConfigChange={updateReportConfig} />
          </motion.div>

          {/* Botones de Acción mejorados */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button 
              onClick={generateReport}
              disabled={generating || !reportData}
              className="bg-gradient-to-r from-slate-600 to-blue-800 hover:from-slate-700 hover:to-blue-900 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 text-sm font-medium transform hover:scale-105"
            >
              {generating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {reportConfig.format === 'pdf' && <FileText className="h-5 w-5" />}
                  {reportConfig.format === 'excel' && <FileSpreadsheet className="h-5 w-5" />}
                  {reportConfig.format === 'csv' && <FileCode className="h-5 w-5" />}
                </>
              )}
              Generar Reporte {reportConfig.format.toUpperCase()}
            </Button>

            <Button 
              onClick={navigateToDashboard}
              variant="outline" 
              className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 text-sm font-medium transform hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al Dashboard
            </Button>
          </motion.div>

          {/* Vista Previa con mejor espaciado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <ReportPreview />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports; 
