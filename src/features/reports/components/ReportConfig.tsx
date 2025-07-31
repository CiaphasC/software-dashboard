import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  FileText,
  Filter,
  Download,
  Calendar,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { useReportConfig, ReportConfig as ReportConfigType } from '@/features/reports/hooks/components/useReportConfig';

interface ReportConfigProps {
  onConfigChange?: (config: ReportConfigType) => void;
}

export const ReportConfig: React.FC<ReportConfigProps> = ({ onConfigChange }) => {
  const { reportConfig, updateReportConfig } = useReportConfig();

  // Notificar cambios al componente padre
  React.useEffect(() => {
    if (onConfigChange) {
      onConfigChange(reportConfig);
    }
  }, [reportConfig, onConfigChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <Card className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl overflow-hidden rounded-2xl">
        {/* Header mejorado */}
        <CardHeader className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 border-b border-gray-200/50 p-6">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="p-3 bg-gradient-to-br from-slate-600 to-blue-800 rounded-xl text-white shadow-lg relative overflow-hidden"
                whileHover={{ rotate: 3, scale: 1.05 }}
                animate={{ 
                  boxShadow: [
                    "0 10px 25px rgba(71, 85, 105, 0.3)",
                    "0 10px 25px rgba(30, 58, 138, 0.4)",
                    "0 10px 25px rgba(71, 85, 105, 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {/* Efecto de brillo en el icono */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <Settings className="h-5 w-5 relative z-10" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-700 to-blue-800 bg-clip-text text-transparent">
                Configuración del Reporte
              </span>
            </motion.div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Título del Reporte - Diseño mejorado */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.label 
                className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white shadow-md"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FileText className="h-3.5 w-3.5" />
                </motion.div>
                Título del Reporte
              </motion.label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Input
                  value={reportConfig.title}
                  onChange={(e) => updateReportConfig({ title: e.target.value })}
                  placeholder="Ej: Reporte Mensual de Incidencias"
                  className="bg-white/90 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl transition-all duration-300 hover:shadow-lg shadow-md"
                />
              </motion.div>
            </motion.div>

            {/* Tipo de Reporte - Diseño mejorado */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.label 
                className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="p-1.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg text-white shadow-md"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Filter className="h-3.5 w-3.5" />
                </motion.div>
                Tipo de Reporte
              </motion.label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Select
                  value={reportConfig.type}
                  onChange={(e) => updateReportConfig({ type: e.target.value as any })}
                  options={[
                    { value: 'comprehensive', label: 'Comprehensivo' },
                    { value: 'incidents', label: 'Solo Incidencias' },
                    { value: 'requirements', label: 'Solo Requerimientos' },
                    { value: 'performance', label: 'Performance' }
                  ]}
                  className="bg-white/90 backdrop-blur-sm border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl transition-all duration-300 hover:shadow-lg shadow-md"
                />
              </motion.div>
            </motion.div>

            {/* Formato - Diseño mejorado */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.label 
                className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="p-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white shadow-md"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Download className="h-3.5 w-3.5" />
                </motion.div>
                Formato
              </motion.label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Select
                  value={reportConfig.format}
                  onChange={(e) => updateReportConfig({ format: e.target.value as any })}
                  options={[
                    { value: 'pdf', label: 'PDF' },
                    { value: 'excel', label: 'Excel' },
                    { value: 'csv', label: 'CSV' }
                  ]}
                  className="bg-white/90 backdrop-blur-sm border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-xl transition-all duration-300 hover:shadow-lg shadow-md"
                />
              </motion.div>
            </motion.div>

            {/* Fecha Inicio - Diseño mejorado */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.label 
                className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="p-1.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg text-white shadow-md"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Calendar className="h-3.5 w-3.5" />
                </motion.div>
                Fecha Inicio
              </motion.label>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Input 
                  type="date" 
                  value={reportConfig.dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => updateReportConfig({
                    dateRange: { ...reportConfig.dateRange, start: new Date(e.target.value) }
                  })}
                  className="bg-white/90 backdrop-blur-sm border-gray-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl transition-all duration-300 hover:shadow-lg shadow-md pr-10"
                />
                {/* Icono de calendario dentro del input */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Calendar className="h-4 w-4" />
                </div>
              </motion.div>
            </motion.div>

            {/* Fecha Fin - Diseño mejorado */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.label 
                className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="p-1.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg text-white shadow-md"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Calendar className="h-3.5 w-3.5" />
                </motion.div>
                Fecha Fin
              </motion.label>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Input 
                  type="date" 
                  value={reportConfig.dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => updateReportConfig({
                    dateRange: { ...reportConfig.dateRange, end: new Date(e.target.value) }
                  })}
                  className="bg-white/90 backdrop-blur-sm border-gray-200 focus:border-red-400 focus:ring-red-400 rounded-xl transition-all duration-300 hover:shadow-lg shadow-md pr-10"
                />
                {/* Icono de calendario dentro del input */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Calendar className="h-4 w-4" />
                </div>
              </motion.div>
            </motion.div>

            {/* Opciones - Diseño mejorado */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.label 
                className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="p-1.5 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg text-white shadow-md"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Zap className="h-3.5 w-3.5" />
                </motion.div>
                Opciones
              </motion.label>
              <motion.div 
                className="space-y-4 bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-6 border border-gray-200/50 shadow-md"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Incluir Resumen */}
                <motion.label 
                  className="flex items-center gap-3 cursor-pointer group"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeSummary}
                      onChange={(e) => updateReportConfig({ includeSummary: e.target.checked })}
                      className="sr-only"
                    />
                    <motion.div 
                      className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        reportConfig.includeSummary 
                          ? 'bg-blue-600 border-blue-600 shadow-lg' 
                          : 'bg-white border-gray-300 group-hover:border-blue-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {reportConfig.includeSummary && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    Incluir Resumen
                  </span>
                </motion.label>

                {/* Incluir Tablas */}
                <motion.label 
                  className="flex items-center gap-3 cursor-pointer group"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeTables}
                      onChange={(e) => updateReportConfig({ includeTables: e.target.checked })}
                      className="sr-only"
                    />
                    <motion.div 
                      className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        reportConfig.includeTables 
                          ? 'bg-green-600 border-green-600 shadow-lg' 
                          : 'bg-white border-gray-300 group-hover:border-green-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {reportConfig.includeTables && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                    Incluir Tablas
                  </span>
                </motion.label>

                {/* Incluir Gráficos */}
                <motion.label 
                  className="flex items-center gap-3 cursor-pointer group"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeCharts}
                      onChange={(e) => updateReportConfig({ includeCharts: e.target.checked })}
                      className="sr-only"
                    />
                    <motion.div 
                      className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        reportConfig.includeCharts 
                          ? 'bg-purple-600 border-purple-600 shadow-lg' 
                          : 'bg-white border-gray-300 group-hover:border-purple-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {reportConfig.includeCharts && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                    Incluir Gráficos
                  </span>
                </motion.label>
              </motion.div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 