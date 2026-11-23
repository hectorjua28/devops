# Guía de configuración y evidencias

Sigue estos pasos en orden. Cada 📸 indica una captura que debes guardar en `docs/evidencias/` para la entrega.

## 1. Subir el pipeline en una rama de trabajo

El repositorio `hectorjua28/devops` ya tiene `main` y `develop`. Los archivos nuevos (pipeline, pruebas y docs) se suben en una rama `feature/`:

```bash
# Dentro de la carpeta del proyecto
git checkout develop
git checkout -b feature/pipeline-cicd
npm install               # actualiza node_modules con Playwright
git add .
git commit -m "ci: pipeline CI/CD, pruebas e2e multiplataforma y documentación"
git push -u origin feature/pipeline-cicd
```

Al abrir el Pull Request se ejecuta el pipeline (integración, construcción, pruebas y Lighthouse). Todavía **no** despliega: eso solo ocurre en `develop`.

> El repositorio debe ser **público** para usar GitHub Pages y environments con aprobación en una cuenta gratuita.
> Haz los pasos 2 a 4 **antes** de hacer merge a `develop`, o el despliegue fallará.

📸 `01-estructura.png`: vista del repositorio con las carpetas.

## 2. Activar GitHub Pages (ambiente de pruebas)

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Environments → `github-pages`** (se crea al activar Pages) → *Deployment branches and tags* → **Add deployment branch rule → `develop`**.
   Si te saltas este paso aparece: *"Branch develop is not allowed to deploy to github-pages due to environment protection rules"*.

## 3. Crear el environment de producción con aprobación

1. **Settings → Environments → New environment → `production`.**
2. Activa **Required reviewers** y agrégate a ti (o al profesor).
3. *Deployment branches and tags* → **Selected branches and tags → Add rule → tag `v*`**.

📸 `02-environments.png`: lista de environments, con `production` y su revisor.

## 4. Proteger ramas

**Settings → Branches → Add branch ruleset** (o *Add rule*) para `main` y `develop`:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass, y selecciona los checks `1 · Integración…` y `3 · Pruebas funcionales…` (aparecen después de la primera ejecución)

📸 `03-ramas.png`: lista de ramas y reglas de protección.

## 5. Flujo de trabajo y ejecución automática del pipeline

```bash
git checkout develop
git checkout -b feature/mejora-x
# ... cambios ...
git commit -am "feat: mejora x"
git push -u origin feature/mejora-x
```
Abre un **Pull Request `feature/pipeline-cicd → develop`** (o el de cualquier otra rama `feature/`). El pipeline corre solo. Cuando esté en verde, haz *merge*. Eso dispara el **despliegue a staging**.

📸 `04-pr-checks.png`: PR con los checks en verde.
📸 `05-actions-lista.png`: pestaña **Actions** con las ejecuciones.
📸 `06-actions-grafo.png`: grafo de jobs de una ejecución en `develop` (integración → construcción → pruebas → deploy → verificación).
📸 `07-integracion-matriz.png`: los jobs de integración (Ubuntu y Windows, Node 22 y 24).
📸 `08-artefactos.png`: sección **Artifacts** al final de la ejecución (`dist`, `tareas-pwa-…zip`, reportes).
📸 `09-summary.png`: resumen de la ejecución (versión, puntajes Lighthouse, staging verificado).

## 6. Ambiente de pruebas

URL: `https://hectorjua28.github.io/devops/` (también aparece en el job *Deploy staging* y en **Settings → Environments → github-pages**).

📸 `10-staging.png`: la app abierta en la URL, con el pie mostrando `v1.0.0-rc.N · commit … · staging`.
📸 `11-build-info.png`: `https://hectorjua28.github.io/devops/build-info.json`.

## 7. Resultados de pruebas funcionales

Descarga el artefacto `reporte-e2e-<plataforma>`, descomprímelo y abre `playwright-report/index.html`. También puedes ejecutar `npx playwright show-report playwright-report`.

📸 `12-playwright-reporte.png`: resumen con todas las pruebas en verde.
📸 `13-playwright-captura-movil.png`: captura adjunta de la prueba *captura de evidencia multiplataforma* en `mobile-safari` o `mobile-chrome`.
📸 `14-lighthouse.png`: reporte HTML del artefacto `reporte-lighthouse`.

## 8. Evidencias multiplataforma en dispositivos reales

📸 `15-android-instalar.png` / `16-android-app.png`: en Chrome, menú ⋮ → **Instalar app**, y la app abierta desde el ícono.
📸 `17-iphone-instalar.png` / `18-iphone-app.png`: en Safari, **Compartir → Agregar a inicio**.
📸 `19-escritorio-instalada.png`: Chrome/Edge → ícono de instalar en la barra de direcciones, y la app en su propia ventana.
📸 `20-offline.png`: modo avión activado y la app funcionando (o DevTools → Network → Offline).
📸 `21-firefox.png`: la app abierta en Firefox de escritorio.

## 9. Versión validada y liberación a producción

```bash
# PR develop → main y merge (con checks en verde)
git checkout main && git pull
git tag -a v1.0.0 -m "Versión 1.0.0 validada"
git push origin v1.0.0
```

El job **5 · Liberación de versión validada** queda en *Waiting*. Revisa la lista de verificación del `INFORME.md` (sección 9) y pulsa **Review deployments → production → Approve and deploy**.

📸 `22-esperando-aprobacion.png`: job esperando aprobación.
📸 `23-aprobacion.png`: diálogo de aprobación.
📸 `24-release.png`: página **Releases** con `v1.0.0` y el `.zip` adjunto.

## 10. Comandos locales útiles

```bash
npm ci                    # instalar dependencias
npm test                  # pruebas unitarias
npx playwright install    # (una vez) navegadores de Playwright
npm run test:e2e          # pruebas funcionales en las 5 plataformas
npm run test:e2e -- --project=chromium
npm run lighthouse        # auditoría (requiere `npm run build` antes)
E2E_BASE_URL=https://hectorjua28.github.io/devops/ npm run test:e2e -- --project=chromium
```
