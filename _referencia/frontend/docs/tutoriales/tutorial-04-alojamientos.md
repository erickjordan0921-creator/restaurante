# Tutorial — Sprint 4: Alojamientos

## 1. Objetivo
Llevar el recurso principal del proyecto al frontend de la SPA vanilla:

- listar alojamientos públicamente;
- ver detalle de alojamiento;
- crear alojamiento autenticado;
- editar alojamiento propio o como admin;
- eliminar alojamiento propio o como admin;
- manejar permisos visuales sin reemplazar la validación real del backend.

Este tutorial parte exactamente del estado que quedó al terminar el Tutorial 3 en `frontend_alojamiento_clase`. En ese punto:

- `src/js/main.js` todavía tiene `renderHome()` interno y trata `home` como un caso especial;
- `src/js/router/routes.js` todavía solo resuelve rutas exactas y aliases simples;
- `src/js/auth/permissions.js` todavía no tiene `canManageAlojamiento()`;
- `src/js/components/layout/Navbar.js` todavía solo conoce `home`, `login`, `registro`, `perfil` y `admin`;
- todavía no existen los archivos del módulo de alojamientos.

En este sprint no se implementa comodidades como funcionalidad principal. Si el backend ya trae `comodidades` dentro del detalle de un alojamiento, se pueden mostrar solo como información asociada, sin selector, catálogo, CRUD ni integración adicional.

## 2. Qué vas a construir
Al finalizar este tutorial tendrás:

- un servicio API de alojamientos;
- una página de listado de alojamientos;
- un componente de card de alojamiento;
- una página de detalle de alojamiento;
- un formulario reutilizable de alojamiento;
- una página de creación;
- una página de edición;
- una acción de eliminación con confirmación;
- un helper de permisos para saber si puede editar o eliminar visualmente;
- rutas dinámicas funcionando;
- `home` resuelto desde el router;
- manejo de estados `loading`, `error` y `empty`.

## 3. Qué vas a aprender
En este sprint vas a aprender:

- cómo consumir endpoints públicos y protegidos sin usar `fetch` directo en páginas o componentes;
- cómo centralizar el acceso a la API con `request()`;
- cómo resolver rutas dinámicas con parámetros como `:id`;
- cómo reutilizar un formulario para crear y editar;
- cómo manejar `POST`, `PATCH` y `DELETE`;
- cómo manejar `204 No Content`;
- cómo mostrar u ocultar botones según `usuario_id` y rol;
- cómo dejar claro que ocultar botones solo mejora la interfaz, pero no reemplaza la seguridad del backend;
- cómo diferenciar lista vacía de error;
- cómo tratar `400`, `401`, `403` y `404` de forma clara.

## 4. Prerrequisitos
Antes de empezar, asegúrate de tener:

- el Tutorial 1 terminado;
- el Tutorial 2 terminado;
- el Tutorial 3 terminado;
- el cliente HTTP centralizado funcionando;
- la sesión y el token funcionando;
- los guards funcionando;
- el backend corriendo en `http://localhost:5000/api/v1`;
- el contrato backend-frontend revisado;
- un usuario normal autenticado si quieres probar creación y edición;
- un usuario admin si quieres probar permisos ampliados.

## 5. Estructura esperada al finalizar
La estructura esperada al finalizar este sprint puede verse así:

```text
frontend-alojamientos/
└── src/
    └── js/
        ├── api/
        │   └── alojamientos.api.js
        ├── components/
        │   └── alojamientos/
        │       ├── AlojamientoCard.js
        │       └── AlojamientoForm.js
        ├── pages/
        │   ├── AlojamientosPage.js
        │   ├── AlojamientoDetallePage.js
        │   ├── CrearAlojamientoPage.js
        │   └── EditarAlojamientoPage.js
        ├── utils/
        │   └── formatters.js
        ├── auth/
        │   └── permissions.js
        ├── router/
        │   ├── routes.js
        │   └── guards.js
        └── main.js
```

En este sprint se reutilizan `http.js`, `session.service.js`, `errorMessages.js`, `guards.js` y `Navbar.js` creados en los sprints anteriores.

Antes de crear los archivos del módulo, asegúrate de crear estas carpetas si todavía no existen:

- `src/js/api/`
- `src/js/components/alojamientos/`
- `src/js/pages/`
- `src/js/utils/`

Las carpetas `src/js/auth/` y `src/js/router/` ya deberían existir desde el Tutorial 3.

Nota sobre el contrato de respuesta: los ejemplos de este tutorial usan `response?.data` porque asumen el contrato real del proyecto, donde el backend entrega el recurso principal dentro de la propiedad `data`.

## 6. Paso a paso completo

### Paso 1: revisar los endpoints reales de alojamientos
El contrato aprobado expone estos endpoints:

- `GET /alojamientos`
- `GET /alojamientos/:id`
- `POST /alojamientos`
- `PATCH /alojamientos/:id`
- `DELETE /alojamientos/:id`

Permisos:

- `GET` públicos;
- `POST` requiere token;
- `PATCH` y `DELETE` requieren propietario o admin.

La tarjeta pública solo necesita un enlace al detalle. Las acciones de editar y eliminar se reservan para la vista de detalle cuando el usuario puede gestionar el alojamiento.

### Paso 2: crear `src/js/api/alojamientos.api.js`
Este archivo centraliza el consumo del dominio de alojamientos.

```js
import { request } from './http.js';

export function getAlojamientos() {
  return request('/alojamientos');
}

export function getAlojamientoById(id) {
  return request(`/alojamientos/${id}`);
}

export function createAlojamiento(payload) {
  return request('/alojamientos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAlojamiento(id, payload) {
  return request(`/alojamientos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAlojamiento(id) {
  return request(`/alojamientos/${id}`, {
    method: 'DELETE',
  });
}
```

Recuerda que `deleteAlojamiento()` puede devolver `null` porque el backend responde con `204 No Content`, y `request()` ya contempla ese caso. En la vista de detalle, no necesitas depender de ese valor: basta con esperar a que la operación termine correctamente y luego navegar al listado.

### Paso 3: crear `src/js/utils/formatters.js`
Este archivo ayuda a formatear valores que se repiten en tarjetas, formularios y detalles.

```js
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return character;
    }
  });
}

export function formatCurrency(value) {
  const numericValue = Number(value ?? 0);
  const amount = Number.isFinite(numericValue) ? numericValue : 0;

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function truncateText(text, maxLength = 120) {
  const content = String(text ?? '').trim();

  if (!content) {
    return '';
  }

  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength).trimEnd()}...`;
}
```

`escapeHtml()` es obligatorio porque vas a renderizar datos ingresados por usuarios, como título, ciudad y descripción. Úsalo tanto en texto visible como en valores precargados del formulario.

### Paso 4: actualizar `src/js/auth/permissions.js`
Este archivo conserva las funciones que ya tenías y agrega la validación visual para alojamientos.

Reemplaza todo el contenido del archivo por el siguiente código:

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

export function canManageAlojamiento(alojamiento) {
  const currentUser = getCurrentUser();

  if (!currentUser || !alojamiento) {
    return false;
  }

  if (currentUser.rol === 'admin') {
    return true;
  }

  return Number(alojamiento.usuario_id) === Number(currentUser.id);
}
```

La comparación obligatoria debe hacerse con `Number()`:

```js
Number(alojamiento.usuario_id) === Number(currentUser.id)
```

### Paso 5: crear `src/js/components/alojamientos/AlojamientoCard.js`
La card debe mostrar:

- título;
- ciudad;
- precio por noche;
- descripción resumida;
- enlace o botón para ver detalle.

```js
import { escapeHtml, formatCurrency, truncateText } from '../../utils/formatters.js';

export function AlojamientoCard(alojamiento) {
  return `
    <article class="card h-100 shadow-sm border-0">
      <div class="card-body d-flex flex-column">
        <h2 class="h5 card-title mb-2">${escapeHtml(alojamiento.titulo)}</h2>
        <p class="text-muted mb-1">
          <i class="bi bi-geo-alt me-1"></i>${escapeHtml(alojamiento.ciudad)}
        </p>
        <p class="fw-semibold mb-3">${formatCurrency(alojamiento.precio_noche)} / noche</p>
        <p class="card-text flex-grow-1">
          ${escapeHtml(truncateText(alojamiento.descripcion, 110))}
        </p>
        <div class="d-flex flex-wrap gap-2 mt-2">
          <a class="btn btn-outline-primary btn-sm" href="#" data-view="alojamientos/${alojamiento.id}">
            Ver detalle
          </a>
        </div>
      </div>
    </article>
  `;
}
```

### Paso 6: crear `src/js/components/alojamientos/AlojamientoForm.js`
El formulario debe servir tanto para crear como para editar.

Campos del formulario:

- `titulo`
- `descripcion`
- `precio_noche`
- `ciudad`

No agregues imágenes, disponibilidad, coordenadas, reservas, favoritos ni reseñas.

```js
import { escapeHtml } from '../../utils/formatters.js';

export function AlojamientoForm({ values = {}, submitLabel = 'Guardar' } = {}) {
  return `
    <form id="alojamientoForm" class="card card-body shadow-sm border-0">
      <div class="mb-3">
        <label class="form-label" for="titulo">Título</label>
        <input
          class="form-control"
          type="text"
          id="titulo"
          name="titulo"
          value="${escapeHtml(values.titulo ?? '')}"
          required
        />
      </div>
      <div class="mb-3">
        <label class="form-label" for="descripcion">Descripción</label>
        <textarea
          class="form-control"
          id="descripcion"
          name="descripcion"
          rows="5"
          required
        >${escapeHtml(values.descripcion ?? '')}</textarea>
      </div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label" for="precio_noche">Precio por noche</label>
          <input
            class="form-control"
            type="number"
            id="precio_noche"
            name="precio_noche"
            min="0"
            step="0.01"
            value="${escapeHtml(values.precio_noche ?? '')}"
            required
          />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="ciudad">Ciudad</label>
          <input
            class="form-control"
            type="text"
            id="ciudad"
            name="ciudad"
            value="${escapeHtml(values.ciudad ?? '')}"
            required
          />
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-center mt-4">
        <button class="btn btn-primary" type="submit">${submitLabel}</button>
      </div>

      <p class="mt-3 mb-0 text-muted" id="alojamientoMensaje"></p>
    </form>
  `;
}
```

### Paso 7: crear `src/js/pages/AlojamientosPage.js`
La página de listado debe:

- mostrar `loading`;
- llamar `GET /alojamientos`;
- renderizar cards;
- mostrar `empty state` si `data` es un arreglo vacío;
- mostrar error si falla la petición.

Si el usuario está autenticado, puedes mostrar un botón `Nuevo alojamiento` en la cabecera para acceder a la ruta protegida `alojamientos/nuevo`. Eso no cambia el comportamiento público del listado.

```js
import { getAlojamientos } from '../api/alojamientos.api.js';
import { isAuthenticated } from '../auth/permissions.js';
import { clearSession } from '../auth/session.service.js';
import { AlojamientoCard } from '../components/alojamientos/AlojamientoCard.js';
import { escapeHtml } from '../utils/formatters.js';
import { formatApiError } from '../utils/errorMessages.js';

function renderState(type, message) {
  return `
    <div class="alert alert-${type} mb-0" role="alert">
      ${escapeHtml(message)}
    </div>
  `;
}

function renderHeader() {
  return `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="h3 mb-2">Alojamientos</h1>
        <p class="text-muted mb-0">
          Explora el catálogo público de alojamientos disponibles en la plataforma.
        </p>
      </div>
      ${
        isAuthenticated()
          ? `
            <a class="btn btn-primary" href="#" data-view="alojamientos/nuevo">
              <i class="bi bi-plus-circle me-1"></i>Nuevo alojamiento
            </a>
          `
          : ''
      }
    </div>
  `;
}

export function AlojamientosPage() {
  return `
    <section class="container py-5">
      ${renderHeader()}
      <div id="alojamientosState" class="text-muted">Cargando alojamientos...</div>
    </section>
  `;
}

export async function mountAlojamientosPage({ navigate } = {}) {
  const state = document.querySelector('#alojamientosState');

  if (!state) {
    return;
  }

  const renderLoading = () => {
    state.innerHTML = renderState('secondary', 'Cargando alojamientos...');
  };

  const renderEmpty = () => {
    state.innerHTML = renderState('info', 'No hay alojamientos para mostrar.');
  };

  const renderError = (message) => {
    state.innerHTML = renderState('danger', message || 'No fue posible cargar los alojamientos.');
  };

  async function cargarAlojamientos() {
    try {
      renderLoading();
      const response = await getAlojamientos();
      const alojamientos = Array.isArray(response?.data) ? response.data : [];

      if (!alojamientos.length) {
        renderEmpty();
        return;
      }

      state.innerHTML = `
        <div class="row g-4">
          ${alojamientos
            .map(
              (alojamiento) => `
                <div class="col-12 col-md-6 col-xl-4">
                  ${AlojamientoCard(alojamiento)}
                </div>
              `,
            )
            .join('')}
        </div>
      `;
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible cargar los alojamientos.');

      if (apiError.status === 401) {
        clearSession();
        navigate?.('home');
        return;
      }

      renderError(apiError.message);
    }
  }

  await cargarAlojamientos();
}
```

### Paso 8: crear `src/js/pages/AlojamientoDetallePage.js`
La página de detalle debe:

- recibir el id desde `params`;
- cargar el alojamiento con `getAlojamientoById(id)`;
- mostrar detalle completo;
- mostrar botones Editar y Eliminar solo si `canManageAlojamiento(alojamiento)` devuelve `true`;
- integrar la eliminación dentro del mismo archivo.

Si el backend devuelve `comodidades` dentro del detalle, puedes mostrarlas solo como información asociada al alojamiento, sin crear selector ni CRUD.

```js
import { getAlojamientoById, deleteAlojamiento } from '../api/alojamientos.api.js';
import { canManageAlojamiento } from '../auth/permissions.js';
import { clearSession } from '../auth/session.service.js';
import { escapeHtml, formatCurrency } from '../utils/formatters.js';
import { formatApiError } from '../utils/errorMessages.js';

function renderState(type, message) {
  return `
    <div class="alert alert-${type} mb-0" role="alert">
      ${escapeHtml(message)}
    </div>
  `;
}

function formatDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('es-CO');
}

export function AlojamientoDetallePage() {
  return `
    <section class="container py-5">
      <div id="detalleAlojamientoState" class="text-muted">Cargando detalle...</div>
    </section>
  `;
}

export async function mountAlojamientoDetallePage({ params = {}, navigate } = {}) {
  const state = document.querySelector('#detalleAlojamientoState');
  const alojamientoId = params.id;

  if (!state || !alojamientoId) {
    return;
  }

  async function cargarDetalle() {
    try {
      state.innerHTML = renderState('secondary', 'Cargando detalle...');
      const response = await getAlojamientoById(alojamientoId);
      const alojamiento = response?.data;

      if (!alojamiento) {
        state.innerHTML = renderState('warning', 'El alojamiento solicitado no existe.');
        return;
      }

      const canManage = canManageAlojamiento(alojamiento);
      const comodidades = Array.isArray(alojamiento.comodidades) ? alojamiento.comodidades : [];
      const fechaCreacion = formatDate(alojamiento.fecha_creacion);

      state.innerHTML = `
        <article class="card border-0 shadow-sm">
          <div class="card-body p-4 p-md-5">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
              <div>
                <p class="text-muted mb-1">
                  <i class="bi bi-geo-alt me-1"></i>${escapeHtml(alojamiento.ciudad)}
                </p>
                <h1 class="h3 mb-2">${escapeHtml(alojamiento.titulo)}</h1>
                <p class="fw-semibold mb-0">${formatCurrency(alojamiento.precio_noche)} / noche</p>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <a class="btn btn-outline-secondary" href="#" data-view="alojamientos">Volver</a>
                ${
                  canManage
                    ? `
                      <a class="btn btn-outline-primary" href="#" data-view="alojamientos/${alojamiento.id}/editar">
                        Editar
                      </a>
                      <button
                        class="btn btn-outline-danger"
                        type="button"
                        data-action="delete-alojamiento"
                        data-id="${alojamiento.id}"
                      >
                        Eliminar
                      </button>
                    `
                    : ''
                }
              </div>
            </div>

            <hr class="my-4" />

            <div class="mb-4">
              <h2 class="h5 mb-3">Descripción</h2>
              <p class="mb-0" style="white-space: pre-line;">${escapeHtml(alojamiento.descripcion)}</p>
            </div>

            ${
              fechaCreacion
                ? `
                  <p class="text-muted mb-4">
                    <i class="bi bi-calendar-event me-1"></i>Creado el ${escapeHtml(fechaCreacion)}
                  </p>
                `
                : ''
            }

            ${
              comodidades.length
                ? `
                  <div class="mb-0">
                    <h2 class="h5 mb-3">Comodidades</h2>
                    <div class="d-flex flex-wrap gap-2">
                      ${comodidades
                        .map(
                          (comodidad) => `
                            <span class="badge text-bg-secondary">
                              ${escapeHtml(comodidad?.nombre ?? '')}
                            </span>
                          `,
                        )
                        .join('')}
                    </div>
                  </div>
                `
                : ''
            }
          </div>
        </article>
      `;
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible cargar el detalle.');

      if (apiError.status === 401) {
        clearSession();
        navigate?.(`alojamientos/${alojamientoId}`);
        return;
      }

      if (apiError.status === 403) {
        state.innerHTML = renderState('danger', 'No tienes permisos para ver este alojamiento.');
        return;
      }

      if (apiError.status === 404) {
        state.innerHTML = renderState('warning', 'El alojamiento solicitado no existe.');
        return;
      }

      state.innerHTML = renderState('danger', apiError.message);
    }
  }

  async function handleDelete() {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este alojamiento?');
    if (!confirmar) {
      return;
    }

    try {
      await deleteAlojamiento(alojamientoId);
      navigate?.('alojamientos');
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible eliminar el alojamiento.');

      if (apiError.status === 401) {
        clearSession();
        navigate?.(`alojamientos/${alojamientoId}`);
        return;
      }

      if (apiError.status === 403) {
        state.innerHTML = renderState('danger', 'No tienes permisos para eliminar este alojamiento.');
        return;
      }

      if (apiError.status === 404) {
        state.innerHTML = renderState('warning', 'El alojamiento solicitado no existe.');
        return;
      }

      state.innerHTML = renderState('danger', apiError.message);
    }
  }

  state.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-action="delete-alojamiento"]');
    if (!deleteButton) {
      return;
    }

    handleDelete();
  });

  await cargarDetalle();
}
```

### Paso 9: crear `src/js/pages/CrearAlojamientoPage.js`
Esta página debe:

- requerir autenticación desde la ruta;
- usar `AlojamientoForm`;
- enviar datos con `createAlojamiento()`;
- manejar errores `400` y `401`;
- limpiar sesión y navegar a login si la sesión expira;
- redirigir después de crear.

Si el backend devuelve id, navega al detalle:

```js
navigate?.(`alojamientos/${alojamientoId}`);
```

Si no devuelve id, navega al listado:

```js
navigate?.('alojamientos');
```

Nota: en el estado del Tutorial 3, `src/js/utils/errorMessages.js` no exporta `getDetailsMessage()`. Por eso esta ayuda se mantiene como función local en esta página.

```js
import { createAlojamiento } from '../api/alojamientos.api.js';
import { AlojamientoForm } from '../components/alojamientos/AlojamientoForm.js';
import { clearSession } from '../auth/session.service.js';
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

function setMessage(text, tone = 'muted') {
  const message = document.querySelector('#alojamientoMensaje');
  if (!message) {
    return;
  }

  message.className = `mt-3 mb-0 text-${tone}`;
  message.textContent = text;
}

export function CrearAlojamientoPage() {
  return `
    <section class="container py-5" style="max-width: 860px;">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 class="h3 mb-2">Nuevo alojamiento</h1>
          <p class="text-muted mb-0">
            Completa los datos básicos para crear un alojamiento nuevo.
          </p>
        </div>
        <a class="btn btn-outline-secondary" href="#" data-view="alojamientos">
          Volver
        </a>
      </div>
      ${AlojamientoForm({ submitLabel: 'Crear' })}
    </section>
  `;
}

export function mountCrearAlojamientoPage({ navigate } = {}) {
  const form = document.querySelector('#alojamientoForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const titulo = document.querySelector('#titulo').value.trim();
    const descripcion = document.querySelector('#descripcion').value.trim();
    const precio_noche = Number(document.querySelector('#precio_noche').value);
    const ciudad = document.querySelector('#ciudad').value.trim();

    try {
      setMessage('Creando alojamiento...', 'muted');
      const response = await createAlojamiento({
        titulo,
        descripcion,
        precio_noche,
        ciudad,
      });

      const alojamientoId = response?.data?.id;
      if (alojamientoId) {
        navigate?.(`alojamientos/${alojamientoId}`);
        return;
      }

      navigate?.('alojamientos');
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible crear el alojamiento.');

      if (apiError.status === 401) {
        clearSession();
        navigate?.('login');
        return;
      }

      if (apiError.status === 400) {
        setMessage(
          getDetailsMessage(apiError.details) || 'Revisa los campos enviados.',
          'danger',
        );
        return;
      }

      if (apiError.status === 403) {
        setMessage('No tienes permisos para crear un alojamiento.', 'danger');
        return;
      }

      setMessage(apiError.message, 'danger');
    }
  });
}
```

### Paso 10: crear `src/js/pages/EditarAlojamientoPage.js`
Esta página debe:

- requerir autenticación desde la ruta;
- recibir el id desde `params`;
- cargar el alojamiento con `getAlojamientoById(id)`;
- validar `canManageAlojamiento(alojamiento)`;
- usar `AlojamientoForm` con datos iniciales;
- actualizar con `updateAlojamiento(id, payload)`;
- manejar errores `400`, `401`, `403` y `404`;
- redirigir al detalle después de actualizar.

Ejemplo:

```js
navigate?.(`alojamientos/${updatedId}`);
```

La misma nota aplica aquí: `errorMessages.js` del Tutorial 3 no exporta `getDetailsMessage()`, así que este tutorial la mantiene como función local en la página de edición.

```js
import { getAlojamientoById, updateAlojamiento } from '../api/alojamientos.api.js';
import { canManageAlojamiento } from '../auth/permissions.js';
import { clearSession } from '../auth/session.service.js';
import { AlojamientoForm } from '../components/alojamientos/AlojamientoForm.js';
import { escapeHtml } from '../utils/formatters.js';
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

function setMessage(text, tone = 'muted') {
  const message = document.querySelector('#alojamientoMensaje');
  if (!message) {
    return;
  }

  message.className = `mt-3 mb-0 text-${tone}`;
  message.textContent = text;
}

function renderState(type, message) {
  return `
    <div class="alert alert-${type}" role="alert">
      ${escapeHtml(message)}
    </div>
  `;
}

export function EditarAlojamientoPage({ id } = {}) {
  return `
    <section class="container py-5" style="max-width: 860px;">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 class="h3 mb-2">Editar alojamiento</h1>
          <p class="text-muted mb-0">
            Actualiza la información del alojamiento seleccionado.
          </p>
        </div>
        <a class="btn btn-outline-secondary" href="#" data-view="alojamientos/${id}">
          Volver
        </a>
      </div>
      <div id="editarAlojamientoState" class="text-muted">Cargando datos...</div>
    </section>
  `;
}

export async function mountEditarAlojamientoPage({ params = {}, navigate } = {}) {
  const state = document.querySelector('#editarAlojamientoState');
  const alojamientoId = params.id;

  if (!state || !alojamientoId) {
    return;
  }

  async function cargarAlojamiento() {
    try {
      state.innerHTML = renderState('secondary', 'Cargando datos...');
      const response = await getAlojamientoById(alojamientoId);
      const alojamiento = response?.data;

      if (!alojamiento) {
        state.innerHTML = renderState('warning', 'El alojamiento solicitado no existe.');
        return;
      }

      if (!canManageAlojamiento(alojamiento)) {
        state.innerHTML = renderState('danger', 'No tienes permisos para editar este alojamiento.');
        return;
      }

      state.innerHTML = AlojamientoForm({
        values: alojamiento,
        submitLabel: 'Actualizar',
      });

      const form = document.querySelector('#alojamientoForm');
      if (!form) {
        return;
      }

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const titulo = document.querySelector('#titulo').value.trim();
        const descripcion = document.querySelector('#descripcion').value.trim();
        const precio_noche = Number(document.querySelector('#precio_noche').value);
        const ciudad = document.querySelector('#ciudad').value.trim();

        try {
          setMessage('Actualizando alojamiento...', 'muted');
          const result = await updateAlojamiento(alojamientoId, {
            titulo,
            descripcion,
            precio_noche,
            ciudad,
          });

          const updatedId = result?.data?.id ?? alojamientoId;
          navigate?.(`alojamientos/${updatedId}`);
        } catch (error) {
          const apiError = formatApiError(error, 'No fue posible actualizar el alojamiento.');

          if (apiError.status === 401) {
            clearSession();
            navigate?.('login');
            return;
          }

          if (apiError.status === 400) {
            setMessage(
              getDetailsMessage(apiError.details) || 'Revisa los campos enviados.',
              'danger',
            );
            return;
          }

          if (apiError.status === 403) {
            setMessage('No tienes permisos para editar este alojamiento.', 'danger');
            return;
          }

          if (apiError.status === 404) {
            setMessage('El alojamiento solicitado no existe.', 'danger');
            return;
          }

          setMessage(apiError.message, 'danger');
        }
      });
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible cargar el alojamiento.');

      if (apiError.status === 401) {
        clearSession();
        navigate?.('login');
        return;
      }

      if (apiError.status === 403) {
        state.innerHTML = renderState('danger', 'No tienes permisos para editar este alojamiento.');
        return;
      }

      if (apiError.status === 404) {
        state.innerHTML = renderState('warning', 'El alojamiento solicitado no existe.');
        return;
      }

      state.innerHTML = renderState('danger', apiError.message);
    }
  }

  await cargarAlojamiento();
}
```

### Paso 11: reemplazar `src/js/router/routes.js`
Este archivo debe dejar de resolver solo rutas exactas y pasar a soportar parámetros dinámicos.

Debes registrar estas rutas públicas:

- `home`
- `alojamientos`
- `alojamientos/:id`
- `login`
- `registro`

Debes registrar estas rutas protegidas:

- `perfil`
- `alojamientos/nuevo`
- `alojamientos/:id/editar`

Debes conservar las rutas de administración existentes:

- `admin`
- `admin-usuarios`
- `admin/usuarios`

El orden de las rutas de alojamientos es obligatorio:

- `home`
- `alojamientos`
- `alojamientos/nuevo`
- `alojamientos/:id/editar`
- `alojamientos/:id`

No coloques `alojamientos/:id` antes de `alojamientos/nuevo`, porque `nuevo` podría interpretarse como un parámetro `id`.

Reemplaza todo el contenido del archivo por el siguiente código:

```js
import { AdminUsuariosPage, mountAdminUsuariosPage } from '../pages/AdminUsuariosPage.js';
import { LoginPage, mountLoginPage } from '../pages/LoginPage.js';
import { PerfilPage, mountPerfilPage } from '../pages/PerfilPage.js';
import { RegistroPage, mountRegistroPage } from '../pages/RegistroPage.js';
import { AlojamientosPage, mountAlojamientosPage } from '../pages/AlojamientosPage.js';
import { AlojamientoDetallePage, mountAlojamientoDetallePage } from '../pages/AlojamientoDetallePage.js';
import { CrearAlojamientoPage, mountCrearAlojamientoPage } from '../pages/CrearAlojamientoPage.js';
import { EditarAlojamientoPage, mountEditarAlojamientoPage } from '../pages/EditarAlojamientoPage.js';

function escapeRouteSegment(segment) {
  return String(segment).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildRouteMatcher(pattern) {
  const source = pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        const paramName = segment.slice(1);
        return `(?<${paramName}>[^/]+)`;
      }

      return escapeRouteSegment(segment);
    })
    .join('/');

  return new RegExp(`^${source}$`);
}

const routeList = [
  {
    path: 'home',
    aliases: [''],
    public: true,
    page: AlojamientosPage,
    mount: mountAlojamientosPage,
  },
  {
    path: 'alojamientos',
    public: true,
    page: AlojamientosPage,
    mount: mountAlojamientosPage,
  },
  {
    path: 'alojamientos/nuevo',
    requiresAuth: true,
    page: CrearAlojamientoPage,
    mount: mountCrearAlojamientoPage,
  },
  {
    path: 'alojamientos/:id/editar',
    requiresAuth: true,
    page: EditarAlojamientoPage,
    mount: mountEditarAlojamientoPage,
  },
  {
    path: 'alojamientos/:id',
    public: true,
    page: AlojamientoDetallePage,
    mount: mountAlojamientoDetallePage,
  },
  {
    path: 'login',
    public: true,
    page: LoginPage,
    mount: mountLoginPage,
  },
  {
    path: 'registro',
    public: true,
    page: RegistroPage,
    mount: mountRegistroPage,
  },
  {
    path: 'perfil',
    requiresAuth: true,
    page: PerfilPage,
    mount: mountPerfilPage,
  },
  {
    path: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    page: AdminUsuariosPage,
    mount: mountAdminUsuariosPage,
  },
  {
    path: 'admin-usuarios',
    aliases: ['admin/usuarios'],
    requiresAuth: true,
    requiresAdmin: true,
    page: AdminUsuariosPage,
    mount: mountAdminUsuariosPage,
  },
];

export function normalizeRouteView(view) {
  const normalized = String(view ?? 'home')
    .trim()
    .replace(/^#/, '')
    .replace(/^\/+|\/+$/g, '');

  return normalized || 'home';
}

function matchRoute(route, normalizedView) {
  if (route.path === normalizedView || route.aliases?.includes(normalizedView)) {
    return {};
  }

  if (!route.path.includes(':')) {
    return null;
  }

  const matcher = buildRouteMatcher(route.path);
  const match = normalizedView.match(matcher);

  if (!match) {
    return null;
  }

  return match.groups ?? {};
}

export function getRoute(view) {
  const normalizedView = normalizeRouteView(view);

  for (const route of routeList) {
    const params = matchRoute(route, normalizedView);

    if (params === null) {
      continue;
    }

    return {
      ...route,
      path: normalizedView,
      pattern: route.path,
      params,
    };
  }

  return null;
}

export function getRouteList() {
  return routeList.map(({ aliases, ...route }) => route);
}
```

### Paso 12: reemplazar `src/js/main.js`
Este archivo debe dejar de manejar `home` como caso especial con `renderHome()` y pasar a resolverlo desde `routes.js`.

El `mount` debe recibir, como mínimo:

```js
route.mount?.({
  navigate,
  render,
  params: route.params,
  view: currentView,
});
```

Debe conservar:

- renderizado de Navbar;
- página 404;
- página de acceso denegado;
- guards `requireAuth` y `requireAdmin`;
- manejo de logout;
- navegación por `data-view`.

Reemplaza todo el contenido del archivo por el siguiente código:

```js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/main.css';

import { clearSession } from './auth/session.service.js';
import { Navbar } from './components/layout/Navbar.js';
import { requireAdmin, requireAuth } from './router/guards.js';
import { getRoute, normalizeRouteView } from './router/routes.js';

const app = document.querySelector('#app');
let currentView = 'home';

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
  const route = getRoute(view);

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

  route.mount?.({
    navigate,
    render,
    params: route.params,
    view: currentView,
  });
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

### Paso 13: revisar `src/js/components/layout/Navbar.js`
En este sprint no necesitas reemplazar `Navbar.js`.

La versión del Tutorial 3 sigue funcionando porque:

- `Inicio` sigue apuntando a `home`;
- `home` ahora se resuelve desde el router hacia el listado público de alojamientos;
- `login`, `registro`, `perfil` y `admin` siguen existiendo;
- no hace falta adelantar `comodidades`.

Si más adelante quieres agregar un acceso explícito a `alojamientos`, eso sería una mejora opcional, no un requisito de este tutorial. Para completar el Sprint 4 no modifiques la navbar.

### Paso 14: probar flujos completos
Prueba estos recorridos:

- visitante lista alojamientos en `home`;
- visitante lista alojamientos en `alojamientos`;
- visitante ve detalle;
- usuario autenticado crea alojamiento;
- propietario edita;
- propietario elimina;
- admin edita o elimina;
- usuario no propietario recibe `403` o bloqueo visual;
- `204 No Content` funciona;
- `home` ya no depende de `renderHome()` interno;
- `alojamientos/nuevo` no se confunde con `alojamientos/:id`;
- `admin/usuarios` sigue funcionando como alias.

## 7. Cómo probar que funciona
Usa esta lista de verificación:

- `GET /alojamientos` muestra cards;
- la lista vacía muestra `empty state`;
- el error de red muestra un mensaje claro;
- el detalle carga por `id`;
- crear alojamiento funciona con token;
- crear sin token no funciona;
- editar propio funciona;
- editar de otro usuario no debe permitirse realmente;
- eliminar propio funciona y maneja `204`;
- la gestión de Editar y Eliminar se muestra en el detalle solo si `canManageAlojamiento()` devuelve `true`;
- si el backend devuelve `comodidades` en el detalle, solo se muestran como información asociada;
- no hay imágenes reales;
- no hay reservas, favoritos ni reseñas;
- no hay catálogo ni CRUD de comodidades en este sprint.

## 8. Errores comunes
Los errores más frecuentes en este sprint son:

- inventar campos no soportados;
- tratar `204` como JSON;
- hacer `fetch` directo sin usar `alojamientos.api.js`;
- asumir que ocultar botones es seguridad real;
- comparar `usuario_id` con el id incorrecto;
- olvidar el token en `POST`, `PATCH` o `DELETE`;
- mostrar lista vacía como error;
- adelantar comodidades como funcionalidad principal;
- agregar imágenes reales antes de tiempo;
- dejar `home` como caso especial dentro de `main.js`.

## 9. Cierre con Git y GitHub
Cuando termines el módulo de alojamientos, registra el cambio en Git con comandos como estos:

```bash
git status
git add .
git commit -m "feat: implementar alojamientos frontend"
```

Si el repositorio ya tiene remoto configurado, puedes hacer `git push` según la configuración de tu proyecto.

## 10. Resultado final del sprint
Al terminar este sprint tendrás:

- listado público funcionando;
- detalle funcionando;
- creación protegida;
- edición protegida;
- eliminación protegida;
- rutas dinámicas funcionando;
- `home` renderizado desde el router;
- permisos visuales para propietario o admin;
- uso de `request()` centralizado;
- manejo correcto de `204 No Content`;
- manejo claro de errores;
- la base lista para el Sprint 5: comodidades, sin implementarlas todavía.
