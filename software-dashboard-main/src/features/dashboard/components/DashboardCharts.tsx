import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiCrosshair, FiClock, FiHome, FiStar, FiTrendingUp, FiAlertTriangle, FiFileText, FiGift, FiPieChart } from 'react-icons/fi';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { BarChart, AreaChart, PieChart, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Bar, Area, Line, Pie } from 'recharts';
import { useDashboardCharts } from '@/features/dashboard/hooks/components';
import { DashboardMetrics } from '@/shared/types/common.types';

interface DashboardChartsProps {
  metrics: DashboardMetrics | null;
}

// Mapeo de iconos
const iconMap: { [key: string]: React.ComponentType } = {
  FiCalendar,
  FiCrosshair,
  FiClock,
  FiHome,
  FiStar,
  FiTrendingUp,
  FiAlertTriangle,
  FiFileText,
  FiGift,
  FiPieChart
};

// Componente para renderizar gráficos dinámicamente
const ChartRenderer: React.FC<{
  chartType: 'area' | 'bar' | 'pie' | 'line';
  data: any[];
  config: any;
  getTooltipStyle: () => any;
}> = ({ chartType, data, config, getTooltipStyle }) => {
  const tooltipStyle = getTooltipStyle();

  switch (chartType) {
    case 'area':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={config.margin}>
            <defs>
              <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.gradientColors[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={config.gradientColors[1]} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              fontSize={config.xAxis.fontSize}
              angle={config.xAxis.angle}
              textAnchor={config.xAxis.textAnchor}
              height={config.xAxis.height}
            />
            <YAxis fontSize={config.yAxis.fontSize} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area 
              type="monotone" 
              dataKey={config.dataKey} 
              stroke={config.stroke} 
              strokeWidth={config.strokeWidth}
              fill={`url(#${config.gradientId})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      );

    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={config.margin}>
            <defs>
              <linearGradient id="colorIncidencias" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              fontSize={config.xAxis.fontSize}
              angle={config.xAxis.angle}
              textAnchor={config.xAxis.textAnchor}
              height={config.xAxis.height}
            />
            <YAxis fontSize={config.yAxis.fontSize} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar 
              dataKey={config.dataKey} 
              fill={config.fill} 
              radius={config.radius}
            />
          </BarChart>
        </ResponsiveContainer>
      );

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx={config.cx}
              cy={config.cy}
              outerRadius={config.outerRadius}
              dataKey={config.dataKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      );

    case 'line':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={config.margin}>
            <defs>
              <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.gradientColors[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={config.gradientColors[1]} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis fontSize={config.xAxis.fontSize} />
            <YAxis fontSize={config.yAxis.fontSize} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line 
              type="monotone" 
              dataKey={config.dataKey} 
              stroke={config.stroke} 
              strokeWidth={config.strokeWidth}
              dot={{ fill: config.stroke, strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
};

// Componente para las tarjetas de métricas
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  trend: number;
  subtitle: string;
  status: 'danger' | 'warning' | 'info' | 'success';
  color: string;
}> = ({ title, value, icon, trend, subtitle, status, color }) => {
  const IconComponent = iconMap[icon] || FiStar;
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
              {isPositive ? '+' : ''}{trend}%
            </div>
            <div className="text-xs text-gray-500">vs mes anterior</div>
          </div>
        </div>
        
        <div className="mb-2">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
        
        <p className="text-xs text-gray-500">{subtitle}</p>
      </Card>
    </motion.div>
  );
};

// Componente para las tarjetas de gráficos
const ChartCard: React.FC<{
  title: string;
  subtitle: string;
  icon: string;
  variant: 'default' | 'gradient' | 'glass';
  data: any[];
  chartType: 'area' | 'bar' | 'pie' | 'line';
  config: any;
  getTooltipStyle: () => any;
}> = ({ title, subtitle, icon, variant, data, chartType, config, getTooltipStyle }) => {
  const IconComponent = iconMap[icon] || FiStar;

  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200';
      case 'glass':
        return 'bg-white/80 backdrop-blur-sm border-gray-200/50';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${getVariantClasses()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
          <Badge variant="success" className="bg-green-100 text-green-800">
            Activo
          </Badge>
        </div>
        
        <div className="mt-6">
          <ChartRenderer 
            chartType={chartType} 
            data={data} 
            config={config}
            getTooltipStyle={getTooltipStyle}
          />
        </div>
      </Card>
    </motion.div>
  );
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  metrics
}) => {
  const {
    metricCards,
    chartCards,
    getChartConfig,
    getTooltipStyle
  } = useDashboardCharts(metrics);

  return (
    <div className="space-y-8">
      {/* Sección de Métricas */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Métricas del Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Sección de Gráficos */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Análisis Visual</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartCards.map((chart, index) => (
            <ChartCard key={index} {...chart} getTooltipStyle={getTooltipStyle} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts; 