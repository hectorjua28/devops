// Pruebas funcionales del flujo principal de la app.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  // Cada prueba empieza con la lista vacía
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

const input = (page) => page.getByLabel('Nueva tarea');
const items = (page) => page.locator('#task-list .task');

async function agregar(page, texto) {
  await input(page).fill(texto);
  await page.getByRole('button', { name: 'Agregar tarea' }).click();
}

test('carga la página principal', async ({ page }) => {
  await expect(page).toHaveTitle('Tareas');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mis tareas');
  await expect(page.locator('#empty')).toBeVisible();
  await expect(page.locator('#counter')).toHaveText('0 pendientes · 0/0');
});

test('agrega tareas y actualiza el contador', async ({ page }) => {
  await agregar(page, 'Comprar pan');
  await agregar(page, 'Estudiar DevOps');

  await expect(items(page)).toHaveCount(2);
  await expect(items(page).first()).toContainText('Estudiar DevOps'); // la más nueva va primero
  await expect(page.locator('#counter')).toHaveText('2 pendientes · 0/2');
  await expect(input(page)).toHaveValue('');
});

test('no agrega tareas vacías', async ({ page }) => {
  await agregar(page, '   ');
  await expect(items(page)).toHaveCount(0);
});

test('marca una tarea como hecha y filtra', async ({ page }) => {
  await agregar(page, 'Tarea A');
  await agregar(page, 'Tarea B');

  await items(page).filter({ hasText: 'Tarea A' }).getByRole('button', { name: /Marcar como hecha/ }).click();
  await expect(items(page).filter({ hasText: 'Tarea A' })).toHaveClass(/done/);
  await expect(page.locator('#counter')).toHaveText('1 pendiente · 1/2');

  await page.getByRole('tab', { name: 'Hechas' }).click();
  await expect(items(page)).toHaveCount(1);
  await expect(items(page)).toContainText('Tarea A');

  await page.getByRole('tab', { name: 'Pendientes' }).click();
  await expect(items(page)).toHaveCount(1);
  await expect(items(page)).toContainText('Tarea B');

  await page.getByRole('tab', { name: 'Todas' }).click();
  await expect(items(page)).toHaveCount(2);
});

test('elimina una tarea', async ({ page }) => {
  await agregar(page, 'Borrar esta');
  await items(page).getByRole('button', { name: 'Eliminar tarea' }).click();
  await expect(items(page)).toHaveCount(0);
  await expect(page.locator('#empty')).toBeVisible();
});

test('las tareas persisten al recargar', async ({ page }) => {
  await agregar(page, 'Persistente');
  await page.reload();
  await expect(items(page)).toHaveCount(1);
  await expect(items(page)).toContainText('Persistente');
});

test('el texto se muestra sin interpretar HTML', async ({ page }) => {
  await agregar(page, '<b>negrita</b>');
  await expect(items(page).locator('.text')).toHaveText('<b>negrita</b>');
  await expect(items(page).locator('b')).toHaveCount(0);
});

test('cambia entre modo claro y oscuro', async ({ page }) => {
  const html = page.locator('html');
  const antes = await html.getAttribute('data-theme');
  await page.getByRole('button', { name: 'Cambiar tema' }).click();
  await expect(html).not.toHaveAttribute('data-theme', antes ?? '');
  const despues = await html.getAttribute('data-theme');
  expect(['light', 'dark']).toContain(despues);
});

test('muestra versión, commit y ambiente en el pie', async ({ page }) => {
  await expect(page.locator('#app-version')).not.toBeEmpty();
  await expect(page.locator('#app-commit')).not.toBeEmpty();
  await expect(page.locator('#app-env')).not.toBeEmpty();
});

test('captura de evidencia multiplataforma', async ({ page }, testInfo) => {
  await agregar(page, 'Configurar pipeline CI/CD');
  await agregar(page, 'Desplegar a staging');
  await items(page).filter({ hasText: 'Configurar pipeline' }).getByRole('button', { name: /Marcar como hecha/ }).click();

  const shot = await page.screenshot({ fullPage: true });
  await testInfo.attach(`app-${testInfo.project.name}`, { body: shot, contentType: 'image/png' });
});
