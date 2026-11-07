import { escapeHtml } from '../../utils/formatters.js';

function normalizeIds(ids = []) {
  return (Array.isArray(ids) ? ids : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

export function ComodidadesSelector({ comodidades = [], selectedIds = [] } = {}) {
  const lista = Array.isArray(comodidades) ? comodidades : [];
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
            const id = Number(comodidad?.id);
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
