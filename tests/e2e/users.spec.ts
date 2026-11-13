import { test, expect } from '@playwright/test';
const mock = 'http://127.0.0.1:4010/user-service';
test.beforeEach(async ({ request }) => { await request.post(`${mock}/__reset`); });
async function login(page: import('@playwright/test').Page) {
  await page.goto('/login'); await page.getByLabel('Correo electrónico', { exact: true }).fill('admin@example.com'); await page.getByLabel('Contraseña', { exact: true }).fill('password123'); await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Bienvenido a tu panel.' })).toBeVisible();
}
test('sesión persistente y ciclo crear, listar, editar, eliminar', async ({ page }) => {
  await login(page); await page.reload(); await expect(page.getByRole('heading', { name: 'Bienvenido a tu panel.' })).toBeVisible();
  await page.goto('/usuarios/crear'); await page.getByLabel('Nombre completo').fill('Lucía Prueba'); await page.getByLabel('Correo electrónico').fill('lucia@example.com'); await page.getByLabel('Contraseña', { exact: true }).fill('password123'); await page.getByRole('button', { name: 'Crear usuario', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Usuario creado correctamente' })).toBeVisible();
  await page.getByRole('button', { name: 'Ver usuarios' }).click(); await page.getByLabel('Buscar usuarios').fill('lucia@example.com'); await expect(page.getByText('Lucía Prueba', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Editar Lucía Prueba', exact: true }).click(); await page.getByLabel('Nombre completo').fill('Lucía Actualizada'); await page.getByLabel('Estado', { exact: true }).selectOption('ACTIVE'); await page.getByRole('button', { name: 'Guardar cambios' }).click(); await expect(page.getByRole('heading', { name: 'Usuario actualizado' })).toBeVisible();
  await page.getByRole('button', { name: 'Ver usuarios' }).click(); await page.getByRole('button', { name: 'Eliminar Lucía Actualizada', exact: true }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.getByRole('button', { name: 'Cancelar', exact: true }).click(); await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Eliminar Lucía Actualizada', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Eliminar usuario', exact: true }).click(); await expect(page.getByText('Usuario eliminado correctamente.')).toBeVisible(); await expect(page.getByText('Lucía Actualizada', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click(); await expect(page).toHaveURL(/\/login$/); expect(await page.evaluate(() => localStorage.getItem('nexo.session'))).toBeNull();
});
test('401 borra el token y redirige; 403 conserva la sesión', async ({ page, request }) => {
  await login(page); await request.post(`${mock}/__failure`, { data: { status: 403 } }); await page.goto('/usuarios'); await expect(page.getByRole('alert')).toContainText('permisos'); expect(await page.evaluate(() => localStorage.getItem('nexo.session'))).toBeTruthy();
  await request.post(`${mock}/__failure`, { data: { status: 401 } }); await page.getByRole('button', { name: 'Actualizar' }).click(); await expect(page).toHaveURL(/\/login\?expired=1/); await expect(page.getByRole('alert')).toContainText('venció'); expect(await page.evaluate(() => localStorage.getItem('nexo.session'))).toBeNull();
});
test('registro público y credenciales inválidas muestran mensajes', async ({ page }) => {
  await page.goto('/registro'); await page.getByLabel('Nombre completo').fill('Nuevo Miembro'); await page.getByLabel('Correo electrónico').fill('nuevo@example.com'); await page.getByLabel('Contraseña', { exact: true }).fill('password123'); await page.getByRole('button', { name: 'Crear usuario', exact: true }).click(); await expect(page.getByRole('status')).toContainText('pendiente de activación');
  await page.getByRole('button', { name: 'Ir al inicio de sesión' }).click(); await page.getByLabel('Correo electrónico', { exact: true }).fill('nuevo@example.com'); await page.getByLabel('Contraseña', { exact: true }).fill('password123'); await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('pendiente de activación');
});
test('pantallas adaptables y navegación protegida', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/usuarios'); await expect(page).toHaveURL(/login/); await login(page); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1100 }); await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
});
