import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
      { find: '@components', replacement: '/src/components' },
      { find: '@pages', replacement: '/src/pages' },
      { find: '@services', replacement: '/src/services' },
      { find: '@utils', replacement: '/src/utils' },
      { find: '@hooks', replacement: '/src/hooks' },
      { find: '@types', replacement: '/src/types' },
      { find: '@store', replacement: '/src/store' },
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          charts: ['recharts'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://3.112.172.7:8080',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'recharts'],
  },
});
