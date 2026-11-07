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
