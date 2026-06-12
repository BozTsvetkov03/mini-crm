import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5269',
        // Keep the original Host header so the Google OAuth middleware
        // builds redirect URIs on localhost:5173 and the whole sign-in
        // flow stays behind this proxy in dev
        changeOrigin: false,
      }
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
  }
})
