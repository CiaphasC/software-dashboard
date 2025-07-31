import React from 'react';
import { DashboardCharts } from './DashboardCharts';
import { DashboardMetrics as DashboardMetricsType } from '@/shared/types/common.types';

interface DashboardMetricsProps {
  metrics: DashboardMetricsType | null;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ 
  metrics
}) => {
  return (
    <DashboardCharts
      metrics={metrics}
    />
  );
};

export default DashboardMetrics; 