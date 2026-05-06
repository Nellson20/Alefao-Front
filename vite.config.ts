import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@asamuzakjp/css-color': '@asamuzakjp/css-color/dist/index.mjs',
    },
  },
  ssr: {
    noExternal: [/@asamuzakjp\/css-color/, /@csstools\/css-calc/, /pdfjs-dist/],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    pool: 'forks',
  },
})
