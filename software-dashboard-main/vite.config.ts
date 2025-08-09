import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // HMR condicional (solo aplica en desarrollo). Si no se define host público, usa HMR local por defecto.
  const useCustomHmr = Boolean(env.VITE_PUBLIC_HMR_HOST)
  const hmrConfig = useCustomHmr
    ? {
        protocol: (env.VITE_PUBLIC_HMR_PROTOCOL || 'wss') as 'ws' | 'wss',
        host: env.VITE_PUBLIC_HMR_HOST,
        port: Number(env.VITE_PUBLIC_HMR_PORT || '443'),
      }
    : undefined

  // allowedHosts condicional para túneles/reverse proxy (ngrok, etc.)
  const allowedHosts = env.VITE_PUBLIC_ALLOWED_HOSTS
    ? env.VITE_PUBLIC_ALLOWED_HOSTS.split(',').map((s) => s.trim())
    : undefined

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      host: true,
      port: 3000,
      open: true,
      hmr: hmrConfig,
      ...(allowedHosts ? { allowedHosts } : {}),
    },
  }
})