import { escapeHtml } from '../../utils/formatters.js';

export function ComodidadBadge(comodidad) {
  return `
    <span class="badge rounded-pill text-bg-secondary">
      ${escapeHtml(comodidad?.nombre ?? 'Comodidad')}
    </span>
  `;
}
