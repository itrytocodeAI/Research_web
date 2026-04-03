import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('react-markdown') || id.includes('remark-gfm')) {
            return 'markdown'
          }

          if (id.includes('docx')) {
            return 'docx'
          }

          if (id.includes('@blinkdotnew')) {
            return 'blink'
          }

          if (id.includes('framer-motion') || id.includes('lucide-react')) {
            return 'ui-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
})
