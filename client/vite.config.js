import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Plugin to ensure dist exists in both client/dist and root dist
function syncRootDistPlugin() {
  return {
    name: 'sync-root-dist',
    closeBundle() {
      try {
        const clientDir = import.meta.dirname || process.cwd();
        const clientDist = path.resolve(clientDir, 'dist');
        const rootDist = path.resolve(clientDir, '../dist');
        if (fs.existsSync(clientDist)) {
          fs.cpSync(clientDist, rootDist, { recursive: true });
        }
      } catch (e) {}
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), syncRootDistPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
});
