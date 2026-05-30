import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      clientPort: 5173,
    },
  },
  plugins: [
    react(),
    visualizer({
      open: false,
      filename: 'dist/bundle-stats.html',
      gzipSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor'
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/recharts') || id.includes('node_modules/lottie-web')) return 'ui'
          if (id.includes('node_modules/@tiptap') || id.includes('node_modules/@monaco-editor')) return 'editor'
          if (id.includes('node_modules/@tanstack/react-query')) return 'query'
          if (id.includes('node_modules/@daily-co') || id.includes('node_modules/katex')) return 'player'
          if (id.includes('node_modules/openai') || id.includes('node_modules/@anthropic-ai')) return 'ai'
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) return 'i18n'
          if (id.includes('node_modules/razorpay') || id.includes('node_modules/html2canvas') || id.includes('node_modules/jspdf')) return 'payments'
        },
      },
    },
  },
})
