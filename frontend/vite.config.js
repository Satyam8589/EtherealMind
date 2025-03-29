import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    open: true
  },
  // Ensure proper paths for deployment
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Prevent warnings from becoming errors
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create separate chunks for large dependencies
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('react')) return 'react';
            return 'vendor';
          }
        }
      }
    }
  },
  preview: {
    port: 3000,
    strictPort: true
  }
})
