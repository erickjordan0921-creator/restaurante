# Tutorial — Sprint 3: Roles, autorización y guards

## 1. Objetivo
Agregar control de acceso a la SPA vanilla para:

- proteger vistas privadas;
- bloquear vistas solo admin;
- manejar `401` y `403` correctamente;
- mostrar u ocultar opciones según el rol;
- consumir `GET /admin/usuarios` solo como admin.

Este sprint no implementa alojamientos ni otros módulos fuera de alcance.

## 2. Qué vas a construir
Al finalizar este tutorial tendrás:

- un archivo de configuración de rutas;
- un guard de autenticación;
- un guard de rol admin;
- una utilidad para leer el rol del usuario autenticado;
- la navbar actualizada con Inicio, la opción Usuarios solo para admin y un dropdown con el correo del usuario;
- un acceso directo al listado de usuarios;
- un servicio API para admin;
- un listado de usuarios usando `GET /admin/usuarios`;
- sin panel intermedio de administración;
- manejo diferenciado de errores `401` y `403`.

## 3. Qué va a aprender el estudiante
En este sprint vas a aprender:

- la diferencia entre autenticación y autorización;
- la diferencia entre `401` y `403`;
- por qué ocultar botones no es seguridad real;
- cómo crear guards en JavaScript vanilla;
- cómo proteger vistas desde el frontend;
- cómo usar el rol guardado en sesión;
- por qué el backend siempre valida permisos de forma definitiva;
- cómo manejar un usuario invitado, un usuario normal y un admin.

## 4. Prerrequisitos
Antes de empezar, asegúrate de tener:

- el Tutorial 1 terminado;
- el Tutorial 2 terminado;
- la sesión frontend funcionando;
- el token centralizado;
- el usuario autenticado guardado en sesión;
- el backend devolviendo el campo `rol` dentro de ese usuario;
- el cliente HTTP centralizado;
- el backend corriendo en `http://localhost:5000/api/v1`;
- el contrato backend-frontend revisado;
- usuarios de prueba:
  - invitado;
  - usuario normal;
  - usuario admin.

## 5. Estructura esperada al finalizar
La estructura esperada al finalizar este sprint puede verse así:

```text
frontend-alojamientos/
└── src/
    └── js/
        ├── api/
        │   ├── http.js
        │   ├── auth.api.js
        │   └── admin.api.js
        ├── auth/
        │   ├── session.service.js
        │   └── permissions.js
        ├── router/
        │   ├── routes.js
        │   └── guards.js
        ├── components/
        │   └── layout/
        │       └── Navbar.js
        ├── pages/
        │   ├── AdminUsuariosPage.js
        │   ├── LoginPage.js
        │   ├── RegistroPage.js
        │   └── PerfilPage.js
        └── main.js
```

El router puede seguir siendo simple, pero ya debe tener reglas de acceso.
La vista intermedia de administración no forma parte de la estructura final de este sprint.

## 6. Paso a paso completo

### Paso 1: verificar `src/js/pages/LoginPage.js`
Abre `src/js/pages/LoginPage.js`. No crees un archivo nuevo: este paso solo verifica el patrón que ya venía del Tutorial 2.

El Tutorial 2 dejó el login guardando la sesión completa con `saveSession(...)`. En este sprint no reemplazas el archivo: solo confirmas que el usuario guardado incluye `rol` dentro de `response.data.usuario`.

Formato esperado:

```json
{
  "id": 1,
  "correo": "admin@example.com",
  "rol": "admin"
}
```

Cuando el login responde, el flujo debe seguir guardando `response.data.usuario`, que es el objeto completo del usuario. Si el backend ya devuelve `rol`, no hace falta cambiar nada en el login; en este sprint solo vas a leer ese campo desde sesión.

En `src/js/pages/LoginPage.js`, verifica que el login guarde sesión así:

```js
import { saveSession } from '../auth/session.service.js';

const response = await login({ correo, contrasena });
saveSession(response.data.access_token, response.data.usuario);
```

Puedes comprobar el rol guardado con `getUser()?.rol`.

### Paso 2: reemplazar todo el contenido de `src/js/pages/PerfilPage.js`
El Tutorial 2 ya dejó la base del perfil, pero ahora la vista debe mostrar también el rol del usuario autenticado.

La idea es que el perfil inicial siga leyendo la sesión para mostrar el correo y el rol, mientras el montaje consulta el backend para completar los campos editables.

Reemplaza todo el contenido de `src/js/pages/PerfilPage.js` por este código:

```js
import { getProfile, updateProfile } from '../api/auth.api.js';
import { clearSession, getUser } from '../auth/session.service.js';
import { formatApiError } from '../utils/errorMessages.js';

function getDetailsMessage(details) {
  if (!details) {
    return '';
  }

  if (typeof details === 'string') {
    return details;
  }

  if (Array.isArray(details)) {
    return details.filter(Boolean).join(' ');
  }

  if (typeof details === 'object') {
    return Object.values(details)
      .flat()
      .filter(Boolean)
      .join(' ');
  }

  return '';
}

function setMessage(element, text, tone = 'muted') {
  if (!element) {
    return;
  }

  element.className = `mt-3 mb-0 text-${tone}`;
  element.textContent = text;
}

function getRoleLabel(role) {
  if (role === 'admin') {
    return 'Administrador';
  }

  if (role === 'usuario') {
    return 'Usuario';
  }

  return 'No disponible';
}

export function PerfilPage() {
  const user = getUser();

  return `
    <section class="container py-5" style="max-width: 720px;">
      <h1 class="mb-4">Perfil</h1>
      <div class="alert alert-info">
        <strong>Correo:</strong> ${user?.correo ?? 'No disponible'}
        <br />
        <strong>Rol:</strong> ${getRoleLabel(user?.rol)}
      </div>
      <form id="perfilForm" class="card card-body shadow-sm">
        <div class="mb-3">
          <label class="form-label" for="nombre">Nombre</label>
          <input class="form-control" type="text" id="nombre" name="nombre" value="" required />
        </div>
        <div class="mb-3">
          <label class="form-label" for="apellido">Apellido</label>
          <input class="form-control" type="text" id="apellido" name="apellido" value="" required />
        </div>
        <div class="mb-3">
          <label class="form-label" for="telefono">Teléfono</label>
          <input class="form-control" type="tel" id="telefono" name="telefono" value="" />
        </div>
        <button class="btn btn-primary" type="submit">Actualizar</button>
        <p class="mt-3 mb-0 text-muted" id="perfilMensaje"></p>
      </form>
    </section>
  `;
}

export function mountPerfilPage({ navigate } = {}) {
  const form = document.querySelector('#perfilForm');
  const message = document.querySelector('#perfilMensaje');
  const nombreInput = document.querySelector('#nombre');
  const apellidoInput = document.querySelector('#apellido');
  const telefonoInput = document.querySelector('#telefono');

  if (!form || !message || !nombreInput || !apellidoInput || !telefonoInput) {
    return;
  }

  async function cargarPerfil() {
    try {
      const response = await getProfile();
      const perfil = response.data;

      nombreInput.value = perfil?.nombre ?? '';
      apellidoInput.value = perfil?.apellido ?? '';
      telefonoInput.value = perfil?.telefono ?? '';
      setMessage(message, '', 'muted');
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible cargar el perfil.');

      if (apiError.status === 401) {
        clearSession();
        setMessage(message, 'La sesión expiró. Inicia sesión nuevamente.', 'danger');
        navigate?.('login');
        return;
      }

      const detailsMessage = getDetailsMessage(apiError.details);
      setMessage(message, detailsMessage || apiError.message, 'danger');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nombre = nombreInput.value.trim();
    const apellido = apellidoInput.value.trim();
    const telefono = telefonoInput.value.trim();

    try {
      setMessage(message, 'Actualizando perfil...', 'muted');
      await updateProfile({
        nombre,
        apellido,
        telefono,
      });
      setMessage(message, 'Datos básicos del perfil actualizados correctamente.', 'success');
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible actualizar el perfil.');

      if (apiError.status === 401) {
        clearSession();
        setMessage(message, 'Sesión inválida. Vuelve a iniciar sesión.', 'danger');
        navigate?.('login');
        return;
      }

      const detailsMessage = getDetailsMessage(apiError.details);

      if (apiError.status === 400) {
        setMessage(message, detailsMessage || 'Revisa los campos enviados.', 'danger');
        return;
      }

      setMessage(message, detailsMessage || apiError.message, 'danger');
    }
  });

  cargarPerfil();
}
```

El perfil debe enseñar el correo y el rol desde la sesión, y el `mount` debe seguir consumiendo el backend para poblar los campos editables.
Si el backend responde `401`, esta vista limpia la sesión y navega a login.
Si llegara a aparecer un `403`, no se debe cerrar la sesión desde aquí; se debe conservar y mostrar el mensaje correspondiente en la vista protegida que lo dispara.

### Paso 3: crear `src/js/auth/permissions.js`
Este archivo es nuevo en Sprint 3 y centraliza la lectura del usuario y del rol autenticado.

Crea `src/js/auth/permissions.js` con este contenido:

```js
import { getUser, hasSession } from './session.service.js';

export function getCurrentUser() {
  return getUser();
}

export function getCurrentRole() {
  return getCurrentUser()?.rol ?? null;
}

export function isAuthenticated() {
  return hasSession() && Boolean(getCurrentUser());
}

export function isAdmin() {
  return getCurrentRole() === 'admin';
}
```

La idea es no repetir lógica de roles en cada vista.

### Paso 4: crear `src/js/router/guards.js`
Este archivo es nuevo en Sprint 3 y define los guards que protegen rutas privadas y rutas solo admin.

Crea `src/js/router/guards.js` con este contenido:

```js
import { isAdmin, isAuthenticated } from '../auth/permissions.js';

export function requireAuth(onDenied) {
  if (!isAuthenticated()) {
    onDenied?.('login');
    return false;
  }

  return true;
}

export function requireAdmin(onDenied) {
  if (!isAuthenticated()) {
    onDenied?.('login');
    return false;
  }

  if (!isAdmin()) {
    onDenied?.('forbidden');
    return false;
  }

  return true;
}
```

Si no hay sesión, se puede enviar a login o mostrar un mensaje. Si hay sesión pero no admin, se debe mostrar un mensaje de permisos insuficientes. No se debe cerrar sesión por `403`.

### Paso 5: crear `src/js/router/routes.js`
Define rutas con metadatos simples para indicar si son públicas, privadas o solo admin.

Importante: `home` no se resuelve desde `routes.js`. Sigue siendo la vista base heredada del Tutorial 1/2 y `main.js` la renderiza como caso especial con `renderHome()`.

Crea `src/js/router/routes.js` con este contenido:

```js
import { AdminUsuariosPage, mountAdminUsuariosPage } from '../pages/AdminUsuariosPage.js';
import { LoginPage, mountLoginPage } from '../pages/LoginPage.js';
import { PerfilPage, mountPerfilPage } from '../pages/PerfilPage.js';
import { RegistroPage, mountRegistroPage } from '../pages/RegistroPage.js';

export const routes = [
  {
    path: 'login',
    page: LoginPage,
    public: true,
    mount: mountLoginPage,
  },
  {
    path: 'registro',
    page: RegistroPage,
    public: true,
    mount: mountRegistroPage,
  },
  {
    path: 'perfil',
    page: PerfilPage,
    requiresAuth: true,
    mount: mountPerfilPage,
  },
  {
    path: 'admin',
    page: AdminUsuariosPage,
    requiresAuth: true,
    requiresAdmin: true,
    mount: mountAdminUsuariosPage,
  },
  {
    path: 'admin-usuarios',
    aliases: ['admin/usuarios'],
    page: AdminUsuariosPage,
    requiresAuth: true,
    requiresAdmin: true,
    mount: mountAdminUsuariosPage,
  },
];

export function getRoute(path) {
  return routes.find(
    (route) => route.path === path || route.aliases?.includes(path),
  );
}

export function normalizeRouteView(path = 'home') {
  return String(path || 'home')
    .replace(/^#\/?/, '')
    .replace(/^\//, '') || 'home';
}
```

No conviertas esto en un framework complejo. Solo necesitas una forma clara de saber qué rutas requieren sesión y cuáles requieren admin. Verifica que `admin` y `admin-usuarios` compartan `AdminUsuariosPage`, que ambas usen `mount: mountAdminUsuariosPage` y que exista el alias `admin/usuarios`.

### Paso 6: reemplazar `src/js/main.js` por la versión de Sprint 3
Abre `src/js/main.js`. Sobre el archivo que viene del Tutorial 2, reemplaza todo el contenido por la siguiente versión de Sprint 3. Este bloque muestra el archivo completo; no es un archivo nuevo.

Conserva del Tutorial 2:

- la constante `app`;
- `currentView`;
- `navigate`;
- el listener de clicks para `data-view`;
- el manejo de logout;
- la vista base de `home`;
- la vista de no encontrada, si ya la tenías.

La versión de Sprint 3 queda así:

```js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/main.css';

import { getCurrentUser, isAdmin, isAuthenticated } from './auth/permissions.js';
import { clearSession } from './auth/session.service.js';
import { Navbar } from './components/layout/Navbar.js';
import { requireAdmin, requireAuth } from './router/guards.js';
import { getRoute, normalizeRouteView } from './router/routes.js';

const app = document.querySelector('#app');
let currentView = 'home';

function renderHome() {
  const user = getCurrentUser();

  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-9 py-4">
          <p class="text-uppercase text-primary fw-semibold mb-2">Frontend Alojamientos</p>
          <h1 class="display-6 mb-3">Base SPA lista para comenzar</h1>
          <p class="text-muted mb-4">
            Este arranque deja lista la autenticación y la navegación principal.
          </p>
          <div class="d-flex flex-wrap gap-2">
            ${
              isAuthenticated()
                ? '<a class="btn btn-primary" href="#" data-view="perfil">Ir a mi perfil</a>'
                : '<a class="btn btn-primary" href="#" data-view="login">Iniciar sesión</a><a class="btn btn-outline-secondary" href="#" data-view="registro">Crear cuenta</a>'
            }
          </div>
          ${
            user?.correo
              ? `
                <p class="text-muted mt-4 mb-0">
                  Has iniciado sesión como <strong>${user.correo}</strong>.
                </p>
              `
              : ''
          }
          ${
            isAdmin()
              ? `
                <p class="text-muted mt-2 mb-0">
                  Tu sesión tiene permisos de administrador.
                </p>
              `
              : ''
          }
        </div>
      </div>
    </section>
  `;
}

function renderForbiddenPage() {
  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="alert alert-danger shadow-sm border-0" role="alert">
            <div class="d-flex align-items-start gap-3">
              <i class="bi bi-shield-exclamation fs-1"></i>
              <div>
                <h1 class="h4 mb-2">No tienes permisos para ver esta sección</h1>
                <p class="mb-3">
                  Tu sesión sigue activa, pero esta vista requiere permisos de administrador.
                </p>
                <a class="btn btn-outline-light" href="#" data-view="home">
                  Volver
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderNotFoundPage() {
  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5 text-center">
              <h1 class="h3 mb-3">Página no encontrada</h1>
              <p class="text-muted mb-4">
                La ruta solicitada no está disponible en esta SPA.
              </p>
              <a class="btn btn-primary" href="#" data-view="home">Ir al inicio</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderAccessDenied(reason) {
  if (reason === 'login') {
    navigate('login');
    return;
  }

  currentView = 'forbidden';
  app.innerHTML = `
    ${Navbar(currentView)}
    <main id="page-root">${renderForbiddenPage()}</main>
  `;
}

function render(view = currentView) {
  const normalizedView = normalizeRouteView(view);

  if (normalizedView === 'home') {
    currentView = 'home';
    app.innerHTML = `
      ${Navbar(currentView)}
      <main id="page-root">${renderHome()}</main>
    `;
    return;
  }

  const route = getRoute(normalizedView);

  if (!route) {
    currentView = 'not-found';
    app.innerHTML = `
      ${Navbar(currentView)}
      <main id="page-root">${renderNotFoundPage()}</main>
    `;
    return;
  }

  if (route.requiresAdmin) {
    if (!requireAdmin(renderAccessDenied)) {
      return;
    }
  } else if (route.requiresAuth) {
    if (!requireAuth(renderAccessDenied)) {
      return;
    }
  }

  currentView = route.path;

  const pageHtml = route.page(route.params) ?? '';

  app.innerHTML = `
    ${Navbar(currentView)}
    <main id="page-root">${pageHtml}</main>
  `;

  route.mount?.({ navigate, render, params: route.params, view: currentView });
}

function navigate(view = 'home') {
  render(normalizeRouteView(view));
}

app.addEventListener('click', (event) => {
  const viewLink = event.target.closest('[data-view]');
  if (viewLink) {
    event.preventDefault();
    navigate(viewLink.dataset.view);
    return;
  }

  const logoutButton = event.target.closest('[data-action="logout"]');
  if (logoutButton) {
    clearSession();
    navigate('home');
  }
});

navigate(currentView);
```

La idea es simple: `home` sigue siendo una vista base heredada del Tutorial 1/2, el router resuelve la ruta actual y los guards deciden si se puede entrar antes de montar la página.
Cuando una ruta tiene datos dinámicos, `route.params` viaja hacia la página para que pueda leer identificadores como `id`.
Si la vista necesita enlazar eventos o cargar datos después de insertar el HTML, expone un hook como `mount`, que se ejecuta justo después del render.

### Paso 7: actualizar `Navbar.js`
La navbar debe cambiar según el rol.

Debe mostrar:

- visitante: Inicio, Login y Registro;
- autenticado normal: Inicio y dropdown con correo;
- admin: Inicio, Usuarios y dropdown con correo.

La navbar del Tutorial 2 se reutiliza y en este sprint solo se controla la aparición de `Usuarios` según el rol. No aparece `Comodidades` ni panel intermedio de administración.

Reemplaza todo el contenido de `src/js/components/layout/Navbar.js` por este archivo:

```js
import { getCurrentUser, isAdmin, isAuthenticated } from '../../auth/permissions.js';

function isAdminView(currentView) {
  return currentView === 'admin' || currentView === 'admin-usuarios' || currentView === 'admin/usuarios';
}

function isActive(view, currentView) {
  if (view === 'admin') {
    return isAdminView(currentView) ? 'active fw-semibold' : '';
  }

  return currentView === view ? 'active fw-semibold' : '';
}

function navLink(view, label, currentView) {
  return `
    <li class="nav-item">
      <a class="nav-link ${isActive(view, currentView)}" href="#" data-view="${view}">
        ${label}
      </a>
    </li>
  `;
}

function navDropdown(user, currentView) {
  const label = user?.correo?.trim() || 'Mi cuenta';

  return `
    <li class="nav-item dropdown">
      <button
        class="btn btn-outline-light dropdown-toggle ${isActive('perfil', currentView)}"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        ${label}
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li>
          <a class="dropdown-item ${isActive('perfil', currentView)}" href="#" data-view="perfil">
            Perfil
          </a>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li>
          <button class="dropdown-item" type="button" data-action="logout">
            Cerrar sesión
          </button>
        </li>
      </ul>
    </li>
  `;
}

export function Navbar(currentView = 'home') {
  const user = getCurrentUser();
  const loggedIn = isAuthenticated();

  return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-semibold" href="#" data-view="home">Alojamientos</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Alternar navegación"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            ${navLink('home', 'Inicio', currentView)}
            ${
              loggedIn
                ? `
                  ${isAdmin() ? navLink('admin', 'Usuarios', currentView) : ''}
                  ${navDropdown(user, currentView)}
                `
                : `
                  ${navLink('login', 'Login', currentView)}
                  ${navLink('registro', 'Registro', currentView)}
                `
            }
          </ul>
        </div>
      </div>
    </nav>
  `;
}
```

La opción `Usuarios` solo aparece para admin. El usuario normal ve `Inicio` y el dropdown con su correo.

#### Reemplazar `src/js/api/http.js`
Reemplaza todo el contenido de `src/js/api/http.js` por este código. Este archivo ya venía del Tutorial 2 y en Sprint 3 se mantiene como cliente HTTP centralizado: adjunta el token, ejecuta `fetch` y normaliza errores. No debe cerrar sesión ni decidir navegación. Si llega `401` o `403`, la decisión queda en las vistas protegidas.

```js
import { getToken } from '../auth/session.service.js';
import { formatApiError } from '../utils/errorMessages.js';

const API_URL = import.meta.env.VITE_API_URL;

function parseBody(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (cause) {
    throw formatApiError(
      {
        status: 0,
        message: cause instanceof Error ? cause.message : 'No fue posible conectar con el servidor.',
        details: null,
        data: null,
      },
      'No fue posible conectar con el servidor.',
    );
  }

  if (response.status === 204) {
    return null;
  }

  const bodyText = await response.text();
  const data = parseBody(bodyText);

  if (!response.ok) {
    throw formatApiError(
      {
        status: response.status,
        message:
          data?.error?.message ??
          data?.message ??
          data?.detail ??
          data ??
          'Ocurrió un error inesperado.',
        details: data?.error?.details ?? data?.details ?? data?.errors ?? {},
        data,
      },
      'Revisa los datos enviados.',
    );
  }

  return data;
}
```

### Paso 8: crear `src/js/api/admin.api.js`
Este archivo es nuevo en Sprint 3 y encapsula el consumo del área administrativa.

El único endpoint nuevo permitido en este tutorial es:

- `GET /admin/usuarios`

Crea `src/js/api/admin.api.js` con este contenido:

```js
import { request } from './http.js';

export function getUsuarios() {
  return request('/admin/usuarios');
}
```

Debe usar el cliente HTTP centralizado que ya construiste en el Tutorial 2.


### Paso 9: crear `src/js/pages/AdminUsuariosPage.js`
Este archivo es nuevo en Sprint 3. Debe consumir `GET /admin/usuarios` y mostrar una tabla simple de usuarios con ID, correo, rol y fecha de creación.

Debe manejar:

- loading;
- error;
- empty state;
- `401`;
- `403`.

Crea `src/js/pages/AdminUsuariosPage.js` con este contenido:

```js
import { getUsuarios } from '../api/admin.api.js';
import { clearSession } from '../auth/session.service.js';
import { formatApiError } from '../utils/errorMessages.js';

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('es-CO');
}

function renderUsuariosTable(usuarios) {
  return `
    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Correo</th>
            <th scope="col">Rol</th>
            <th scope="col">Creación</th>
          </tr>
        </thead>
        <tbody>
          ${usuarios
            .map(
              (usuario) => `
                <tr>
                  <td>${usuario.id ?? '—'}</td>
                  <td>${usuario.correo ?? '—'}</td>
                  <td>${usuario.rol ?? 'usuario'}</td>
                  <td>${formatDate(usuario.fecha_creacion)}</td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderStateMessage(type, message) {
  return `
    <div class="alert alert-${type} mb-0" role="alert">
      ${message}
    </div>
  `;
}

export function AdminUsuariosPage() {
  return `
    <section class="container py-5">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 class="h3 mb-2">Usuarios</h1>
          <p class="text-muted mb-0">
            Consulta el listado de usuarios registrados en la plataforma.
          </p>
        </div>
      </div>

      <div id="adminUsuariosState" class="text-muted">Cargando usuarios...</div>
    </section>
  `;
}

export function mountAdminUsuariosPage({ navigate } = {}) {
  const state = document.querySelector('#adminUsuariosState');

  if (!state) {
    return;
  }

  async function cargarUsuarios() {
    try {
      state.innerHTML = renderStateMessage('secondary', 'Cargando usuarios...');
      const response = await getUsuarios();
      const usuarios = Array.isArray(response?.data) ? response.data : [];

      if (!usuarios.length) {
        state.innerHTML = renderStateMessage('info', 'No hay usuarios para mostrar.');
        return;
      }

      state.innerHTML = renderUsuariosTable(usuarios);
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible cargar los usuarios.');

      if (apiError.status === 401) {
        clearSession();
        state.innerHTML = renderStateMessage('warning', 'Tu sesión expiró. Inicia sesión nuevamente.');
        navigate?.('login');
        return;
      }

      if (apiError.status === 403) {
        state.innerHTML = renderStateMessage('danger', 'No tienes permisos para ver esta sección.');
        return;
      }

      state.innerHTML = renderStateMessage('danger', apiError.message);
    }
  }

  cargarUsuarios();
}
```

### Paso 10: manejar `401` y `403` en `src/js/pages/AdminUsuariosPage.js`
En `src/js/pages/AdminUsuariosPage.js` o en cualquier otra vista protegida, aplica esta regla de decisión:

Usa esta regla simple:

- `http.js` centraliza la petición, adjunta el token y normaliza el error, pero no cierra sesión ni decide navegación;
- las vistas protegidas deciden qué hacer ante `401`;
- `401`: token ausente, inválido o expirado. La vista puede limpiar sesión y pedir login;
- `403`: usuario autenticado sin permiso. No debes cerrar sesión automáticamente ni enviar al login.

Regla de decisión en la vista:

```js
if (error.status === 401) {
  clearSession();
  // volver a login
}

if (error.status === 403) {
  // mostrar mensaje de permisos insuficientes
  // conservar la sesión
}
```

### Paso 11: probar los tres perfiles
Prueba estos tres escenarios:

- invitado intentando entrar a perfil o admin;
- usuario normal intentando entrar a admin;
- admin entrando a admin y listando usuarios.

Usa el navegador y también la navegación interna de la SPA para validar que los guards funcionen antes de mostrar la vista.

### Paso 12: dejar preparado el control de permisos para los siguientes sprints
Las mismas reglas de autenticación y autorización se reutilizarán después para proteger acciones futuras del dominio.

No implementes esas funcionalidades ahora. Solo deja la base de guards, rol y navbar lista para que después se reutilice.

## 7. Cómo probar que funciona
Usa esta lista de verificación:

- un invitado no puede ver perfil;
- un invitado no puede ver admin;
- `home` sigue siendo la vista base;
- `registro` abre correctamente;
- un usuario normal puede ver perfil;
- `perfil` muestra correo y rol;
- un usuario normal no puede ver admin;
- un admin ve Usuarios en la navbar;
- un admin puede listar usuarios;
- `admin/usuarios` funciona como alias de `admin`;
- `401` limpia sesión o solicita login;
- `403` muestra mensaje sin cerrar sesión;
- la navbar cambia según el rol;
- no hay rutas de alojamientos;
- no hay rutas de comodidades;

## 8. Errores comunes
Los errores más frecuentes en este sprint son:

- asumir que ocultar la opción Usuarios es seguridad real;
- cerrar sesión ante cualquier `403`;
- olvidar enviar token en `GET /admin/usuarios`;
- asumir que todo usuario autenticado es admin;
- duplicar validación de rol en muchas páginas en vez de usar guards;
- implementar alojamientos, funcionalidades futuras o rutas fuera de este sprint;
- crear endpoints admin inexistentes;
- mezclar permisos frontend con permisos definitivos del backend.

## 9. Cierre con Git y GitHub
Cuando termines el flujo de roles y guards, registra el cambio en Git con comandos como estos:

```bash
git status
git add .
git commit -m "feat: implementar roles y guards"
```

Si el repositorio ya tiene remoto configurado, puedes hacer `git push` según la configuración de tu proyecto.

## 10. Resultado final del sprint
Al terminar este sprint tendrás:

- guards funcionando;
- rutas privadas protegidas;
- rutas admin protegidas;
- navbar condicional por rol;
- listado de usuarios admin;
- manejo correcto de `401` y `403`;
- la base lista para continuar con el siguiente sprint.






