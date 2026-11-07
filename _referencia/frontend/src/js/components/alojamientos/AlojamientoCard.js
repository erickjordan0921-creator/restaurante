import { ComodidadBadge } from '../comodidades/ComodidadBadge.js';
import { escapeHtml, formatCurrency, truncateText } from '../../utils/formatters.js';

export function AlojamientoCard(alojamiento) {
  const comodidades = Array.isArray(alojamiento.comodidades) ? alojamiento.comodidades : [];

  return `
    <article class="card h-100 shadow-sm border-0 alojamiento-card">
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
