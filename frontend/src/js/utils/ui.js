import { escapeHtml } from './formatters.js';

/* Componentes de interfaz compartidos de SINU: toasts, confirmaciones y etiquetas. */

export function toast(message, tone = '') {
  const container = document.querySelector('#toasts');
  if (!container) {
    return;
  }

  const element = document.createElement('div');
  element.className = `toast-sinu ${tone}`;
  element.textContent = message;
  container.appendChild(element);
  setTimeout(() => element.remove(), tone === 'error' ? 4800 : 3000);
}

export function closeModal() {
  document.querySelector('#modalRaiz').innerHTML = '';
}

/**
 * Confirmación antes de acciones destructivas o irreversibles.
 * `messageHtml` puede llevar <b>; todo dato del usuario debe ir escapado.
 */
export function confirmar(title, messageHtml, okText = 'Confirmar', danger = false) {
  return new Promise((resolve) => {
    const root = document.querySelector('#modalRaiz');
    root.innerHTML = `
      <div class="modal-fondo">
        <div class="modal-sinu" role="dialog" aria-modal="true" aria-labelledby="confirmTitulo">
          <h2 id="confirmTitulo">${escapeHtml(title)}</h2>
          <p>${messageHtml}</p>
          <div class="botones">
            <button class="btn btn-sinu" type="button" data-respuesta="no">Volver</button>
            <button class="btn btn-sinu ${danger ? 'peligro' : ''}" type="button" data-respuesta="si">${escapeHtml(okText)}</button>
          </div>
        </div>
      </div>
    `;

    root.querySelectorAll('[data-respuesta]').forEach((button) => {
      button.addEventListener('click', () => {
        closeModal();
        resolve(button.dataset.respuesta === 'si');
      });
    });
    root.querySelector('[data-respuesta="si"]').focus();
  });
}

/** Ventana informativa que se cierra con el botón, con Escape o al hacer clic fuera. */
export function showInfoModal(innerHtml, { wide = false } = {}) {
  const root = document.querySelector('#modalRaiz');
  root.innerHTML = `
    <div class="modal-fondo" data-cerrable>
      <div class="modal-sinu ${wide ? 'ancho' : ''}" role="dialog" aria-modal="true">
        ${innerHtml}
        <div class="botones"><button class="btn btn-sinu" type="button" data-cerrar>Cerrar</button></div>
      </div>
    </div>
  `;

  const fondo = root.querySelector('.modal-fondo');
  fondo.addEventListener('click', (event) => {
    if (event.target === fondo || event.target.closest('[data-cerrar]')) {
      closeModal();
    }
  });
}

export function tag(text, tone) {
  return `<span class="tag tag-${tone}">${escapeHtml(text)}</span>`;
}

export function empty(text) {
  return `<div class="vacio">${text}</div>`;
}

export function loading(text = 'Cargando…') {
  return `<div class="cargando"><div class="spinner-border spinner-border-sm me-2" role="status"></div>${escapeHtml(text)}</div>`;
}

export const TAG_PEDIDO = {
  pendiente: ['Pendiente', 'warn'],
  'en preparación': ['En preparación', 'info'],
  listo: ['Listo', 'ok'],
  entregado: ['Entregado', 'gris'],
  cancelado: ['Cancelado', 'danger'],
};

export function tagPedido(estado) {
  const [text, tone] = TAG_PEDIDO[estado] ?? [estado, 'gris'];
  return tag(text, tone);
}

/** Muestra el error de la API como toast. Devuelve el mensaje. */
export function showApiError(error, fallback = 'No fue posible completar la acción.') {
  const details = error?.details && typeof error.details === 'object'
    ? Object.values(error.details).flat(Infinity).filter((v) => typeof v === 'string').join(' ')
    : '';
  const message = details || error?.message || fallback;
  toast(message, 'error');
  return message;
}
