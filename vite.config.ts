import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure consistent file hashing
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    },
    // Ensure CSS is extracted consistently
    cssCodeSplit: true,
    // Minify for production
    minify: 'terser',
    // Generate sourcemaps for better debugging
    sourcemap: true
  },
  // Ensure consistent base URL
  base: '/',
  // Configure development server
  server: {
    port: 5173,
    strictPort: true
  },
  // Configure preview server
  preview: {
    port: 5173,
    strictPort: true
  }
});
