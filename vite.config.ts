import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    build: {
      sourcemap: false,  // Disable source maps in production
      minify: 'terser',  // Use terser for better minification
      terserOptions: {
        compress: {
          drop_console: isProduction,  // Remove console.logs in production
          drop_debugger: true,         // Remove debugger statements
          pure_funcs: isProduction ? ['console.log', 'console.info'] : []
        },
        format: {
          comments: false  // Remove all comments
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
