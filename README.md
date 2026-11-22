# Tareas PWA

Gestor de tareas hecho con **Vite + JavaScript puro**. Instalable, funciona offline, con modo oscuro automático y diseño glassmorphism.

## Uso

```bash
npm install
npm run dev       # servidor de desarrollo
npm test          # pruebas unitarias (Vitest)
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
```

> El service worker solo se registra en el build de producción (`npm run build && npm run preview`).
