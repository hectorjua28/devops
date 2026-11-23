// Pruebas funcionales (e2e) multiplataforma con Playwright.
//
// - Sin variables: construye la app y la sirve con `vite preview` (uso local).
// - E2E_USE_DIST=1: sirve el dist/ ya construido (en CI se prueba el MISMO artefacto que se despliega).
// - E2E_BASE_URL=https://...: prueba un sitio ya desplegado (ej. el ambiente de staging).
import { defineConfig, devices } from '@playwright/test';

const remoteURL = process.env.E2E_BASE_URL;
const PORT = 4173;
const serve = `npx vite preview --port ${PORT} --strictPort`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
  ],
  use: {
    // La barra final es importante para que las rutas relativas funcionen en subcarpetas.
    baseURL: remoteURL ? remoteURL.replace(/\/?$/, '/') : `http://localhost:${PORT}/`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'es-MX',
    serviceWorkers: 'allow',
  },

  // Matriz multiplataforma: 3 motores de escritorio + 2 móviles
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],

  webServer: remoteURL
    ? undefined
    : {
        command: process.env.E2E_USE_DIST ? serve : `npm run build && ${serve}`,
        url: `http://localhost:${PORT}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: { VITE_BASE: '/', VITE_APP_ENV: process.env.VITE_APP_ENV || 'test' },
      },
});
