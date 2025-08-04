/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
  readonly VITE_PORT: string
  readonly VITE_SESSION_EXPIRY_HOURS: string
  readonly VITE_STORAGE_BUCKET: string
  readonly VITE_WEBHOOK_URL: string
  readonly VITE_DEFAULT_REPORT_FORMAT: string
  readonly VITE_METRICS_UPDATE_INTERVAL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 