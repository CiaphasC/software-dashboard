import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Globe,
  Save,
  Eye,
  EyeOff,
  Check,
  X,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Info,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe2,
  CreditCard,
  Calendar,
  Monitor,
  HardDrive,
  ShieldCheck,
  Wifi,
  Zap,
  ChevronRight,
  Sun,
  Moon,
  Smartphone,
  Users,
  Lock,
  Key,
  RefreshCw,
  Trash2,
  Copy,
  ExternalLink,
  Star,
  TrendingUp,
  Activity,
  BarChart3,
  Layers,
  Grid,
  List,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { Select } from '@/shared/components/ui/Select';
import { toast } from 'react-hot-toast';
import { useConfig } from '@/shared/context/ConfigContext';

interface TabProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
  description: string;
}

const Tab: React.FC<TabProps> = ({ id, label, icon: Icon, active, onClick, description }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
      active
        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
        : 'bg-white/50 hover:bg-white/80 text-gray-700 hover:text-gray-900 border border-gray-200/50 hover:border-blue-200'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg transition-all duration-300 ${
        active 
          ? 'bg-white/20 text-white' 
          : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
      }`}>
    <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h3 className={`font-semibold text-sm transition-colors duration-300 ${
          active ? 'text-white' : 'text-gray-900'
        }`}>
          {label}
        </h3>
        <p className={`text-xs mt-0.5 transition-colors duration-300 ${
          active ? 'text-white/80' : 'text-gray-500'
        }`}>
          {description}
        </p>
      </div>
      <ChevronRight className={`h-4 w-4 transition-all duration-300 ${
        active ? 'text-white/80 rotate-90' : 'text-gray-400 group-hover:text-blue-500'
      }`} />
    </div>
  </motion.button>
);

const SettingCard: React.FC<{
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  gradient?: string;
}> = ({ title, description, icon: Icon, children, gradient = "from-blue-500 to-indigo-600" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className={`bg-gradient-to-r ${gradient} text-white pb-4`}>
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-white/20 rounded-lg">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-white/80 text-sm font-normal mt-1">{description}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

const ToggleSetting: React.FC<{
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}> = ({ title, description, enabled, onToggle, icon: Icon }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50 hover:border-blue-200 transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={`p-2 rounded-lg ${
          enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-0.5">{description}</p>
      </div>
    </div>
    <Button
      variant={enabled ? 'default' : 'outline'}
      size="sm"
      onClick={onToggle}
      className={`transition-all duration-300 ${
        enabled 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25' 
          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
      }`}
    >
      {enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
    </Button>
  </motion.div>
);

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: string;
}> = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    className={`p-4 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs text-white/80">{trend}</span>
          </div>
        )}
      </div>
      <div className="p-2 bg-white/20 rounded-lg">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </motion.div>
);

export const SettingsPage: React.FC = () => {
  const { config, setConfig, updateSection, resetConfig } = useConfig();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Detectar cambios
  const handleSettingChange = (section: keyof typeof config, key: string, value: any) => {
    updateSection(section, { [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500));
      setSaving(false);
      setHasChanges(false);
    toast.success('✅ Configuración guardada exitosamente');
  };

  const handleReset = () => {
    resetConfig();
    setHasChanges(false);
    toast.success('🔄 Configuración restaurada a valores predeterminados');
  };

  const handleExport = async () => {
    try {
      const configData = JSON.stringify(config, null, 2);
      const blob = new Blob([configData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('📁 Configuración exportada correctamente');
    } catch (error) {
      toast.error('❌ Error al exportar la configuración');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const configData = e.target?.result as string;
        const importedConfig = JSON.parse(configData);
        setConfig(importedConfig);
        setHasChanges(true);
        toast.success('📂 Configuración importada correctamente');
      } catch (error) {
        toast.error('❌ Error al importar la configuración');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { 
      id: 'general', 
      label: 'General', 
      icon: Settings, 
      description: 'Configuración básica del sistema' 
    },
    { 
      id: 'notifications', 
      label: 'Notificaciones', 
      icon: Bell, 
      description: 'Preferencias de alertas y mensajes' 
    },
    { 
      id: 'security', 
      label: 'Seguridad', 
      icon: Shield, 
      description: 'Configuración de seguridad y acceso' 
    },
    { 
      id: 'appearance', 
      label: 'Apariencia', 
      icon: Palette, 
      description: 'Personalización visual y temas' 
    },
    { 
      id: 'system', 
      label: 'Sistema', 
      icon: Database, 
      description: 'Información y mantenimiento del sistema' 
    }
  ];

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <SettingCard
        title="Información de la Empresa"
        description="Configura los datos básicos de tu organización"
        icon={Globe}
        gradient="from-emerald-500 to-teal-600"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Nombre de la Empresa
              </label>
              <Input
                value={config?.general.companyName || ''}
                onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
                placeholder="Ingresa el nombre de tu empresa"
                className="bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Zona Horaria
              </label>
              <Select
                value={config?.general.timezone || ''}
                onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                options={[
                  { value: 'America/Lima', label: '🇵🇪 Lima, Perú (GMT-5)' },
                  { value: 'America/New_York', label: '🇺🇸 Nueva York (GMT-5)' },
                  { value: 'Europe/Madrid', label: '🇪🇸 Madrid (GMT+1)' },
                  { value: 'America/Mexico_City', label: '🇲🇽 Ciudad de México (GMT-6)' },
                  { value: 'America/Buenos_Aires', label: '🇦🇷 Buenos Aires (GMT-3)' }
                ]}
                className="bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Idioma
              </label>
              <Select
                value={config?.general.language || ''}
                onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                options={[
                  { value: 'es', label: '🇪🇸 Español' },
                  { value: 'en', label: '🇺🇸 English' },
                  { value: 'pt', label: '🇧🇷 Português' }
                ]}
                className="bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Moneda
              </label>
              <Select
                value={config?.general.currency || ''}
                onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                options={[
                  { value: 'PEN', label: '🇵🇪 Soles (PEN)' },
                  { value: 'USD', label: '🇺🇸 Dólares (USD)' },
                  { value: 'EUR', label: '🇪🇺 Euros (EUR)' },
                  { value: 'MXN', label: '🇲🇽 Pesos (MXN)' },
                  { value: 'ARS', label: '🇦🇷 Pesos (ARS)' }
                ]}
                className="bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Formato de Fecha
              </label>
              <Select
                value={config?.general.dateFormat || ''}
                onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                ]}
                className="bg-white/50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
          </div>
          </div>
        </div>
      </SettingCard>

      <SettingCard
        title="Información de Contacto"
        description="Datos de contacto y ubicación de la empresa"
        icon={MapPin}
        gradient="from-blue-500 to-indigo-600"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Dirección
              </label>
              <Input
                value={config?.general.address || ''}
                onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
                placeholder="Av. Arequipa 1234, Lima 15001, Perú"
                className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Teléfono
              </label>
              <Input
                value={config?.general.phone || ''}
                onChange={(e) => handleSettingChange('general', 'phone', e.target.value)}
                placeholder="+51 1 234-5678"
                className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Sitio Web
              </label>
              <Input
                value={config?.general.website || ''}
                onChange={(e) => handleSettingChange('general', 'website', e.target.value)}
                placeholder="https://www.empresa.pe"
                className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Correo Electrónico
              </label>
              <Input
                value={config?.general.email || ''}
                onChange={(e) => handleSettingChange('general', 'email', e.target.value)}
                placeholder="contacto@empresa.pe"
                className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
      </SettingCard>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <SettingCard
        title="Configuración de Notificaciones"
        description="Personaliza cómo recibes las alertas y mensajes del sistema"
        icon={Bell}
        gradient="from-purple-500 to-pink-600"
      >
          <div className="space-y-4">
          <ToggleSetting
            title="Notificaciones por Email"
            description="Recibir notificaciones por correo electrónico"
            enabled={config?.notifications.emailNotifications || false}
            onToggle={() => handleSettingChange('notifications', 'emailNotifications', !config?.notifications.emailNotifications)}
            icon={Mail}
          />
          <ToggleSetting
            title="Notificaciones Push"
            description="Recibir notificaciones push en el navegador"
            enabled={config?.notifications.pushNotifications || false}
            onToggle={() => handleSettingChange('notifications', 'pushNotifications', !config?.notifications.pushNotifications)}
            icon={Smartphone}
          />
          <ToggleSetting
            title="Alertas de Incidencias"
            description="Alertas cuando se creen nuevas incidencias"
            enabled={config?.notifications.incidentAlerts || false}
            onToggle={() => handleSettingChange('notifications', 'incidentAlerts', !config?.notifications.incidentAlerts)}
            icon={AlertTriangle}
          />
          <ToggleSetting
            title="Actualizaciones de Requerimientos"
            description="Actualizaciones sobre requerimientos"
            enabled={config?.notifications.requirementUpdates || false}
            onToggle={() => handleSettingChange('notifications', 'requirementUpdates', !config?.notifications.requirementUpdates)}
            icon={RefreshCw}
          />
          <ToggleSetting
            title="Reportes Semanales"
            description="Reportes semanales automáticos"
            enabled={config?.notifications.weeklyReports || false}
            onToggle={() => handleSettingChange('notifications', 'weeklyReports', !config?.notifications.weeklyReports)}
            icon={BarChart3}
          />
          <ToggleSetting
            title="Resumen Diario"
            description="Resumen diario de actividades"
            enabled={config?.notifications.dailyDigest || false}
            onToggle={() => handleSettingChange('notifications', 'dailyDigest', !config?.notifications.dailyDigest)}
            icon={Activity}
          />
                </div>
      </SettingCard>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <SettingCard
        title="Configuración de Seguridad"
        description="Configura las políticas de seguridad y acceso al sistema"
        icon={Shield}
        gradient="from-red-500 to-orange-600"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Tiempo de Sesión (minutos)
              </label>
              <Input
                type="number"
                value={config?.security.sessionTimeout || 30}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="480"
                className="bg-white/50 border-gray-200 focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Expiración de Contraseña (días)
              </label>
              <Input
                type="number"
                value={config?.security.passwordExpiry || 90}
                onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                min="30"
                max="365"
                className="bg-white/50 border-gray-200 focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Máximo Intentos de Login
              </label>
              <Input
                type="number"
                value={config?.security.maxLoginAttempts || 5}
                onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                min="3"
                max="10"
                className="bg-white/50 border-gray-200 focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Longitud Mínima de Contraseña
              </label>
              <Input
                type="number"
                value={config?.security.passwordMinLength || 8}
                onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                min="6"
                max="20"
                className="bg-white/50 border-gray-200 focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
            </div>
          </div>
          
          <div className="space-y-4">
          <ToggleSetting
            title="Autenticación de Dos Factores"
            description="Requerir código adicional para el login"
            enabled={config?.security.twoFactorAuth || false}
            onToggle={() => handleSettingChange('security', 'twoFactorAuth', !config?.security.twoFactorAuth)}
            icon={Key}
          />
          <ToggleSetting
            title="Requerir Caracteres Especiales"
            description="Las contraseñas deben incluir caracteres especiales"
            enabled={config?.security.requireSpecialChars || false}
            onToggle={() => handleSettingChange('security', 'requireSpecialChars', !config?.security.requireSpecialChars)}
            icon={Lock}
          />
          <ToggleSetting
            title="Cierre Automático de Sesión"
            description="Cerrar sesión automáticamente por inactividad"
            enabled={config?.security.autoLogout || false}
            onToggle={() => handleSettingChange('security', 'autoLogout', !config?.security.autoLogout)}
            icon={ShieldCheck}
          />
                </div>
      </SettingCard>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <SettingCard
        title="Configuración de Apariencia"
        description="Personaliza el aspecto visual de la aplicación"
        icon={Palette}
        gradient="from-indigo-500 to-purple-600"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Tema
              </label>
              <Select
                value={config?.appearance.theme || 'light'}
                onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                options={[
                  { value: 'light', label: '☀️ Claro' },
                  { value: 'dark', label: '🌙 Oscuro' },
                  { value: 'auto', label: '🔄 Automático' }
                ]}
                className="bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Esquema de Color
              </label>
              <Select
                value={config?.appearance.colorScheme || 'blue'}
                onChange={(e) => handleSettingChange('appearance', 'colorScheme', e.target.value)}
                options={[
                  { value: 'blue', label: '🔵 Azul' },
                  { value: 'green', label: '🟢 Verde' },
                  { value: 'purple', label: '🟣 Púrpura' },
                  { value: 'orange', label: '🟠 Naranja' },
                  { value: 'red', label: '🔴 Rojo' }
                ]}
                className="bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Tamaño de Fuente
              </label>
              <Select
                value={config?.appearance.fontSize || 'medium'}
                onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                options={[
                  { value: 'small', label: '📝 Pequeño' },
                  { value: 'medium', label: '📝 Mediano' },
                  { value: 'large', label: '📝 Grande' }
                ]}
                className="bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>
                <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Vista de Datos
              </label>
              <Select
                value={config?.appearance.dataView || 'grid'}
                onChange={(e) => handleSettingChange('appearance', 'dataView', e.target.value)}
                options={[
                  { value: 'grid', label: '🔲 Cuadrícula' },
                  { value: 'list', label: '📋 Lista' },
                  { value: 'table', label: '📊 Tabla' }
                ]}
                className="bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
                </div>
              </div>
          </div>
        
        <div className="space-y-4">
          <ToggleSetting
            title="Barra Lateral Colapsada"
            description="Mostrar la barra lateral colapsada por defecto"
            enabled={config?.appearance.sidebarCollapsed || false}
            onToggle={() => handleSettingChange('appearance', 'sidebarCollapsed', !config?.appearance.sidebarCollapsed)}
            icon={Minimize2}
          />
          <ToggleSetting
            title="Modo Compacto"
            description="Reducir espaciado en la interfaz"
            enabled={config?.appearance.compactMode || false}
            onToggle={() => handleSettingChange('appearance', 'compactMode', !config?.appearance.compactMode)}
            icon={Grid}
          />
          <ToggleSetting
            title="Animaciones"
            description="Mostrar animaciones y transiciones"
            enabled={config?.appearance.animations || true}
            onToggle={() => handleSettingChange('appearance', 'animations', !config?.appearance.animations)}
            icon={Activity}
          />
        </div>
      </SettingCard>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <SettingCard
        title="Información del Sistema"
        description="Estado y métricas del sistema"
        icon={Database}
        gradient="from-teal-500 to-cyan-600"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Versión del Sistema"
            value={config?.system.version || 'v2.1.0'}
            icon={Monitor}
            color="from-blue-500 to-indigo-600"
            trend="Actualizado"
          />
          <StatCard
            title="Estado"
            value={config?.system.maintenanceMode ? 'Mantenimiento' : 'Operativo'}
            icon={ShieldCheck}
            color={config?.system.maintenanceMode ? "from-orange-500 to-red-600" : "from-green-500 to-emerald-600"}
          />
          <StatCard
            title="Última Actualización"
            value={config?.system.lastUpdate.toLocaleDateString('es-PE')}
            icon={Calendar}
            color="from-purple-500 to-pink-600"
          />
          <StatCard
            title="Espacio en Disco"
            value={config?.system.databaseSize || '2.4 GB'}
            icon={HardDrive}
            color="from-orange-500 to-red-600"
            trend="+12% este mes"
          />
          <StatCard
            title="Frecuencia de Backup"
            value={config?.system.backupFrequency || 'Diario'}
            icon={Clock}
            color="from-indigo-500 to-purple-600"
          />
          <StatCard
            title="Conectividad"
            value="Conectado"
            icon={Wifi}
            color="from-teal-500 to-cyan-600"
            trend="99.9% uptime"
          />
              </div>
      </SettingCard>

      <SettingCard
        title="Acciones del Sistema"
        description="Herramientas de administración y mantenimiento"
        icon={Zap}
        gradient="from-amber-500 to-orange-600"
      >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleExport}
            className="flex items-center gap-3 p-4 h-auto bg-white/50 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
          >
            <Download className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Exportar Configuración</div>
              <div className="text-sm text-gray-600">Descargar configuración actual</div>
            </div>
            </Button>
          
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-config"
              />
              <label htmlFor="import-config">
                <Button
                  variant="outline"
                className="flex items-center gap-3 p-4 h-auto w-full bg-white/50 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300"
                  as="span"
                >
                <Upload className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Importar Configuración</div>
                  <div className="text-sm text-gray-600">Cargar configuración desde archivo</div>
                </div>
                </Button>
              </label>
            </div>
          
            <Button
              variant="outline"
              onClick={handleReset}
            className="flex items-center gap-3 p-4 h-auto bg-white/50 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300"
          >
            <RotateCcw className="h-5 w-5 text-orange-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Restaurar Valores</div>
              <div className="text-sm text-gray-600">Volver a configuración predeterminada</div>
            </div>
            </Button>
          
            <Button
              variant="outline"
            className="flex items-center gap-3 p-4 h-auto bg-white/50 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-300"
          >
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Modo Mantenimiento</div>
              <div className="text-sm text-gray-600">Activar modo mantenimiento</div>
            </div>
            </Button>
          </div>
      </SettingCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'system':
        return renderSystemTab();
      default:
        return renderGeneralTab();
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Configuración del Sistema
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Personaliza la apariencia y comportamiento de la aplicación
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                >
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  Cambios sin guardar
                </motion.div>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                loading={saving}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200/50 shadow-xl">
            <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-blue-900">
              <Eye className="h-5 w-5 mr-2" />
              Previsualización en Vivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50 shadow-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Formato de Fecha
                  </h4>
                <p className="text-2xl font-mono text-blue-600">
                    {new Date().toLocaleDateString('es-PE')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Zona horaria: {config.general.timezone}
                </p>
              </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-200/50 shadow-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    Formato de Moneda
                  </h4>
                <p className="text-2xl font-mono text-green-600">
                    {new Intl.NumberFormat('es-PE', {
                      style: 'currency',
                      currency: config.general.currency,
                    }).format(1234.56)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Moneda: {config.general.currency}
                </p>
              </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200/50 shadow-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-purple-600" />
                    Tema Actual
                  </h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full ${config.appearance.theme === 'dark' ? 'bg-gray-800' : 'bg-white border-2 border-gray-300'}`}></div>
                    <span className="capitalize font-medium">{config.appearance.theme}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Tamaño: {config.appearance.fontSize}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Tabs y contenido */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar Tabs */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-gradient-to-b from-gray-50 to-gray-100/50 p-6">
              <nav className="space-y-3">
                    {tabs.map((tab) => (
                      <Tab
                        key={tab.id}
                        id={tab.id}
                        label={tab.label}
                        icon={tab.icon}
                        active={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                    description={tab.description}
                      />
                    ))}
                  </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage; 
