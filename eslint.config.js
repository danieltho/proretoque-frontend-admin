import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // setState síncrono dentro de un effect es un patrón intencional aquí:
      // resets controlados por props (modales que se abren/cierran) y flags de
      // carga (`setLoading(true)`) antes de un fetch async. Se mantiene como
      // aviso para no ocultar usos genuinamente problemáticos.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Componentes shadcn (viven en src/app/components/ui) y archivos de
    // definición de columnas exportan helpers/constantes junto a componentes;
    // Fast Refresh no aplica a estos archivos.
    files: ['src/app/components/ui/*.tsx', 'src/components/ui/*.tsx', '**/*Columns.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
