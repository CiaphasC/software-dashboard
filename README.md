# Sistema de Gestión de Incidencias y Requerimientos

Aplicación web de gestión (incidencias, requerimientos, usuarios, reportes) desarrollada con React + TypeScript y backend en Supabase (PostgreSQL + Edge Functions).

## 📦 Monorepo

- `software-dashboard-main/`: Frontend (React 19, Vite, Tailwind)
- `software-dashboard-main-backend/`: Backend (Supabase: migraciones, Edge Functions, seeds, pruebas)

## ✅ Estado actual (resumen senior)

- Autenticación con Supabase (roles: admin, technician, requester) y verificación de sesión
- Dashboard con métricas y prefetch de datos clave
- Incidencias y Requerimientos con filtrado/paginación, edición y métricas
- Reportes (PDF/Excel/CSV) con generadores cargados bajo demanda y vista previa
- Usuarios (administración, aprobaciones de registro)
- Tiempo real (Postgres Changes) y sistema de auto-refresh centralizado (con optimizaciones)

## 🧱 Arquitectura (frontend)

- Estructura por features (`features/*`), UI compartida en `shared/components/ui`
- Estado global con Zustand y stores paginados (`createPaginatedEntityStore`) con:
  - Throttle configurable para `updateStats` tras `load()`
  - Carga incremental y filtros centralizados
- Selectores derivados memoizados en `shared/store/selectors.ts` (filtros/paginación sin recalcular en cada render)
- Prefetch manager (bundles y primeras páginas) + cache in-memory (`shared/data/fetcher.ts`)
- Refresh centralizado con skip inteligente (formularios/modal abiertos) en `useCentralizedRefresh`
- Realtime por tabla con handlers desacoplados (`shared/services/supabase/realtime.ts`)
- Edge Functions encapsuladas en `edgeFunctionsService` con validación (Zod) y HttpClient con timeout/retry/backoff
- Reportes: generadores importados dinámicamente (reduce bundle inicial) y cache de métricas 30s
- Animaciones cuidadas (Framer Motion) con partículas pausadas si la pestaña está oculta

## 🔒 Arquitectura (backend Supabase)

- Migraciones SQL y seeds en `software-dashboard-main-backend/supabase/migrations`
- Edge Functions (TypeScript) en `software-dashboard-main-backend/supabase/functions/*`
- RPC `get_dashboard_metrics` para métricas de dashboard
- RLS habilitado (consultas tipadas y funciones encapsulan operaciones seguras)

## 🧰 Requisitos

- Node.js 18+ (recomendado 20+)
- npm o pnpm
- Cuenta de Supabase (para cloud) o Supabase CLI (para local)

## ⚙️ Configuración rápida

### 1) Frontend

1. Crear `.env.local` en `software-dashboard-main/`:
   ```bash
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
   # Opcional para túneles (ngrok, etc.)
   VITE_PUBLIC_ALLOWED_HOSTS=f31f6fed942f.ngrok-free.app
   VITE_PUBLIC_HMR_PROTOCOL=wss
   VITE_PUBLIC_HMR_HOST=f31f6fed942f.ngrok-free.app
   VITE_PUBLIC_HMR_PORT=443
   ```
2. Instalar y arrancar:
```bash
cd software-dashboard-main
npm install
npm run dev
```

Notas importantes
- No uses `localhost`/HTTP en `VITE_SUPABASE_URL` si sirves la app por HTTPS (ngrok) para evitar “mixed content”.
- En `vite.config.ts` se soporta HMR remoto y `allowedHosts` a través de variables anteriores.

### 2) Backend (opciones)

- Opción A: Supabase Cloud (recomendado)
  - Crear proyecto, cargar migraciones (Dashboard > SQL) y desplegar Edge Functions si aplica
  - Configurar Auth > URLs permitidas (agregar dominio de ngrok si usa OAuth/magic links)
- Opción B: Supabase local
  - Instalar Supabase CLI y ejecutar `supabase start`
  - Aplicar migraciones del repo
  - Apuntar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` al entorno local (exponer por ngrok si accedes desde otra PC)

### 3) Pruebas de admin (opcional)

Hay un script de prueba en `software-dashboard-main-backend/test-admin-creation.mjs` para validar/crear un admin inicial (ajusta credenciales antes de ejecutarlo).

## 🧪 Scripts (frontend)

- `npm run dev`: desarrollo
- `npm run build`: producción
- `npm run preview`: preview local de build

## 🔐 Credenciales de prueba (si existen en tu entorno)
- admin: `admin@empresa.com` / `admin123`
- technician: `tecnico@empresa.com` / `tecnico123`
- requester: `solicitante@empresa.com` / `solicitante123`

Asegúrate de crearlas en el mismo entorno (cloud/local) al que apunta el frontend.

## 🧠 Rendimiento y decisiones clave

- Virtualización de tablas a partir de 50 ítems; filas sin animación por-fila para reducir CPU
- Generadores de reportes importados dinámicamente (PDF/Excel/CSV)
- Cache de métricas del dashboard 30s; cache y single-flight en `fetchWithCache`
- Selectores memoizados; menos cálculos por render
- Throttle en actualización de métricas de stores (configurable)
- Partículas pausadas si `document.hidden`; animaciones con duraciones contenidas
- Mensajes de error de login contextualizados (credenciales, email no confirmado, red/HTTPS)

## 🧭 Navegación (roles)

- Dashboard, Incidencias, Requerimientos: admin, technician, requester
- Reportes, Usuarios, Configuración: admin

La `Sidebar` filtra opciones según el rol del usuario autenticado.

## 🐛 Guía de resolución de problemas

- No inicia sesión por ngrok: suele ser por `VITE_SUPABASE_URL` apuntando a `localhost` o HTTP. Usa la URL HTTPS de Supabase Cloud o expón Supabase local por ngrok HTTPS.
- “Mixed Content” en consola: frontend por HTTPS con backend HTTP. Cambia a HTTPS.
- CORS/HMR remoto: define `VITE_PUBLIC_ALLOWED_HOSTS` (y HMR host/protocol/port) como en el ejemplo.
- Realtime recarga demasiado: usa `settings` para ajustar auto-refresh y considera aumentar intervalos.

## 🔒 Seguridad

- Nunca expongas Service Role Key en frontend
- Edge Functions invocadas con `Authorization: Bearer <access_token>` del usuario actual
- RLS y vistas limitan acceso por rol/permisos

## 🗺️ Roadmap técnico

- Safelist de clases dinámicas de Tailwind (colores por tema) para build de producción
- Debounce/backoff en refresh central y realtime por tabla
- Toggle “Modo rendimiento” (menos animaciones) en `settings`
- Tests unitarios/e2e para stores, repos y reportes

## 📄 Licencia

MIT 