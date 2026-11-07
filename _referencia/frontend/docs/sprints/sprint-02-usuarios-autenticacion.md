# Sprint 2 — Usuarios y autenticación

## 1. Nombre del sprint
Usuarios y autenticación.

## 2. Objetivo del sprint
Continuar desde la base terminada del Sprint 1 / Tutorial 1 para agregar usuarios y autenticación sobre la SPA vanilla existente. El sprint mantiene una navegación simple dentro de `src/js/main.js` y todavía no crea router formal ni guards; esa separación queda para un sprint posterior.

## 3. Alcance del sprint
- Crear las carpetas:
  - `src/js/api`
  - `src/js/auth`
  - `src/js/components/layout`
  - `src/js/pages`
  - `src/js/utils`
- Crear o verificar `.env` con `VITE_API_URL=http://localhost:5000/api/v1`.
- Crear `src/js/utils/storage.js`.
- Crear `src/js/utils/errorMessages.js`.
- Crear `src/js/auth/session.service.js`.
- Crear `src/js/api/http.js`.
- Crear `src/js/api/auth.api.js`.
- Crear `src/js/components/layout/Navbar.js`.
- Crear `src/js/pages/RegistroPage.js`.
- Crear `src/js/pages/LoginPage.js`.
- Crear `src/js/pages/PerfilPage.js`.
- Reemplazar o actualizar `src/js/main.js` con navegación simple.
- Usar solo estos endpoints:
  - `POST /usuarios/registro`
  - `POST /usuarios/login`
  - `GET /usuarios/perfil`
  - `PATCH /usuarios/perfil`
- Validar manualmente registro, login, perfil, actualización de perfil, logout, perfil sin sesión y credenciales inválidas.
- Ejecutar `npm run build`.
- Ejecutar `npm run preview`.
- Guardar los cambios con Git.

## 4. Fuera de alcance
Este sprint deja fuera explícitamente:

- admin;
- alojamientos;
- comodidades;
- reservas;
- favoritos;
- imágenes;
- reseñas;
- router formal;
- guards separados;
- testing automatizado;
- frameworks de pruebas.

## 5. Prerrequisitos
- Sprint 1 / Tutorial 1 terminado.
- Backend corriendo en `http://localhost:5000/api/v1`.
- `.env` con `VITE_API_URL=http://localhost:5000/api/v1`.
- Git Bash como terminal de trabajo.
- Para validar `npm run preview`, el backend debe permitir por CORS el origen que muestra Vite para preview, normalmente `http://localhost:4173/`.
- Conocimientos básicos de formularios HTML, eventos y Fetch API.

## 6. Herramientas y tecnologías usadas
- JavaScript vanilla
- Fetch API
- `localStorage`
- Vite
- Bootstrap 5.3
- Bootstrap Icons
- Git
- Git Bash

## 7. Tareas del sprint
- Crear las carpetas de la estructura JavaScript.
- Crear o verificar `.env`.
- Implementar `src/js/utils/storage.js`.
- Implementar `src/js/utils/errorMessages.js`.
- Implementar `src/js/auth/session.service.js`.
- Implementar `src/js/api/http.js`.
- Implementar `src/js/api/auth.api.js`.
- Implementar `src/js/components/layout/Navbar.js`.
- Implementar `src/js/pages/RegistroPage.js`.
- Implementar `src/js/pages/LoginPage.js`.
- Implementar `src/js/pages/PerfilPage.js`.
- Actualizar `src/js/main.js` con navegación simple.
- Validar el flujo manual con backend corriendo.
- Validar `npm run build`.
- Validar `npm run preview`.
- Guardar el resultado con `git status`, `git add .`, `git commit` y `git push`.

## 8. Riesgos o puntos de atención
- Olvidar definir `VITE_API_URL` en `.env`.
- Subir `.env` por error.
- Usar `contrasena` con ñ en vez de `contrasena`.
- Llamar `fetch` directo desde las pantallas en vez de usar `http.js`.
- No guardar token y usuario en `session.service.js`.
- Olvidar que `GET /usuarios/perfil` requiere token.
- Validar `npm run preview` sin permitir `http://localhost:4173/` en CORS del backend.
- Crear router formal o guards antes de tiempo.
- Mezclar admin, alojamientos o comodidades antes de tiempo.

## 9. Criterios de aceptación
- Existen:
  - `src/js/utils/storage.js`
  - `src/js/utils/errorMessages.js`
  - `src/js/auth/session.service.js`
  - `src/js/api/http.js`
  - `src/js/api/auth.api.js`
  - `src/js/components/layout/Navbar.js`
  - `src/js/pages/RegistroPage.js`
  - `src/js/pages/LoginPage.js`
  - `src/js/pages/PerfilPage.js`
  - `src/js/main.js`
- No existen:
  - `src/js/router/routes.js`
  - `src/js/router/guards.js`
- El usuario puede registrarse.
- El usuario puede iniciar sesión.
- Token y usuario se guardan en `localStorage`.
- La navbar cambia según la sesión.
- El perfil está protegido de forma básica.
- El perfil carga datos reales.
- El perfil permite actualizar nombre, apellido y teléfono.
- Logout limpia la sesión.
- Perfil sin sesión lleva a login.
- Credenciales inválidas muestran error.
- `npm run build` genera `dist/`.
- `npm run preview` funciona si CORS permite `http://localhost:4173/`.
- En este sprint no hay pruebas automatizadas.

## 10. Definition of Done
- `npm run dev` validado con backend corriendo.
- Flujo manual completo probado.
- `npm run build` ejecutado correctamente.
- `npm run preview` validado.
- No se sube `.env`.
- Solo `.env.example` queda versionado.
- No se crean router formal ni guards.
- Cambios guardados en Git.

## 11. Entregables
- `src/js/utils/storage.js`.
- `src/js/utils/errorMessages.js`.
- `src/js/auth/session.service.js`.
- `src/js/api/http.js`.
- `src/js/api/auth.api.js`.
- `src/js/components/layout/Navbar.js`.
- `src/js/pages/RegistroPage.js`.
- `src/js/pages/LoginPage.js`.
- `src/js/pages/PerfilPage.js`.
- `src/js/main.js`.
- `.env.example` mantenido.
- `.env` local no versionado.
- Commit del Sprint 2 enviado al repositorio remoto.

## 12. Commit sugerido
```text
Sprint 2: usuarios y autenticacion
```

## 13. Estado
Sprint documentado y alineado con el Tutorial 2 final.
