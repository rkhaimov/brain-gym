import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist/client',
  },
  plugins: [
    tanstackRouter({
      autoCodeSplitting: false,
      generatedRouteTree: './src/routeTree.gen.ts',
      routesDirectory: './src/client/routes',
      target: 'react',
    }),
    react(),
    tailwindcss(),
  ],
  server: {
    host: '127.0.0.1',
    port: 3000,
    proxy: {
      '/ceramics.v1.ProductService': {
        target: 'http://127.0.0.1:3001',
      },
    },
    strictPort: true,
  },
});
