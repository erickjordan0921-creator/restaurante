# Tutorial — Sprint 2: Usuarios y autenticación

## 1. Objetivo
Continuar desde el proyecto que quedó al finalizar el Tutorial 1 y agregar la capa de usuarios y autenticación sobre la base existente de Vite, Bootstrap y la pantalla inicial.

En este sprint vas a trabajar con estos endpoints reales del backend:

- `POST /usuarios/registro`
- `POST /usuarios/login`
- `GET /usuarios/perfil`
- `PATCH /usuarios/perfil`

Este tutorial todavía no crea archivos de router ni guards. La navegación seguirá siendo simple dentro de `src/js/main.js`, y más adelante se separará en otro sprint.

## 2. Qué vas a construir
Al finalizar este tutorial tendrás:

- carpetas JavaScript separadas por responsabilidad;
- un helper para `localStorage`;
- un helper para traducir errores del backend;
- un servicio de sesión centralizado;
- un cliente HTTP único para la API;
- funciones para registro, login, perfil y actualización de perfil;
- una navbar que cambia según la sesión;
- pantallas de Registro, Login y Perfil;
- una navegación simple dentro de `main.js`;
- validación manual en navegador con backend corriendo;
- build y preview del frontend;
- cierre básico con Git.

No se agregan admin, alojamientos ni comodidades en este sprint.

## 3. Qué vas a aprender
En este sprint vas a aprender:

- cómo separar responsabilidades en una SPA vanilla;
- cómo enviar formularios con JavaScript;
- cómo centralizar `fetch` en un cliente HTTP;
- cómo guardar y leer token y usuario desde `localStorage`;
- cómo actualizar la interfaz según la sesión;
- cómo proteger una vista de forma básica;
- cómo traducir errores comunes del backend a mensajes legibles;
- cómo validar manualmente registro, login y perfil desde el navegador.

## 4. Prerrequisitos
Antes de empezar, asegúrate de tener:

- el Tutorial 1 terminado;
- el proyecto levantado con la base de Vite, Bootstrap y Bootstrap Icons;
- `.env` listo con `VITE_API_URL=http://localhost:5000/api/v1`;
- el backend corriendo en `http://localhost:5000/api/v1`;
- `.env` del backend listo con CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
- revisar en el backend que este tomando el valor real de env:
  ```py
    from dotenv import load_dotenv, find_dotenv  # Busca el archivo .env y cargar las variables
    env_path = find_dotenv(usecwd=True)  # Busca el archivo .env desde la carpeta donde se ejecuta el proyecto.
    load_dotenv(env_path, override=True)  # Carga las variables que están dentro del archivo .env.
  ```
- conocimientos básicos de formularios, eventos y Fetch API;
- Git Bash como terminal de trabajo.

## 5. Estructura esperada al finalizar
La estructura esperada al final del tutorial es esta:

```text
frontend-alojamientos/
├── .env.example
├── index.html
├── package-lock.json
├── package.json
├── vite.config.js
└── src/
    ├── css/
    │   └── main.css
    └── js/
        ├── api/
        │   ├── auth.api.js
        │   └── http.js
        ├── auth/
        │   └── session.service.js
        ├── components/
        │   └── layout/
        │       └── Navbar.js
        ├── pages/
        │   ├── LoginPage.js
        │   ├── PerfilPage.js
        │   └── RegistroPage.js
        ├── utils/
        │   ├── errorMessages.js
        │   └── storage.js
        └── main.js
```

La base del Tutorial 1 sigue intacta y encima de ella se agregan estos módulos para usuarios y autenticación.

## 6. Paso a paso completo

### Paso 1: crear las carpetas necesarias
Desde la raíz del proyecto, crea las carpetas que separarán responsabilidades.

```bash
mkdir -p src/js/api src/js/auth src/js/components/layout src/js/pages src/js/utils
```

Esto deja listas las carpetas para API, sesión, navbar, pantallas y utilidades compartidas.

### Paso 2: crear o verificar `.env`
Antes de consumir el backend, asegúrate de tener el archivo `.env` con la URL base local.

```bash
cp .env.example .env
```

Si `.env` ya existe, no hace falta copiarlo de nuevo. Solo verifica que contenga:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Recuerda que `.env` no debe subirse al repositorio. El archivo que sí debe quedar versionado es `.env.example`.

### Paso 3: crear `src/js/utils/storage.js`
Este archivo centraliza el acceso a `localStorage` para no repetir la misma lógica en cada módulo.

```js
export function saveItem(key, value) {
  if (value === undefined) {
    removeItem(key);
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem(key) {
  const storedValue = localStorage.getItem(key);

  if (storedValue === null) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    return storedValue;
  }
}

export function removeItem(key) {
  localStorage.removeItem(key);
}
```

### Paso 4: crear `src/js/utils/errorMessages.js`
Este archivo traduce mensajes comunes del backend para que la UI muestre errores claros y no texto crudo.

```js
const EXACT_TRANSLATIONS = new Map([
  ['Shorter than minimum length 6.', 'Debe tener al menos 6 caracteres.'],
  ['Missing data for required field.', 'Este campo es obligatorio.'],
  ['Not a valid email address.', 'Ingresa un correo electrónico válido.'],
  ['Field may not be null.', 'Este campo no puede estar vacío.'],
  ['Not a valid integer.', 'Debe ser un número entero válido.'],
  ['Not a valid number.', 'Debe ser un número válido.'],
  ['Unknown field.', 'Este campo no es válido.'],
  ['Invalid input type.', 'El tipo de dato no es válido.'],
  ['Unauthorized', 'No autorizado.'],
  ['Unauthorized.', 'No autorizado.'],
  ['Not found', 'No encontrado.'],
  ['Not found.', 'No encontrado.'],
  ['Forbidden', 'No tienes permisos para realizar esta acción.'],
  ['Forbidden.', 'No tienes permisos para realizar esta acción.'],
  ['Invalid credentials', 'Credenciales inválidas.'],
  ['Invalid credentials.', 'Credenciales inválidas.'],
  ['Something went wrong', 'Ocurrió un error.'],
  ['Something went wrong.', 'Ocurrió un error.'],
  ['Failed to fetch', 'No fue posible conectar con el servidor.'],
  ['NetworkError when attempting to fetch resource.', 'No fue posible conectar con el servidor.'],
  ['Load failed', 'No fue posible conectar con el servidor.'],
]);

const PREFIX_TRANSLATIONS = [
  ['Length must be between', 'La longitud debe estar dentro del rango permitido.'],
  ['Shorter than minimum length', 'No cumple la longitud mínima requerida.'],
  ['Longer than maximum length', 'Supera la longitud máxima permitida.'],
];

const ENGLISH_HINTS = [
  'invalid',
  'missing',
  'required',
  'field',
  'length',
  'value',
  'email',
  'credentials',
  'password',
  'unauthorized',
  'forbidden',
  'not found',
  'failed',
  'error',
  'session',
  'token',
];

export function translateApiMessage(message, fallbackMessage = 'Revisa los datos enviados.') {
  if (typeof message !== 'string') {
    return fallbackMessage;
  }

  const normalized = message.trim();
  if (!normalized) {
    return fallbackMessage;
  }

  const exactTranslation = EXACT_TRANSLATIONS.get(normalized);
  if (exactTranslation) {
    return exactTranslation;
  }

  for (const [prefix, translation] of PREFIX_TRANSLATIONS) {
    if (normalized.startsWith(prefix)) {
      return translation;
    }
  }

  const lowerMessage = normalized.toLowerCase();
  if (ENGLISH_HINTS.some((hint) => lowerMessage.includes(hint))) {
    return fallbackMessage;
  }

  return normalized;
}

function translateValue(value, fallbackMessage) {
  if (typeof value === 'string') {
    return translateApiMessage(value, fallbackMessage);
  }

  if (Array.isArray(value)) {
    return value.map((item) => translateValue(item, fallbackMessage));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, translateValue(item, fallbackMessage)]),
    );
  }

  return value;
}

export function formatApiError(error, fallbackMessage = 'Revisa los datos enviados.') {
  return {
    status: error?.status ?? 0,
    message: translateApiMessage(error?.message, fallbackMessage),
    details: translateValue(error?.details, fallbackMessage),
    data: error?.data ?? null,
  };
}
```

### Paso 5: crear `src/js/auth/session.service.js`
Este servicio guarda, lee y limpia la sesión local sin repetir lógica en cada pantalla.

```js
import { getItem, removeItem, saveItem } from '../utils/storage.js';

const TOKEN_KEY = 'frontend_alojamientos_access_token';
const USER_KEY = 'frontend_alojamientos_user';

export function saveToken(token) {
  saveItem(TOKEN_KEY, token);
}

export function getToken() {
  return getItem(TOKEN_KEY);
}

export function saveUser(user) {
  saveItem(USER_KEY, user);
}

export function getUser() {
  return getItem(USER_KEY);
}

export function saveSession(token, user) {
  saveToken(token);
  saveUser(user);
}

export function clearSession() {
  removeItem(TOKEN_KEY);
  removeItem(USER_KEY);
}

export function hasSession() {
  return Boolean(getToken());
}
```

### Paso 6: crear `src/js/api/http.js`
Este cliente HTTP centraliza las peticiones al backend. Aquí se usa `VITE_API_URL` sin inventar un valor alternativo.

```js
import { clearSession, getToken } from '../auth/session.service.js';
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
        message:
          cause instanceof Error ? cause.message : 'No fue posible conectar con el servidor.',
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

  if (response.status === 401) {
    clearSession();
  }

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

### Paso 7: crear `src/js/api/auth.api.js`
Aquí defines las funciones concretas para registro, login y perfil usando únicamente los endpoints reales de usuarios.

```js
import { request } from './http.js';

export function register(payload) {
  return request('/usuarios/registro', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return request('/usuarios/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getProfile() {
  return request('/usuarios/perfil');
}

export function updateProfile(payload) {
  return request('/usuarios/perfil', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
```

### Paso 8: crear `src/js/components/layout/Navbar.js`
La navbar cambia según exista sesión o no. Para este sprint solo debe mostrar lo que corresponde a usuarios y autenticación.

```js
import { getUser, hasSession } from '../../auth/session.service.js';

function isActive(view, currentView) {
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
  const user = getUser();
  const loggedIn = hasSession();

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

### Paso 9: crear `src/js/pages/RegistroPage.js`
Esta pantalla crea usuarios nuevos y, cuando el registro es correcto, lleva a Login.

```js
import { register } from '../api/auth.api.js';
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

export function RegistroPage() {
  return `
    <section class="container py-5" style="max-width: 520px;">
      <h1 class="mb-4">Crear cuenta</h1>
      <form id="registroForm" class="card card-body shadow-sm">
        <div class="mb-3">
          <label class="form-label" for="correo">Correo</label>
          <input class="form-control" type="email" id="correo" name="correo" required />
        </div>
        <div class="mb-3">
          <label class="form-label" for="contrasena">Contraseña</label>
          <input class="form-control" type="password" id="contrasena" name="contrasena" required />
        </div>
        <button class="btn btn-primary" type="submit">Registrarme</button>
        <p class="mt-3 mb-0 text-muted" id="registroMensaje"></p>
        <p class="mt-3 mb-0">
          <a href="#" data-view="login">Ya tengo una cuenta</a>
        </p>
      </form>
    </section>
  `;
}

export function mountRegistroPage({ navigate } = {}) {
  const form = document.querySelector('#registroForm');
  const message = document.querySelector('#registroMensaje');
  let redirectTimer = null;

  if (!form || !message) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (redirectTimer) {
      clearTimeout(redirectTimer);
      redirectTimer = null;
    }

    const correo = document.querySelector('#correo').value.trim();
    const contrasena = document.querySelector('#contrasena').value.trim();

    try {
      setMessage(message, 'Registrando usuario...', 'muted');
      await register({ correo, contrasena });
      setMessage(message, 'Usuario registrado correctamente. Ahora inicia sesión.', 'success');
      form.reset();
      redirectTimer = window.setTimeout(() => {
        navigate?.('login');
      }, 1200);
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible registrar el usuario.');
      const detailsMessage = getDetailsMessage(apiError.details);
      setMessage(message, detailsMessage || apiError.message, 'danger');
    }
  });
}
```

### Paso 10: crear `src/js/pages/LoginPage.js`
Esta pantalla inicia sesión, guarda token y usuario, y luego vuelve al inicio.

```js
import { login } from '../api/auth.api.js';
import { saveSession } from '../auth/session.service.js';
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

export function LoginPage() {
  return `
    <section class="container py-5" style="max-width: 520px;">
      <h1 class="mb-4">Iniciar sesión</h1>
      <form id="loginForm" class="card card-body shadow-sm">
        <div class="mb-3">
          <label class="form-label" for="correo">Correo</label>
          <input class="form-control" type="email" id="correo" name="correo" required />
        </div>
        <div class="mb-3">
          <label class="form-label" for="contrasena">Contraseña</label>
          <input class="form-control" type="password" id="contrasena" name="contrasena" required />
        </div>
        <button class="btn btn-dark" type="submit">Entrar</button>
        <p class="mt-3 mb-0 text-muted" id="loginMensaje"></p>
        <p class="mt-3 mb-0">
          <a href="#" data-view="registro">Crear una cuenta</a>
        </p>
      </form>
    </section>
  `;
}

export function mountLoginPage({ navigate } = {}) {
  const form = document.querySelector('#loginForm');
  const message = document.querySelector('#loginMensaje');

  if (!form || !message) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const correo = document.querySelector('#correo').value.trim();
    const contrasena = document.querySelector('#contrasena').value.trim();

    try {
      setMessage(message, 'Validando credenciales...', 'muted');
      const response = await login({ correo, contrasena });

      saveSession(response.data.access_token, response.data.usuario);
      setMessage(message, 'Inicio de sesión exitoso.', 'success');
      navigate?.('home');
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible iniciar sesión.');
      const detailsMessage = getDetailsMessage(apiError.details);

      if (apiError.status === 401) {
        setMessage(message, apiError.message || 'Credenciales inválidas.', 'danger');
        return;
      }

      if (apiError.status === 400) {
        setMessage(message, detailsMessage || 'Revisa los campos enviados.', 'danger');
        return;
      }

      setMessage(message, detailsMessage || apiError.message, 'danger');
    }
  });
}
```

### Paso 11: crear `src/js/pages/PerfilPage.js`
Esta pantalla consulta el perfil autenticado y permite actualizar nombre, apellido y teléfono.

```js
import { getProfile, updateProfile } from '../api/auth.api.js';
import { getUser } from '../auth/session.service.js';
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

export function PerfilPage() {
  const user = getUser();

  return `
    <section class="container py-5" style="max-width: 720px;">
      <h1 class="mb-4">Perfil</h1>
      <div class="alert alert-info">
        <strong>Correo:</strong> ${user?.correo ?? 'No disponible'}
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

### Paso 12: integrar la navegación simple en `src/js/main.js`
En este sprint todavía no se crean archivos de router ni guards. La navegación vive dentro de `main.js` para mantener el flujo simple y fácil de seguir.

```js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/main.css';

import { clearSession, getUser, hasSession } from './auth/session.service.js';
import { Navbar } from './components/layout/Navbar.js';
import { LoginPage, mountLoginPage } from './pages/LoginPage.js';
import { PerfilPage, mountPerfilPage } from './pages/PerfilPage.js';
import { RegistroPage, mountRegistroPage } from './pages/RegistroPage.js';

const app = document.querySelector('#app');
let currentView = 'home';

function renderNotFoundPage() {
  return `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5 text-center">
              <h1 class="h3 mb-3">Página no encontrada</h1>
              <p class="text-muted mb-4">
                La vista solicitada no está disponible en esta SPA.
              </p>
              <a class="btn btn-primary" href="#" data-view="home">Ir al inicio</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderHomePage() {
  const user = getUser();

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
              hasSession()
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
        </div>
      </div>
    </section>
  `;
}

function normalizeView(view) {
  const normalized = String(view ?? 'home')
    .trim()
    .replace(/^#/, '')
    .replace(/^\/+|\/+$/g, '');

  return normalized || 'home';
}

const views = {
  home: {
    page: renderHomePage,
  },
  login: {
    page: LoginPage,
    mount: mountLoginPage,
  },
  registro: {
    page: RegistroPage,
    mount: mountRegistroPage,
  },
  perfil: {
    requiresAuth: true,
    page: PerfilPage,
    mount: mountPerfilPage,
  },
};

function render(view = currentView) {
  const normalizedView = normalizeView(view);
  const selectedView = views[normalizedView];

  if (!selectedView) {
    currentView = 'not-found';
    app.innerHTML = `
      ${Navbar(currentView)}
      <main id="page-root">${renderNotFoundPage()}</main>
    `;
    return;
  }

  if (selectedView.requiresAuth && !hasSession()) {
    navigate('login');
    return;
  }

  currentView = normalizedView;

  const pageHtml = selectedView.page() ?? '';

  app.innerHTML = `
    ${Navbar(currentView)}
    <main id="page-root">${pageHtml}</main>
  `;

  selectedView.mount?.({ navigate, render, view: currentView });
}

function navigate(view = 'home') {
  render(normalizeView(view));
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

### Paso 13: probar la aplicación en el navegador
El backend debe estar corriendo antes de probar este sprint.

Ejecuta el frontend en modo desarrollo:

```bash
npm run dev
```

Abre la URL que muestra Vite en la terminal, normalmente `http://localhost:5173/`, y prueba manualmente este flujo:

- abrir Registro;
- registrar un usuario válido;
- confirmar que después del registro se pueda ir a Login;
- iniciar sesión;
- confirmar que aparece el correo del usuario en la navbar;
- entrar a Perfil;
- cargar los datos del usuario;
- actualizar nombre, apellido o teléfono;
- cerrar sesión;
- confirmar que vuelve la navbar de visitante;
- intentar entrar a Perfil sin sesión;
- probar credenciales inválidas y verificar que se muestre el error.

Luego genera el build de producción:

```bash
npm run build
```

Ese comando debe generar `dist/`.

Después revisa el build compilado:

> Nota sobre CORS:
> Para validar `npm run preview`, el backend debe permitir el origen que muestra Vite para preview, normalmente `http://localhost:4173/`.
> Si el backend solo permite `http://localhost:5173/`, el frontend puede compilar bien, pero las peticiones al backend desde preview pueden ser bloqueadas por CORS.

```bash
npm run preview
```

Abre la URL que muestra Vite en la terminal, normalmente `http://localhost:4173/`, y valida que registro, login y perfil sigan cargando correctamente.

## 7. Cómo probar que funciona
Usa esta lista de verificación:

- el proyecto parte del Tutorial 1 sin volver a crearse;
- `src/js/api/http.js` usa `VITE_API_URL`;
- `src/js/auth/session.service.js` centraliza token y usuario;
- la navbar cambia entre visitante y usuario autenticado;
- el registro guarda datos y lleva a Login;
- el login guarda la sesión y vuelve a Inicio;
- el perfil carga datos reales y permite actualizar;
- la sesión se limpia al cerrar sesión;
- `npm run build` genera `dist/`;
- `npm run preview` sirve el build compilado.

En este sprint no hay pruebas automatizadas. La validación se hace manualmente con el backend corriendo, revisando registro, login, perfil, actualización y logout desde el navegador.

## 8. Errores comunes
Los errores más frecuentes en este sprint son:

- usar `contrasena` con ñ en lugar de `contrasena`;
- olvidar definir `VITE_API_URL` en `.env`;
- llamar `fetch` directo desde cada pantalla en vez de usar `http.js`;
- no guardar token y usuario en `session.service.js`;
- olvidar que `GET /usuarios/perfil` requiere sesión;
- no mostrar mensajes claros cuando el backend devuelve `400` o `401`;
- validar `npm run preview` sin permitir `http://localhost:4173/` en CORS del backend;
- intentar crear archivos de router formal en este sprint;
- mezclar admin, alojamientos o comodidades antes de tiempo.

## 9. Guardar los cambios en Git
Antes de crear el commit, revisa `git status` para confirmar qué archivos se van a guardar.

```bash
git status
git add .
git commit -m "Sprint 2: usuarios y autenticacion"
git push
```

No subas `.env`. Solo debe quedar versionado `.env.example`.

## 10. Resultado esperado
Al terminar este Sprint 2 tendrás:

- registro funcionando;
- login funcionando;
- perfil protegido de forma básica;
- navbar condicional según la sesión;
- sesión local centralizada;
- mensajes de error más claros;
- una navegación simple dentro de `main.js`;
- una base lista para que el siguiente sprint separe la lógica de navegación y empiece a crecer sobre esta autenticación.
