import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // Vercel'da Admin Panel /admin/ manzilida ochiladi
  base: command === 'build' ? '/admin/' : '/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    open: true,
    proxy: {
      '/api/admin': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
}));
