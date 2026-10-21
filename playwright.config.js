// Pruebas E2E (Playwright): un navegador real usa el front, que llama al backend real con una base
// PostgreSQL real. Los servidores NO se levantan aquí:
//   - local: docker compose up (repo walking-dictionary-infra)
//   - CI:    .github/workflows/e2e.yml
// Los archivos se llaman *.e2e.js para que Vitest (pruebas unitarias) no los tome.

import { defineConfig, devices } from '@playwright/test';
import { FRONT_URL } from './e2e/soporte/entorno.js';

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.js',
  globalSetup: './e2e/soporte/preparacion-global.js',
  // Todas las pruebas comparten la misma base de datos: una a la vez y en orden.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 30000,
  expect: { timeout: 10000 },
  outputDir: 'reportes-e2e/resultados',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reportes-e2e/html', open: 'never' }],
    ['junit', { outputFile: 'reportes-e2e/junit.xml' }],
    // Lo lee e2e/soporte/generar-resumen.js para el tablero de métricas (reportes-e2e/resumen.html).
    ['json', { outputFile: 'reportes-e2e/resultados.json' }],
    ...(process.env.GITHUB_ACTIONS ? [['github']] : []),
  ],
  use: {
    baseURL: FRONT_URL,
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
