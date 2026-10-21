import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'reportes-e2e']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Regla nueva de eslint-plugin-react-hooks v7. Hay 5 incumplimientos que ya
      // existían (AuthProvider, DetalleCurso, ParticipacionMazo, SugerenciasPalabras
      // y MazosEstudio). Se deja como advertencia hasta reescribir esos efectos.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  // Pruebas E2E: corren en Node (Playwright), no en el navegador.
  {
    files: ['e2e/**/*.js', 'playwright.config.js'],
    languageOptions: { globals: globals.node },
  },
])