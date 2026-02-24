import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Load env vars from the root-level .env instead of webex-mockup/
  envDir: '../',
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
