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
