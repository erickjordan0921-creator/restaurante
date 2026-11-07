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
