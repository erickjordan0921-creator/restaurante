# Sprint 1 — Base SPA con Vite y Bootstrap

## 1. Nombre del sprint
Base SPA con Vite y Bootstrap.

## 2. Objetivo del sprint
Dejar lista la base técnica de la SPA vanilla para que el estudiante pueda seguir el Tutorial 1 paso a paso y llegar a una pantalla base funcional, con Vite, Bootstrap 5.3, Bootstrap Icons, `.env.example` y la estructura real del frontend.

## 3. Contexto de negocio
Antes de construir autenticación, alojamientos o comodidades, el frontend necesita una base estable y repetible. Este sprint asegura que el proyecto quede preparado para crecer sin contradecir la estructura real que se usa en el tutorial operativo.

## 4. Alcance del sprint
- Inicializar Vite en modo vanilla.
- Instalar Bootstrap 5.3.
- Instalar Bootstrap Icons.
- Limpiar la plantilla inicial de Vite cuando genere archivos de ejemplo.
- Crear `src/js/main.js`.
- Crear `src/css/main.css`.
- Crear o revisar `vite.config.js`.
- Crear `.env.example`.
- Reemplazar `package.json` con la versión completa del Sprint 1.
- Ejecutar nuevamente `npm install` después de reemplazar `package.json`.
- Validar manualmente la app en navegador con `npm run dev`.
- Validar el build con `npm run build`.
- Validar el preview con `npm run preview`.
- Guardar los cambios con `git add .`, `git commit` y `git push`.

Estructura esperada del proyecto:

```text
frontend-alojamientos/
├── .env.example
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── src/
    ├── css/
    │   └── main.css
    └── js/
        └── main.js
```

## 5. Fuera de alcance
Este sprint no implementa:

- router;
- login;
- sesión;
- guards;
- consumo de API;
- alojamientos;
- comodidades;
- funcionalidades de tutoriales posteriores;
- configuración de testing;
- frameworks de pruebas.

## 6. Prerrequisitos
- Tener Node.js y npm instalados.
- Tener conocimientos básicos de HTML, CSS y JavaScript.
- Tener disponible la URL local del backend para futuros sprints: `http://localhost:5000/api/v1`.
- Usar Git Bash como terminal de trabajo para ejecutar los comandos del sprint.

## 7. Herramientas y tecnologías usadas
- HTML5
- CSS3
- JavaScript vanilla moderno
- Vite
- Bootstrap 5.3
- Bootstrap Icons
- npm
- Git
- Git Bash

## 8. Tareas del sprint
- Inicializar Vite en modo vanilla.
- Instalar Bootstrap 5.3.
- Instalar Bootstrap Icons.
- Limpiar la plantilla inicial de Vite si genera archivos de ejemplo.
- Crear `src/js/main.js`.
- Crear `src/css/main.css`.
- Crear o revisar `vite.config.js`.
- Crear `.env.example` con `VITE_API_URL=http://localhost:5000/api/v1`.
- Reemplazar `package.json` con la versión completa del Sprint 1.
- Ejecutar nuevamente `npm install` para sincronizar `package-lock.json` y `node_modules`.
- Validar la app en navegador con `npm run dev`.
- Validar el build con `npm run build`.
- Validar el preview con `npm run preview`.
- Guardar el resultado con `git status`, `git add .`, `git commit` y `git push`.

## 9. Riesgos o puntos de atención
- Confundir Vite con un framework.
- Olvidar crear `vite.config.js` si la plantilla no lo generó.
- Olvidar volver a ejecutar `npm install` después de reemplazar `package.json`.
- Mezclar JavaScript inline en HTML.
- Usar rutas distintas a `/src/js/main.js`.
- No limpiar la plantilla inicial si Vite generó archivos de ejemplo.
- Subir `.env` por error en lugar de dejar solo `.env.example`.

## 10. Criterios de aceptación
- Existe `package.json`.
- Existe `package-lock.json`.
- Existe `index.html`.
- Existe `vite.config.js`.
- Existe `.env.example`.
- Existe `src/js/main.js`.
- Existe `src/css/main.css`.
- `index.html` apunta a `/src/js/main.js`.
- `.env.example` contiene `VITE_API_URL=http://localhost:5000/api/v1`.
- `npm run dev` carga la pantalla base en navegador.
- La pantalla base muestra el texto `Frontend de alojamientos listo`.
- `npm run build` genera `dist/`.
- `npm run preview` carga correctamente el build compilado.
- En este sprint no hay pruebas automatizadas.

## 11. Definition of Done
- `npm run dev` validado en navegador.
- `npm run build` ejecutado correctamente.
- `npm run preview` validado en navegador.
- No se sube `.env`; solo `.env.example`.
- Cambios guardados en Git.

## 12. Entregables del sprint
- `index.html`.
- `package.json`.
- `package-lock.json`.
- `vite.config.js`.
- `.env.example`.
- `src/js/main.js`.
- `src/css/main.css`.
- Commit del Sprint 1 enviado al repositorio remoto.

Commit sugerido:

```text
Sprint 1: base SPA con Vite y Bootstrap
```

## 13. Estado
Documentado y alineado con el Tutorial 1 final.
