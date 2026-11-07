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

      if (!canManageAlojamiento(alojamiento)) {
        state.innerHTML = renderState('danger', 'No tienes permisos para editar este alojamiento.');
        return;
      }

      const selectedIds = Array.isArray(alojamiento?.comodidades)
        ? alojamiento.comodidades.map((comodidad) => Number(comodidad?.id)).filter((value) => Number.isFinite(value))
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
