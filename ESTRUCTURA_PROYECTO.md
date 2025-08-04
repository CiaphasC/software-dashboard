# Estructura del Proyecto - Sistema de Gestión de Incidencias

## 📁 Estructura General

```
estable1/
├── README.md                           # Documentación principal del proyecto
├── ESTRUCTURA_PROYECTO.md             # Este archivo - Guía de estructura
├── software-dashboard-main/           # 🎨 Frontend (React + TypeScript)
└── software-dashboard-main-backend/   # 🔧 Backend (Supabase)
```

## 🎨 Frontend (`software-dashboard-main/`)

### Estructura de Carpetas

```
software-dashboard-main/
├── src/
│   ├── features/                      # Características organizadas por dominio
│   │   ├── activities/                # Actividades del sistema
│   │   ├── auth/                      # Autenticación y autorización
│   │   ├── dashboard/                 # Dashboard principal
│   │   ├── incidents/                 # Gestión de incidencias
│   │   ├── reports/                   # Generación de reportes
│   │   ├── requirements/              # Gestión de requerimientos
│   │   ├── settings/                  # Configuraciones
│   │   └── users/                     # Gestión de usuarios
│   ├── shared/                        # Componentes y utilidades compartidas
│   │   ├── components/                # Componentes UI reutilizables
│   │   ├── hooks/                     # Hooks personalizados
│   │   ├── services/                  # Servicios de API
│   │   ├── store/                     # Estado global (Zustand)
│   │   ├── types/                     # Tipos TypeScript
│   │   └── utils/                     # Utilidades
│   ├── App.tsx                        # Componente principal
│   └── index.tsx                      # Punto de entrada
├── docs/                              # Documentación técnica
├── package.json                       # Dependencias del frontend
├── tailwind.config.js                 # Configuración de Tailwind CSS
├── vite.config.ts                     # Configuración de Vite
└── tsconfig.json                      # Configuración de TypeScript
```

### Características Implementadas

#### 🏠 Dashboard
- Métricas en tiempo real
- Gráficos interactivos
- Actividades recientes
- Animaciones fluidas

#### 🚨 Incidencias
- Registro completo de incidencias
- Asignación de responsables
- Seguimiento de estados
- Filtros avanzados
- Exportación de datos

#### 📋 Requerimientos
- Gestión de documentos
- Estados de atención
- Evidencia de cumplimiento
- Reportes automáticos

#### 👥 Usuarios
- Gestión de perfiles
- Permisos por roles
- Aprobación de registros
- Estadísticas de usuarios

#### 📊 Reportes
- Generación en PDF/Excel/CSV
- Configuración personalizable
- Vista previa
- Exportación masiva

## 🔧 Backend (`software-dashboard-main-backend/`)

### Estructura de Carpetas

```
software-dashboard-main-backend/
├── supabase/                          # Configuración de Supabase
│   ├── functions/                     # Edge Functions
│   │   ├── auth-webhook-ts/           # Webhook de autenticación
│   │   ├── create-admin-user-ts/      # Creación de administradores
│   │   ├── create-user-ts/            # Creación de usuarios
│   │   ├── delete-user-ts/            # Eliminación de usuarios
│   │   ├── generate-report-ts/        # Generación de reportes
│   │   ├── get-catalogs-ts/           # Catálogos del sistema
│   │   ├── get-item-details-ts/       # Detalles de elementos
│   │   ├── real-time-analytics-ts/    # Analytics en tiempo real
│   │   ├── register-user-ts/          # Registro de usuarios
│   │   ├── send-notification-ts/      # Envío de notificaciones
│   │   ├── update-incident-status-ts/ # Actualización de incidencias
│   │   ├── update-requirement-status-ts/ # Actualización de requerimientos
│   │   ├── update-user-ts/            # Actualización de usuarios
│   │   └── upload-file-ts/            # Subida de archivos
│   ├── migrations/                    # Migraciones de base de datos
│   │   ├── 20250801001154_init_schema.sql
│   │   ├── 20250803234505_create_admin_user_fixed.sql
│   │   ├── 20250803234506_seed_incidents.sql
│   │   └── 20250803234507_seed_requirements.sql
│   ├── seed.sql                       # Datos iniciales
│   └── config.toml                    # Configuración de Supabase
├── docs/                              # Documentación del backend
├── test-admin-creation.mjs            # Script de prueba
└── .gitignore                         # Archivos ignorados por Git
```

### Funcionalidades del Backend

#### 🔐 Autenticación
- Sistema de autenticación con Supabase
- Roles y permisos
- Webhooks de autenticación
- Gestión de sesiones

#### 📊 Base de Datos
- Esquema completo de incidencias
- Gestión de requerimientos
- Sistema de usuarios
- Relaciones y constraints

#### ⚡ Edge Functions
- API REST completa
- Funciones serverless
- Procesamiento en tiempo real
- Integración con servicios externos

#### 🔔 Notificaciones
- Sistema de alertas automáticas
- Emails automáticos
- Notificaciones push
- Recordatorios programados

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19**: Framework principal
- **TypeScript**: Tipado estático
- **Tailwind CSS 4**: Estilos y diseño
- **Vite**: Build tool y dev server
- **React Router DOM**: Navegación
- **React Hook Form**: Formularios
- **Zod**: Validación de esquemas
- **Zustand**: Estado global
- **Lucide React**: Iconos
- **Recharts**: Gráficos
- **React Hot Toast**: Notificaciones

### Backend
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Base de datos
- **Edge Functions**: Funciones serverless
- **Row Level Security**: Seguridad
- **Real-time subscriptions**: Tiempo real

## 🚀 Instalación y Desarrollo

### Frontend
```bash
cd software-dashboard-main
npm install
npm run dev
```

### Backend
```bash
cd software-dashboard-main-backend
# Configurar variables de entorno en Supabase
# Ejecutar migraciones
supabase db reset
```

## 📝 Notas Importantes

1. **Estructura Modular**: Cada feature está organizada en su propia carpeta con componentes, hooks y servicios específicos.

2. **Patrones de Diseño**: Se implementan patrones como Clean Architecture, Feature-Based Structure y Component Composition.

3. **TypeScript**: Todo el código está tipado para mayor seguridad y mejor experiencia de desarrollo.

4. **Responsive Design**: La interfaz es completamente responsiva y funciona en todos los dispositivos.

5. **Performance**: Optimizaciones implementadas para mejor rendimiento y experiencia de usuario.

6. **Seguridad**: Implementación de Row Level Security y validaciones en ambos lados.

## 🔗 Enlaces Útiles

- [Repositorio en GitHub](https://github.com/CiaphasC/software-dashboard)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de React](https://react.dev)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs) 