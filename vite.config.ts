import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import type { Plugin } from 'vite'

const LANGS = ['es', 'en', 'it', 'fr', 'pt', 'tr']

function copyLocalesToPublic() {
  for (const lang of LANGS) {
    const src = `locales/${lang}.json`
    if (!existsSync(src)) continue
    const dir = `public/locales/${lang}`
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(`${dir}/translation.json`, readFileSync(src, 'utf8'))
  }
}

function localesWatcherPlugin(): Plugin {
  return {
    name: 'locales-watcher',
    buildStart() {
      copyLocalesToPublic()
    },
    configureServer(server) {
      server.watcher.add(path.resolve(__dirname, 'locales'))
      server.watcher.on('change', (file) => {
        if (file.includes(`${path.sep}locales${path.sep}`) || file.includes('/locales/')) {
          copyLocalesToPublic()
          server.ws.send({ type: 'full-reload' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localesWatcherPlugin()],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-slot',
          ],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-http-backend'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
