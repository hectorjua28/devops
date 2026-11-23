import { defineConfig, loadEnv } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  // Si no se define VITE_APP_VERSION, usamos la versión de package.json.
  if (!process.env.VITE_APP_VERSION && !env.VITE_APP_VERSION) {
    process.env.VITE_APP_VERSION = pkg.version;
  }

  return {
    // Ej: VITE_BASE=/mi-repo/ para GitHub Pages
    base: env.VITE_BASE || process.env.VITE_BASE || '/',
    test: {
      environment: 'node',
      // Las pruebas e2e (tests/e2e) las ejecuta Playwright, no Vitest
      include: ['tests/**/*.test.js'],
      exclude: ['tests/e2e/**', 'node_modules/**'],
    },
  };
});
