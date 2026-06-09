import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/gangapulse-api': {
        target: 'https://www.gangapulse.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gangapulse-api/, ''),
      },
      '/datagov-api': {
        target: 'https://api.data.gov.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/datagov-api/, ''),
      },
      '/cpcb-api': {
        target: 'https://rtwqmsdb1.cpcb.gov.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cpcb-api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion': ['framer-motion'],
          'charts': ['recharts'],
          'maps': ['leaflet', 'react-leaflet'],
          'firebase': ['firebase/app', 'firebase/database', 'firebase/auth'],
          'icons': ['lucide-react'],
        },
      },
    },
  },
});
