# Tareas PWA

[![CI/CD](https://github.com/hectorjua28/devops/actions/workflows/deploy.yml/badge.svg)](https://github.com/hectorjua28/devops/actions/workflows/deploy.yml)

**Ambiente de pruebas:** https://hectorjua28.github.io/devops/

Gestor de tareas hecho con **Vite + JavaScript puro**. Instalable, funciona offline, con modo oscuro automático y diseño glassmorphism.

## Uso

```bash
npm install
npm run dev       # servidor de desarrollo
npm test          # pruebas unitarias (Vitest)
npm run test:e2e  # pruebas funcionales multiplataforma (Playwright)
npm run lighthouse # auditoría de calidad (tras npm run build)
npm run build     # build de producción en dist/
npm run preview   # sirve dist/ localmente
npm run icons     # regenera los íconos PNG
```

## Variables de entorno

| Variable           | Uso                                          | Por defecto                 |
| ------------------ | -------------------------------------------- | --------------------------- |
| `VITE_BASE`        | Ruta base (ej. `/mi-repo/` en GitHub Pages)  | `/`                         |
| `VITE_APP_VERSION` | Versión mostrada en el pie de página         | `version` de `package.json` |
| `VITE_COMMIT_SHA`  | SHA del commit                               | `dev`                       |
| `VITE_APP_ENV`     | Ambiente (dev, staging, prod…)               | `dev`                       |

Ejemplo:

```bash
VITE_BASE=/mi-repo/ VITE_COMMIT_SHA=$(git rev-parse HEAD) VITE_APP_ENV=prod npm run build
```

## Estructura

```
src/tasks.js     lógica pura de tareas (probada en tests/)
src/storage.js   persistencia en localStorage
src/theme.js     modo claro/oscuro
src/main.js      UI
public/sw.js     service worker (offline)
tests/           unitarias (*.test.js) y e2e (e2e/*.spec.js)
.github/workflows/deploy.yml   pipeline CI/CD
docs/            informe, guía de configuración y evidencias
```

## CI/CD

| Rama / evento | Resultado |
|---|---|
| PR desde `feature/*` | Integración (Linux/Windows) + build + pruebas e2e + Lighthouse |
| `develop` | Todo lo anterior + **despliegue a staging (GitHub Pages)** + verificación |
| tag `vX.Y.Z` | Todo lo anterior + **aprobación manual** + GitHub Release con el `.zip` |

Detalles en [`docs/INFORME.md`](docs/INFORME.md) y configuración paso a paso en [`docs/GUIA-CONFIGURACION.md`](docs/GUIA-CONFIGURACION.md).

> El service worker solo se registra en el build de producción (`npm run build && npm run preview`).
