import { escapeHtml, formatTime } from '../../utils/formatters.js';
import { tag, tagPedido } from '../../utils/ui.js';

// Texto del botón según el estado actual del pedido
const SIGUIENTE_ACCION = {
  pendiente: 'Iniciar preparación',
  'en preparación': 'Marcar listo',
  listo: 'Entregado',
};

/** Ticket de cocina. Borde rojo = usa insumos próximos a vencer (prepárelo primero). */
export function Ticket({ pedido: p, prioridad, por_vencer: porVencer }) {
  const urgente = prioridad && p.estado !== 'listo';

  return `
    <div class="ticket ${urgente ? 'prioridad' : ''} ${p.estado === 'listo' ? 'listo' : ''}">
      <div class="ticket-cab">
        <div class="ticket-mesa">Mesa ${escapeHtml(p.mesa)}</div>
        <div class="crono" data-desde="${p.fecha}">00:00</div>
      </div>
      <div class="ticket-cab"><small>${p.codigo} · ${formatTime(p.fecha)}</small>${tagPedido(p.estado)}</div>
      ${urgente ? tag('⚠ Prioridad: insumos por vencer', 'danger') : ''}
      <ul>
        ${p.items
          .map(
            (it) => `<li><span>${porVencer.includes(it.plato_id) ? '⏳ ' : ''}${escapeHtml(it.nombre)}</span><b>× ${it.cantidad}</b></li>`,
          )
          .join('')}
      </ul>
      <button class="btn btn-sinu xl w-100" type="button" data-avanzar="${p.id}">${SIGUIENTE_ACCION[p.estado]}</button>
    </div>
  `;
}

/** Actualiza los cronómetros (mm:ss desde la llegada); naranja ≥ 15 min, rojo ≥ 25 min. */
export function tickCronos(root = document) {
  root.querySelectorAll('.crono[data-desde]').forEach((el) => {
    const s = Math.max(0, Math.floor((Date.now() - new Date(el.dataset.desde)) / 1000));
    const m = Math.floor(s / 60);
    const minutos = m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}` : String(m).padStart(2, '0');
    el.textContent = `${minutos}:${String(s % 60).padStart(2, '0')}`;
    el.classList.toggle('medio', m >= 15 && m < 25);
    el.classList.toggle('alto', m >= 25);
  });
}
