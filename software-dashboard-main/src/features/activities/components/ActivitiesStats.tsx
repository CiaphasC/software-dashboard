import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/Card';

interface Activity {
  id: string;
  type: 'incident' | 'requirement' | 'user' | 'system';
  action: 'created' | 'updated' | 'resolved' | 'deleted' | 'closed';
  title: string;
  description: string;
  user: string;
  timestamp: Date;
}

interface ActivitiesStatsProps {
  activities: Activity[];
  className?: string;
}

const ActivitiesStats: React.FC<ActivitiesStatsProps> = ({ activities, className = '' }) => {
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 15 
      }
    }
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Actividades */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Clock className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Actividades</p>
                  <motion.p 
                    className="text-3xl font-bold text-blue-800"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    {activities.length}
                  </motion.p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Incidencias */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <AlertTriangle className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-orange-600 font-medium">Incidencias</p>
                  <motion.p 
                    className="text-3xl font-bold text-orange-800"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    {activities.filter(a => a.type === 'incident').length}
                  </motion.p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Requerimientos */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <FileText className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Requerimientos</p>
                  <motion.p 
                    className="text-3xl font-bold text-indigo-800"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    {activities.filter(a => a.type === 'requirement').length}
                  </motion.p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Resueltos */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <CheckCircle className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Resueltos</p>
                  <motion.p 
                    className="text-3xl font-bold text-green-800"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    {activities.filter(a => a.action === 'resolved').length}
                  </motion.p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ActivitiesStats; 