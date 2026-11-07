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
      const canManage = canManageAlojamiento(alojamiento);
      const comodidades = Array.isArray(alojamiento?.comodidades) ? alojamiento.comodidades : [];
      const fechaCreacion = formatDate(alojamiento?.fecha_creacion);

      state.innerHTML = `
        <article class="card border-0 shadow-sm">
          <div class="card-body p-4 p-md-5">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
              <div>
                <p class="text-muted mb-1">
                  <i class="bi bi-geo-alt me-1"></i>${escapeHtml(alojamiento?.ciudad)}
                </p>
                <h1 class="h3 mb-2">${escapeHtml(alojamiento?.titulo)}</h1>
                <p class="fw-semibold mb-0">${formatCurrency(alojamiento?.precio_noche)} / noche</p>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <a class="btn btn-outline-secondary" href="#" data-view="alojamientos">Volver</a>
                ${
                  canManage
                    ? `
                      <a class="btn btn-outline-primary" href="#" data-view="alojamientos/${alojamiento?.id}/editar">
                        Editar
                      </a>
                      <button
                        class="btn btn-outline-danger"
                        type="button"
                        data-action="delete-alojamiento"
                        data-id="${alojamiento?.id}"
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
              <p class="mb-0" style="white-space: pre-line;">${escapeHtml(alojamiento?.descripcion)}</p>
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
      const result = await deleteAlojamiento(alojamientoId);
      if (result === null) {
        navigate?.('alojamientos');
      }
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
