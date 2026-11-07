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

