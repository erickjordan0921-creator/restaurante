# Tutorial — Sprint 5: Comodidades

## 1. Objetivo
Completar el frontend incorporando comodidades sin romper lo ya validado en el Tutorial 4:

- consultar el catálogo público de comodidades;
- ver el detalle público de una comodidad;
- crear comodidades solo como admin;
- mostrar comodidades en las cards y en el detalle de alojamiento;
- asignar o reemplazar comodidades en la edición de un alojamiento;
- mantener `request()` como cliente HTTP centralizado;
- conservar el contrato `response.data`;
- manejar `loading`, `error`, `empty`, `400`, `401`, `403` y `404`.

Este tutorial parte exactamente del estado que queda al terminar el Tutorial 4 en `frontend_alojamiento_clase`.

## 2. Qué vas a construir
Al finalizar este tutorial tendrás:

- un servicio API de comodidades;
- una badge visual para comodidades;
- un selector múltiple de comodidades para alojamientos;
- una página pública de listado de comodidades;
- una página pública de detalle de comodidad;
- una página protegida para crear comodidades como admin;
- cards de alojamiento con badges de comodidades;
- detalle de alojamiento con badges de comodidades;
- formulario de alojamiento reutilizable con espacio para contenido extra;
- edición de alojamiento con asignación o reemplazo de comodidades;
- rutas nuevas para comodidades;
- navegación principal actualizada con enlace a comodidades;
- manejo de errores y estados de carga coherente con el proyecto.

No se implementan editar ni eliminar comodidad.
No se agregan reservas, favoritos, reseñas, imágenes reales, búsqueda avanzada, disponibilidad, pagos, subida de archivos, mapas ni geolocalización.

## 3. Qué vas a aprender
En este sprint vas a aprender:

- cómo reutilizar un catálogo público en una SPA vanilla;
- cómo diferenciar crear una comodidad de asignarla a un alojamiento;
- cómo trabajar con arreglos de IDs y `comodidades_ids`;
- cómo renderizar relaciones entre recursos sin simular datos;
- cómo usar `mount...` como punto de entrada de las páginas;
- cómo conectar rutas dinámicas con `params`;
- cómo extender un formulario sin duplicarlo;
- cómo mantener la seguridad real del backend sin depender solo de la interfaz.

## 4. Prerrequisitos
Antes de empezar, asegúrate de tener:

- Tutorial 1 terminado;
- Tutorial 2 terminado;
- Tutorial 3 terminado;
- Tutorial 4 terminado y validado;
- el cliente HTTP centralizado funcionando desde los sprints anteriores;
- la sesión y el token funcionando;
- los guards funcionando;
- el backend corriendo en `http://localhost:5000/api/v1`;
- un usuario admin para probar `POST /comodidades`;
- un usuario propietario o admin para probar `PATCH /alojamientos/:id/comodidades`.

Este tutorial no necesita modificar `src/js/main.js`, `src/js/auth/permissions.js` ni `src/js/api/alojamientos.api.js` salvo que encuentres una incompatibilidad real. En el estado actual del proyecto, no hace falta tocarlos.

## 5. Estructura esperada al finalizar
La estructura esperada al finalizar este sprint puede verse así:

```text
frontend-alojamientos/
└── src/
    └── js/
        ├── api/
        │   ├── alojamientos.api.js
        │   └── comodidades.api.js
        ├── auth/
        │   ├── permissions.js
        │   └── session.service.js
        ├── components/
        │   ├── alojamientos/
        │   │   ├── AlojamientoCard.js
        │   │   ├── AlojamientoForm.js
        │   │   └── ComodidadesSelector.js
        │   ├── comodidades/
        │   │   └── ComodidadBadge.js
        │   └── layout/
        │       └── Navbar.js
        ├── pages/
        │   ├── AlojamientosPage.js
        │   ├── AlojamientoDetallePage.js
        │   ├── CrearAlojamientoPage.js
        │   ├── EditarAlojamientoPage.js
        │   ├── ComodidadesPage.js
        │   ├── ComodidadDetallePage.js
        │   └── AdminCrearComodidadPage.js
        ├── router/
        │   ├── guards.js
        │   └── routes.js
        ├── utils/
        │   ├── errorMessages.js
        │   ├── formatters.js
        │   └── storage.js
        └── main.js
```

Archivos nuevos esperados:

- `src/js/api/comodidades.api.js`
- `src/js/components/comodidades/ComodidadBadge.js`
- `src/js/components/alojamientos/ComodidadesSelector.js`
- `src/js/pages/ComodidadesPage.js`
- `src/js/pages/ComodidadDetallePage.js`
- `src/js/pages/AdminCrearComodidadPage.js`

Archivos existentes que se reemplazan:

- `src/js/components/alojamientos/AlojamientoCard.js`
- `src/js/components/alojamientos/AlojamientoForm.js`
- `src/js/pages/AlojamientoDetallePage.js`
- `src/js/pages/EditarAlojamientoPage.js`
- `src/js/router/routes.js`
- `src/js/components/layout/Navbar.js`

Archivos que se reutilizan sin cambios en este tutorial:

- `src/js/main.js`
- `src/js/auth/permissions.js`
- `src/js/api/alojamientos.api.js`
- `src/js/pages/AlojamientosPage.js`
- `src/js/pages/CrearAlojamientoPage.js`

## 6. Paso a paso completo

### Paso 1: revisar el alcance real del Sprint 5
Este sprint tiene dos flujos distintos:

- crear una comodidad nueva en el catálogo;
- asignar o reemplazar comodidades en un alojamiento existente.

No son lo mismo.

- `POST /comodidades` crea una comodidad del catálogo y solo lo puede hacer un admin.
- `PATCH /alojamientos/:id/comodidades` modifica la relación del alojamiento con el catálogo y lo puede hacer el propietario o un admin.

El payload de asignación siempre usa este nombre de campo:

```json
{
  "comodidades_ids": [1, 2, 3]
}
```

Si quieres vaciar las comodidades, el arreglo puede ir vacío:

```json
{
  "comodidades_ids": []
}
```

No crees endpoints de editar ni eliminar comodidades.

### Paso 2: crear `src/js/api/comodidades.api.js`
Este archivo centraliza el consumo del catálogo de comodidades y la asignación a alojamientos.

```js
import { request } from './http.js';

export function getComodidades() {
  return request('/comodidades');
}

export function getComodidadById(id) {
  return request(`/comodidades/${id}`);
}

export function createComodidad(payload) {
  return request('/comodidades', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAlojamientoComodidades(alojamientoId, comodidadesIds) {
  return request(`/alojamientos/${alojamientoId}/comodidades`, {
    method: 'PATCH',
    body: JSON.stringify({
      comodidades_ids: comodidadesIds,
    }),
  });
}
```

### Paso 3: crear `src/js/components/comodidades/ComodidadBadge.js`
Esta badge debe ser segura, tolerar datos incompletos y escapar siempre el texto.

```js
import { escapeHtml } from '../../utils/formatters.js';

export function ComodidadBadge(comodidad) {
  return `
    <span class="badge rounded-pill text-bg-secondary">
      ${escapeHtml(comodidad?.nombre ?? 'Comodidad')}
    </span>
  `;
}
```

### Paso 4: crear `src/js/components/alojamientos/ComodidadesSelector.js`
Este componente permite seleccionar varias comodidades para un alojamiento.

Debe:

- aceptar `comodidades`;
- aceptar `selectedIds`;
- marcar como seleccionadas las comodidades actuales;
- normalizar IDs con `Number()`;
- filtrar valores inválidos;
- mostrar `empty state` si no hay comodidades;
- exportar `getSelectedComodidadesIds(root = document)`.

```js
import { escapeHtml } from '../../utils/formatters.js';

function normalizeIds(ids = []) {
  return (Array.isArray(ids) ? ids : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

export function ComodidadesSelector({ comodidades = [], selectedIds = [] } = {}) {
  const lista = (Array.isArray(comodidades) ? comodidades : [])
    .map((comodidad) => ({
      ...comodidad,
      id: Number(comodidad?.id),
    }))
    .filter((comodidad) => Number.isFinite(comodidad.id));
  const seleccionadas = new Set(normalizeIds(selectedIds));

  if (!lista.length) {
    return `
      <div class="alert alert-info mb-0" role="status">
        No hay comodidades disponibles para asignar en este momento.
      </div>
    `;
  }

  return `
    <fieldset class="border rounded-3 p-3 bg-body-tertiary">
      <legend class="float-none w-auto px-2 h6 mb-0">Comodidades</legend>
      <p class="text-muted small mb-3">
        Selecciona una o más comodidades para este alojamiento.
      </p>
      <div class="row g-2">
        ${lista
          .map((comodidad) => {
            const id = comodidad.id;
            const checked = seleccionadas.has(id) ? 'checked' : '';

            return `
              <div class="col-12 col-sm-6 col-lg-4">
                <label class="w-100 border rounded-3 px-3 py-2 bg-white d-flex align-items-center gap-2 h-100">
                  <input
                    class="form-check-input m-0"
                    type="checkbox"
                    name="comodidades_ids"
                    value="${id}"
                    ${checked}
                  />
                  <span class="small fw-semibold">${escapeHtml(comodidad?.nombre ?? 'Sin nombre')}</span>
                </label>
              </div>
            `;
          })
          .join('')}
      </div>
    </fieldset>
  `;
}

export function getSelectedComodidadesIds(root = document) {
  return [...root.querySelectorAll('input[name="comodidades_ids"]:checked')]
    .map((input) => Number(input.value))
    .filter((value) => Number.isFinite(value));
}
```

### Paso 5: crear `src/js/pages/ComodidadesPage.js`
Esta página es pública y muestra el catálogo de comodidades.

Debe:

- exportar `ComodidadesPage`;
- exportar `mountComodidadesPage`;
- usar `getComodidades()`;
- usar `ComodidadBadge`;
- usar `escapeHtml()`;
- usar `formatApiError()`;
- usar `isAdmin()` para mostrar el botón `Crear comodidad`;
- manejar `loading`, `empty` y `error`;
- conservar el catálogo como vista pública.

```js
import { getComodidades } from '../api/comodidades.api.js';
import { isAdmin } from '../auth/permissions.js';
import { clearSession } from '../auth/session.service.js';
import { ComodidadBadge } from '../components/comodidades/ComodidadBadge.js';
import { escapeHtml } from '../utils/formatters.js';
import { formatApiError } from '../utils/errorMessages.js';

function renderState(type, message) {
  return `
    <div class="alert alert-${type}" role="alert">
      ${escapeHtml(message)}
    </div>
  `;
}

export function ComodidadesPage() {
  const canCreateComodidad = isAdmin();

  return `
    <section class="container py-5">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 class="h3 mb-2">Comodidades</h1>
          <p class="text-muted mb-0">
            Explora el catálogo público de comodidades disponibles en la plataforma.
          </p>
        </div>

        ${
          canCreateComodidad
            ? `
              <a class="btn btn-primary" href="#" data-view="admin/comodidades/nueva">
                <i class="bi bi-plus-lg me-1"></i>Crear comodidad
              </a>
            `
            : ''
        }
      </div>

      <div id="comodidadesState" class="text-muted">Cargando comodidades...</div>
    </section>
  `;
}

export async function mountComodidadesPage({ navigate } = {}) {
  const state = document.querySelector('#comodidadesState');

  if (!state) {
    return;
  }

  async function cargarComodidades() {
    try {
      state.innerHTML = renderState('secondary', 'Cargando comodidades...');
      const response = await getComodidades();
      const comodidades = Array.isArray(response?.data) ? response.data : [];

      if (!comodidades.length) {
        state.innerHTML = renderState('info', 'No hay comodidades para mostrar.');
        return;
      }

      state.innerHTML = `
        <div class="row g-4">
          ${comodidades
            .map(
              (comodidad) => `
                <div class="col-12 col-md-6 col-xl-4">
                  <article class="card h-100 border-0 shadow-sm">
                    <div class="card-body d-flex flex-column">
                      <div class="mb-3">${ComodidadBadge(comodidad)}</div>
                      <p class="text-muted mb-4">
                        Identificador #${escapeHtml(String(comodidad?.id ?? '—'))}
                      </p>
                      <div class="mt-auto">
                        <a class="btn btn-outline-primary btn-sm" href="#" data-view="comodidades/${comodidad?.id}">
                          Ver detalle
                        </a>
                      </div>
                    </div>
                  </article>
                </div>
              `,
            )
            .join('')}
        </div>
      `;
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible cargar las comodidades.');

      if (apiError.status === 401) {
        clearSession();
        navigate?.('comodidades');
        return;
      }

      state.innerHTML = renderState('danger', apiError.message);
    }
  }

  await cargarComodidades();
}
```

### Paso 6: crear `src/js/pages/ComodidadDetallePage.js`
Esta página muestra el detalle público de una comodidad.

Debe:

- exportar `ComodidadDetallePage`;
- exportar `mountComodidadDetallePage`;
- recibir `params.id` desde el router;
- usar `getComodidadById(id)`;
- usar `ComodidadBadge`;
- usar `escapeHtml()`;
- usar `formatApiError()`;
- manejar `401` limpiando sesión y volviendo al catálogo;
- manejar `404` con mensaje claro;
- no inventar campos inexistentes;
- mostrar botón de volver a `comodidades`.

```js
import { getComodidadById } from '../api/comodidades.api.js';
import { clearSession } from '../auth/session.service.js';
import { ComodidadBadge } from '../components/comodidades/ComodidadBadge.js';
import { escapeHtml } from '../utils/formatters.js';
import { formatApiError } from '../utils/errorMessages.js';

function renderState(type, message) {
  return `
    <div class="alert alert-${type}" role="alert">
      ${escapeHtml(message)}
    </div>
  `;
}

export function ComodidadDetallePage({ id } = {}) {
  return `
    <section class="container py-5" style="max-width: 860px;">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 class="h3 mb-2">Detalle de comodidad</h1>
          <p class="text-muted mb-0">
            Consulta la información disponible para esta comodidad.
          </p>
        </div>
        <a class="btn btn-outline-secondary" href="#" data-view="comodidades">
          Volver
        </a>
      </div>

      <div id="comodidadDetalleState" class="text-muted">Cargando detalle...</div>
      ${id ? `<p class="visually-hidden" id="comodidadDetalleId">${escapeHtml(String(id))}</p>` : ''}
    </section>
  `;
}

export async function mountComodidadDetallePage({ params = {}, navigate } = {}) {
  const state = document.querySelector('#comodidadDetalleState');
  const comodidadId = params.id;

  if (!state || !comodidadId) {
    return;
  }

  async function cargarDetalle() {
    try {
      state.innerHTML = renderState('secondary', 'Cargando detalle...');
      const response = await getComodidadById(comodidadId);
      const comodidad = response?.data;

      state.innerHTML = `
        <article class="card border-0 shadow-sm">
          <div class="card-body p-4 p-md-5">
            <div class="mb-3">${ComodidadBadge(comodidad)}</div>
            <p class="text-muted mb-1">ID #${escapeHtml(String(comodidad?.id ?? '—'))}</p>
            <h2 class="h4 mb-0">${escapeHtml(comodidad?.nombre ?? 'Comodidad')}</h2>
          </div>
        </article>
      `;
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible cargar el detalle.');

      if (apiError.status === 401) {
        clearSession();
        navigate?.('comodidades');
        return;
      }

      if (apiError.status === 404) {
        state.innerHTML = renderState('warning', 'La comodidad solicitada no existe.');
        return;
      }

      state.innerHTML = renderState('danger', apiError.message);
    }
  }

  await cargarDetalle();
}
```

### Paso 7: crear `src/js/pages/AdminCrearComodidadPage.js`
Esta página crea comodidades del catálogo y solo debe estar disponible para admin.

Debe:

- exportar `AdminCrearComodidadPage`;
- exportar `mountAdminCrearComodidadPage`;
- usar `createComodidad({ nombre })`;
- manejar `400`, `401` y `403`;
- limpiar sesión y navegar a `login` si la sesión expira;
- mostrar mensaje de éxito;
- limpiar el formulario después de crear;
- mantener `getDetailsMessage()` local si `errorMessages.js` no la exporta.

```js
import { createComodidad } from '../api/comodidades.api.js';
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
  const message = document.querySelector('#comodidadMensaje');

  if (!message) {
    return;
  }

  message.className = `mt-3 mb-0 text-${tone}`;
  message.textContent = text;
}

export function AdminCrearComodidadPage() {
  return `
    <section class="container py-5" style="max-width: 620px;">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 class="h3 mb-2">Crear comodidad</h1>
          <p class="text-muted mb-0">
            Agrega una comodidad al catálogo general de la plataforma.
          </p>
        </div>
        <a class="btn btn-outline-secondary" href="#" data-view="comodidades">
          Volver
        </a>
      </div>

      <form id="comodidadForm" class="card card-body shadow-sm border-0">
        <div class="mb-3">
          <label class="form-label" for="nombre">Nombre</label>
          <input
            class="form-control"
            type="text"
            id="nombre"
            name="nombre"
            placeholder="Internet inalámbrico"
            required
          />
        </div>

        <div class="d-flex flex-wrap gap-2 align-items-center">
          <button class="btn btn-primary" type="submit">Guardar</button>
        </div>

        <p class="mt-3 mb-0 text-muted" id="comodidadMensaje"></p>
      </form>
    </section>
  `;
}

export function mountAdminCrearComodidadPage({ navigate } = {}) {
  const form = document.querySelector('#comodidadForm');

  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nombre = document.querySelector('#nombre').value.trim();

    try {
      setMessage('Creando comodidad...', 'muted');
      await createComodidad({ nombre });
      setMessage('Comodidad creada correctamente.', 'success');
      form.reset();
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible crear la comodidad.');

      if (apiError.status === 401) {
        clearSession();
        navigate?.('login');
        return;
      }

      if (apiError.status === 400) {
        setMessage(
          getDetailsMessage(apiError.details) || 'Revisa el nombre enviado.',
          'danger',
        );
        return;
      }

      if (apiError.status === 403) {
        setMessage('No tienes permisos para crear comodidades.', 'danger');
        return;
      }

      setMessage(apiError.message, 'danger');
    }
  });
}
```

### Paso 8: reemplazar `src/js/components/alojamientos/AlojamientoCard.js`
Reemplaza todo el contenido del archivo por el siguiente código.
La card ahora debe mostrar badges de comodidades cuando `alojamiento.comodidades` exista.

Debe:

- conservar título, ciudad, precio y resumen;
- importar `ComodidadBadge`;
- escapar el texto del alojamiento;
- mantener el enlace al detalle;
- no inventar comodidades si el backend no las devuelve.

```js
import { ComodidadBadge } from '../comodidades/ComodidadBadge.js';
import { escapeHtml, formatCurrency, truncateText } from '../../utils/formatters.js';

export function AlojamientoCard(alojamiento) {
  const comodidades = Array.isArray(alojamiento.comodidades) ? alojamiento.comodidades : [];

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
        ${
          comodidades.length
            ? `
              <div class="d-flex flex-wrap gap-2 mb-3">
                ${comodidades.map((comodidad) => ComodidadBadge(comodidad)).join('')}
              </div>
            `
            : ''
        }
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

### Paso 9: reemplazar `src/js/components/alojamientos/AlojamientoForm.js`
Reemplaza todo el contenido del archivo por el siguiente código.
El formulario debe seguir sirviendo para crear y editar alojamientos, pero ahora debe aceptar contenido extra para insertar el selector de comodidades en la edición.

Debe:

- conservar los campos `titulo`, `descripcion`, `precio_noche` y `ciudad`;
- agregar soporte para `extraContent`;
- insertar `extraContent` antes del botón de submit;
- seguir funcionando para crear alojamiento sin comodidades.

```js
import { escapeHtml } from '../../utils/formatters.js';

export function AlojamientoForm({
  values = {},
  submitLabel = 'Guardar',
  extraContent = '',
} = {}) {
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

      ${extraContent ? `<div class="mt-4">${extraContent}</div>` : ''}

      <div class="d-flex flex-wrap gap-2 align-items-center mt-4">
        <button class="btn btn-primary" type="submit">${submitLabel}</button>
      </div>

      <p class="mt-3 mb-0 text-muted" id="alojamientoMensaje"></p>
    </form>
  `;
}
```

### Paso 10: reemplazar `src/js/pages/AlojamientoDetallePage.js`
Reemplaza todo el contenido del archivo por el siguiente código.
La vista de detalle debe conservar lo validado en el Tutorial 4 y añadir las comodidades como badges.

Debe:

- conservar permisos visuales con `canManageAlojamiento()`;
- conservar botones Editar y Eliminar solo cuando corresponda;
- conservar la eliminación con:

```js
await deleteAlojamiento(alojamientoId);
navigate?.('alojamientos');
```

- manejar `401`, `403` y `404`;
- mostrar comodidades como badges si llegan en `alojamiento.comodidades`;
- no simular datos;
- no volver a depender de `result === null` para borrar.

```js
import { getAlojamientoById, deleteAlojamiento } from '../api/alojamientos.api.js';
import { canManageAlojamiento } from '../auth/permissions.js';
import { clearSession } from '../auth/session.service.js';
import { ComodidadBadge } from '../components/comodidades/ComodidadBadge.js';
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
                      ${comodidades.map((comodidad) => ComodidadBadge(comodidad)).join('')}
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

### Paso 11: reemplazar `src/js/pages/EditarAlojamientoPage.js`
Reemplaza todo el contenido del archivo por el siguiente código.
La edición ahora debe cargar el alojamiento y las comodidades disponibles, mostrar el selector y luego actualizar ambos recursos.

Debe:

- conservar la validación visual de permisos con `canManageAlojamiento(alojamiento)`;
- cargar alojamiento y comodidades con `Promise.all`;
- calcular `selectedIds` desde `alojamiento.comodidades`;
- usar `AlojamientoForm` con `extraContent`;
- renderizar `ComodidadesSelector`;
- actualizar el alojamiento con `updateAlojamiento()`;
- actualizar comodidades con `updateAlojamientoComodidades()`;
- permitir enviar `comodidades_ids: []`;
- redirigir al detalle después de guardar;
- manejar `400`, `401`, `403` y `404`;
- mantener `getDetailsMessage()` local si `errorMessages.js` no la exporta.

```js
import { getAlojamientoById, updateAlojamiento } from '../api/alojamientos.api.js';
import {
  getComodidades,
  updateAlojamientoComodidades,
} from '../api/comodidades.api.js';
import { canManageAlojamiento } from '../auth/permissions.js';
import { clearSession } from '../auth/session.service.js';
import {
  ComodidadesSelector,
  getSelectedComodidadesIds,
} from '../components/alojamientos/ComodidadesSelector.js';
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
      const [alojamientoResponse, comodidadesResponse] = await Promise.all([
        getAlojamientoById(alojamientoId),
        getComodidades(),
      ]);
      const alojamiento = alojamientoResponse?.data;
      const comodidadesDisponibles = Array.isArray(comodidadesResponse?.data)
        ? comodidadesResponse.data
        : [];

      if (!alojamiento) {
        state.innerHTML = renderState('warning', 'El alojamiento solicitado no existe.');
        return;
      }

      if (!canManageAlojamiento(alojamiento)) {
        state.innerHTML = renderState('danger', 'No tienes permisos para editar este alojamiento.');
        return;
      }

      const selectedIds = Array.isArray(alojamiento.comodidades)
        ? alojamiento.comodidades
            .map((comodidad) => Number(comodidad?.id))
            .filter((value) => Number.isFinite(value))
        : [];

      state.innerHTML = AlojamientoForm({
        values: alojamiento,
        submitLabel: 'Actualizar',
        extraContent: `
          <div id="comodidadesSelectorSlot" class="mt-4"></div>
        `,
      });

      const selectorSlot = document.querySelector('#comodidadesSelectorSlot');
      if (selectorSlot) {
        selectorSlot.innerHTML = `
          <div class="mb-3">
            <h2 class="h5 mb-2">Comodidades</h2>
            <p class="text-muted mb-0">
              Selecciona las comodidades que aplican para este alojamiento.
            </p>
          </div>
          ${ComodidadesSelector({
            comodidades: comodidadesDisponibles,
            selectedIds,
          })}
        `;
      }

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
        const comodidadesIds = getSelectedComodidadesIds(form);

        try {
          setMessage('Actualizando alojamiento...', 'muted');
          const result = await updateAlojamiento(alojamientoId, {
            titulo,
            descripcion,
            precio_noche,
            ciudad,
          });

          if (comodidadesDisponibles.length > 0) {
            await updateAlojamientoComodidades(alojamientoId, comodidadesIds);
          }

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

### Paso 12: reemplazar `src/js/router/routes.js`
Reemplaza todo el contenido del archivo por el siguiente código.
El router debe seguir resolviendo todas las rutas del Tutorial 4 y sumar las nuevas rutas de comodidades.

Debes conservar:

- `home`
- `alojamientos`
- `alojamientos/nuevo`
- `alojamientos/:id/editar`
- `alojamientos/:id`
- `login`
- `registro`
- `perfil`
- `admin`
- `admin-usuarios`
- `admin/usuarios`

Debes agregar:

- `comodidades`
- `comodidades/:id`
- `admin/comodidades/nueva`

El orden importa:

- `alojamientos/nuevo` debe ir antes de `alojamientos/:id/editar` y `alojamientos/:id`;
- `comodidades` debe ir antes de `comodidades/:id`;
- las rutas específicas deben ir antes de las más generales.

```js
import { LoginPage, mountLoginPage } from '../pages/LoginPage.js';
import { PerfilPage, mountPerfilPage } from '../pages/PerfilPage.js';
import { RegistroPage, mountRegistroPage } from '../pages/RegistroPage.js';
import { AdminUsuariosPage, mountAdminUsuariosPage } from '../pages/AdminUsuariosPage.js';
import { AlojamientosPage, mountAlojamientosPage } from '../pages/AlojamientosPage.js';
import { AlojamientoDetallePage, mountAlojamientoDetallePage } from '../pages/AlojamientoDetallePage.js';
import { CrearAlojamientoPage, mountCrearAlojamientoPage } from '../pages/CrearAlojamientoPage.js';
import { EditarAlojamientoPage, mountEditarAlojamientoPage } from '../pages/EditarAlojamientoPage.js';
import { AdminCrearComodidadPage, mountAdminCrearComodidadPage } from '../pages/AdminCrearComodidadPage.js';
import { ComodidadDetallePage, mountComodidadDetallePage } from '../pages/ComodidadDetallePage.js';
import { ComodidadesPage, mountComodidadesPage } from '../pages/ComodidadesPage.js';

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
    path: 'comodidades',
    public: true,
    page: ComodidadesPage,
    mount: mountComodidadesPage,
  },
  {
    path: 'comodidades/:id',
    public: true,
    page: ComodidadDetallePage,
    mount: mountComodidadDetallePage,
  },
  {
    path: 'admin/comodidades/nueva',
    requiresAuth: true,
    requiresAdmin: true,
    page: AdminCrearComodidadPage,
    mount: mountAdminCrearComodidadPage,
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

### Paso 13: reemplazar `src/js/components/layout/Navbar.js`
Reemplaza todo el contenido del archivo por el siguiente código.
La navbar debe conservar Inicio y sumar Comodidades como enlace público.

Debe:

- conservar Inicio;
- agregar enlace público a `comodidades`;
- conservar Login y Registro para visitantes;
- conservar Perfil para usuarios autenticados;
- conservar Usuarios para admin;
- marcar como activas las vistas `home`, `alojamientos`, `comodidades`, `admin` y `perfil`;
- considerar activa `comodidades` cuando la vista actual sea `comodidades` o `comodidades/:id`;
- considerar activa la administración cuando la vista actual empiece por `admin/`.

```js
import { escapeHtml } from '../../utils/formatters.js';
import { getCurrentUser, isAdmin, isAuthenticated } from '../../auth/permissions.js';

function isAdminRoute(currentView) {
  return currentView === 'admin' || currentView === 'admin-usuarios' || currentView.startsWith('admin/');
}

function isViewActive(view, currentView) {
  if (view === 'admin') {
    return isAdminRoute(currentView);
  }

  if (view === 'alojamientos') {
    return currentView === 'alojamientos' || currentView.startsWith('alojamientos/');
  }

  if (view === 'comodidades') {
    return currentView === 'comodidades' || currentView.startsWith('comodidades/');
  }

  return currentView === view;
}

function navLink(view, label, currentView) {
  const activeClass = isViewActive(view, currentView) ? 'active fw-semibold' : '';

  return `
    <li class="nav-item">
      <a class="nav-link ${activeClass}" href="#" data-view="${view}">${label}</a>
    </li>
  `;
}

function navDropdown(user, currentView) {
  const toggleClass = isViewActive('perfil', currentView) ? 'active fw-semibold' : '';
  const label = user?.correo?.trim() || 'Mi cuenta';

  return `
    <li class="nav-item dropdown">
      <button
        class="btn btn-outline-light dropdown-toggle ${toggleClass}"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        ${escapeHtml(label)}
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li>
          <a class="dropdown-item ${isViewActive('perfil', currentView) ? 'active' : ''}" href="#" data-view="perfil">
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
            ${navLink('comodidades', 'Comodidades', currentView)}
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

### Paso 14: validar los flujos completos
Prueba estos recorridos:

- visitante lista comodidades en `comodidades`;
- visitante ve el detalle de una comodidad en `comodidades/:id`;
- admin crea comodidad desde `admin/comodidades/nueva`;
- usuario normal no ve el botón de crear comodidad;
- una card de alojamiento muestra badges cuando el backend devuelve `comodidades`;
- el detalle de alojamiento muestra badges cuando el backend devuelve `comodidades`;
- editar alojamiento carga las comodidades disponibles;
- el selector marca las comodidades actuales del alojamiento;
- enviar el formulario de edición guarda los datos y luego las comodidades;
- enviar `comodidades_ids: []` no rompe el flujo;
- `alojamientos/nuevo` sigue funcionando sin tocar `AlojamientoForm`;
- `home` sigue mostrando el listado público;
- `Navbar.js` muestra `Comodidades` y marca bien el estado activo;
- `admin/usuarios` sigue funcionando como alias;
- el build pasa con `npm run build`.

## 7. Cómo probar que funciona
Usa esta lista de verificación:

- `GET /comodidades` muestra el catálogo;
- el catálogo vacío muestra `empty state`;
- el error de red muestra un mensaje claro;
- `GET /comodidades/:id` muestra el detalle;
- `POST /comodidades` funciona solo con admin;
- `POST /comodidades` sin admin responde `403`;
- el selector carga comodidades;
- el selector usa `comodidades_ids` como arreglo de checkboxes;
- `comodidades_ids: []` vacía comodidades;
- el detalle de alojamiento muestra badges si el backend las devuelve;
- la edición del alojamiento conserva permisos y validación real;
- no existen editar ni eliminar comodidad;
- no se adelantó ninguna funcionalidad posterior.

## 8. Errores comunes
Los errores más frecuentes en este sprint son:

- usar `cargarComodidades`, `cargarDetalleComodidad` o `bindAdminCrearComodidad` como exportaciones del router en lugar de `mount...`;
- confundir crear comodidad con asignar comodidad;
- enviar `comodidadesIds` en vez de `comodidades_ids`;
- enviar un número en vez de un arreglo;
- registrar `alojamientos/:id` antes de `alojamientos/nuevo` o `comodidades/:id` antes de `comodidades`;
- hacer `fetch` directo en páginas o componentes;
- olvidar `escapeHtml()` en badges o vistas;
- reintroducir la lógica vieja de eliminar con `result === null`;
- modificar `main.js` o `permissions.js` sin necesidad;
- adelantar módulos de Sprint 6 o funciones que no existen.

## 9. Cierre con Git y GitHub
Cuando termines el módulo de comodidades, registra el cambio en Git con comandos como estos:

```bash
git status
git add .
git commit -m "feat: implementar comodidades frontend"
```

Si el repositorio ya tiene remoto configurado, puedes hacer `git push` según la configuración de tu proyecto.

## 10. Resultado final del sprint
Al terminar este sprint tendrás:

- catálogo de comodidades funcionando;
- detalle público de comodidad funcionando;
- creación de comodidad como admin;
- selector de comodidades en edición de alojamiento;
- comodidades renderizadas en cards y detalle de alojamiento;
- rutas nuevas funcionando;
- navegación principal actualizada;
- manejo correcto de `400`, `401`, `403` y `404`;
- build validado con Vite;
- el proyecto listo para seguir sin tocar todavía funcionalidades posteriores.
