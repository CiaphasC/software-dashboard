# Sistema de Gestión de Incidencias y Requerimientos

Este proyecto es una aplicación web para registrar, consultar y administrar incidencias y requerimientos. El frontend está construido con React + TypeScript y el backend se apoya en Supabase (PostgreSQL, Auth, Edge Functions, Realtime).

Importante: en el estado actual de la solución, el uso está centrado en un único usuario administrador. La gestión multi‑rol (técnico/solicitante) está prevista en el roadmap, pero no forma parte del flujo operativo actual.

## Estructura del repositorio

- `software-dashboard-main/` → Frontend (React 19, Vite, Tailwind)
- `software-dashboard-main-backend/` → Backend (Supabase: migraciones, Edge Functions, seeds y utilidades)

## Capacidades actuales

- Inicio de sesión con Supabase Auth (sesión persistente y verificación al arranque)
- Panel de control con métricas agregadas
- Gestión de Incidencias y Requerimientos: listado, filtros, paginación, edición básica
- Reportes descargables (PDF/Excel/CSV) con vista previa y generación bajo demanda
- Actualizaciones en tiempo real (suscripciones a cambios en BD)

Limitaciones/diseño actual
- Operación con un único usuario administrador (no hay flujos separados por rol en UI)
- Algunos conteos/métricas se refrescan con una cadencia optimizada para no impactar rendimiento

## Tecnologías

Frontend
- React 19 + TypeScript, Vite, Tailwind
- Zustand para estado global (stores paginados reutilizables)
- Framer Motion para animaciones (con políticas de ahorro)

Backend (Supabase)
- PostgreSQL + RLS, vistas y RPC para métricas
- Edge Functions en TypeScript para operaciones de dominio
- Realtime (Postgres Changes)

## Puesta en marcha

Requisitos
- Node 18+ (ideal 20+)
- Cuenta de Supabase (cloud) o Supabase CLI (local)

1) Frontend
- Crear `software-dashboard-main/.env.local` con:
  ```bash
  VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
  VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
  # Opcional cuando se usa ngrok u otro túnel
  VITE_PUBLIC_ALLOWED_HOSTS=tu-subdominio.ngrok-free.app
  VITE_PUBLIC_HMR_PROTOCOL=wss
  VITE_PUBLIC_HMR_HOST=tu-subdominio.ngrok-free.app
  VITE_PUBLIC_HMR_PORT=443
  ```
- Instalar y levantar:
  ```bash
  cd software-dashboard-main
  npm install
  npm run dev
  ```

Notas
- Si sirves la app por HTTPS (ngrok), evita `localhost`/HTTP en `VITE_SUPABASE_URL` para no provocar “mixed content”.

2) Backend
- Opción cloud: crea el proyecto en Supabase, aplica migraciones (Dashboard > SQL) y despliega Edge Functions si procede
- Opción local (desarrollo): usa Supabase CLI (`supabase start`), aplica migraciones y apunta el frontend a la URL local (expuesta por ngrok si se accederá desde otras máquinas)

3) Crear/validar el administrador
- En `software-dashboard-main-backend/test-admin-creation.mjs` hay un script de verificación/creación de admin. Ejecuta con las variables de entorno `SUPABASE_URL` y `SUPABASE_ANON_KEY` definidas.
- Si se usó el script de ejemplo, las credenciales suelen ser:
  - Email: `admin@empresa.com`
  - Contraseña: `admin123`
  (Asegúrate de crearlas en el mismo entorno —cloud o local— al que apunta el frontend.)

## Decisiones de rendimiento (resumen)

- Carga de generadores de reportes bajo demanda (reduce el bundle inicial)
- Cache de métricas de dashboard (~30s) para evitar RPC repetitivas
- Tiendas paginadas con actualización de métricas con throttle (configurable)
- Selectores derivados memoizados (filtros/paginación sin recálculo innecesario)
- Virtualización de tablas a partir de 50 ítems y reducción de animaciones por fila
- Animaciones pausadas cuando la pestaña no está visible

## Navegación (actual)

- Acceso a Dashboard, Incidencias, Requerimientos, Reportes y Usuarios está habilitado para el administrador. La barra lateral muestra únicamente lo disponible para el usuario autenticado (actualmente, admin).

## Solución de problemas

- No inicia sesión al usar ngrok: suele indicar `VITE_SUPABASE_URL` apuntando a `localhost`/HTTP. Usa la URL HTTPS de Supabase cloud o expón Supabase local también por HTTPS.
- “Mixed Content” en consola: frontend por HTTPS pero backend por HTTP. Cambia `VITE_SUPABASE_URL` a HTTPS.
- HMR/CORS en túneles: usa `VITE_PUBLIC_ALLOWED_HOSTS` y variables de HMR remoto como se muestra arriba.
- Exceso de recargas en tiempo real: incrementa los intervalos de refresh desde configuración si fuera necesario.

## Seguridad

- No expongas la Service Role Key en el frontend
- Edge Functions se invocan con el token del usuario actual (Bearer) y se validan en backend
- Asegura `site_url` y orígenes permitidos en la configuración de Supabase

## Roadmap

- Soporte real multi‑rol en UI (técnico/solicitante)
- Modo rendimiento configurable (menos animaciones)
- Safelist de clases Tailwind dinámicas para builds de producción
- Tests unitarios/e2e para stores, repos y reportes

## Licencia

MIT 