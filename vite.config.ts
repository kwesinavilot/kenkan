import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'public/popup.html'),
        content: path.resolve(__dirname, 'src/content/index.ts'),
        background: path.resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        manualChunks: undefined, // Disable code splitting
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020', // Ensure compatibility with Chrome extensions
    minify: false // Disable minification for easier debugging
  },
  publicDir: 'public',
  define: {
    // Ensure we're building for extension environment
    'process.env.NODE_ENV': '"production"'
  }
})
