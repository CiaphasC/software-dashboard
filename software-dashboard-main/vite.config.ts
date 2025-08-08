import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: true,                     // 0.0.0.0 → permite acceso externo :contentReference[oaicite:1]{index=1}
    port: 3000,
    open: true,

    // ① Autoriza todos los subdominios *.ngrok-free.app
    //    (si prefieres sólo uno, cámbialo por '678a88e6b885.ngrok-free.app')
    allowedHosts: ['.ngrok-free.app'],  // comodín con punto inicial :contentReference[oaicite:2]{index=2}

    // ② Ajusta Hot Module Replacement para que use el dominio público
    hmr: {
      protocol: 'wss',                  // ngrok → HTTPS → WSS :contentReference[oaicite:3]{index=3}
      host: '678a88e6b885.ngrok-free.app',
      port: 443                         // puerto TLS estándar
    }
  },
})