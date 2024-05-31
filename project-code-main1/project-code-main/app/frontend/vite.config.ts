import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import 'process'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // const env = loadEnv(mode, process.cwd(), '');
  let backendPort = process.env.VITE_BACKEND_PORT;
  if (!backendPort || backendPort === '' || backendPort === '0') {
    backendPort = '24858';
  }

  return {
    plugins: [react(), svgr()],
    build: {
      outDir: '../backend/static',
      emptyOutDir: true,
      sourcemap: true
    },
    server: {
      host: 'localhost',
      port: 24847,
      proxy: {
        '^/api': {
          target: `http://localhost:${process.env.VITE_BACKEND_PORT}`, // Use VITE_BACKEND_PORT or default to 24858
          changeOrigin: true
        }
      }
    }
  };
});
