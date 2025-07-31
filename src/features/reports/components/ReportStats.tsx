import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { 
  AlertTriangle, 
  Clock, 
  FileText, 
  TrendingUp 
} from 'lucide-react';

interface ReportData {
  metrics: {
    totalIncidents: number;
    openIncidents: number;
    pendingRequirements: number;
  };
}

interface ReportStatsProps {
  reportData: ReportData;
}

export const ReportStats: React.FC<ReportStatsProps> = ({ reportData }) => {
  const stats = [
    {
      title: 'Total Incidencias',
      value: reportData.metrics.totalIncidents,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'from-slate-600 via-gray-700 to-blue-900',
      glowColor: '#475569',
      trend: '+12%',
      trendColor: 'text-emerald-600',
      trendBg: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/60',
      bgGradient: 'from-red-50 to-orange-50',
      borderColor: 'border-red-200/50'
    },
    {
      title: 'Incidencias Abiertas',
      value: reportData.metrics.openIncidents,
      icon: <Clock className="h-6 w-6" />,
      color: 'from-slate-600 via-gray-700 to-blue-900',
      glowColor: '#475569',
      trend: '+5%',
      trendColor: 'text-orange-600',
      trendBg: 'bg-orange-50/90 text-orange-700 border-orange-200/60',
      bgGradient: 'from-orange-50 to-yellow-50',
      borderColor: 'border-orange-200/50'
    },
    {
      title: 'Requerimientos',
      value: reportData.metrics.pendingRequirements,
      icon: <FileText className="h-6 w-6" />,
      color: 'from-slate-600 via-gray-700 to-blue-900',
      glowColor: '#475569',
      trend: '-2%',
      trendColor: 'text-emerald-600',
      trendBg: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/60',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200/50'
    },
    {
      title: 'Performance',
      value: '94%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'from-slate-600 via-gray-700 to-blue-900',
      glowColor: '#475569',
      trend: '+8%',
      trendColor: 'text-emerald-600',
      trendBg: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/60',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200/50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: index * 0.15,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          whileHover={{ 
            y: -8, 
            scale: 1.03,
            transition: { duration: 0.3, type: "spring", stiffness: 300 }
          }}
          className="group"
        >
          <Card className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl border ${stat.borderColor} shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl`}>
            {/* Efecto de luminiscencia mejorado */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: `radial-gradient(500px circle at 50% 50%, ${stat.glowColor}15, transparent 50%)`
              }}
            />
            
            {/* Fondo decorativo mejorado */}
            <motion.div
              className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-20 translate-x-20 blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.3, 0.1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Efecto de brillo sutil */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.5
              }}
            />
            
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <motion.p 
                    className="text-sm font-semibold text-gray-600 mb-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                  >
                    {stat.title}
                  </motion.p>
                  <motion.p 
                    className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.15 + 0.4, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.p>
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 + 0.5 }}
                  >
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${stat.trendBg} shadow-sm`}>
                      {stat.trend}
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    </motion.div>
                  </motion.div>
                </div>
                                  <motion.div
                    className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:shadow-xl transition-all duration-500 relative overflow-hidden`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    style={{
                      boxShadow: `0 0 25px ${stat.glowColor}40`
                    }}
                    initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: index * 0.15 + 0.6, 
                      type: "spring", 
                      stiffness: 200,
                      duration: 0.8
                    }}
                  >
                  {/* Efecto de brillo en el icono */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: index * 0.3
                    }}
                  />
                  <motion.div 
                    className="relative z-10"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: index * 0.2
                    }}
                  >
                    {stat.icon}
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Línea decorativa inferior */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: index * 0.15 + 0.8, duration: 0.8 }}
              />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}; 