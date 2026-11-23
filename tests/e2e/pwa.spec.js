// Pruebas de los requisitos de PWA: manifest, íconos, service worker y modo offline.
import { test, expect } from '@playwright/test';

test('el manifest es válido e instalable', async ({ page, request }) => {
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifestURL = new URL(href, page.url()).href;

  const res = await request.get(manifestURL);
  expect(res.ok()).toBeTruthy();
  const manifest = await res.json();

  expect(manifest.name).toBeTruthy();
  expect(manifest.short_name).toBeTruthy();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBeTruthy();

  const sizes = manifest.icons.map((i) => i.sizes);
  expect(sizes).toContain('192x192');
  expect(sizes).toContain('512x512');

  // Cada ícono declarado debe existir
  for (const icon of manifest.icons) {
    const r = await request.get(new URL(icon.src, manifestURL).href);
    expect(r.ok(), `ícono ${icon.src}`).toBeTruthy();
  }
});

test('tiene las etiquetas meta para móviles', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/);
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
});

test.describe('service worker', () => {
  // Playwright solo soporta de forma confiable service workers + modo offline en Chromium.
  test.skip(({ browserName }) => browserName !== 'chromium', 'Service worker/offline se verifica en motores Chromium');

  test('se registra y controla la página', async ({ page }) => {
    await page.goto('./');
    const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
    expect(scope).toBe(new URL('./', page.url()).href);

    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  });

  test('funciona sin conexión', async ({ page, context }) => {
    await page.goto('./');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload(); // el SW ya controla la página y guarda los recursos en caché
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

    await page.getByLabel('Nueva tarea').fill('Creada antes de quedarme sin red');
    await page.getByRole('button', { name: 'Agregar tarea' }).click();

    await context.setOffline(true);
    await page.reload();

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Mis tareas');
    await expect(page.locator('#task-list .task')).toContainText('Creada antes de quedarme sin red');

    await page.getByLabel('Nueva tarea').fill('Creada sin conexión');
    await page.getByRole('button', { name: 'Agregar tarea' }).click();
    await expect(page.locator('#task-list .task')).toHaveCount(2);

    await context.setOffline(false);
  });
});
