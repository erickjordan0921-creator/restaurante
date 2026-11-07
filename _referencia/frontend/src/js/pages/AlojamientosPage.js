import { getAlojamientos, deleteAlojamiento } from '../api/alojamientos.api.js';
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
        navigate?.('alojamientos');
        return;
      }

      renderError(apiError.message);
    }
  }

  async function handleDelete(alojamientoId) {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este alojamiento?');
    if (!confirmar) {
      return;
    }

    try {
      const result = await deleteAlojamiento(alojamientoId);
      if (result === null) {
        await cargarAlojamientos();
      }
    } catch (error) {
      const apiError = formatApiError(error, 'No fue posible eliminar el alojamiento.');

      if (apiError.status === 401) {
        clearSession();
        navigate?.('alojamientos');
        return;
      }

      if (apiError.status === 403) {
        renderError('No tienes permisos para eliminar este alojamiento.');
        return;
      }

      renderError(apiError.message);
    }
  }

  state.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-action="delete-alojamiento"]');
    if (!deleteButton) {
      return;
    }

    const alojamientoId = deleteButton.dataset.id;
    if (alojamientoId) {
      handleDelete(alojamientoId);
    }
  });

  await cargarAlojamientos();
}
