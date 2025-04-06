import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    host: true,
    port: 3001,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild', // ✅ מהיר יותר
    sourcemap: false, // ✅ מבטל sourcemaps – מזרז
    brotliSize: false, // ✅ חוסך חישובים מיותרים
    cssCodeSplit: true, // ✅ שימוש בברירת מחדל – טוב לרינדור מהיר
    chunkSizeWarningLimit: 1500,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'], // ✅ פיצול לקובץ נפרד – משפר cache
        },
      },
    },
  },
});
