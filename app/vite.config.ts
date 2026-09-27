import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const rootEnvDir = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
  const env = loadEnv(mode, rootEnvDir, '');
  const apiProxy = {
    target: env.VITE_API_PROXY_TARGET || 'http://localhost:3001',
    changeOrigin: true
  };

  return {
    base: './',
    plugins: [react(), tailwindcss()],
    css: {
      modules: {
        localsConvention: 'dashes'
      },
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    },
    server: {
      strictPort: true,
      port: Number(env.VITE_PORT) || 3000,
      host: true,
      proxy: {
        '/api': apiProxy
      }
    },
    preview: {
      proxy: {
        '/api': apiProxy
      }
    }
  };
});
